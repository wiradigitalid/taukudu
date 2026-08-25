use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanerConfig {
    pub skip_recent_minutes: u64,
    pub secure_delete: bool,
    pub close_browsers_before_clean: bool,
    pub create_restore_point_before_clean: bool,
    pub protect_recycle_bin: bool,
    pub keep_deletion_log: bool,
}

impl Default for CleanerConfig {
    fn default() -> Self {
        Self {
            skip_recent_minutes: 60,
            secure_delete: false,
            close_browsers_before_clean: false,
            create_restore_point_before_clean: false,
            protect_recycle_bin: true,
            keep_deletion_log: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String, // "dark" | "light" | "system"
    pub language: String, // "en", "id", etc.
    pub minimize_to_tray: bool,
    pub show_notification_on_complete: bool,
    pub show_threat_notifications: bool,
    pub run_at_startup: bool,
    pub auto_update: bool,
    pub backup_path: String,
    pub cleaner: CleanerConfig,
    pub exclusions: Vec<String>,
    pub ignored_software_updates: Vec<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        let default_backup = if let Ok(profile) = std::env::var("USERPROFILE") {
            PathBuf::from(profile)
                .join("Documents")
                .join("TauKudu Backups")
                .to_string_lossy()
                .to_string()
        } else {
            "TauKudu Backups".to_string()
        };

        Self {
            theme: "dark".to_string(),
            language: "en".to_string(),
            minimize_to_tray: false,
            show_notification_on_complete: true,
            show_threat_notifications: true,
            run_at_startup: false,
            auto_update: true,
            backup_path: default_backup,
            cleaner: CleanerConfig::default(),
            exclusions: vec!["target".to_string(), ".git".to_string(), "node_modules".to_string()],
            ignored_software_updates: Vec::new(),
        }
    }
}

pub struct SettingsStoreEngine {
    file_path: Mutex<PathBuf>,
    settings: Mutex<AppSettings>,
}

impl SettingsStoreEngine {
    pub fn new() -> Self {
        let base_dir = if let Ok(appdata) = std::env::var("LOCALAPPDATA") {
            PathBuf::from(appdata).join("TauKudu")
        } else {
            PathBuf::from(".taukudu_data")
        };
        let _ = fs::create_dir_all(&base_dir);
        let config_file = base_dir.join("config.json");

        let mut current_settings = AppSettings::default();

        if config_file.exists() {
            if let Ok(content) = fs::read_to_string(&config_file) {
                if let Ok(parsed) = serde_json::from_str::<AppSettings>(&content) {
                    current_settings = parsed;
                }
            }
        } else {
            // Write defaults
            if let Ok(json) = serde_json::to_string_pretty(&current_settings) {
                let _ = fs::write(&config_file, json);
            }
        }

        Self {
            file_path: Mutex::new(config_file),
            settings: Mutex::new(current_settings),
        }
    }

    fn persist(&self) {
        let s = self.settings.lock().unwrap();
        let path = self.file_path.lock().unwrap();
        if let Ok(content) = serde_json::to_string_pretty(&*s) {
            let mut tmp = path.clone();
            tmp.set_extension("tmp");
            if fs::write(&tmp, content).is_ok() {
                let _ = fs::rename(tmp, &*path);
            }
        }
    }

    pub fn get_settings(&self) -> AppSettings {
        self.settings.lock().unwrap().clone()
    }

    pub fn update_settings(&self, new_settings: AppSettings) -> AppSettings {
        {
            let mut s = self.settings.lock().unwrap();
            *s = new_settings;
        }
        self.persist();
        self.get_settings()
    }

    pub fn add_exclusion(&self, path: String) -> Vec<String> {
        let mut out = Vec::new();
        {
            let mut s = self.settings.lock().unwrap();
            if !s.exclusions.contains(&path) {
                s.exclusions.push(path);
            }
            out = s.exclusions.clone();
        }
        self.persist();
        out
    }

    pub fn remove_exclusion(&self, path: &str) -> Vec<String> {
        let mut out = Vec::new();
        {
            let mut s = self.settings.lock().unwrap();
            s.exclusions.retain(|x| x != path);
            out = s.exclusions.clone();
        }
        self.persist();
        out
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_SETTINGS: SettingsStoreEngine = SettingsStoreEngine::new();
}
