use rand::Rng;
use serde::{Deserialize, Serialize};
use std::fs::{self, File, OpenOptions};
use std::io::{Seek, SeekFrom, Write};
use std::path::{Path, PathBuf};
use zeroize::Zeroize;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledProgramInfo {
    pub id: String,
    pub name: String,
    pub publisher: String,
    pub version: String,
    pub install_location: String,
    pub uninstall_string: String,
    pub estimated_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShredderResult {
    pub files_shredded: usize,
    pub bytes_shredded: u64,
    pub failed_files: usize,
    pub errors: Vec<String>,
}

#[cfg(windows)]
mod win_uninstaller {
    use super::InstalledProgramInfo;
    use winreg::enums::*;
    use winreg::RegKey;

    pub fn list_installed_programs() -> Vec<InstalledProgramInfo> {
        let mut programs = Vec::new();
        let targets = vec![
            (HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
            (HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"),
            (HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
        ];

        for (hive, subkey) in targets {
            let root = RegKey::predef(hive);
            if let Ok(key) = root.open_subkey(subkey) {
                for key_name in key.enum_keys().flatten() {
                    if let Ok(app_key) = key.open_subkey(&key_name) {
                        let name: String = app_key.get_value("DisplayName").unwrap_or_default();
                        if name.is_empty() {
                            continue;
                        }

                        let publ: String = app_key.get_value("Publisher").unwrap_or_default();
                        let ver: String = app_key.get_value("DisplayVersion").unwrap_or_default();
                        let loc: String = app_key.get_value("InstallLocation").unwrap_or_default();
                        let uninst: String = app_key.get_value("UninstallString").unwrap_or_default();
                        let size: u32 = app_key.get_value("EstimatedSize").unwrap_or(0);

                        programs.push(InstalledProgramInfo {
                            id: format!("{:x}", md5_hash(&format!("{}::{}", name, key_name))),
                            name,
                            publisher: if publ.is_empty() { "Unknown Publisher".to_string() } else { publ },
                            version: if ver.is_empty() { "1.0.0".to_string() } else { ver },
                            install_location: loc,
                            uninstall_string: uninst,
                            estimated_size_bytes: (size as u64) * 1024,
                        });
                    }
                }
            }
        }

        programs.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        programs.dedup_by(|a, b| a.name.to_lowercase() == b.name.to_lowercase());
        programs
    }

    fn md5_hash(input: &str) -> u128 {
        let mut sum: u128 = 0;
        for (i, b) in input.bytes().enumerate() {
            sum = sum.wrapping_add((b as u128) << ((i % 16) * 8));
        }
        sum
    }
}

pub struct UninstallerShredderEngine;

impl UninstallerShredderEngine {
    pub fn list_installed_programs() -> Vec<InstalledProgramInfo> {
        #[cfg(windows)]
        {
            win_uninstaller::list_installed_programs()
        }
        #[cfg(not(windows))]
        {
            Vec::new()
        }
    }

    pub fn execute_uninstall(uninstall_cmd: &str) -> Result<(), String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let output = Command::new("cmd")
                .args(["/c", uninstall_cmd])
                .output();

            match output {
                Ok(o) if o.status.success() => Ok(()),
                Ok(o) => Err(String::from_utf8_lossy(&o.stderr).to_string()),
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            let _ = uninstall_cmd;
            Ok(())
        }
    }

    pub fn shred_file(path_str: &str, passes: usize) -> Result<u64, String> {
        let path = Path::new(path_str);
        if !path.exists() || !path.is_file() {
            return Err("Path is not a regular file".to_string());
        }

        let size = fs::metadata(path).map_err(|e| e.to_string())?.len();
        if size == 0 {
            fs::remove_file(path).map_err(|e| e.to_string())?;
            return Ok(0);
        }

        let mut file = OpenOptions::new()
            .read(true)
            .write(true)
            .open(path)
            .map_err(|e| format!("Failed to open file for shredding: {}", e))?;

        let mut rng = rand::thread_rng();
        let chunk_size = 64 * 1024;
        let mut buffer = vec![0u8; chunk_size];

        for _pass in 0..passes {
            file.seek(SeekFrom::Start(0))
                .map_err(|e| format!("Seek failed: {}", e))?;
            let mut remaining = size;

            while remaining > 0 {
                let to_write = (remaining as usize).min(chunk_size);
                rng.fill(&mut buffer[..to_write]);
                file.write_all(&buffer[..to_write])
                    .map_err(|e| format!("Write pass failed: {}", e))?;
                remaining -= to_write as u64;
            }
            file.flush().map_err(|e| format!("Flush failed: {}", e))?;
        }

        // Final zero pass
        file.seek(SeekFrom::Start(0))
            .map_err(|e| format!("Seek failed: {}", e))?;
        buffer.zeroize();
        let mut remaining = size;
        while remaining > 0 {
            let to_write = (remaining as usize).min(chunk_size);
            file.write_all(&buffer[..to_write])
                .map_err(|e| format!("Zero pass failed: {}", e))?;
            remaining -= to_write as u64;
        }
        file.flush().map_err(|e| format!("Flush failed: {}", e))?;
        drop(file);

        // Delete file
        fs::remove_file(path).map_err(|e| format!("Final unlink failed: {}", e))?;
        Ok(size)
    }

    pub fn shred_targets(paths: &[String], passes: usize) -> ShredderResult {
        let mut shredded_count = 0;
        let mut shredded_bytes = 0;
        let mut failed_count = 0;
        let mut errors = Vec::new();

        for p in paths {
            match Self::shred_file(p, passes) {
                Ok(bytes) => {
                    shredded_count += 1;
                    shredded_bytes += bytes;
                }
                Err(e) => {
                    failed_count += 1;
                    errors.push(format!("{}: {}", p, e));
                }
            }
        }

        ShredderResult {
            files_shredded: shredded_count,
            bytes_shredded: shredded_bytes,
            failed_files: failed_count,
            errors,
        }
    }
}
