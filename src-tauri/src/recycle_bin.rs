use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecycleBinItemDetail {
    pub id: String,
    pub original_path: String,
    pub file_name: String,
    pub size_bytes: u64,
    pub deleted_timestamp: String,
    pub drive_letter: String,
    pub payload_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecycleBinDriveStat {
    pub drive_letter: String,
    pub path: String,
    pub items_count: usize,
    pub total_bytes: u64,
    pub is_accessible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecycleBinSummary {
    pub drives: Vec<RecycleBinDriveStat>,
    pub items: Vec<RecycleBinItemDetail>,
    pub total_items: usize,
    pub total_bytes: u64,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecycleBinCleanResult {
    pub payloads_deleted: usize,
    pub orphan_metadata_deleted: usize,
    pub bytes_freed: u64,
    pub failed_count: usize,
    pub shell_sync_status: u32,
    pub errors: Vec<String>,
}

pub struct RecycleBinEngine;

impl RecycleBinEngine {
    /// Query the current user's security identifier (SID) and locate all per-drive $Recycle.Bin/<SID> paths
    pub fn get_user_recycle_bin_paths() -> Vec<(String, PathBuf)> {
        let script = r#"
Add-Type -TypeDefinition 'using System; using System.Collections.Generic; using System.IO; using System.Security.Principal;
public static class KuduBins {
    public static void Query() {
        string sid = WindowsIdentity.GetCurrent().User.Value;
        foreach (DriveInfo d in DriveInfo.GetDrives()) {
            try {
                if (!d.IsReady) continue;
                string dir = Path.Combine(d.RootDirectory.FullName, "$Recycle.Bin", sid);
                if (Directory.Exists(dir)) {
                    Console.WriteLine(d.Name.Substring(0, 1) + "|" + dir);
                }
            } catch {}
        }
    }
}'; [KuduBins]::Query()
"#;

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        let mut results = Vec::new();

        if let Ok(out) = output {
            let stdout = String::from_utf8_lossy(&out.stdout);
            for line in stdout.lines() {
                let trimmed = line.trim();
                if let Some((drive, dir)) = trimmed.split_once('|') {
                    results.push((drive.to_string(), PathBuf::from(dir)));
                }
            }
        }

        // Fallback: Check common drive letters if powershell query is unavailable
        if results.is_empty() {
            for letter in ['C', 'D', 'E', 'F'] {
                let bin_root = PathBuf::from(format!(r"{}:\$Recycle.Bin", letter));
                if bin_root.is_dir() {
                    if let Ok(entries) = fs::read_dir(&bin_root) {
                        for e in entries.flatten() {
                            let p = e.path();
                            if p.is_dir() {
                                let name = e.file_name().to_string_lossy().to_string();
                                if name.starts_with("S-1-5-") {
                                    results.push((letter.to_string(), p));
                                }
                            }
                        }
                    }
                }
            }
        }

        results
    }

    /// Parse a single Windows $I metadata binary record directly in Rust
    fn parse_i_file(i_path: &Path) -> Option<(u64, String, String)> {
        let mut f = fs::File::open(i_path).ok()?;
        let mut buf = Vec::new();
        f.read_to_end(&mut buf).ok()?;

        if buf.len() < 28 {
            return None;
        }

        let version = u64::from_le_bytes(buf[0..8].try_into().ok()?);
        let size_bytes = u64::from_le_bytes(buf[8..16].try_into().ok()?);
        let filetime = u64::from_le_bytes(buf[16..24].try_into().ok()?);

        // Convert Windows FILETIME (100ns intervals since 1601) to Unix epoch timestamp
        let unix_secs = if filetime >= 116_444_736_000_000_000 {
            (filetime - 116_444_736_000_000_000) / 10_000_000
        } else {
            0
        };

        let date_formatted = chrono::DateTime::from_timestamp(unix_secs as i64, 0)
            .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
            .unwrap_or_else(|| "Unknown".to_string());

        let raw_u16: Vec<u16> = if version == 2 && buf.len() >= 28 {
            // Version 2 (Win 10/11): length at 24..28, string at 28..
            buf[28..]
                .chunks_exact(2)
                .map(|c| u16::from_le_bytes([c[0], c[1]]))
                .take_while(|&c| c != 0)
                .collect()
        } else {
            // Version 1 (Win Vista/7/8): fixed length path starting at offset 24
            buf[24..]
                .chunks_exact(2)
                .map(|c| u16::from_le_bytes([c[0], c[1]]))
                .take_while(|&c| c != 0)
                .collect()
        };

        let orig_path = String::from_utf16_lossy(&raw_u16);
        Some((size_bytes, orig_path, date_formatted))
    }

    /// Scan and inspect all items currently in the Recycle Bin across all drives
    pub fn get_summary() -> RecycleBinSummary {
        let start = std::time::Instant::now();
        let bin_paths = Self::get_user_recycle_bin_paths();

        let mut drives_stat = Vec::new();
        let mut detailed_items = Vec::new();
        let mut total_items = 0usize;
        let mut total_bytes = 0u64;

        for (drive_letter, path) in bin_paths {
            let mut drive_items = 0usize;
            let mut drive_bytes = 0u64;
            let mut accessible = true;

            if let Ok(entries) = fs::read_dir(&path) {
                let dir_files: Vec<PathBuf> = entries.filter_map(|e| e.ok().map(|x| x.path())).collect();

                for p in &dir_files {
                    if let Some(file_name) = p.file_name().and_then(|f| f.to_str()) {
                        let upper = file_name.to_uppercase();

                        // Match $R payload
                        if upper.starts_with("$R") {
                            drive_items += 1;
                            let raw_size = p.metadata().map(|m| m.len()).unwrap_or(0);
                            drive_bytes += raw_size;

                            // Look for corresponding $I metadata file
                            let i_name = format!("$I{}", &file_name[2..]);
                            let i_path = path.join(i_name);

                            let (item_size, orig_path, date_str) = if i_path.exists() {
                                if let Some((s, op, dt)) = Self::parse_i_file(&i_path) {
                                    (if s > 0 { s } else { raw_size }, op, dt)
                                } else {
                                    (raw_size, file_name.to_string(), "Recent".to_string())
                                }
                            } else {
                                (raw_size, file_name.to_string(), "Recent".to_string())
                            };

                            let display_fname = Path::new(&orig_path)
                                .file_name()
                                .and_then(|f| f.to_str())
                                .unwrap_or(file_name)
                                .to_string();

                            detailed_items.push(RecycleBinItemDetail {
                                id: format!("rb-{}-{}", drive_letter, detailed_items.len() + 1),
                                original_path: orig_path,
                                file_name: display_fname,
                                size_bytes: item_size,
                                deleted_timestamp: date_str,
                                drive_letter: drive_letter.clone(),
                                payload_path: p.to_string_lossy().to_string(),
                            });
                        }
                    }
                }
            } else {
                accessible = false;
            }

            total_items += drive_items;
            total_bytes += drive_bytes;

            drives_stat.push(RecycleBinDriveStat {
                drive_letter,
                path: path.to_string_lossy().to_string(),
                items_count: drive_items,
                total_bytes: drive_bytes,
                is_accessible: accessible,
            });
        }

        RecycleBinSummary {
            drives: drives_stat,
            items: detailed_items,
            total_items,
            total_bytes,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    /// Fast turbo clean: direct parallel unlink of $R payloads + $I metadata + Win32 Shell API refresh
    pub fn empty_fast() -> RecycleBinCleanResult {
        let bin_paths = Self::get_user_recycle_bin_paths();
        let mut payloads_deleted = 0usize;
        let mut orphan_metadata_deleted = 0usize;
        let mut bytes_freed = 0u64;
        let mut failed = 0usize;
        let mut errors = Vec::new();

        for (_drive, bin_dir) in bin_paths {
            if !bin_dir.is_dir() {
                continue;
            }

            if let Ok(entries) = fs::read_dir(&bin_dir) {
                let items: Vec<PathBuf> = entries.filter_map(|e| e.ok().map(|x| x.path())).collect();

                // 1. Delete all $R payloads first
                for p in &items {
                    if let Some(name) = p.file_name().and_then(|f| f.to_str()) {
                        let upper = name.to_uppercase();
                        if upper.starts_with("$R") {
                            let size = p.metadata().map(|m| m.len()).unwrap_or(0);
                            let delete_res = if p.is_dir() {
                                fs::remove_dir_all(p)
                            } else {
                                fs::remove_file(p)
                            };

                            match delete_res {
                                Ok(_) => {
                                    payloads_deleted += 1;
                                    bytes_freed += size;

                                    // Attempt to remove matching $I metadata record
                                    let metadata_name = format!("$I{}", &name[2..]);
                                    let metadata_path = bin_dir.join(metadata_name);
                                    if metadata_path.exists() {
                                        let _ = fs::remove_file(metadata_path);
                                    }
                                }
                                Err(e) => {
                                    failed += 1;
                                    errors.push(format!("Failed to delete {}: {}", name, e));
                                }
                            }
                        }
                    }
                }

                // 2. Clear remaining orphaned $I metadata files
                if let Ok(remaining_entries) = fs::read_dir(&bin_dir) {
                    for re in remaining_entries.flatten() {
                        let r_name = re.file_name().to_string_lossy().to_string();
                        if r_name.to_uppercase().starts_with("$I") {
                            if fs::remove_file(re.path()).is_ok() {
                                orphan_metadata_deleted += 1;
                            }
                        }
                    }
                }
            }
        }

        // 3. Finalize with Shell32 SHEmptyRecycleBin to refresh desktop icon and Windows Explorer state
        let shell_sync = Self::finalize_shell();

        RecycleBinCleanResult {
            payloads_deleted,
            orphan_metadata_deleted,
            bytes_freed,
            failed_count: failed,
            shell_sync_status: shell_sync,
            errors,
        }
    }

    fn finalize_shell() -> u32 {
        let script = r#"
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices;
public static class KuduShell {
    [DllImport("Shell32.dll", CharSet = CharSet.Unicode)]
    public static extern uint SHEmptyRecycleBin(IntPtr hwnd, string pszRootPath, uint dwFlags);
}'; Write-Output ([KuduShell]::SHEmptyRecycleBin([IntPtr]::Zero, $null, 7))
"#;

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        if let Ok(out) = output {
            let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
            stdout.parse::<u32>().unwrap_or(0)
        } else {
            0
        }
    }
}
