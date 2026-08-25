use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

const THROTTLE_WINDOW_SECS: u64 = 24 * 60 * 60; // 24 hours

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrimRecord {
    pub drive_letter: String,
    pub timestamp_secs: u64,
    pub date_formatted: String,
    pub is_throttled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrimHistorySummary {
    pub records: Vec<TrimRecord>,
    pub total_trimmed_drives: usize,
}

pub struct TrimHistoryStore {
    file_path: Mutex<PathBuf>,
    cache: Mutex<HashMap<String, u64>>,
}

impl TrimHistoryStore {
    pub fn new() -> Self {
        let base_dir = if let Ok(appdata) = std::env::var("LOCALAPPDATA") {
            PathBuf::from(appdata).join("TauKudu")
        } else {
            PathBuf::from(".taukudu_data")
        };
        let _ = fs::create_dir_all(&base_dir);
        let file = base_dir.join("trim_history.json");

        let mut map = HashMap::new();
        if file.exists() {
            if let Ok(content) = fs::read_to_string(&file) {
                if let Ok(loaded) = serde_json::from_str::<HashMap<String, u64>>(&content) {
                    map = loaded;
                }
            }
        }

        Self {
            file_path: Mutex::new(file),
            cache: Mutex::new(map),
        }
    }

    fn persist(&self) {
        let map = self.cache.lock().unwrap();
        let path = self.file_path.lock().unwrap();
        if let Ok(content) = serde_json::to_string_pretty(&*map) {
            let mut tmp = path.clone();
            tmp.set_extension("tmp");
            if fs::write(&tmp, content).is_ok() {
                let _ = fs::rename(tmp, &*path);
            }
        }
    }

    pub fn is_throttled(&self, drive: &str) -> bool {
        let clean = drive.trim_end_matches(':').to_uppercase();
        let cache = self.cache.lock().unwrap();
        if let Some(&last_time) = cache.get(&clean) {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs();
            (now - last_time) < THROTTLE_WINDOW_SECS
        } else {
            false
        }
    }

    pub fn record_trim(&self, drive: &str) {
        let clean = drive.trim_end_matches(':').to_uppercase();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        {
            let mut cache = self.cache.lock().unwrap();
            cache.insert(clean, now);
        }
        self.persist();
    }

    pub fn get_summary(&self) -> TrimHistorySummary {
        let cache = self.cache.lock().unwrap();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let mut records = Vec::new();
        for (drive, &ts) in cache.iter() {
            let throttled = (now - ts) < THROTTLE_WINDOW_SECS;
            let date_str = chrono::DateTime::from_timestamp(ts as i64, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
                .unwrap_or_else(|| "Unknown".to_string());

            records.push(TrimRecord {
                drive_letter: drive.clone(),
                timestamp_secs: ts,
                date_formatted: date_str,
                is_throttled: throttled,
            });
        }

        let total = records.len();
        TrimHistorySummary {
            records,
            total_trimmed_drives: total,
        }
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_TRIM_HISTORY: TrimHistoryStore = TrimHistoryStore::new();
}
