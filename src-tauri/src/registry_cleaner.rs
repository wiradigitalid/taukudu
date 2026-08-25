use serde::{Deserialize, Serialize};
use std::time::Instant;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryIssue {
    pub id: String,
    pub category: String, // "shared_dlls" | "app_paths" | "startup_entries" | "mui_cache"
    pub key_path: String,
    pub value_name: String,
    pub issue_description: String,
    pub target_file: String,
    pub is_selected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryScanResult {
    pub issues: Vec<RegistryIssue>,
    pub total_found: usize,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryFixResult {
    pub fixed_count: usize,
    pub failed_count: usize,
    pub errors: Vec<String>,
}

pub struct RegistryCleanerEngine;

#[cfg(windows)]
mod win_reg_scanner {
    use super::RegistryIssue;
    use std::path::Path;
    use winreg::enums::*;
    use winreg::RegKey;

    pub fn scan_orphaned_entries() -> Vec<RegistryIssue> {
        let mut issues = Vec::new();

        // 1. Shared DLLs: HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\SharedDLLs
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        if let Ok(shared_key) = hklm.open_subkey(r"SOFTWARE\Microsoft\Windows\CurrentVersion\SharedDLLs") {
            for (dll_path, _) in shared_key.enum_values().flatten() {
                if !dll_path.is_empty() && dll_path.contains('\\') {
                    if !Path::new(&dll_path).exists() {
                        issues.push(RegistryIssue {
                            id: format!("shared-dll-{}", issues.len() + 1),
                            category: "shared_dlls".to_string(),
                            key_path: r"HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\SharedDLLs".to_string(),
                            value_name: dll_path.clone(),
                            issue_description: "Shared DLL reference points to missing file on disk".to_string(),
                            target_file: dll_path,
                            is_selected: true,
                        });
                    }
                }
            }
        }

        // 2. App Paths: HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths
        if let Ok(app_paths_key) = hklm.open_subkey(r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths") {
            for subkey_name in app_paths_key.enum_keys().flatten() {
                if let Ok(app_key) = app_paths_key.open_subkey(&subkey_name) {
                    let default_val: String = app_key.get_value("").unwrap_or_default();
                    let clean_path = default_val.trim_matches('"').trim();
                    if !clean_path.is_empty() && clean_path.ends_with(".exe") {
                        if !Path::new(clean_path).exists() {
                            issues.push(RegistryIssue {
                                id: format!("app-path-{}", issues.len() + 1),
                                category: "app_paths".to_string(),
                                key_path: format!(r"HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\{}", subkey_name),
                                value_name: "".to_string(),
                                issue_description: "Registered App Path executable does not exist".to_string(),
                                target_file: clean_path.to_string(),
                                is_selected: true,
                            });
                        }
                    }
                }
            }
        }

        // 3. User MUI Cache (Missing app strings in explorer)
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        if let Ok(mui_key) = hkcu.open_subkey(r"Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\MuiCache") {
            for (val_name, _) in mui_key.enum_values().flatten() {
                if val_name.ends_with(".ApplicationCompany") || val_name.ends_with(".FriendlyAppName") {
                    let exe_part = val_name.split('.').next().unwrap_or("").to_string();
                    if exe_part.contains('\\') && !Path::new(&exe_part).exists() {
                        issues.push(RegistryIssue {
                            id: format!("mui-cache-{}", issues.len() + 1),
                            category: "mui_cache".to_string(),
                            key_path: r"HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\MuiCache".to_string(),
                            value_name: val_name,
                            issue_description: "MUI cache references uninstalled application".to_string(),
                            target_file: exe_part,
                            is_selected: true,
                        });
                    }
                }
            }
        }

        issues
    }

    pub fn fix_issue(key_path: &str, value_name: &str) -> Result<(), String> {
        let is_hklm = key_path.starts_with("HKLM");
        let subkey = if is_hklm {
            key_path.trim_start_matches("HKLM\\")
        } else {
            key_path.trim_start_matches("HKCU\\")
        };

        let hive = if is_hklm {
            RegKey::predef(HKEY_LOCAL_MACHINE)
        } else {
            RegKey::predef(HKEY_CURRENT_USER)
        };

        if value_name.is_empty() {
            // Delete entire subkey (e.g. invalid App Paths)
            let parent_idx = subkey.rfind('\\').ok_or("Invalid subkey path")?;
            let parent_path = &subkey[..parent_idx];
            let child_name = &subkey[parent_idx + 1..];
            let parent_key = hive.open_subkey_with_flags(parent_path, KEY_WRITE).map_err(|e| e.to_string())?;
            parent_key.delete_subkey_all(child_name).map_err(|e| e.to_string())?;
        } else {
            // Delete specific value
            let key = hive.open_subkey_with_flags(subkey, KEY_WRITE).map_err(|e| e.to_string())?;
            key.delete_value(value_name).map_err(|e| e.to_string())?;
        }

        Ok(())
    }
}

impl RegistryCleanerEngine {
    pub fn scan_registry() -> RegistryScanResult {
        let start = Instant::now();

        #[cfg(windows)]
        {
            let issues = win_reg_scanner::scan_orphaned_entries();
            RegistryScanResult {
                total_found: issues.len(),
                issues,
                duration_ms: start.elapsed().as_millis() as u64,
            }
        }
        #[cfg(not(windows))]
        {
            RegistryScanResult {
                issues: Vec::new(),
                total_found: 0,
                duration_ms: start.elapsed().as_millis() as u64,
            }
        }
    }

    pub fn fix_registry_issues(targets: &[(String, String)]) -> RegistryFixResult {
        let mut fixed = 0;
        let mut failed = 0;
        let mut errors = Vec::new();

        #[cfg(windows)]
        {
            for (key_path, val_name) in targets {
                match win_reg_scanner::fix_issue(key_path, val_name) {
                    Ok(_) => fixed += 1,
                    Err(e) => {
                        failed += 1;
                        errors.push(format!("{}: {}", key_path, e));
                    }
                }
            }
        }
        #[cfg(not(windows))]
        {
            let _ = targets;
        }

        RegistryFixResult {
            fixed_count: fixed,
            failed_count: failed,
            errors,
        }
    }
}
