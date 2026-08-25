use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use sysinfo::Disks;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskDriveInfo {
    pub name: String,
    pub mount_point: String,
    pub total_space_bytes: u64,
    pub available_space_bytes: u64,
    pub used_space_bytes: u64,
    pub file_system: String,
    pub is_removable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskTreemapNode {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub children: Vec<DiskTreemapNode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileTypeBreakdown {
    pub extension: String,
    pub count: usize,
    pub total_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskAnalysisResult {
    pub tree: DiskTreemapNode,
    pub file_types: Vec<FileTypeBreakdown>,
    pub total_size_bytes: u64,
}

pub struct DiskAnalyzerEngine;

impl DiskAnalyzerEngine {
    pub fn get_drives() -> Vec<DiskDriveInfo> {
        let disks = Disks::new_with_refreshed_list();
        let mut drives = Vec::new();

        for disk in disks.list() {
            let total = disk.total_space();
            let avail = disk.available_space();
            let used = total.saturating_sub(avail);

            drives.push(DiskDriveInfo {
                name: disk.name().to_string_lossy().to_string(),
                mount_point: disk.mount_point().to_string_lossy().to_string(),
                total_space_bytes: total,
                available_space_bytes: avail,
                used_space_bytes: used,
                file_system: disk.file_system().to_string_lossy().to_string(),
                is_removable: disk.is_removable(),
            });
        }

        drives
    }

    pub fn analyze_directory(dir_path: &str, max_depth: usize) -> DiskAnalysisResult {
        let root = Path::new(dir_path);
        let mut ext_map: HashMap<String, (usize, u64)> = HashMap::new();

        let tree = Self::build_tree_recursive(root, 0, max_depth, &mut ext_map);

        let mut file_types: Vec<FileTypeBreakdown> = ext_map
            .into_iter()
            .map(|(ext, (count, total_size_bytes))| FileTypeBreakdown {
                extension: ext,
                count,
                total_size_bytes,
            })
            .collect();

        file_types.sort_by(|a, b| b.total_size_bytes.cmp(&a.total_size_bytes));

        let total_size_bytes = tree.size;

        DiskAnalysisResult {
            tree,
            file_types,
            total_size_bytes,
        }
    }

    fn build_tree_recursive(
        dir: &Path,
        current_depth: usize,
        max_depth: usize,
        ext_map: &mut HashMap<String, (usize, u64)>,
    ) -> DiskTreemapNode {
        let name = dir
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| dir.to_string_lossy().to_string());

        let mut node = DiskTreemapNode {
            name,
            path: dir.to_string_lossy().to_string(),
            size: 0,
            children: Vec::new(),
        };

        if current_depth >= max_depth {
            node.size = Self::measure_dir_fast(dir, ext_map);
            return node;
        }

        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.is_dir() {
                    let child = Self::build_tree_recursive(&p, current_depth + 1, max_depth, ext_map);
                    node.size += child.size;
                    node.children.push(child);
                } else if p.is_file() {
                    if let Ok(meta) = entry.metadata() {
                        let size = meta.len();
                        node.size += size;

                        let ext = p
                            .extension()
                            .and_then(|e| e.to_str())
                            .map(|e| format!(".{}", e.to_lowercase()))
                            .unwrap_or_else(|| "(no extension)".to_string());

                        let stat = ext_map.entry(ext).or_insert((0, 0));
                        stat.0 += 1;
                        stat.1 += size;
                    }
                }
            }
        }

        node.children.sort_by(|a, b| b.size.cmp(&a.size));
        node
    }

    fn measure_dir_fast(dir: &Path, ext_map: &mut HashMap<String, (usize, u64)>) -> u64 {
        let mut total = 0;
        for entry in WalkDir::new(dir).min_depth(1).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() {
                if let Ok(meta) = entry.metadata() {
                    let size = meta.len();
                    total += size;

                    let ext = entry
                        .path()
                        .extension()
                        .and_then(|e| e.to_str())
                        .map(|e| format!(".{}", e.to_lowercase()))
                        .unwrap_or_else(|| "(no extension)".to_string());

                    let stat = ext_map.entry(ext).or_insert((0, 0));
                    stat.0 += 1;
                    stat.1 += size;
                }
            }
        }
        total
    }
}
