use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMenuEntryInfo {
    pub id: String,
    pub name: String,
    pub hive: String, // "HKCR" | "HKCU"
    pub scope: String, // "AllFiles" | "Directory" | "Folder" | "Drive"
    pub key_path: String,
    pub command: String,
    pub source: String, // "7-Zip" | "WinRAR" | "VS Code" | "Git" | "ThirdParty"
    pub is_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMenuScanResult {
    pub entries: Vec<ContextMenuEntryInfo>,
    pub total_found: usize,
}

pub struct ContextMenuEngine;

#[cfg(windows)]
mod win_context_menu {
    use super::ContextMenuEntryInfo;
    use std::process::Command;
    use winreg::enums::*;
    use winreg::RegKey;

    const SAFELIST_VERBS: &[&str] = &[
        "open", "edit", "print", "printto", "runas", "opennewwindow",
        "find", "explore", "cmd", "properties", "cut", "copy", "paste",
        "delete", "rename"
    ];

    pub fn scan_menu_entries() -> Vec<ContextMenuEntryInfo> {
        let mut results = Vec::new();
        let roots = vec![
            (HKEY_CLASSES_ROOT, r"*\shell", "AllFiles", "HKCR"),
            (HKEY_CLASSES_ROOT, r"Directory\shell", "Directory", "HKCR"),
            (HKEY_CLASSES_ROOT, r"Folder\shell", "Folder", "HKCR"),
            (HKEY_CURRENT_USER, r"Software\Classes\*\shell", "AllFiles", "HKCU"),
            (HKEY_CURRENT_USER, r"Software\Classes\Directory\shell", "Directory", "HKCU"),
        ];

        for (hive_type, subkey_path, scope, hive_name) in roots {
            let root = RegKey::predef(hive_type);
            if let Ok(shell_key) = root.open_subkey(subkey_path) {
                for key_name in shell_key.enum_keys().flatten() {
                    let lower = key_name.to_lowercase();
                    if SAFELIST_VERBS.contains(&lower.as_str()) {
                        continue;
                    }

                    if let Ok(item_key) = shell_key.open_subkey(&key_name) {
                        let display_name: String = item_key.get_value("").unwrap_or_else(|_| key_name.clone());
                        let mut command = String::new();
                        if let Ok(cmd_key) = item_key.open_subkey("command") {
                            command = cmd_key.get_value("").unwrap_or_default();
                        }

                        let source = infer_source(&key_name, &display_name, &command);

                        results.push(ContextMenuEntryInfo {
                            id: format!("ctx-{}", results.len() + 1),
                            name: if display_name.is_empty() { key_name.clone() } else { display_name },
                            hive: hive_name.to_string(),
                            scope: scope.to_string(),
                            key_path: format!(r"{}\{}\{}", hive_name, subkey_path, key_name),
                            command,
                            source,
                            is_enabled: !key_name.starts_with('_'),
                        });
                    }
                }
            }
        }

        results
    }

    fn infer_source(key_name: &str, display_name: &str, command: &str) -> String {
        let combined = format!("{} {} {}", key_name, display_name, command).to_lowercase();
        if combined.contains("7-zip") {
            "7-Zip".to_string()
        } else if combined.contains("winrar") || combined.contains("rarext") {
            "WinRAR".to_string()
        } else if combined.contains("vscode") || combined.contains("code.exe") {
            "VS Code".to_string()
        } else if combined.contains("git") {
            "Git GUI/Bash".to_string()
        } else if combined.contains("notepad++") {
            "Notepad++".to_string()
        } else if combined.contains("vlc") {
            "VLC Media Player".to_string()
        } else if combined.contains("discord") {
            "Discord".to_string()
        } else {
            "Third-Party Application".to_string()
        }
    }

    pub fn toggle_entry(key_path: &str, enable: bool) -> Result<(), String> {
        let is_hkcr = key_path.starts_with("HKCR");
        let reg_root = if is_hkcr { "HKCR" } else { "HKCU" };
        let subkey = if key_path.starts_with("HKCR\\") {
            &key_path[5..]
        } else if key_path.starts_with("HKCU\\") {
            &key_path[5..]
        } else {
            key_path
        };

        let last_slash = subkey.rfind('\\').ok_or("Invalid registry path")?;
        let parent_path = &subkey[..last_slash];
        let entry_name = &subkey[last_slash + 1..];

        let target_name = if enable && entry_name.starts_with('_') {
            &entry_name[1..]
        } else if !enable && !entry_name.starts_with('_') {
            &format!("_{}", entry_name)
        } else {
            return Ok(());
        };

        let src_full = format!(r"{}\{}\{}", reg_root, parent_path, entry_name);
        let dst_full = format!(r"{}\{}\{}", reg_root, parent_path, target_name);

        let script = format!(
            "Copy-Item -Path 'Registry::{}' -Destination 'Registry::{}' -Recurse -Force; Remove-Item -Path 'Registry::{}' -Recurse -Force",
            src_full, dst_full, src_full
        );

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &script])
            .output();

        match output {
            Ok(o) if o.status.success() => Ok(()),
            Ok(o) => Err(String::from_utf8_lossy(&o.stderr).to_string()),
            Err(e) => Err(e.to_string()),
        }
    }
}

impl ContextMenuEngine {
    pub fn scan_entries() -> ContextMenuScanResult {
        #[cfg(windows)]
        {
            let entries = win_context_menu::scan_menu_entries();
            ContextMenuScanResult {
                total_found: entries.len(),
                entries,
            }
        }
        #[cfg(not(windows))]
        {
            ContextMenuScanResult {
                entries: Vec::new(),
                total_found: 0,
            }
        }
    }

    pub fn toggle_entry(key_path: &str, enable: bool) -> Result<(), String> {
        #[cfg(windows)]
        {
            win_context_menu::toggle_entry(key_path, enable)
        }
        #[cfg(not(windows))]
        {
            let _ = (key_path, enable);
            Ok(())
        }
    }
}
