use blake3::Hasher;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{Read, Seek, SeekFrom};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateScanOptions {
    pub directory: String,
    pub min_file_size: u64,
    pub max_file_size: Option<u64>,
    #[serde(default)]
    pub exclude_patterns: Vec<String>,
    #[serde(default)]
    pub extension_filter: Vec<String>,
    pub max_depth: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateFile {
    pub path: String,
    pub size: u64,
    pub last_modified: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateGroup {
    pub hash: String,
    pub size: u64,
    pub files: Vec<DuplicateFile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateScanResult {
    pub groups: Vec<DuplicateGroup>,
    pub total_duplicates: usize,
    pub reclaimable_space: u64,
    pub scan_duration_ms: u64,
    pub files_scanned: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmptyFolderScanResult {
    pub empty_folders: Vec<String>,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LargeFileScanResult {
    pub files: Vec<DuplicateFile>,
    pub scan_duration_ms: u64,
}

// ── Multi-Stage Hasher inspired by Czkawka ──

fn hash_file_partial(path: &Path) -> Option<String> {
    let mut file = File::open(path).ok()?;
    let mut buffer = [0u8; 4096];
    let bytes_read = file.read(&mut buffer).ok()?;
    if bytes_read == 0 {
        return None;
    }
    let mut hasher = Hasher::new();
    hasher.update(&buffer[..bytes_read]);
    Some(hasher.finalize().to_hex().to_string())
}

fn hash_file_full(path: &Path) -> Option<String> {
    let mut file = File::open(path).ok()?;
    let mut hasher = Hasher::new();
    let mut buffer = [0u8; 65536];
    loop {
        match file.read(&mut buffer) {
            Ok(0) => break,
            Ok(n) => {
                hasher.update(&buffer[..n]);
            }
            Err(_) => return None,
        }
    }
    Some(hasher.finalize().to_hex().to_string())
}

pub struct DeduplicationEngine;

impl DeduplicationEngine {
    pub fn scan_duplicates(options: &DuplicateScanOptions) -> DuplicateScanResult {
        let start = Instant::now();
        let root_dir = Path::new(&options.directory);
        if !root_dir.exists() || !root_dir.is_dir() {
            return DuplicateScanResult {
                groups: Vec::new(),
                total_duplicates: 0,
                reclaimable_space: 0,
                scan_duration_ms: 0,
                files_scanned: 0,
            };
        }

        // Phase 1: Directory Walk
        let max_depth = options.max_depth.unwrap_or(50);
        let mut walker = WalkDir::new(root_dir).max_depth(max_depth).into_iter();
        let mut discovered_files: Vec<DuplicateFile> = Vec::new();
        let files_scanned = Arc::new(AtomicUsize::new(0));

        while let Some(Ok(entry)) = walker.next() {
            if entry.file_type().is_dir() {
                let name = entry.file_name().to_string_lossy().to_lowercase();
                if options.exclude_patterns.iter().any(|p| p.to_lowercase() == name) {
                    walker.skip_current_dir();
                    continue;
                }
            } else if entry.file_type().is_file() {
                files_scanned.fetch_add(1, Ordering::Relaxed);
                if let Ok(meta) = entry.metadata() {
                    let size = meta.len();
                    if size < options.min_file_size {
                        continue;
                    }
                    if let Some(max_s) = options.max_file_size {
                        if size > max_s {
                            continue;
                        }
                    }

                    if !options.extension_filter.is_empty() {
                        let ext = entry
                            .path()
                            .extension()
                            .and_then(|e| e.to_str())
                            .map(|e| format!(".{}", e.to_lowercase()))
                            .unwrap_or_default();
                        if !options.extension_filter.contains(&ext) {
                            continue;
                        }
                    }

                    let mtime = meta
                        .modified()
                        .ok()
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_millis() as u64)
                        .unwrap_or(0);

                    discovered_files.push(DuplicateFile {
                        path: entry.path().to_string_lossy().to_string(),
                        size,
                        last_modified: mtime,
                    });
                }
            }
        }

        // Phase 2: Size Grouping (Czkawka Phase 1)
        let mut size_map: HashMap<u64, Vec<DuplicateFile>> = HashMap::new();
        for file in discovered_files {
            size_map.entry(file.size).or_default().push(file);
        }
        size_map.retain(|_, list| list.len() > 1);

        // Phase 3: Partial Hash (Czkawka Phase 2)
        let candidate_files: Vec<DuplicateFile> = size_map.into_values().flatten().collect();
        let partial_hash_map: Arc<Mutex<HashMap<(u64, String), Vec<DuplicateFile>>>> =
            Arc::new(Mutex::new(HashMap::new()));

        candidate_files.par_iter().for_each(|file| {
            if let Some(partial_hash) = hash_file_partial(Path::new(&file.path)) {
                let mut map = partial_hash_map.lock().unwrap();
                map.entry((file.size, partial_hash))
                    .or_default()
                    .push(file.clone());
            }
        });

        let mut partial_groups: HashMap<(u64, String), Vec<DuplicateFile>> =
            std::mem::take(&mut *partial_hash_map.lock().unwrap());
        partial_groups.retain(|_, list| list.len() > 1);

        // Phase 4: Full Cryptographic Hash (Czkawka Phase 3 - Blake3)
        let final_candidates: Vec<DuplicateFile> = partial_groups.into_values().flatten().collect();
        let full_hash_map: Arc<Mutex<HashMap<(u64, String), Vec<DuplicateFile>>>> =
            Arc::new(Mutex::new(HashMap::new()));

        final_candidates.par_iter().for_each(|file| {
            if let Some(full_hash) = hash_file_full(Path::new(&file.path)) {
                let mut map = full_hash_map.lock().unwrap();
                map.entry((file.size, full_hash))
                    .or_default()
                    .push(file.clone());
            }
        });

        let mut final_groups: HashMap<(u64, String), Vec<DuplicateFile>> =
            std::mem::take(&mut *full_hash_map.lock().unwrap());
        final_groups.retain(|_, list| list.len() > 1);

        let mut duplicate_groups: Vec<DuplicateGroup> = Vec::new();
        let mut total_duplicates = 0;
        let mut reclaimable_space = 0;

        for ((size, hash), files) in final_groups {
            let dup_count = files.len() - 1;
            total_duplicates += dup_count;
            reclaimable_space += size * dup_count as u64;

            duplicate_groups.push(DuplicateGroup {
                hash,
                size,
                files,
            });
        }

        // Sort groups by reclaimable size descending
        duplicate_groups.sort_by(|a, b| {
            let a_reclaim = a.size * (a.files.len() as u64 - 1);
            let b_reclaim = b.size * (b.files.len() as u64 - 1);
            b_reclaim.cmp(&a_reclaim)
        });

        DuplicateScanResult {
            groups: duplicate_groups,
            total_duplicates,
            reclaimable_space,
            scan_duration_ms: start.elapsed().as_millis() as u64,
            files_scanned: files_scanned.load(Ordering::Relaxed),
        }
    }

    pub fn scan_empty_folders(directory: &str) -> EmptyFolderScanResult {
        let start = Instant::now();
        let root = Path::new(directory);
        let mut empty_folders = Vec::new();

        if root.exists() && root.is_dir() {
            for entry in WalkDir::new(root).min_depth(1).contents_first(true).into_iter().filter_map(|e| e.ok()) {
                if entry.file_type().is_dir() {
                    if let Ok(mut read_dir) = fs::read_dir(entry.path()) {
                        if read_dir.next().is_none() {
                            empty_folders.push(entry.path().to_string_lossy().to_string());
                        }
                    }
                }
            }
        }

        EmptyFolderScanResult {
            empty_folders,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    pub fn scan_large_files(directory: &str, min_size_bytes: u64) -> LargeFileScanResult {
        let start = Instant::now();
        let root = Path::new(directory);
        let mut large_files = Vec::new();

        if root.exists() && root.is_dir() {
            for entry in WalkDir::new(root).min_depth(1).into_iter().filter_map(|e| e.ok()) {
                if entry.file_type().is_file() {
                    if let Ok(meta) = entry.metadata() {
                        if meta.len() >= min_size_bytes {
                            let mtime = meta
                                .modified()
                                .ok()
                                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                                .map(|d| d.as_millis() as u64)
                                .unwrap_or(0);

                            large_files.push(DuplicateFile {
                                path: entry.path().to_string_lossy().to_string(),
                                size: meta.len(),
                                last_modified: mtime,
                            });
                        }
                    }
                }
            }
        }

        large_files.sort_by(|a, b| b.size.cmp(&a.size));

        LargeFileScanResult {
            files: large_files,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    pub fn delete_files(paths: &[String]) -> usize {
        let count = Arc::new(AtomicUsize::new(0));
        paths.par_iter().for_each(|p| {
            let path = Path::new(p);
            if path.is_file() {
                if fs::remove_file(path).is_ok() {
                    count.fetch_add(1, Ordering::Relaxed);
                }
            } else if path.is_dir() {
                if fs::remove_dir(path).is_ok() {
                    count.fetch_add(1, Ordering::Relaxed);
                }
            }
        });
        count.load(Ordering::Relaxed)
    }
}
