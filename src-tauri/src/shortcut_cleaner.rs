use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrokenShortcutItem {
    pub id: String,
    pub shortcut_path: String,
    pub filename: String,
    pub target_path: Option<String>,
    pub broken_reason: String,
    pub location_type: String, // "Desktop", "StartMenu", "Startup", "Recent"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrokenShortcutScanResult {
    pub items: Vec<BrokenShortcutItem>,
    pub total_scanned: usize,
    pub total_broken: usize,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrokenShortcutCleanResult {
    pub deleted_count: usize,
    pub failed_count: usize,
    pub errors: Vec<String>,
}

pub struct ShortcutCleanerEngine;

impl ShortcutCleanerEngine {
    pub fn get_shortcut_directories() -> Vec<(String, PathBuf)> {
        let mut dirs = Vec::new();

        if let Ok(profile) = std::env::var("USERPROFILE") {
            let p = PathBuf::from(&profile);
            dirs.push(("Desktop (User)".to_string(), p.join("Desktop")));
            dirs.push((
                "Start Menu (User)".to_string(),
                p.join("AppData")
                    .join("Roaming")
                    .join("Microsoft")
                    .join("Windows")
                    .join("Start Menu")
                    .join("Programs"),
            ));
            dirs.push((
                "Startup (User)".to_string(),
                p.join("AppData")
                    .join("Roaming")
                    .join("Microsoft")
                    .join("Windows")
                    .join("Start Menu")
                    .join("Programs")
                    .join("Startup"),
            ));
            dirs.push((
                "Recent Items".to_string(),
                p.join("AppData")
                    .join("Roaming")
                    .join("Microsoft")
                    .join("Windows")
                    .join("Recent"),
            ));
        }

        if let Ok(pub_profile) = std::env::var("PUBLIC") {
            let p = PathBuf::from(&pub_profile);
            dirs.push(("Desktop (Public)".to_string(), p.join("Desktop")));
            dirs.push((
                "Start Menu (Public)".to_string(),
                p.join("Microsoft")
                    .join("Windows")
                    .join("Start Menu")
                    .join("Programs"),
            ));
        }

        if let Ok(progdata) = std::env::var("PROGRAMDATA") {
            let p = PathBuf::from(&progdata);
            dirs.push((
                "Start Menu (All Users)".to_string(),
                p.join("Microsoft")
                    .join("Windows")
                    .join("Start Menu")
                    .join("Programs"),
            ));
            dirs.push((
                "Startup (All Users)".to_string(),
                p.join("Microsoft")
                    .join("Windows")
                    .join("Start Menu")
                    .join("Programs")
                    .join("Startup"),
            ));
        }

        dirs
    }

    /// Extract target path from Windows .lnk binary structure (Shell Link .LNK specification)
    /// Parses LinkTargetIDList, LinkInfo, or StringData headers without relying on slow COM objects.
    pub fn parse_lnk_target(lnk_path: &Path) -> Option<String> {
        let bytes = fs::read(lnk_path).ok()?;
        if bytes.len() < 76 {
            return None;
        }

        // Header size (4 bytes, 0x0000004C) and LinkCLSID check
        let header_size = u32::from_le_bytes(bytes[0..4].try_into().ok()?);
        if header_size != 0x4C {
            return None;
        }

        let link_flags = u32::from_le_bytes(bytes[20..24].try_into().ok()?);
        let has_link_info = (link_flags & 0x02) != 0;
        let has_relative_path = (link_flags & 0x08) != 0;

        let mut offset = 76usize;

        // Skip IDList if present
        if (link_flags & 0x01) != 0 {
            if bytes.len() < offset + 2 {
                return None;
            }
            let id_list_size = u16::from_le_bytes(bytes[offset..offset + 2].try_into().ok()?) as usize;
            offset += 2 + id_list_size;
        }

        // Parse LinkInfo Structure
        if has_link_info && bytes.len() >= offset + 28 {
            let link_info_size = u32::from_le_bytes(bytes[offset..offset + 4].try_into().ok()?) as usize;
            if link_info_size >= 28 && bytes.len() >= offset + link_info_size {
                let link_info_header_size = u32::from_le_bytes(bytes[offset + 4..offset + 8].try_into().ok()?) as usize;
                let link_info_flags = u32::from_le_bytes(bytes[offset + 8..offset + 12].try_into().ok()?);

                // LocalBasePathOffset
                if (link_info_flags & 0x01) != 0 {
                    let local_base_path_offset = u32::from_le_bytes(bytes[offset + 16..offset + 20].try_into().ok()?) as usize;
                    if local_base_path_offset < link_info_size {
                        let path_start = offset + local_base_path_offset;
                        if let Some(null_pos) = bytes[path_start..offset + link_info_size].iter().position(|&b| b == 0) {
                            let path_bytes = &bytes[path_start..path_start + null_pos];
                            let raw_str = String::from_utf8_lossy(path_bytes).to_string();
                            if !raw_str.is_empty() {
                                return Some(raw_str);
                            }
                        }
                    }
                }

                // Unicode LocalBasePathOffset if present (header size >= 36)
                if link_info_header_size >= 36 {
                    let unicode_offset = u32::from_le_bytes(bytes[offset + 28..offset + 32].try_into().ok()?) as usize;
                    if unicode_offset < link_info_size {
                        let u_start = offset + unicode_offset;
                        let raw_u16: Vec<u16> = bytes[u_start..offset + link_info_size]
                            .chunks_exact(2)
                            .map(|c| u16::from_le_bytes([c[0], c[1]]))
                            .take_while(|&c| c != 0)
                            .collect();
                        if !raw_u16.is_empty() {
                            return Some(String::from_utf16_lossy(&raw_u16));
                        }
                    }
                }

                offset += link_info_size;
            }
        }

        // Fallback: Check Relative Path String
        if has_relative_path && bytes.len() >= offset + 2 {
            let str_len = u16::from_le_bytes(bytes[offset..offset + 2].try_into().ok()?) as usize;
            let byte_count = str_len * 2;
            if bytes.len() >= offset + 2 + byte_count {
                let u_start = offset + 2;
                let raw_u16: Vec<u16> = bytes[u_start..u_start + byte_count]
                    .chunks_exact(2)
                    .map(|c| u16::from_le_bytes([c[0], c[1]]))
                    .collect();
                let rel = String::from_utf16_lossy(&raw_u16);
                if !rel.is_empty() {
                    let parent = lnk_path.parent().unwrap_or(Path::new(""));
                    let resolved = parent.join(&rel);
                    return Some(resolved.to_string_lossy().to_string());
                }
            }
        }

        None
    }

    pub fn scan_broken_shortcuts() -> BrokenShortcutScanResult {
        let start = Instant::now();
        let target_dirs = Self::get_shortcut_directories();
        let mut broken_items = Vec::new();
        let mut total_scanned = 0;

        for (loc_label, dir) in target_dirs {
            if !dir.exists() {
                continue;
            }

            for entry in walkdir::WalkDir::new(&dir)
                .max_depth(4)
                .into_iter()
                .filter_map(|e| e.ok())
            {
                let path = entry.path();
                if path.is_file() {
                    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
                    if ext.eq_ignore_ascii_case("lnk") || ext.eq_ignore_ascii_case("url") {
                        total_scanned += 1;
                        let filename = path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();

                        if ext.eq_ignore_ascii_case("lnk") {
                            match Self::parse_lnk_target(path) {
                                Some(target) => {
                                    let trimmed = target.trim();
                                    // Expand Windows environment vars if any
                                    let expanded = if trimmed.starts_with('%') {
                                        Self::expand_vars(trimmed)
                                    } else {
                                        trimmed.to_string()
                                    };

                                    let target_p = Path::new(&expanded);
                                    if !target_p.exists() {
                                        broken_items.push(BrokenShortcutItem {
                                            id: format!("sc-{}", broken_items.len() + 1),
                                            shortcut_path: path.to_string_lossy().to_string(),
                                            filename,
                                            target_path: Some(expanded),
                                            broken_reason: "Target executable or directory does not exist".to_string(),
                                            location_type: loc_label.clone(),
                                        });
                                    }
                                }
                                None => {
                                    // 0-byte or corrupted shortcut link
                                    if path.metadata().map(|m| m.len()).unwrap_or(0) < 76 {
                                        broken_items.push(BrokenShortcutItem {
                                            id: format!("sc-{}", broken_items.len() + 1),
                                            shortcut_path: path.to_string_lossy().to_string(),
                                            filename,
                                            target_path: None,
                                            broken_reason: "Corrupt or truncated 0-byte shortcut file".to_string(),
                                            location_type: loc_label.clone(),
                                        });
                                    }
                                }
                            }
                        } else if ext.eq_ignore_ascii_case("url") {
                            // Internet shortcut URL file
                            if let Ok(content) = fs::read_to_string(path) {
                                if !content.contains("URL=") {
                                    broken_items.push(BrokenShortcutItem {
                                        id: format!("sc-{}", broken_items.len() + 1),
                                        shortcut_path: path.to_string_lossy().to_string(),
                                        filename,
                                        target_path: None,
                                        broken_reason: "Invalid internet shortcut (missing URL target key)".to_string(),
                                        location_type: loc_label.clone(),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        let total_broken = broken_items.len();

        BrokenShortcutScanResult {
            items: broken_items,
            total_scanned,
            total_broken,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    pub fn delete_shortcuts(paths: &[String]) -> BrokenShortcutCleanResult {
        let mut deleted = 0;
        let mut failed = 0;
        let mut errors = Vec::new();

        for p_str in paths {
            let p = Path::new(p_str);
            if p.exists() {
                match fs::remove_file(p) {
                    Ok(_) => deleted += 1,
                    Err(e) => {
                        failed += 1;
                        errors.push(format!("Failed to delete {}: {}", p_str, e));
                    }
                }
            }
        }

        BrokenShortcutCleanResult {
            deleted_count: deleted,
            failed_count: failed,
            errors,
        }
    }

    fn expand_vars(input: &str) -> String {
        let mut res = input.to_string();
        for (k, v) in std::env::vars() {
            let placeholder = format!("%{}%", k);
            if res.contains(&placeholder) {
                res = res.replace(&placeholder, &v);
            }
        }
        res
    }
}
