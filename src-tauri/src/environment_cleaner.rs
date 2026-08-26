use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::time::Instant;

#[cfg(windows)]
use winreg::enums::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE, KEY_READ, KEY_WRITE};
#[cfg(windows)]
use winreg::RegKey;

const KNOWN_DEV_VARS: &[&str] = &[
    "JAVA_HOME", "JDK_HOME", "JRE_HOME",
    "GOROOT", "GOBIN",
    "CARGO_HOME", "RUSTUP_HOME",
    "NVM_HOME", "NVM_DIR", "NVM_SYMLINK",
    "CONDA_PREFIX", "CONDA_HOME", "VIRTUAL_ENV", "PYENV_ROOT",
    "ANDROID_HOME", "ANDROID_SDK_ROOT", "ANDROID_NDK_ROOT",
    "FLUTTER_ROOT", "FLUTTER_HOME", "PUB_CACHE",
    "GRADLE_HOME", "GRADLE_USER_HOME", "M2_HOME", "MAVEN_HOME",
    "DOTNET_ROOT", "DOTNET_INSTALL_DIR", "NUGET_PACKAGES",
    "RUBY_HOME", "GEM_HOME", "RBENV_ROOT",
    "PERL_HOME", "PHP_HOME", "COMPOSER_HOME",
    "SCALA_HOME", "SBT_HOME",
    "HASKELL_HOME", "STACK_ROOT", "CABAL_DIR",
    "DENO_INSTALL", "BUN_INSTALL",
    "PNPM_HOME", "YARN_GLOBAL_FOLDER",
    "VCPKG_ROOT", "CUDA_PATH", "CUDA_HOME",
    "DOCKER_CONFIG", "MINIKUBE_HOME", "HELM_HOME",
    "TERRAFORM_HOME", "PACKER_HOME", "GHCUP_HOME",
];

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrphanEnvItem {
    pub id: String,
    pub variable_name: String,
    pub raw_value: String,
    pub expanded_value: String,
    pub scope: String, // "user" or "system"
    pub entry_type: String, // "PATH_ENTRY" or "VAR_ENTRY"
    pub missing_reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvCleanerScanResult {
    pub items: Vec<OrphanEnvItem>,
    pub total_scanned: usize,
    pub total_orphans: usize,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvCleanerCleanResult {
    pub cleaned_count: usize,
    pub failed_count: usize,
    pub errors: Vec<String>,
}

pub struct EnvironmentCleanerEngine;

impl EnvironmentCleanerEngine {
    pub fn scan_environment() -> EnvCleanerScanResult {
        let start = Instant::now();
        let mut orphans = Vec::new();
        let mut total_scanned = 0;

        #[cfg(windows)]
        {
            let mut merged_vars = HashMap::new();

            // Read User Env
            let user_vars = Self::read_registry_env(HKEY_CURRENT_USER, "Environment");
            for (k, v) in &user_vars {
                merged_vars.insert(k.to_uppercase(), v.clone());
            }

            // Read System Env
            let system_vars = Self::read_registry_env(
                HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment",
            );
            for (k, v) in &system_vars {
                merged_vars.insert(k.to_uppercase(), v.clone());
            }

            // Scan User PATH entries
            if let Some(user_path) = user_vars.get("Path").or_else(|| user_vars.get("PATH")) {
                for slice in user_path.split(';').map(|s| s.trim()).filter(|s| !s.is_empty()) {
                    total_scanned += 1;
                    let expanded = Self::expand_vars(slice, &merged_vars);
                    if !Path::new(&expanded).exists() {
                        orphans.push(OrphanEnvItem {
                            id: format!("env-user-path-{}", orphans.len() + 1),
                            variable_name: "PATH (User)".to_string(),
                            raw_value: slice.to_string(),
                            expanded_value: expanded,
                            scope: "user".to_string(),
                            entry_type: "PATH_ENTRY".to_string(),
                            missing_reason: "Directory referenced in User PATH does not exist".to_string(),
                        });
                    }
                }
            }

            // Scan System PATH entries
            if let Some(sys_path) = system_vars.get("Path").or_else(|| system_vars.get("PATH")) {
                for slice in sys_path.split(';').map(|s| s.trim()).filter(|s| !s.is_empty()) {
                    total_scanned += 1;
                    let expanded = Self::expand_vars(slice, &merged_vars);
                    if !Path::new(&expanded).exists() {
                        orphans.push(OrphanEnvItem {
                            id: format!("env-sys-path-{}", orphans.len() + 1),
                            variable_name: "PATH (System)".to_string(),
                            raw_value: slice.to_string(),
                            expanded_value: expanded,
                            scope: "system".to_string(),
                            entry_type: "PATH_ENTRY".to_string(),
                            missing_reason: "Directory referenced in System PATH does not exist".to_string(),
                        });
                    }
                }
            }

            // Scan Dev Environment Variables (User Hive)
            for (k, v) in &user_vars {
                if k.eq_ignore_ascii_case("Path") {
                    continue;
                }
                if KNOWN_DEV_VARS.iter().any(|&dv| dv.eq_ignore_ascii_case(k)) {
                    total_scanned += 1;
                    let expanded = Self::expand_vars(v, &merged_vars);
                    if !Path::new(&expanded).exists() {
                        orphans.push(OrphanEnvItem {
                            id: format!("env-user-var-{}", orphans.len() + 1),
                            variable_name: k.clone(),
                            raw_value: v.clone(),
                            expanded_value: expanded,
                            scope: "user".to_string(),
                            entry_type: "VAR_ENTRY".to_string(),
                            missing_reason: format!("Variable {} points to non-existent directory", k),
                        });
                    }
                }
            }

            // Scan Dev Environment Variables (System Hive)
            for (k, v) in &system_vars {
                if k.eq_ignore_ascii_case("Path") {
                    continue;
                }
                if KNOWN_DEV_VARS.iter().any(|&dv| dv.eq_ignore_ascii_case(k)) {
                    total_scanned += 1;
                    let expanded = Self::expand_vars(v, &merged_vars);
                    if !Path::new(&expanded).exists() {
                        orphans.push(OrphanEnvItem {
                            id: format!("env-sys-var-{}", orphans.len() + 1),
                            variable_name: k.clone(),
                            raw_value: v.clone(),
                            expanded_value: expanded,
                            scope: "system".to_string(),
                            entry_type: "VAR_ENTRY".to_string(),
                            missing_reason: format!("System variable {} points to non-existent directory", k),
                        });
                    }
                }
            }
        }

        #[cfg(not(windows))]
        {
            total_scanned = 1;
        }

        let total_orphans = orphans.len();

        EnvCleanerScanResult {
            items: orphans,
            total_scanned,
            total_orphans,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    pub fn clean_environment_items(items_to_clean: &[OrphanEnvItem]) -> EnvCleanerCleanResult {
        let mut cleaned = 0;
        let mut failed = 0;
        let mut errors = Vec::new();

        #[cfg(windows)]
        {
            for item in items_to_clean {
                let (root, subkey) = if item.scope == "user" {
                    (HKEY_CURRENT_USER, "Environment")
                } else {
                    (
                        HKEY_LOCAL_MACHINE,
                        r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment",
                    )
                };

                let hk = RegKey::predef(root);
                match hk.open_subkey_with_flags(subkey, KEY_READ | KEY_WRITE) {
                    Ok(key) => {
                        if item.entry_type == "PATH_ENTRY" {
                            let current_path: Result<String, _> = key.get_value("Path").or_else(|_| key.get_value("PATH"));
                            match current_path {
                                Ok(val) => {
                                    let new_entries: Vec<&str> = val
                                        .split(';')
                                        .map(|s| s.trim())
                                        .filter(|s| !s.is_empty() && *s != item.raw_value)
                                        .collect();
                                    let new_path = new_entries.join(";");
                                    let val_name = if key.get_value::<String, _>("Path").is_ok() { "Path" } else { "PATH" };
                                    if key.set_value(val_name, &new_path).is_ok() {
                                        cleaned += 1;
                                    } else {
                                        failed += 1;
                                        errors.push(format!("Failed to write updated PATH in {} hive", item.scope));
                                    }
                                }
                                Err(e) => {
                                    failed += 1;
                                    errors.push(format!("Failed to read PATH in {}: {}", item.scope, e));
                                }
                            }
                        } else {
                            // VAR_ENTRY: Delete registry key value
                            match key.delete_value(&item.variable_name) {
                                Ok(_) => cleaned += 1,
                                Err(e) => {
                                    failed += 1;
                                    errors.push(format!("Failed to delete variable {}: {}", item.variable_name, e));
                                }
                            }
                        }
                    }
                    Err(e) => {
                        failed += 1;
                        errors.push(format!("Access denied opening {} registry hive (Administrator rights may be required): {}", item.scope, e));
                    }
                }
            }

            // Notify Windows environment change
            Self::broadcast_environment_change();
        }

        #[cfg(not(windows))]
        {
            let _ = items_to_clean;
            cleaned = items_to_clean.len();
        }

        EnvCleanerCleanResult {
            cleaned_count: cleaned,
            failed_count: failed,
            errors,
        }
    }

    #[cfg(windows)]
    fn read_registry_env(root: winreg::HKEY, subkey: &str) -> HashMap<String, String> {
        let mut map = HashMap::new();
        let hk = RegKey::predef(root);
        if let Ok(key) = hk.open_subkey_with_flags(subkey, KEY_READ) {
            for (name, val) in key.enum_values().flatten() {
                let str_val = val.to_string();
                if !str_val.is_empty() {
                    map.insert(name, str_val);
                }
            }
        }
        map
    }

    fn expand_vars(input: &str, registry_vars: &HashMap<String, String>) -> String {
        let mut result = input.to_string();
        for (k, v) in registry_vars {
            let placeholder = format!("%{}%", k);
            if result.to_uppercase().contains(&placeholder.to_uppercase()) {
                result = result.replace(&placeholder, v);
            }
        }

        // Process environment fallback
        for (k, v) in std::env::vars() {
            let placeholder = format!("%{}%", k);
            if result.contains(&placeholder) {
                result = result.replace(&placeholder, &v);
            }
        }

        result
    }

    #[cfg(windows)]
    fn broadcast_environment_change() {
        use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
        use windows::Win32::UI::WindowsAndMessaging::{
            SendMessageTimeoutW, HWND_BROADCAST, SMTO_ABORTIFHUNG, WM_SETTINGCHANGE,
        };

        unsafe {
            let env_str: Vec<u16> = "Environment\0".encode_utf16().collect();
            let mut result: usize = 0;
            let _ = SendMessageTimeoutW(
                HWND(HWND_BROADCAST.0),
                WM_SETTINGCHANGE,
                WPARAM(0),
                LPARAM(env_str.as_ptr() as isize),
                SMTO_ABORTIFHUNG,
                1000,
                Some(&mut result),
            );
        }
    }
}
