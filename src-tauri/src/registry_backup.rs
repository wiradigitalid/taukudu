use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryBackupEntry {
    pub id: String,
    pub filename: String,
    pub key_path: String,
    pub file_size_bytes: u64,
    pub created_at: String,
    pub backup_file_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryBackupSummary {
    pub backup_dir: String,
    pub backups: Vec<RegistryBackupEntry>,
    pub total_backups: usize,
}

pub struct RegistryBackupEngine;

impl RegistryBackupEngine {
    pub fn get_backup_dir() -> PathBuf {
        if let Ok(profile) = std::env::var("USERPROFILE") {
            PathBuf::from(profile)
                .join("Documents")
                .join("TauKudu Backups")
                .join("Registry")
        } else {
            PathBuf::from(".taukudu_backups").join("Registry")
        }
    }

    pub fn list_backups() -> RegistryBackupSummary {
        let dir = Self::get_backup_dir();
        let _ = fs::create_dir_all(&dir);

        let mut list = Vec::new();

        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.is_file() && p.extension().and_then(|e| e.to_str()) == Some("reg") {
                    let fname = entry.file_name().to_string_lossy().to_string();
                    let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                    let mtime_str = entry
                        .metadata()
                        .and_then(|m| m.modified())
                        .ok()
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .and_then(|d| chrono::DateTime::from_timestamp(d.as_secs() as i64, 0))
                        .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
                        .unwrap_or_else(|| "Unknown".to_string());

                    list.push(RegistryBackupEntry {
                        id: format!("reg-bak-{}", list.len() + 1),
                        filename: fname.clone(),
                        key_path: fname.replace(".reg", "").replace('_', "\\"),
                        file_size_bytes: size,
                        created_at: mtime_str,
                        backup_file_path: p.to_string_lossy().to_string(),
                    });
                }
            }
        }

        list.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        let total = list.len();

        RegistryBackupSummary {
            backup_dir: dir.to_string_lossy().to_string(),
            backups: list,
            total_backups: total,
        }
    }

    /// Export a Windows Registry Key into a standard .reg file before modifying/deleting
    pub fn export_key(key_path: &str, tag: &str) -> Result<RegistryBackupEntry, String> {
        let dir = Self::get_backup_dir();
        let _ = fs::create_dir_all(&dir);

        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
        let sanitized_tag = tag.replace(|c: char| !c.is_alphanumeric(), "_");
        let filename = format!("reg_{}_{}.reg", sanitized_tag, timestamp);
        let target_file = dir.join(&filename);

        #[cfg(windows)]
        {
            let output = Command::new("reg")
                .args(["export", key_path, target_file.to_str().unwrap_or_default(), "/y"])
                .creation_flags(CREATE_NO_WINDOW)
                .output();

            match output {
                Ok(out) => {
                    if out.status.success() {
                        let size = target_file.metadata().map(|m| m.len()).unwrap_or(0);
                        Ok(RegistryBackupEntry {
                            id: format!("reg-bak-{}", timestamp),
                            filename: filename.clone(),
                            key_path: key_path.to_string(),
                            file_size_bytes: size,
                            created_at: chrono::Utc::now().to_rfc3339(),
                            backup_file_path: target_file.to_string_lossy().to_string(),
                        })
                    } else {
                        let err_msg = String::from_utf8_lossy(&out.stderr).to_string();
                        Err(if err_msg.is_empty() {
                            "Failed to export registry key".to_string()
                        } else {
                            err_msg
                        })
                    }
                }
                Err(e) => Err(format!("reg.exe execution error: {}", e)),
            }
        }
        #[cfg(not(windows))]
        {
            let _ = key_path;
            fs::write(&target_file, "Windows Registry Editor Version 5.00\n").map_err(|e| e.to_string())?;
            Ok(RegistryBackupEntry {
                id: format!("reg-bak-{}", timestamp),
                filename: filename.clone(),
                key_path: "SimulatedKey".to_string(),
                file_size_bytes: 32,
                created_at: chrono::Utc::now().to_rfc3339(),
                backup_file_path: target_file.to_string_lossy().to_string(),
            })
        }
    }

    /// Restore / Import a .reg backup file back into Windows Registry
    pub fn restore_backup_file(file_path: &str) -> Result<String, String> {
        let p = Path::new(file_path);
        if !p.exists() {
            return Err("Backup .reg file not found on disk".to_string());
        }

        #[cfg(windows)]
        {
            let output = Command::new("reg")
                .args(["import", file_path])
                .creation_flags(CREATE_NO_WINDOW)
                .output();

            match output {
                Ok(out) => {
                    if out.status.success() {
                        Ok(format!("Successfully restored registry from {}", file_path))
                    } else {
                        let err = String::from_utf8_lossy(&out.stderr).to_string();
                        Err(if err.is_empty() {
                            "Failed to import .reg file".to_string()
                        } else {
                            err
                        })
                    }
                }
                Err(e) => Err(format!("reg.exe import execution error: {}", e)),
            }
        }
        #[cfg(not(windows))]
        {
            let _ = file_path;
            Ok("Registry import simulated for non-windows".to_string())
        }
    }

    pub fn delete_backup(file_path: &str) -> Result<(), String> {
        let p = Path::new(file_path);
        if p.exists() {
            fs::remove_file(p).map_err(|e| e.to_string())?;
        }
        Ok(())
    }
}
