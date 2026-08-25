use serde::{Deserialize, Serialize};
use std::process::Command;
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestorePointItem {
    pub sequence_number: u32,
    pub description: String,
    pub restore_point_type: String,
    pub creation_time: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestorePointSummary {
    pub is_protection_enabled: bool,
    pub restore_points: Vec<RestorePointItem>,
    pub total_count: usize,
    pub last_created_time: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestorePointResult {
    pub success: bool,
    pub message: String,
}

pub struct RestorePointEngine;

impl RestorePointEngine {
    /// Check if Windows System Protection is enabled on the system drive (C:)
    pub fn is_protection_enabled() -> bool {
        let script = "(Get-WmiObject -Namespace root/default -Class SystemRestoreConfig).LocalDiskStatus -eq 1 -or (Get-ComputerRestorePoint -ErrorAction SilentlyContinue | Measure-Object).Count -ge 0";
        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        match output {
            Ok(out) => {
                let stdout = String::from_utf8_lossy(&out.stdout).trim().to_lowercase();
                stdout.contains("true")
            }
            Err(_) => false,
        }
    }

    /// List all existing Windows System Restore Points
    pub fn list_restore_points() -> RestorePointSummary {
        let protection_enabled = Self::is_protection_enabled();
        let script = r#"Get-ComputerRestorePoint -ErrorAction SilentlyContinue | Select-Object SequenceNumber, Description, RestorePointType, CreationTime | ConvertTo-Json"#;

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        let mut list = Vec::new();

        if let Ok(out) = output {
            let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !stdout.is_empty() {
                if let Ok(items) = serde_json::from_str::<Vec<serde_json::Value>>(&stdout) {
                    for item in items {
                        list.push(Self::parse_point_json(&item));
                    }
                } else if let Ok(single) = serde_json::from_str::<serde_json::Value>(&stdout) {
                    list.push(Self::parse_point_json(&single));
                }
            }
        }

        let total = list.len();
        let last_time = list.last().map(|p| p.creation_time.clone());

        RestorePointSummary {
            is_protection_enabled: protection_enabled,
            restore_points: list,
            total_count: total,
            last_created_time: last_time,
        }
    }

    fn parse_point_json(v: &serde_json::Value) -> RestorePointItem {
        let seq = v["SequenceNumber"].as_u64().unwrap_or(0) as u32;
        let desc = v["Description"].as_str().unwrap_or("System Checkpoint").to_string();
        let r_type = match v["RestorePointType"].as_u64().unwrap_or(0) {
            0 => "APPLICATION_INSTALL",
            1 => "APPLICATION_UNINSTALL",
            10 => "DEVICE_DRIVER_INSTALL",
            12 => "MODIFY_SETTINGS",
            13 => "CANCELLED_OPERATION",
            _ => "SYSTEM_CHECKPOINT",
        }
        .to_string();

        let creation = v["CreationTime"].as_str().unwrap_or("").to_string();

        RestorePointItem {
            sequence_number: seq,
            description: desc,
            restore_point_type: r_type,
            creation_time: creation,
        }
    }

    /// Create a new System Restore Point before performing deep cleaning or system modifications
    pub fn create_restore_point(description: &str) -> RestorePointResult {
        let clean_desc = description.replace('\'', "''");
        let script = format!(
            "Checkpoint-Computer -Description '{}' -RestorePointType 'MODIFY_SETTINGS' -ErrorAction Stop",
            clean_desc
        );

        let output = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &script])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        match output {
            Ok(out) => {
                if out.status.success() {
                    RestorePointResult {
                        success: true,
                        message: format!("Successfully created restore point: {}", description),
                    }
                } else {
                    let stderr = String::from_utf8_lossy(&out.stderr).trim().to_string();
                    if stderr.contains("frequency") || stderr.contains("1440") {
                        RestorePointResult {
                            success: false,
                            message: "A restore point was already created recently. Windows limits creation frequency to once per 24 hours unless SystemRestore frequency registry is configured.".to_string(),
                        }
                    } else if stderr.contains("administrator") || stderr.contains("privileges") {
                        RestorePointResult {
                            success: false,
                            message: "Administrator privileges required to create a system restore point.".to_string(),
                        }
                    } else {
                        RestorePointResult {
                            success: false,
                            message: if stderr.is_empty() { "Failed to create restore point".to_string() } else { stderr },
                        }
                    }
                }
            }
            Err(e) => RestorePointResult {
                success: false,
                message: format!("Command execution error: {}", e),
            },
        }
    }
}
