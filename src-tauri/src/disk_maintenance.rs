use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrimDriveStatus {
    pub drive_letter: String,
    pub media_type: String, // "SSD" | "NVMe" | "HDD"
    pub trim_enabled: bool,
    pub last_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskRepairOutput {
    pub tool: String, // "sfc" | "dism" | "chkdsk"
    pub success: bool,
    pub exit_code: i32,
    pub output: String,
    pub summary: String,
}

pub struct DiskMaintenanceEngine;

impl DiskMaintenanceEngine {
    pub fn get_trim_status() -> Vec<TrimDriveStatus> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let mut list = Vec::new();

            // Query TRIM global state
            let mut trim_enabled = true;
            if let Ok(out) = Command::new("fsutil")
                .args(["behavior", "query", "DisableDeleteNotify"])
                .output()
            {
                let stdout = String::from_utf8_lossy(&out.stdout);
                if stdout.contains("= 1") {
                    trim_enabled = false;
                }
            }

            list.push(TrimDriveStatus {
                drive_letter: "C:".to_string(),
                media_type: "SSD / NVMe".to_string(),
                trim_enabled,
                last_status: if trim_enabled {
                    "TRIM is enabled and active".to_string()
                } else {
                    "TRIM is disabled by OS policy".to_string()
                },
            });

            list
        }
        #[cfg(not(windows))]
        {
            Vec::new()
        }
    }

    pub fn execute_trim(drive_letter: &str) -> Result<String, String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let letter = drive_letter.trim_end_matches(':');
            let script = format!("Optimize-Volume -DriveLetter {} -ReTrim -Verbose", letter);

            let output = Command::new("powershell")
                .args(["-NoProfile", "-NonInteractive", "-Command", &script])
                .output();

            match output {
                Ok(o) if o.status.success() => Ok(format!("TRIM completed successfully on drive {}:", letter)),
                Ok(o) => Err(String::from_utf8_lossy(&o.stderr).to_string()),
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            let _ = drive_letter;
            Ok("TRIM simulated for non-windows platform".to_string())
        }
    }

    pub fn run_sfc() -> Result<DiskRepairOutput, String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let output = Command::new("sfc")
                .arg("/verifyonly")
                .output();

            match output {
                Ok(o) => {
                    let out_str = String::from_utf8_lossy(&o.stdout).to_string();
                    let success = o.status.success() || out_str.contains("did not find any integrity violations");
                    Ok(DiskRepairOutput {
                        tool: "sfc".to_string(),
                        success,
                        exit_code: o.status.code().unwrap_or(0),
                        output: out_str.clone(),
                        summary: if success {
                            "Windows Resource Protection did not find any integrity violations.".to_string()
                        } else {
                            "System file integrity issues detected.".to_string()
                        },
                    })
                }
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            Ok(DiskRepairOutput {
                tool: "sfc".to_string(),
                success: true,
                exit_code: 0,
                output: "SFC not applicable on non-Windows".to_string(),
                summary: "Clean".to_string(),
            })
        }
    }

    pub fn run_sfc_repair() -> Result<DiskRepairOutput, String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            use std::os::windows::process::CommandExt;

            let output = Command::new("sfc")
                .arg("/scannow")
                .creation_flags(CREATE_NO_WINDOW)
                .output();

            match output {
                Ok(o) => {
                    let out_str = String::from_utf8_lossy(&o.stdout).to_string();
                    let success = o.status.success() || out_str.contains("successfully repaired them") || out_str.contains("did not find any integrity violations");
                    Ok(DiskRepairOutput {
                        tool: "sfc_repair".to_string(),
                        success,
                        exit_code: o.status.code().unwrap_or(0),
                        output: out_str.clone(),
                        summary: if out_str.contains("successfully repaired them") {
                            "Windows Resource Protection found corrupt files and successfully repaired them.".to_string()
                        } else if success {
                            "Windows Resource Protection did not find any integrity violations.".to_string()
                        } else {
                            "System file integrity repair completed with warnings.".to_string()
                        },
                    })
                }
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            Ok(DiskRepairOutput {
                tool: "sfc_repair".to_string(),
                success: true,
                exit_code: 0,
                output: "SFC repair simulated on non-Windows".to_string(),
                summary: "Clean".to_string(),
            })
        }
    }

    pub fn run_dism_restore_health() -> Result<DiskRepairOutput, String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            use std::os::windows::process::CommandExt;

            let output = Command::new("dism")
                .args(["/online", "/cleanup-image", "/restorehealth"])
                .creation_flags(CREATE_NO_WINDOW)
                .output();

            match output {
                Ok(o) => {
                    let out_str = String::from_utf8_lossy(&o.stdout).to_string();
                    let success = o.status.success() || out_str.contains("The restore operation completed successfully");
                    Ok(DiskRepairOutput {
                        tool: "dism_restore".to_string(),
                        success,
                        exit_code: o.status.code().unwrap_or(0),
                        output: out_str,
                        summary: if success {
                            "The Windows component store restore operation completed successfully.".to_string()
                        } else {
                            "DISM restore operation finished with errors.".to_string()
                        },
                    })
                }
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            Ok(DiskRepairOutput {
                tool: "dism_restore".to_string(),
                success: true,
                exit_code: 0,
                output: "DISM restore simulated on non-Windows".to_string(),
                summary: "Clean".to_string(),
            })
        }
    }

    pub fn run_chkdsk(drive_letter: &str) -> Result<DiskRepairOutput, String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let target = format!("{}:", drive_letter.trim_end_matches(':'));
            let output = Command::new("chkdsk")
                .args([&target, "/scan"])
                .output();

            match output {
                Ok(o) => {
                    let out_str = String::from_utf8_lossy(&o.stdout).to_string();
                    let success = o.status.success() || out_str.contains("Windows has scanned the file system and found no problems");
                    Ok(DiskRepairOutput {
                        tool: "chkdsk".to_string(),
                        success,
                        exit_code: o.status.code().unwrap_or(0),
                        output: out_str,
                        summary: if success {
                            "No filesystem corruption found on volume.".to_string()
                        } else {
                            "Filesystem scan finished with recommendations.".to_string()
                        },
                    })
                }
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            let _ = drive_letter;
            Ok(DiskRepairOutput {
                tool: "chkdsk".to_string(),
                success: true,
                exit_code: 0,
                output: "CHKDSK not applicable on non-Windows".to_string(),
                summary: "Clean".to_string(),
            })
        }
    }
}
