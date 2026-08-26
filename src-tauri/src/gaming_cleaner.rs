use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GamingTargetDetail {
    pub id: String,
    pub group: String, // "Launcher Caches", "GPU Shader Caches", "Steam Game Shader Caches", "Steam Redistributables"
    pub title: String,
    pub detail: String,
    pub path: String,
    pub size_bytes: u64,
    pub file_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GamingScanSummary {
    pub targets: Vec<GamingTargetDetail>,
    pub total_size_bytes: u64,
    pub total_items: usize,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GamingCleanResult {
    pub cleaned_count: usize,
    pub bytes_freed: u64,
    pub failed_count: usize,
    pub errors: Vec<String>,
}

pub struct GamingCleanerEngine;

impl GamingCleanerEngine {
    /// Discover all Steam library folders across drives from libraryfolders.vdf
    pub fn get_steam_libraries() -> Vec<PathBuf> {
        let mut libraries = HashSet::new();

        let mut candidate_roots = Vec::new();
        if let Ok(progfiles_x86) = std::env::var("ProgramFiles(x86)") {
            candidate_roots.push(PathBuf::from(&progfiles_x86).join("Steam"));
        }
        if let Ok(progfiles) = std::env::var("ProgramFiles") {
            candidate_roots.push(PathBuf::from(&progfiles).join("Steam"));
        }
        if let Ok(localappdata) = std::env::var("LOCALAPPDATA") {
            candidate_roots.push(PathBuf::from(&localappdata).join("Steam"));
        }
        candidate_roots.push(PathBuf::from(r"C:\Steam"));
        candidate_roots.push(PathBuf::from(r"D:\Steam"));
        candidate_roots.push(PathBuf::from(r"E:\Steam"));
        candidate_roots.push(PathBuf::from(r"D:\SteamLibrary"));
        candidate_roots.push(PathBuf::from(r"E:\SteamLibrary"));

        for root in candidate_roots {
            if root.join("steamapps").exists() {
                libraries.insert(root.clone());
            }

            let vdf_path = root.join("steamapps").join("libraryfolders.vdf");
            if vdf_path.is_file() {
                if let Ok(content) = fs::read_to_string(&vdf_path) {
                    for line in content.lines() {
                        let trimmed = line.trim();
                        if trimmed.starts_with("\"path\"") {
                            let parts: Vec<&str> = trimmed.split('"').filter(|s| !s.trim().is_empty()).collect();
                            if parts.len() >= 2 {
                                let raw_path = parts[1].replace(r"\\", r"\");
                                let pb = PathBuf::from(&raw_path);
                                if pb.exists() {
                                    libraries.insert(pb);
                                }
                            }
                        }
                    }
                }
            }
        }

        libraries.into_iter().collect()
    }

    /// Read appmanifest_*.acf files in a steamapps folder to map AppID -> Game Name
    pub fn build_steam_app_id_map(steamapps_dir: &Path) -> HashMap<String, String> {
        let mut map = HashMap::new();
        if let Ok(entries) = fs::read_dir(steamapps_dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if let Some(name) = p.file_name().and_then(|n| n.to_str()) {
                    if name.starts_with("appmanifest_") && name.ends_with(".acf") {
                        if let Ok(content) = fs::read_to_string(&p) {
                            let mut appid = None;
                            let mut game_name = None;

                            for line in content.lines() {
                                let trimmed = line.trim();
                                if trimmed.starts_with("\"appid\"") {
                                    let parts: Vec<&str> = trimmed.split('"').filter(|s| !s.trim().is_empty()).collect();
                                    if parts.len() >= 2 {
                                        appid = Some(parts[1].to_string());
                                    }
                                } else if trimmed.starts_with("\"name\"") {
                                    let parts: Vec<&str> = trimmed.split('"').filter(|s| !s.trim().is_empty()).collect();
                                    if parts.len() >= 2 {
                                        game_name = Some(parts[1].to_string());
                                    }
                                }
                            }

                            if let (Some(id), Some(name)) = (appid, game_name) {
                                map.insert(id, name);
                            }
                        }
                    }
                }
            }
        }
        map
    }

    pub fn scan_gaming_targets() -> GamingScanSummary {
        let start = Instant::now();
        let mut targets = Vec::new();
        let mut total_size = 0u64;

        let localappdata = std::env::var("LOCALAPPDATA").unwrap_or_default();
        let appdata = std::env::var("APPDATA").unwrap_or_default();
        let programdata = std::env::var("PROGRAMDATA").unwrap_or_default();

        // 1. Launcher Caches
        let launcher_paths = vec![
            ("Epic Games Launcher Cache", PathBuf::from(&localappdata).join("EpicGamesLauncher").join("Saved").join("webcache")),
            ("Epic Games Logs", PathBuf::from(&localappdata).join("EpicGamesLauncher").join("Saved").join("Logs")),
            ("Ubisoft Connect Cache", PathBuf::from(&localappdata).join("Ubisoft Game Launcher").join("cache")),
            ("EA Desktop / Origin Web Cache", PathBuf::from(&localappdata).join("Electronic Arts").join("EA Desktop").join("Logs")),
            ("Battle.net Client Logs & Cache", PathBuf::from(&programdata).join("Battle.net").join("Logs")),
            ("GOG Galaxy Web Cache", PathBuf::from(&localappdata).join("GOG.com").join("Galaxy").join("webcache")),
            ("Riot Games Logs", PathBuf::from(&localappdata).join("Riot Games").join("Riot Client").join("Logs")),
            ("Steam HTML & HTTP Cache", PathBuf::from(&localappdata).join("Steam").join("htmlcache")),
        ];

        for (title, path) in launcher_paths {
            if path.exists() {
                let (size, count) = Self::calculate_dir_metrics(&path);
                if size > 0 {
                    total_size += size;
                    targets.push(GamingTargetDetail {
                        id: format!("game-launcher-{}", targets.len() + 1),
                        group: "Launcher Caches".to_string(),
                        title: title.to_string(),
                        detail: format!("{} files ({})", count, Self::format_bytes(size)),
                        path: path.to_string_lossy().to_string(),
                        size_bytes: size,
                        file_count: count,
                    });
                }
            }
        }

        // 2. GPU Shader Caches
        let gpu_paths = vec![
            ("DirectX D3D Shader Cache", PathBuf::from(&localappdata).join("D3DSCache")),
            ("NVIDIA DX / GL Cache", PathBuf::from(&localappdata).join("NVIDIA").join("DXCache")),
            ("NVIDIA GLCache", PathBuf::from(&localappdata).join("NVIDIA").join("GLCache")),
            ("AMD Radeon Shader Cache", PathBuf::from(&localappdata).join("AMD").join("DxCache")),
            ("Intel Graphics Shader Cache", PathBuf::from(&localappdata).join("Intel").join("ShaderCache")),
        ];

        for (title, path) in gpu_paths {
            if path.exists() {
                let (size, count) = Self::calculate_dir_metrics(&path);
                if size > 0 {
                    total_size += size;
                    targets.push(GamingTargetDetail {
                        id: format!("game-gpu-{}", targets.len() + 1),
                        group: "GPU Shader Caches".to_string(),
                        title: title.to_string(),
                        detail: format!("{} files ({})", count, Self::format_bytes(size)),
                        path: path.to_string_lossy().to_string(),
                        size_bytes: size,
                        file_count: count,
                    });
                }
            }
        }

        // 3. Steam Per-Game Shader Caches & Redistributables
        let steam_libs = Self::get_steam_libraries();
        for lib in steam_libs {
            let steamapps = lib.join("steamapps");
            let shader_cache_dir = steamapps.join("shadercache");

            if shader_cache_dir.is_dir() {
                let appid_map = Self::build_steam_app_id_map(&steamapps);

                if let Ok(entries) = fs::read_dir(&shader_cache_dir) {
                    for entry in entries.flatten() {
                        let p = entry.path();
                        if p.is_dir() {
                            let appid = p.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
                            let (size, count) = Self::calculate_dir_metrics(&p);
                            if size >= 1024 {
                                total_size += size;
                                let game_title = appid_map.get(&appid).cloned().unwrap_or_else(|| format!("Steam App #{}", appid));
                                targets.push(GamingTargetDetail {
                                    id: format!("game-steam-shader-{}", targets.len() + 1),
                                    group: "Steam Game Shader Caches".to_string(),
                                    title: format!("{} (Shader Cache)", game_title),
                                    detail: format!("AppID: {} • {} files ({})", appid, count, Self::format_bytes(size)),
                                    path: p.to_string_lossy().to_string(),
                                    size_bytes: size,
                                    file_count: count,
                                });
                            }
                        }
                    }
                }
            }

            // Steam common redistributables
            let common_redist = steamapps.join("common").join("Steamworks Shared").join("_CommonRedist");
            if common_redist.exists() {
                let (size, count) = Self::calculate_dir_metrics(&common_redist);
                if size > 0 {
                    total_size += size;
                    targets.push(GamingTargetDetail {
                        id: format!("game-steam-redist-{}", targets.len() + 1),
                        group: "Steam Redistributables".to_string(),
                        title: "Steamworks Shared (_CommonRedist Installers)".to_string(),
                        detail: format!("DirectX / vcredist installers • {} files ({})", count, Self::format_bytes(size)),
                        path: common_redist.to_string_lossy().to_string(),
                        size_bytes: size,
                        file_count: count,
                    });
                }
            }
        }

        let total_items = targets.len();

        GamingScanSummary {
            targets,
            total_size_bytes: total_size,
            total_items,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    pub fn clean_gaming_targets(paths: &[String]) -> GamingCleanResult {
        let mut cleaned = 0;
        let mut freed = 0u64;
        let mut failed = 0;
        let mut errors = Vec::new();

        for p_str in paths {
            let p = Path::new(p_str);
            if p.exists() {
                let (size, _) = Self::calculate_dir_metrics(p);
                match fs::remove_dir_all(p) {
                    Ok(_) => {
                        cleaned += 1;
                        freed += size;
                    }
                    Err(e) => {
                        failed += 1;
                        errors.push(format!("Failed to clean {}: {}", p_str, e));
                    }
                }
            }
        }

        GamingCleanResult {
            cleaned_count: cleaned,
            bytes_freed: freed,
            failed_count: failed,
            errors,
        }
    }

    fn calculate_dir_metrics(path: &Path) -> (u64, usize) {
        let mut total_bytes = 0u64;
        let mut file_count = 0usize;

        for entry in walkdir::WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() {
                if let Ok(meta) = entry.metadata() {
                    total_bytes += meta.len();
                    file_count += 1;
                }
            }
        }

        (total_bytes, file_count)
    }

    fn format_bytes(bytes: u64) -> String {
        const KB: u64 = 1024;
        const MB: u64 = KB * 1024;
        const GB: u64 = MB * 1024;

        if bytes >= GB {
            format!("{:.2} GB", bytes as f64 / GB as f64)
        } else if bytes >= MB {
            format!("{:.1} MB", bytes as f64 / MB as f64)
        } else if bytes >= KB {
            format!("{:.1} KB", bytes as f64 / KB as f64)
        } else {
            format!("{} B", bytes)
        }
    }
}
