use crate::rules::{load_rules_from_dir, resolve_environment_variables, CleanerRuleFile};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::Arc;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScannedItem {
    pub path: String,
    pub size_bytes: u64,
    pub subcategory: String,
    pub category: String,
    pub needs_admin: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryScanSummary {
    pub category: String,
    pub total_files: usize,
    pub total_bytes: u64,
    pub items: Vec<ScannedItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub categories: Vec<CategoryScanSummary>,
    pub total_files: usize,
    pub total_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanExecutionResult {
    pub deleted_files: usize,
    pub deleted_bytes: u64,
    pub failed_files: usize,
    pub errors: Vec<String>,
}

pub struct CleanerEngine {
    rules: Vec<CleanerRuleFile>,
}

impl CleanerEngine {
    pub fn new(rules_dir: &Path) -> Self {
        let rules = load_rules_from_dir(rules_dir);
        Self { rules }
    }

    pub fn scan_all(&self) -> ScanResult {
        let mut summaries = Vec::new();
        let total_files_global = Arc::new(AtomicUsize::new(0));
        let total_bytes_global = Arc::new(AtomicU64::new(0));

        for rule_file in &self.rules {
            let category_name = rule_file.r#type.clone();
            let scanned_items = Arc::new(std::sync::Mutex::new(Vec::new()));

            // Scan directory cleanTargets in parallel with Rayon
            rule_file.clean_targets.par_iter().for_each(|target| {
                let resolved_dir = resolve_environment_variables(&target.path);
                let p = Path::new(&resolved_dir);
                if p.exists() && p.is_dir() {
                    for entry in WalkDir::new(p).min_depth(1).into_iter().filter_map(|e| e.ok()) {
                        if entry.file_type().is_file() {
                            if let Ok(metadata) = entry.metadata() {
                                let size = metadata.len();
                                total_files_global.fetch_add(1, Ordering::Relaxed);
                                total_bytes_global.fetch_add(size, Ordering::Relaxed);

                                scanned_items.lock().unwrap().push(ScannedItem {
                                    path: entry.path().to_string_lossy().to_string(),
                                    size_bytes: size,
                                    subcategory: target.subcategory.clone(),
                                    category: category_name.clone(),
                                    needs_admin: target.needs_admin,
                                });
                            }
                        }
                    }
                }
            });

            // Scan singleFileTargets
            for single_target in &rule_file.single_file_targets {
                let resolved_file = resolve_environment_variables(&single_target.path);
                let p = Path::new(&resolved_file);
                if p.exists() && p.is_file() {
                    if let Ok(metadata) = p.metadata() {
                        let size = metadata.len();
                        total_files_global.fetch_add(1, Ordering::Relaxed);
                        total_bytes_global.fetch_add(size, Ordering::Relaxed);

                        scanned_items.lock().unwrap().push(ScannedItem {
                            path: p.to_string_lossy().to_string(),
                            size_bytes: size,
                            subcategory: single_target.subcategory.clone(),
                            category: category_name.clone(),
                            needs_admin: single_target.needs_admin,
                        });
                    }
                }
            }

            let items = scanned_items.lock().unwrap().clone();
            let cat_bytes: u64 = items.iter().map(|i| i.size_bytes).sum();
            let cat_files = items.len();

            summaries.push(CategoryScanSummary {
                category: category_name,
                total_files: cat_files,
                total_bytes: cat_bytes,
                items,
            });
        }

        ScanResult {
            categories: summaries,
            total_files: total_files_global.load(Ordering::Relaxed),
            total_bytes: total_bytes_global.load(Ordering::Relaxed),
        }
    }

    /// Attempt deletion of a single file with read-only attribute stripping retry on Windows
    fn delete_file_robust(path: &Path) -> Result<u64, std::io::Error> {
        let size = path.metadata().map(|m| m.len()).unwrap_or(0);

        match fs::remove_file(path) {
            Ok(_) => Ok(size),
            Err(err) => {
                #[cfg(windows)]
                {
                    // If error is permission-denied / read-only attribute, strip read-only and retry
                    if err.kind() == std::io::ErrorKind::PermissionDenied {
                        if let Ok(mut perms) = fs::metadata(path).map(|m| m.permissions()) {
                            perms.set_readonly(false);
                            let _ = fs::set_permissions(path, perms);
                            if fs::remove_file(path).is_ok() {
                                return Ok(size);
                            }
                        }
                    }
                }
                Err(err)
            }
        }
    }

    /// Robust parallel cleaning with fallback permissions recovery
    pub fn clean_files(paths: &[String]) -> CleanExecutionResult {
        let deleted_count = Arc::new(AtomicUsize::new(0));
        let deleted_bytes = Arc::new(AtomicU64::new(0));
        let failed_count = Arc::new(AtomicUsize::new(0));
        let errors = Arc::new(std::sync::Mutex::new(Vec::new()));

        paths.par_iter().for_each(|file_path| {
            let p = Path::new(file_path);
            if p.exists() {
                if p.is_file() {
                    match Self::delete_file_robust(p) {
                        Ok(size) => {
                            deleted_count.fetch_add(1, Ordering::Relaxed);
                            deleted_bytes.fetch_add(size, Ordering::Relaxed);
                        }
                        Err(e) => {
                            failed_count.fetch_add(1, Ordering::Relaxed);
                            errors.lock().unwrap().push(format!("{}: {}", file_path, e));
                        }
                    }
                } else if p.is_dir() {
                    let size = p.metadata().map(|m| m.len()).unwrap_or(0);
                    match fs::remove_dir_all(p) {
                        Ok(_) => {
                            deleted_count.fetch_add(1, Ordering::Relaxed);
                            deleted_bytes.fetch_add(size, Ordering::Relaxed);
                        }
                        Err(e) => {
                            failed_count.fetch_add(1, Ordering::Relaxed);
                            errors.lock().unwrap().push(format!("{}: {}", file_path, e));
                        }
                    }
                }
            }
        });

        let errs = errors.lock().unwrap().clone();
        CleanExecutionResult {
            deleted_files: deleted_count.load(Ordering::Relaxed),
            deleted_bytes: deleted_bytes.load(Ordering::Relaxed),
            failed_files: failed_count.load(Ordering::Relaxed),
            errors: errs,
        }
    }
}
