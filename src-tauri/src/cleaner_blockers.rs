use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use sysinfo::{ProcessRefreshKind, RefreshKind, System};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessBlockerInfo {
    pub pid: u32,
    pub name: String,
    pub display_name: String,
    pub category: String,
    pub blocked_paths: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockerSummary {
    pub blockers: Vec<ProcessBlockerInfo>,
    pub total_blockers: usize,
    pub has_blocking_processes: bool,
}

pub struct CleanerBlockersEngine;

impl CleanerBlockersEngine {
    fn get_browser_display_names() -> HashMap<&'static str, &'static str> {
        let mut map = HashMap::new();
        map.insert("chrome.exe", "Google Chrome");
        map.insert("msedge.exe", "Microsoft Edge");
        map.insert("brave.exe", "Brave Browser");
        map.insert("firefox.exe", "Mozilla Firefox");
        map.insert("opera.exe", "Opera");
        map.insert("opera_gx.exe", "Opera GX");
        map.insert("vivaldi.exe", "Vivaldi");
        map.insert("arc.exe", "Arc");
        map.insert("chromium.exe", "Chromium");
        map.insert("discord.exe", "Discord");
        map.insert("spotify.exe", "Spotify");
        map.insert("steam.exe", "Steam Client");
        map.insert("epicgameslauncher.exe", "Epic Games Launcher");
        map
    }

    /// Check if any active running processes hold locks or belong to cleaner targets
    pub fn check_blockers(target_paths: &[String]) -> BlockerSummary {
        let mut sys = System::new_with_specifics(
            RefreshKind::nothing().with_processes(ProcessRefreshKind::nothing()),
        );
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

        let browser_names = Self::get_browser_display_names();
        let mut blockers_map: HashMap<String, (u32, String, String, Vec<String>)> = HashMap::new();

        // 1. Scan running processes to find active browsers or apps
        for (pid, proc) in sys.processes() {
            let proc_name = proc.name().to_string_lossy().to_lowercase();
            if let Some(&display_name) = browser_names.get(proc_name.as_str()) {
                let pid_u32 = pid.as_u32();
                let category = if proc_name.contains("chrome")
                    || proc_name.contains("edge")
                    || proc_name.contains("firefox")
                    || proc_name.contains("brave")
                    || proc_name.contains("opera")
                    || proc_name.contains("vivaldi")
                    || proc_name.contains("arc")
                {
                    "Browser".to_string()
                } else {
                    "Application".to_string()
                };

                // Find matching paths for this process
                let mut matched_paths = Vec::new();
                for p in target_paths {
                    let p_lower = p.to_lowercase();
                    let key_substr = proc_name.replace(".exe", "");
                    if p_lower.contains(&key_substr) {
                        matched_paths.push(p.clone());
                    }
                }

                if !matched_paths.is_empty() || target_paths.is_empty() {
                    blockers_map.insert(
                        proc_name.clone(),
                        (pid_u32, proc_name, display_name.to_string(), matched_paths),
                    );
                }
            }
        }

        let mut blockers = Vec::new();
        for (_, (pid, name, display_name, paths)) in blockers_map {
            let category = if name.contains("chrome")
                || name.contains("edge")
                || name.contains("firefox")
                || name.contains("brave")
                || name.contains("opera")
                || name.contains("vivaldi")
                || name.contains("arc")
            {
                "Browser".to_string()
            } else {
                "Application".to_string()
            };

            blockers.push(ProcessBlockerInfo {
                pid,
                name,
                display_name,
                category,
                blocked_paths: paths,
            });
        }

        let total = blockers.len();
        BlockerSummary {
            blockers,
            total_blockers: total,
            has_blocking_processes: total > 0,
        }
    }

    /// Close or terminate a blocking process by PID so cleaning can proceed without file locks
    pub fn close_blocker(pid: u32) -> Result<(), String> {
        let mut sys = System::new_with_specifics(
            RefreshKind::nothing().with_processes(ProcessRefreshKind::nothing()),
        );
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

        let pid_sys = sysinfo::Pid::from_u32(pid);
        if let Some(proc) = sys.process(pid_sys) {
            proc.kill();
            Ok(())
        } else {
            Err(format!("Process with PID {} not found", pid))
        }
    }
}
