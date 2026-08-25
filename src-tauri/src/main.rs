// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;
use tauri::Manager;
use taukudu_lib::{
    BloatwareApp, CleanExecutionResult, CleanerEngine, DeduplicationEngine, DiskAnalysisResult,
    DiskAnalyzerEngine, DiskDriveInfo, DuplicateScanOptions, DuplicateScanResult,
    EmptyFolderScanResult, LargeFileScanResult, PrivacyApplyResult, PrivacyShieldEngine,
    PrivacyShieldState, ScanResult, StartupDebloatEngine, StartupItem,
};

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

#[tauri::command]
fn scan_duplicates(options: DuplicateScanOptions) -> DuplicateScanResult {
    DeduplicationEngine::scan_duplicates(&options)
}

#[tauri::command]
fn scan_empty_folders(directory: String) -> EmptyFolderScanResult {
    DeduplicationEngine::scan_empty_folders(&directory)
}

#[tauri::command]
fn scan_large_files(directory: String, min_size_bytes: u64) -> LargeFileScanResult {
    DeduplicationEngine::scan_large_files(&directory, min_size_bytes)
}

#[tauri::command]
fn delete_duplicate_files(paths: Vec<String>) -> usize {
    DeduplicationEngine::delete_files(&paths)
}

#[tauri::command]
fn get_privacy_shield_state() -> PrivacyShieldState {
    PrivacyShieldEngine::get_all_settings()
}

#[tauri::command]
fn apply_privacy_setting(id: String, enable: bool) -> Result<(), String> {
    PrivacyShieldEngine::apply_setting(&id, enable)
}

#[tauri::command]
fn get_drives() -> Vec<DiskDriveInfo> {
    DiskAnalyzerEngine::get_drives()
}

#[tauri::command]
fn analyze_disk_directory(dir_path: String, max_depth: usize) -> DiskAnalysisResult {
    DiskAnalyzerEngine::analyze_directory(&dir_path, max_depth)
}

#[tauri::command]
fn get_startup_items() -> Vec<StartupItem> {
    StartupDebloatEngine::list_startup_items()
}

#[tauri::command]
fn toggle_startup_item(id: String, enable: bool) -> Result<(), String> {
    StartupDebloatEngine::toggle_startup_item(&id, enable)
}

#[tauri::command]
fn get_bloatware_list() -> Vec<BloatwareApp> {
    StartupDebloatEngine::list_known_bloatware()
}

#[tauri::command]
fn remove_bloatware(package_names: Vec<String>) -> Vec<String> {
    StartupDebloatEngine::remove_bloatware_packages(&package_names)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_system_overview,
            scan_cleaners,
            clean_targets,
            scan_duplicates,
            scan_empty_folders,
            scan_large_files,
            delete_duplicate_files,
            get_privacy_shield_state,
            apply_privacy_setting,
            get_drives,
            analyze_disk_directory,
            get_startup_items,
            toggle_startup_item,
            get_bloatware_list,
            remove_bloatware
        ])
        .run(tauri::generate_context!())
        .expect("error while running taukudu application");
}
