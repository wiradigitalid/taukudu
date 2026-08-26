use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::Instant;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatteryDiagnosticInfo {
    pub has_battery: bool,
    pub device_name: String,
    pub manufacturer: String,
    pub chemistry: String,
    pub design_capacity_mwh: u32,
    pub full_charge_capacity_mwh: u32,
    pub current_capacity_mwh: u32,
    pub health_percentage: f32, // (Full Charge / Design) * 100
    pub charge_level_percentage: u8,
    pub estimated_runtime_minutes: Option<u32>,
    pub status: String, // "Charging", "Discharging", "Full", "AC Connected", "No Battery"
    pub is_ac_connected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PowerPlanScheme {
    pub guid: String,
    pub name: String,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PowerSummary {
    pub battery: BatteryDiagnosticInfo,
    pub power_plans: Vec<PowerPlanScheme>,
    pub active_plan_name: String,
    pub scan_duration_ms: u64,
}

pub struct PowerDiagnosticsEngine;

impl PowerDiagnosticsEngine {
    pub fn get_power_diagnostics() -> PowerSummary {
        let start = Instant::now();
        let mut battery = BatteryDiagnosticInfo {
            has_battery: false,
            device_name: "Desktop Power Supply".to_string(),
            manufacturer: "AC Line".to_string(),
            chemistry: "AC Power".to_string(),
            design_capacity_mwh: 0,
            full_charge_capacity_mwh: 0,
            current_capacity_mwh: 0,
            health_percentage: 100.0,
            charge_level_percentage: 100,
            estimated_runtime_minutes: None,
            status: "AC Connected (Desktop)".to_string(),
            is_ac_connected: true,
        };

        let mut plans = Vec::new();
        let mut active_plan = "Balanced".to_string();

        #[cfg(windows)]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            use std::os::windows::process::CommandExt;

            // 1. Query Win32_Battery via PowerShell CIM
            let ps_script = r#"
Get-CimInstance -ClassName Win32_Battery | Select-Object Name, DeviceID, EstimatedChargeRemaining, EstimatedRunTime, BatteryStatus, DesignCapacity, FullChargeCapacity, Chemistry | ConvertTo-Json -Compress
"#;
            let output = Command::new("powershell")
                .args(["-NoProfile", "-NonInteractive", "-Command", ps_script])
                .creation_flags(CREATE_NO_WINDOW)
                .output();

            if let Ok(out) = output {
                let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !stdout.is_empty() {
                    if let Ok(json_val) = serde_json::from_str::<serde_json::Value>(&stdout) {
                        let obj = if json_val.is_array() {
                            json_val.as_array().and_then(|a| a.first()).cloned().unwrap_or(json_val)
                        } else {
                            json_val
                        };

                        let name = obj.get("Name").and_then(|v| v.as_str()).unwrap_or("Internal Battery").to_string();
                        let charge_pct = obj.get("EstimatedChargeRemaining").and_then(|v| v.as_u64()).unwrap_or(100) as u8;
                        let runtime_min = obj.get("EstimatedRunTime").and_then(|v| v.as_u64()).map(|m| m as u32);
                        let design_cap = obj.get("DesignCapacity").and_then(|v| v.as_u64()).unwrap_or(50000) as u32;
                        let full_cap = obj.get("FullChargeCapacity").and_then(|v| v.as_u64()).unwrap_or(design_cap as u64) as u32;
                        let chem = obj.get("Chemistry").and_then(|v| v.as_str()).unwrap_or("Lithium-Ion").to_string();

                        let health = if design_cap > 0 {
                            ((full_cap as f32 / design_cap as f32) * 100.0).min(100.0)
                        } else {
                            100.0
                        };

                        battery = BatteryDiagnosticInfo {
                            has_battery: true,
                            device_name: name,
                            manufacturer: "OEM Laptop Battery".to_string(),
                            chemistry: chem,
                            design_capacity_mwh: design_cap,
                            full_charge_capacity_mwh: full_cap,
                            current_capacity_mwh: (full_cap as f32 * (charge_pct as f32 / 100.0)) as u32,
                            health_percentage: health,
                            charge_level_percentage: charge_pct,
                            estimated_runtime_minutes: runtime_min,
                            status: if charge_pct == 100 { "Fully Charged".to_string() } else { "Active".to_string() },
                            is_ac_connected: true,
                        };
                    }
                }
            }

            // 2. Query power plans using powercfg /list
            if let Ok(out) = Command::new("powercfg")
                .args(["/list"])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
            {
                let stdout = String::from_utf8_lossy(&out.stdout);
                for line in stdout.lines() {
                    let trimmed = line.trim();
                    if trimmed.starts_with("Power Scheme GUID:") {
                        let is_active = trimmed.ends_with('*');
                        let clean = trimmed.trim_end_matches('*').trim();

                        // Format: "Power Scheme GUID: 381b4222-f694-41f0-9685-ff5bb260df2e  (Balanced)"
                        let parts: Vec<&str> = clean.split_whitespace().collect();
                        if parts.len() >= 4 {
                            let guid = parts[3].to_string();
                            let name_part = clean
                                .find('(')
                                .and_then(|start| clean.find(')').map(|end| &clean[start + 1..end]))
                                .unwrap_or("Custom Plan")
                                .to_string();

                            if is_active {
                                active_plan = name_part.clone();
                            }

                            plans.push(PowerPlanScheme {
                                guid,
                                name: name_part,
                                is_active,
                            });
                        }
                    }
                }
            }
        }

        #[cfg(not(windows))]
        {
            plans.push(PowerPlanScheme {
                guid: "simulated-plan-1".to_string(),
                name: "High Performance".to_string(),
                is_active: true,
            });
            active_plan = "High Performance".to_string();
        }

        PowerSummary {
            battery,
            power_plans: plans,
            active_plan_name: active_plan,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    /// Switch active Windows power scheme (e.g. High Performance, Balanced, Power Saver)
    pub fn set_active_power_scheme(scheme_guid: &str) -> Result<String, String> {
        #[cfg(windows)]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            use std::os::windows::process::CommandExt;

            let output = Command::new("powercfg")
                .args(["/setactive", scheme_guid])
                .creation_flags(CREATE_NO_WINDOW)
                .output();

            match output {
                Ok(out) if out.status.success() => {
                    Ok(format!("Successfully activated power scheme {}", scheme_guid))
                }
                Ok(out) => {
                    let err = String::from_utf8_lossy(&out.stderr).to_string();
                    Err(if err.is_empty() { "Failed to set power scheme".to_string() } else { err })
                }
                Err(e) => Err(format!("powercfg execution error: {}", e)),
            }
        }
        #[cfg(not(windows))]
        {
            let _ = scheme_guid;
            Ok("Power scheme simulated".to_string())
        }
    }
}
