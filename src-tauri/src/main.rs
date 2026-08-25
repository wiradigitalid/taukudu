// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clap::Parser;
use std::env;
use std::path::PathBuf;
use tauri::Manager;
use taukudu_lib::{
    handle_cli_mode, BloatwareApp, CleanExecutionResult, CleanerEngine, CliArgs,
    DeduplicationEngine, DiskAnalysisResult, DiskAnalyzerEngine, DiskDriveInfo, DriverPackageInfo,
    DuplicateScanOptions, DuplicateScanResult, EmptyFolderScanResult, HistoryRecord,
    InstalledProgramInfo, LargeFileScanResult, MalwareActionResult, MalwareScanResult,
    MalwareScannerEngine, PerfMonitorEngine, PerformanceSnapshot, PrivacyApplyResult,
    PrivacyShieldEngine, PrivacyShieldState, ScanResult, ServiceDriverEngine, ServiceItemInfo,
    ShredderResult, StartupDebloatEngine, StartupItem, UninstallerShredderEngine, GLOBAL_HISTORY,
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
    let res = CleanerEngine::clean_files(&paths);

    // Save to history SQLite
    if res.deleted_files > 0 {
        let rec = HistoryRecord {
            id: format!("clean-{}", chrono::Utc::now().timestamp_millis()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            action_type: "cleaner".to_string(),
            total_space_saved_bytes: res.deleted_bytes,
            total_items_cleaned: res.deleted_files,
            duration_ms: 100,
            details_summary: format!("Cleaned {} temporary files", res.deleted_files),
        };
        let _ = GLOBAL_HISTORY.lock().unwrap().add_record(&rec);
    }

    res
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

#[tauri::command]
fn scan_malware(scan_type: String, custom_path: Option<String>) -> MalwareScanResult {
    MalwareScannerEngine::scan(&scan_type, custom_path.as_deref())
}

#[tauri::command]
fn quarantine_threats(file_paths: Vec<String>) -> MalwareActionResult {
    MalwareScannerEngine::quarantine_files(&file_paths)
}

#[tauri::command]
fn delete_threats(file_paths: Vec<String>) -> MalwareActionResult {
    MalwareScannerEngine::delete_threat_files(&file_paths)
}

#[tauri::command]
fn get_services() -> Vec<ServiceItemInfo> {
    ServiceDriverEngine::list_services()
}

#[tauri::command]
fn set_service_start_mode(service_name: String, start_type: String) -> Result<(), String> {
    ServiceDriverEngine::set_service_state(&service_name, &start_type)
}

#[tauri::command]
fn get_driver_packages() -> Vec<DriverPackageInfo> {
    ServiceDriverEngine::list_drivers()
}

#[tauri::command]
fn delete_driver(published_name: String) -> Result<(), String> {
    ServiceDriverEngine::delete_driver_package(&published_name)
}

#[tauri::command]
fn get_installed_programs() -> Vec<InstalledProgramInfo> {
    UninstallerShredderEngine::list_installed_programs()
}

#[tauri::command]
fn uninstall_program(cmd: String) -> Result<(), String> {
    UninstallerShredderEngine::execute_uninstall(&cmd)
}

#[tauri::command]
fn shred_files(paths: Vec<String>, passes: usize) -> ShredderResult {
    UninstallerShredderEngine::shred_targets(&paths, passes)
}

#[tauri::command]
fn get_performance_snapshot() -> PerformanceSnapshot {
    PerfMonitorEngine::collect_snapshot()
}

#[tauri::command]
fn kill_perf_process(pid: u32) -> Result<(), String> {
    PerfMonitorEngine::kill_process(pid)
}

#[tauri::command]
fn get_history_records() -> Vec<HistoryRecord> {
    GLOBAL_HISTORY
        .lock()
        .unwrap()
        .get_all_records()
        .unwrap_or_default()
}

#[tauri::command]
fn clear_history_records() -> Result<(), String> {
    GLOBAL_HISTORY
        .lock()
        .unwrap()
        .clear_all_records()
        .map_err(|e| e.to_string())
}

fn main() {
    let args: Vec<String> = env::args().collect();

    // Check if invoked via CLI mode arguments
    if args.len() > 1 && (args.contains(&"--help".to_string()) || args.contains(&"-h".to_string()) || args.contains(&"--version".to_string()) || args.contains(&"-v".to_string()) || args.contains(&"--cli".to_string()) || args.contains(&"--clean".to_string()) || args.contains(&"--all".to_string()) || args[1] == "clean" || args[1] == "duplicates" || args[1] == "malware" || args[1] == "privacy") {
        let parsed = CliArgs::parse();
        handle_cli_mode(&parsed);
        return;
    }

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
            remove_bloatware,
            scan_malware,
            quarantine_threats,
            delete_threats,
            get_services,
            set_service_start_mode,
            get_driver_packages,
            delete_driver,
            get_installed_programs,
            uninstall_program,
            shred_files,
            get_performance_snapshot,
            kill_perf_process,
            get_history_records,
            clear_history_records
        ])
        .run(tauri::generate_context!())
        .expect("error while running taukudu application");
}
