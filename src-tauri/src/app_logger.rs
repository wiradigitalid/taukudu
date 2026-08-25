use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::sync::Mutex;

const MAX_LOG_SIZE_BYTES: u64 = 5 * 1024 * 1024; // 5 MB

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String, // "INFO" | "WARN" | "ERROR" | "DEBUG"
    pub message: String,
    pub source: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogStats {
    pub log_file_path: String,
    pub log_file_size_bytes: u64,
    pub total_lines: usize,
    pub error_count: usize,
    pub warn_count: usize,
}

pub struct AppLoggerEngine {
    log_dir: Mutex<PathBuf>,
}

impl AppLoggerEngine {
    pub fn new() -> Self {
        let base_dir = if let Ok(appdata) = std::env::var("LOCALAPPDATA") {
            PathBuf::from(appdata).join("TauKudu").join("logs")
        } else {
            PathBuf::from(".taukudu_logs")
        };
        let _ = fs::create_dir_all(&base_dir);

        Self {
            log_dir: Mutex::new(base_dir),
        }
    }

    fn get_active_log_path(&self) -> PathBuf {
        self.log_dir.lock().unwrap().join("taukudu.log")
    }

    fn get_rotated_log_path(&self) -> PathBuf {
        self.log_dir.lock().unwrap().join("taukudu.old.log")
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

    pub fn log(&self, level: &str, message: &str, source: Option<&str>) {
        self.rotate_if_needed();
        let path = self.get_active_log_path();
        let now = chrono::Utc::now().to_rfc3339();

        let entry = LogEntry {
            timestamp: now,
            level: level.to_uppercase(),
            message: message.to_string(),
            source: source.map(|s| s.to_string()),
        };

        if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(&path) {
            if let Ok(json) = serde_json::to_string(&entry) {
                let _ = writeln!(file, "{}", json);
            }
        }
    }

    pub fn query_logs(&self, limit: usize, filter_level: Option<String>) -> Vec<LogEntry> {
        let path = self.get_active_log_path();
        if !path.exists() {
            return Vec::new();
        }

        let mut results = Vec::new();
        let level_f = filter_level.map(|l| l.to_uppercase());

        if let Ok(file) = fs::File::open(&path) {
            let reader = BufReader::new(file);
            for line in reader.lines().flatten() {
                if let Ok(entry) = serde_json::from_str::<LogEntry>(&line) {
                    if let Some(ref lvl) = level_f {
                        if !lvl.is_empty() && &entry.level != lvl {
                            continue;
                        }
                    }
                    results.push(entry);
                }
            }
        }

        results.reverse();
        results.truncate(limit);
        results
    }

    pub fn get_stats(&self) -> LogStats {
        let path = self.get_active_log_path();
        let size = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);

        let mut total = 0;
        let mut errors = 0;
        let mut warns = 0;

        if let Ok(file) = fs::File::open(&path) {
            let reader = BufReader::new(file);
            for line in reader.lines().flatten() {
                total += 1;
                if line.contains(r#""level":"ERROR""#) {
                    errors += 1;
                } else if line.contains(r#""level":"WARN""#) {
                    warns += 1;
                }
            }
        }

        LogStats {
            log_file_path: path.to_string_lossy().to_string(),
            log_file_size_bytes: size,
            total_lines: total,
            error_count: errors,
            warn_count: warns,
        }
    }

    pub fn clear(&self) -> Result<(), String> {
        let active = self.get_active_log_path();
        let old = self.get_rotated_log_path();
        let _ = fs::remove_file(active);
        let _ = fs::remove_file(old);
        Ok(())
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_APP_LOGGER: AppLoggerEngine = AppLoggerEngine::new();
}
