use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::sync::Mutex;

const MAX_LOG_SIZE_BYTES: u64 = 8 * 1024 * 1024; // 8MB rotation threshold

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GranularDeletedFileEntry {
    pub id: String,
    pub session_id: String,
    pub path: String,
    pub size_bytes: u64,
    pub cleaner_category: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeletionLogQueryOptions {
    pub session_id: Option<String>,
    pub search_query: Option<String>,
    pub category_filter: Option<String>,
    pub limit: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeletionLogStats {
    pub total_logged_files: usize,
    pub total_bytes_logged: u64,
    pub log_file_size_bytes: u64,
    pub log_file_path: String,
}

pub struct DeletionLoggerEngine {
    log_dir: Mutex<PathBuf>,
}

impl DeletionLoggerEngine {
    pub fn new() -> Self {
        let base_dir = if let Ok(appdata) = std::env::var("LOCALAPPDATA") {
            PathBuf::from(appdata).join("TauKudu").join("audit_logs")
        } else {
            PathBuf::from(".taukudu_audit")
        };

        let _ = fs::create_dir_all(&base_dir);

        Self {
            log_dir: Mutex::new(base_dir),
        }
    }

    fn get_active_log_path(&self) -> PathBuf {
        self.log_dir.lock().unwrap().join("deleted_files.jsonl")
    }

    fn get_rotated_log_path(&self) -> PathBuf {
        self.log_dir.lock().unwrap().join("deleted_files.old.jsonl")
    }

    fn rotate_if_needed(&self) {
        let active = self.get_active_log_path();
        if let Ok(meta) = fs::metadata(&active) {
            if meta.len() >= MAX_LOG_SIZE_BYTES {
                let old = self.get_rotated_log_path();
                let _ = fs::remove_file(&old);
                let _ = fs::rename(&active, &old);
            }
        }
    }

    /// Append an array of granular deleted file entries
    pub fn append_entries(&self, entries: &[GranularDeletedFileEntry]) -> Result<usize, String> {
        if entries.is_empty() {
            return Ok(0);
        }

        self.rotate_if_needed();
        let log_path = self.get_active_log_path();

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_path)
            .map_err(|e| e.to_string())?;

        let mut written = 0;
        for entry in entries {
            if let Ok(json_line) = serde_json::to_string(entry) {
                if writeln!(file, "{}", json_line).is_ok() {
                    written += 1;
                }
            }
        }

        Ok(written)
    }

    /// Query granular deletion log entries with keyword search and pagination
    pub fn query_entries(&self, options: &DeletionLogQueryOptions) -> Vec<GranularDeletedFileEntry> {
        let log_path = self.get_active_log_path();
        if !log_path.exists() {
            return Vec::new();
        }

        let mut results = Vec::new();

        if let Ok(file) = fs::File::open(&log_path) {
            let reader = BufReader::new(file);
            let search = options.search_query.as_deref().map(|s| s.to_lowercase());
            let cat = options.category_filter.as_deref().map(|s| s.to_lowercase());

            for line in reader.lines().flatten() {
                if let Ok(entry) = serde_json::from_str::<GranularDeletedFileEntry>(&line) {
                    if let Some(ref sid) = options.session_id {
                        if &entry.session_id != sid {
                            continue;
                        }
                    }

                    if let Some(ref c) = cat {
                        if !c.is_empty() && &entry.cleaner_category.to_lowercase() != c {
                            continue;
                        }
                    }

                    if let Some(ref q) = search {
                        if !q.is_empty() && !entry.path.to_lowercase().contains(q) {
                            continue;
                        }
                    }

                    results.push(entry);
                }
            }
        }

        // Reverse to display newest first
        results.reverse();
        results.truncate(options.limit);
        results
    }

    /// Get summary stats on the deletion ledger
    pub fn get_stats(&self) -> DeletionLogStats {
        let log_path = self.get_active_log_path();
        let file_size = fs::metadata(&log_path).map(|m| m.len()).unwrap_or(0);

        let mut total_files = 0;
        let mut total_bytes = 0;

        if let Ok(file) = fs::File::open(&log_path) {
            let reader = BufReader::new(file);
            for line in reader.lines().flatten() {
                if let Ok(entry) = serde_json::from_str::<GranularDeletedFileEntry>(&line) {
                    total_files += 1;
                    total_bytes += entry.size_bytes;
                }
            }
        }

        DeletionLogStats {
            total_logged_files: total_files,
            total_bytes_logged: total_bytes,
            log_file_size_bytes: file_size,
            log_file_path: log_path.to_string_lossy().to_string(),
        }
    }

    /// Clear all deletion audit logs
    pub fn clear_logs(&self) -> Result<(), String> {
        let active = self.get_active_log_path();
        let old = self.get_rotated_log_path();
        let _ = fs::remove_file(active);
        let _ = fs::remove_file(old);
        Ok(())
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_DELETION_LOGGER: DeletionLoggerEngine = DeletionLoggerEngine::new();
}
