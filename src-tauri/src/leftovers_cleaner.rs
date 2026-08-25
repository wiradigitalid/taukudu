use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use winreg::enums::*;
use winreg::RegKey;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeftoverFolderItem {
    pub id: String,
    pub path: String,
    pub folder_name: String,
    pub parent_directory: String,
    pub size_bytes: u64,
    pub file_count: usize,
    pub last_modified: u64,
    pub is_selected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeftoversScanResult {
    pub items: Vec<LeftoverFolderItem>,
    pub total_count: usize,
    pub total_size_bytes: u64,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeftoversCleanResult {
    pub success_count: usize,
    pub failed_count: usize,
    pub bytes_freed: u64,
    pub errors: Vec<String>,
}

pub struct LeftoversCleanerEngine;

impl LeftoversCleanerEngine {
    /// Safe folders and prefixes that must NEVER be flagged as uninstall leftovers
    fn get_safelist() -> HashSet<&'static str> {
        let mut set = HashSet::new();
        // Windows core & system
        set.insert("microsoft");
        set.insert("microsoft corporation");
        set.insert("windows");
        set.insert("windowsapps");
        set.insert("windows nt");
        set.insert("windows defender");
        set.insert("windows mail");
        set.insert("windows media player");
        set.insert("windows security");
        set.insert("windowspowershell");
        set.insert("internet explorer");
        set.insert("common files");
        set.insert("desktop");
        set.insert("documents");
        set.insert("downloads");
        set.insert("pictures");
        set.insert("videos");
        set.insert("music");
        set.insert("appdata");
        set.insert("packages");
        set.insert("system volume information");
        set.insert("$recycle.bin");
        set.insert("temp");
        set.insert("perflogs");
        set.insert("recovery");

        // Developer tools & runtimes
        set.insert(".net");
        set.insert("dotnet");
        set.insert(".dotnet");
        set.insert("python");
        set.insert("python3");
        set.insert("node.js");
        set.insert("nodejs");
        set.insert("node_modules");
        set.insert("rust");
        set.insert(".rustup");
        set.insert(".cargo");
        set.insert("go");
        set.insert("java");
        set.insert("javapath");
        set.insert("git");
        set.insert("npm");
        set.insert("yarn");
        set.insert("pnpm");
        set.insert("pip");
        set.insert("cargo");
        set.insert("visual studio");
        set.insert("microsoft visual studio");

        // Drivers & hardware
        set.insert("nvidia");
        set.insert("nvidia corporation");
        set.insert("amd");
        set.insert("intel");
        set.insert("realtek");
        set.insert("logitech");
        set.insert("razer");
        set.insert("corsair");

        set
    }

    /// Read all installed program display names and tokens from registry
    fn get_installed_program_tokens() -> HashSet<String> {
        let mut tokens = HashSet::new();

        let hives = [
            (HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
            (HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"),
            (HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
        ];

        for (hive, subkey) in hives {
            if let Ok(reg) = RegKey::predef(hive).open_subkey(subkey) {
                for key_name in reg.enum_keys().filter_map(|k| k.ok()) {
                    if let Ok(item_key) = reg.open_subkey(&key_name) {
                        let display_name: Result<String, _> = item_key.get_value("DisplayName");
                        if let Ok(name) = display_name {
                            let clean = name.trim().to_lowercase();
                            if !clean.is_empty() {
                                tokens.insert(clean.clone());

                                // Add first word
                                if let Some(first) = clean.split_whitespace().next() {
                                    if first.len() >= 3 {
                                        tokens.insert(first.to_string());
                                    }
                                }

                                // Add alphanumeric clean
                                let alnum: String = clean.chars().filter(|c| c.is_alphanumeric() || *c == ' ').collect();
                                if !alnum.is_empty() && alnum != clean {
                                    tokens.insert(alnum);
                                }
                            }
                        }

                        let install_loc: Result<String, _> = item_key.get_value("InstallLocation");
                        if let Ok(loc) = install_loc {
                            let p = Path::new(&loc);
                            if let Some(file_name) = p.file_name().and_then(|f| f.to_str()) {
                                tokens.insert(file_name.trim().to_lowercase());
                            }
                        }
                    }
                }
            }
        }

        tokens
    }

    /// Recursively calculate directory size and file count
    fn calculate_dir_info(dir: &Path) -> (u64, usize, u64) {
        let mut size = 0u64;
        let mut files = 0usize;
        let mut latest_mtime = 0u64;

        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let path = entry.path();
                if let Ok(meta) = entry.metadata() {
                    if let Ok(mtime) = meta.modified() {
                        let sec = mtime.duration_since(UNIX_EPOCH).unwrap_or_default().as_secs();
                        if sec > latest_mtime {
                            latest_mtime = sec;
                        }
                    }

                    if meta.is_file() {
                        size += meta.len();
                        files += 1;
                    } else if meta.is_dir() {
                        let (sub_size, sub_files, sub_mtime) = Self::calculate_dir_info(&path);
                        size += sub_size;
                        files += sub_files;
                        if sub_mtime > latest_mtime {
                            latest_mtime = sub_mtime;
                        }
                    }
                }
            }
        }

        (size, files, latest_mtime)
    }

    pub fn scan_leftovers() -> LeftoversScanResult {
        let start = std::time::Instant::now();
        let safelist = Self::get_safelist();
        let installed_tokens = Self::get_installed_program_tokens();

        let mut target_dirs: Vec<PathBuf> = Vec::new();

        if let Ok(appdata) = std::env::var("APPDATA") {
            target_dirs.push(PathBuf::from(appdata));
        }
        if let Ok(localappdata) = std::env::var("LOCALAPPDATA") {
            target_dirs.push(PathBuf::from(localappdata));
        }
        if let Ok(programdata) = std::env::var("ProgramData") {
            target_dirs.push(PathBuf::from(programdata));
        }
        if let Ok(progfiles) = std::env::var("ProgramFiles") {
            target_dirs.push(PathBuf::from(progfiles));
        }
        if let Ok(progfiles86) = std::env::var("ProgramFiles(x86)") {
            target_dirs.push(PathBuf::from(progfiles86));
        }

        let mut items = Vec::new();
        let mut total_size = 0u64;

        for root in target_dirs {
            if !root.is_dir() {
                continue;
            }

            if let Ok(entries) = fs::read_dir(&root) {
                for entry in entries.filter_map(|e| e.ok()) {
                    let path = entry.path();
                    if !path.is_dir() {
                        continue;
                    }

                    let folder_name = match path.file_name().and_then(|f| f.to_str()) {
                        Some(name) => name,
                        None => continue,
                    };

                    let lower = folder_name.trim().to_lowercase();

                    // Check safelist
                    if safelist.contains(lower.as_str()) {
                        continue;
                    }

                    // Check prefix against safelist
                    if safelist.iter().any(|&safe| lower.starts_with(safe)) {
                        continue;
                    }

                    // Check if matched to any installed program token
                    let matches_installed = installed_tokens.iter().any(|tok| {
                        if tok.len() >= 3 && lower.len() >= 3 {
                            tok == &lower || lower.contains(tok) || tok.contains(&lower)
                        } else {
                            tok == &lower
                        }
                    });

                    if matches_installed {
                        continue;
                    }

                    // Calculate folder size and metadata
                    let (size, file_count, mtime) = Self::calculate_dir_info(&path);

                    if size > 0 || file_count > 0 {
                        total_size += size;
                        items.push(LeftoverFolderItem {
                            id: format!("leftover-{}", items.len() + 1),
                            path: path.to_string_lossy().to_string(),
                            folder_name: folder_name.to_string(),
                            parent_directory: root.to_string_lossy().to_string(),
                            size_bytes: size,
                            file_count,
                            last_modified: mtime,
                            is_selected: true,
                        });
                    }
                }
            }
        }

        let count = items.len();
        LeftoversScanResult {
            items,
            total_count: count,
            total_size_bytes: total_size,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    pub fn delete_leftover_folders(paths: &[String]) -> LeftoversCleanResult {
        let mut success = 0;
        let mut failed = 0;
        let mut freed = 0u64;
        let mut errors = Vec::new();

        for p_str in paths {
            let p = Path::new(p_str);
            if p.exists() && p.is_dir() {
                let (size, _, _) = Self::calculate_dir_info(p);
                match fs::remove_dir_all(p) {
                    Ok(_) => {
                        success += 1;
                        freed += size;
                    }
                    Err(e) => {
                        failed += 1;
                        errors.push(format!("Failed to delete {}: {}", p_str, e));
                    }
                }
            }
        }

        LeftoversCleanResult {
            success_count: success,
            failed_count: failed,
            bytes_freed: freed,
            errors,
        }
    }
}
