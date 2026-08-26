use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;
const MARKER_FILENAME: &str = ".disable-gpu";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuDiagnosticInfo {
    pub adapter_name: String,
    pub driver_version: String,
    pub driver_date: String,
    pub is_hardware_acceleration_disabled: bool,
    pub marker_exists: bool,
    pub rendering_mode: String,
}

pub struct GpuControllerEngine;

impl GpuControllerEngine {
    fn get_data_dir() -> PathBuf {
        if let Ok(appdata) = std::env::var("LOCALAPPDATA") {
            PathBuf::from(appdata).join("TauKudu")
        } else {
            PathBuf::from(".taukudu_data")
        }
    }

    fn marker_path() -> PathBuf {
        Self::get_data_dir().join(MARKER_FILENAME)
    }

    pub fn is_gpu_disabled() -> bool {
        if std::env::var("TAUKUDU_DISABLE_GPU").is_ok() {
            return true;
        }
        Self::marker_path().exists()
    }

    pub fn get_gpu_diagnostics() -> GpuDiagnosticInfo {
        let is_disabled = Self::is_gpu_disabled();
        let marker_exists = Self::marker_path().exists();

        #[cfg(windows)]
        {
            let script = "Get-CimInstance -ClassName Win32_VideoController -ErrorAction SilentlyContinue | Select-Object -First 1 Name,DriverVersion,DriverDate | ConvertTo-Json -Compress";
            let output = Command::new("powershell")
                .args(["-NoProfile", "-NonInteractive", "-Command", script])
                .creation_flags(CREATE_NO_WINDOW)
                .output();

            let mut adapter_name = "Standard Display Adapter".to_string();
            let mut driver_version = "N/A".to_string();
            let mut driver_date = "N/A".to_string();

            if let Ok(out) = output {
                let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if let Ok(v) = serde_json::from_str::<serde_json::Value>(&stdout) {
                    if let Some(name) = v["Name"].as_str() {
                        adapter_name = name.to_string();
                    }
                    if let Some(ver) = v["DriverVersion"].as_str() {
                        driver_version = ver.to_string();
                    }
                    if let Some(date) = v["DriverDate"].as_str() {
                        driver_date = date.to_string();
                    }
                }
            }

            GpuDiagnosticInfo {
                adapter_name,
                driver_version,
                driver_date,
                is_hardware_acceleration_disabled: is_disabled,
                marker_exists,
                rendering_mode: if is_disabled {
                    "Software Fallback (WARP / Software Rasterizer)".to_string()
                } else {
                    "DirectX 12 / D3D11 Hardware Accelerated".to_string()
                },
            }
        }
        #[cfg(not(windows))]
        {
            GpuDiagnosticInfo {
                adapter_name: "Generic Display".to_string(),
                driver_version: "N/A".to_string(),
                driver_date: "N/A".to_string(),
                is_hardware_acceleration_disabled: is_disabled,
                marker_exists,
                rendering_mode: if is_disabled { "Software".to_string() } else { "Hardware".to_string() },
            }
        }
    }

    pub fn set_gpu_disabled(disable: bool) -> Result<GpuDiagnosticInfo, String> {
        let path = Self::marker_path();
        if disable {
            let _ = fs::create_dir_all(Self::get_data_dir());
            fs::write(&path, "disabled").map_err(|e| e.to_string())?;
            std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", "--disable-gpu --disable-gpu-sandbox");
        } else {
            if path.exists() {
                let _ = fs::remove_file(&path);
            }
            std::env::remove_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS");
        }
        Ok(Self::get_gpu_diagnostics())
    }
}
