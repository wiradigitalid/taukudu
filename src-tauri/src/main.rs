// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;
use tauri::Manager;
use taukudu_lib::{CleanerEngine, ScanResult, CleanExecutionResult};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust in TauKudu!", name)
}

#[tauri::command]
fn get_system_overview() -> serde_json::Value {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();

    serde_json::json!({
        "os_name": sysinfo::System::name().unwrap_or_else(|| "Unknown".to_string()),
        "os_version": sysinfo::System::os_version().unwrap_or_else(|| "".to_string()),
        "host_name": sysinfo::System::host_name().unwrap_or_else(|| "localhost".to_string()),
        "total_memory_bytes": sys.total_memory(),
        "used_memory_bytes": sys.used_memory(),
        "cpu_count": sys.cpus().len(),
    })
}

#[tauri::command]
fn scan_cleaners(app_handle: tauri::AppHandle) -> ScanResult {
    let resource_path = app_handle
        .path()
        .resource_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("rules");

    let rules_dir = if resource_path.is_dir() {
        resource_path
    } else {
        PathBuf::from("rules")
    };

    let engine = CleanerEngine::new(&rules_dir);
    engine.scan_all()
}

#[tauri::command]
fn clean_targets(paths: Vec<String>) -> CleanExecutionResult {
    CleanerEngine::clean_files(&paths)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_system_overview,
            scan_cleaners,
            clean_targets
        ])
        .run(tauri::generate_context!())
        .expect("error while running taukudu application");
}
