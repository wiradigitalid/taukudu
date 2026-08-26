use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

const DEFAULT_TELEMETRY_BLOCKLIST: &[&str] = &[
    "v10.events.data.microsoft.com",
    "v20.events.data.microsoft.com",
    "watson.telemetry.microsoft.com",
    "telemetry.microsoft.com",
    "telecommand.telemetry.microsoft.com",
    "feedback.windows.com",
    "settings-win.data.microsoft.com",
    "diagnostics.support.microsoft.com",
    "activity.windows.com",
    "browser.events.data.msn.com",
    "survey.watson.microsoft.com",
    "oca.telemetry.microsoft.com",
    "df.telemetry.microsoft.com",
    "reports.wes.df.telemetry.microsoft.com",
    "cs1.wpc.v0cdn.net",
    "vortex.data.microsoft.com",
    "vortex-win.data.microsoft.com",
];

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostsEntryItem {
    pub ip_address: String,
    pub hostname: String,
    pub is_commented: bool,
    pub is_telemetry_block: bool,
    pub raw_line: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostsFileSummary {
    pub hosts_file_path: String,
    pub is_writable: bool,
    pub total_entries: usize,
    pub telemetry_blocked_count: usize,
    pub entries: Vec<HostsEntryItem>,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostsApplyResult {
    pub success: bool,
    pub backup_file_path: Option<String>,
    pub blocked_domains_count: usize,
    pub message: String,
}

pub struct HostsSecurityEngine;

impl HostsSecurityEngine {
    pub fn get_hosts_path() -> PathBuf {
        let windir = std::env::var("WINDIR").unwrap_or_else(|_| "C:\\Windows".to_string());
        PathBuf::from(&windir)
            .join("System32")
            .join("drivers")
            .join("etc")
            .join("hosts")
    }

    pub fn scan_hosts_file() -> HostsFileSummary {
        let start = Instant::now();
        let path = Self::get_hosts_path();
        let mut entries = Vec::new();
        let mut telemetry_count = 0;
        let is_writable = fs::OpenOptions::new().write(true).open(&path).is_ok();

        if path.is_file() {
            if let Ok(content) = fs::read_to_string(&path) {
                for line in content.lines() {
                    let trimmed = line.trim();
                    if trimmed.is_empty() {
                        continue;
                    }

                    let is_commented = trimmed.starts_with('#');
                    let clean = trimmed.trim_start_matches('#').trim();
                    let parts: Vec<&str> = clean.split_whitespace().collect();

                    if parts.len() >= 2 {
                        let ip = parts[0].to_string();
                        let host = parts[1].to_lowercase();
                        let is_telemetry = DEFAULT_TELEMETRY_BLOCKLIST.contains(&host.as_str());

                        if is_telemetry && (ip == "0.0.0.0" || ip == "127.0.0.1") && !is_commented {
                            telemetry_count += 1;
                        }

                        entries.push(HostsEntryItem {
                            ip_address: ip,
                            hostname: host,
                            is_commented,
                            is_telemetry_block: is_telemetry,
                            raw_line: trimmed.to_string(),
                        });
                    }
                }
            }
        }

        let total = entries.len();

        HostsFileSummary {
            hosts_file_path: path.to_string_lossy().to_string(),
            is_writable,
            total_entries: total,
            telemetry_blocked_count: telemetry_count,
            entries,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    /// Block Windows Telemetry domains by redirecting to 0.0.0.0 in hosts file
    pub fn apply_telemetry_block(enable_block: bool) -> Result<HostsApplyResult, String> {
        let hosts_path = Self::get_hosts_path();
        if !hosts_path.exists() {
            return Err("Windows hosts file not found".to_string());
        }

        let original_content = fs::read_to_string(&hosts_path).map_err(|e| format!("Failed to read hosts: {}", e))?;

        // 1. Create a timestamped backup in TauKudu Backups/Hosts
        let mut backup_path_str = None;
        if let Ok(profile) = std::env::var("USERPROFILE") {
            let bak_dir = PathBuf::from(profile)
                .join("Documents")
                .join("TauKudu Backups")
                .join("Hosts");
            let _ = fs::create_dir_all(&bak_dir);
            let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
            let bak_file = bak_dir.join(format!("hosts_backup_{}.txt", timestamp));
            if fs::write(&bak_file, &original_content).is_ok() {
                backup_path_str = Some(bak_file.to_string_lossy().to_string());
            }
        }

        // 2. Strip existing TauKudu telemetry block section
        let mut lines: Vec<String> = Vec::new();
        let mut in_taukudu_block = false;

        for line in original_content.lines() {
            let trimmed = line.trim();
            if trimmed == "# === TauKudu Windows Telemetry Shield Start ===" {
                in_taukudu_block = true;
                continue;
            }
            if trimmed == "# === TauKudu Windows Telemetry Shield End ===" {
                in_taukudu_block = false;
                continue;
            }
            if !in_taukudu_block {
                lines.push(line.to_string());
            }
        }

        // 3. Append telemetry block entries if enabled
        let mut blocked_count = 0;
        if enable_block {
            lines.push(String::new());
            lines.push("# === TauKudu Windows Telemetry Shield Start ===".to_string());
            for domain in DEFAULT_TELEMETRY_BLOCKLIST {
                lines.push(format!("0.0.0.0 {}", domain));
                blocked_count += 1;
            }
            lines.push("# === TauKudu Windows Telemetry Shield End ===".to_string());
        }

        let new_content = lines.join("\r\n") + "\r\n";

        // 4. Write back to hosts file with read-only recovery
        if let Ok(mut perms) = fs::metadata(&hosts_path).map(|m| m.permissions()) {
            perms.set_readonly(false);
            let _ = fs::set_permissions(&hosts_path, perms);
        }

        fs::write(&hosts_path, new_content).map_err(|e| {
            format!(
                "Failed to write to Windows hosts file (Administrator privileges required): {}",
                e
            )
        })?;

        // 5. Flush Windows DNS cache
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            use std::process::Command;
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            let _ = Command::new("ipconfig")
                .args(["/flushdns"])
                .creation_flags(CREATE_NO_WINDOW)
                .output();
        }

        Ok(HostsApplyResult {
            success: true,
            backup_file_path: backup_path_str,
            blocked_domains_count: blocked_count,
            message: if enable_block {
                format!("Successfully blocked {} telemetry endpoints in Windows hosts file.", blocked_count)
            } else {
                "Successfully restored original hosts file without telemetry redirection.".to_string()
            },
        })
    }
}
