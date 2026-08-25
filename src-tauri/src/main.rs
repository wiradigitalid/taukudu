// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clap::Parser;
use std::env;
use std::path::PathBuf;
use tauri::Manager;
use taukudu_lib::{
    handle_cli_mode, ActiveConnectionInfo, BloatwareApp, BreachMonitorSummary,
    BrowserCacheScanSummary, BrowserProfileCacheTarget, ChromiumCacheEngine,
    CleanExecutionResult, CleanerBlockersEngine, CleanerEngine, CliArgs, ContextMenuEngine, ContextMenuEntryInfo,
    ContextMenuScanResult, CveItem, CveScanSummary, CveScannerEngine, DeduplicationEngine,
    DeleteFailureProbeEngine, DeletePathProbeResult, DeleteProbeSummary, DeletionLogQueryOptions,
    DeletionLogStats, DeletionLoggerEngine, GranularDeletedFileEntry,
    DiskAnalysisResult, DiskAnalyzerEngine, DiskDriveInfo, DiskMaintenanceEngine,
    DiskRepairOutput, DriverPackageInfo, DuplicateScanOptions, DuplicateScanResult,
    EmptyFolderScanResult, FirewallAuditEngine, FirewallAuditSummary, GameModeEngine,
    GameModeStatus, GameOptimizationItem, HistoryRecord, InstalledProgramInfo,
    LargeFileScanResult, LeftoversCleanerEngine, LeftoversCleanResult, LeftoversScanResult,
    MalwareActionResult, MalwareScanResult, MalwareScannerEngine,
    NetworkItemInfo, NetworkToolsEngine, PerfMonitorEngine, PerformanceSnapshot,
    PrivacyApplyResult, PrivacyShieldEngine, PrivacyShieldState, RecycleBinCleanResult,
    RecycleBinDriveStat, RecycleBinEngine, RecycleBinSummary, RegistryCleanerEngine,
    RegistryFixResult, RegistryIssue, RegistryScanResult, RestorePointEngine,
    RestorePointItem, RestorePointResult, RestorePointSummary, ScanResult, ScheduleItem,
    ScheduleSummary, ServiceDriverEngine, ServiceItemInfo, ShredderResult, SoftwareUpdateSummary,
    SoftwareUpdaterEngine, StartupDebloatEngine, StartupItem, ThreatMonitorEngine,
    ThreatMonitorSummary, TrimDriveStatus, UninstallerShredderEngine, UpdateExecutionResult,
    GLOBAL_BREACH_MONITOR, GLOBAL_DELETION_LOGGER, GLOBAL_GAME_MODE, GLOBAL_HISTORY,
    GLOBAL_SCHEDULER, GLOBAL_THREAT_MONITOR,
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

    // Save to history SQLite and Granular Deletion Log
    if res.deleted_files > 0 {
        let session_id = format!("clean-{}", chrono::Utc::now().timestamp_millis());
        let rec = HistoryRecord {
            id: session_id.clone(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            action_type: "cleaner".to_string(),
            total_space_saved_bytes: res.deleted_bytes,
            total_items_cleaned: res.deleted_files,
            duration_ms: 100,
            details_summary: format!("Cleaned {} temporary files", res.deleted_files),
        };
        let _ = GLOBAL_HISTORY.lock().unwrap().add_record(&rec);

        // Record granular log
        let granular_entries: Vec<GranularDeletedFileEntry> = paths
            .iter()
            .map(|p| GranularDeletedFileEntry {
                id: format!("del-{}", chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0)),
                session_id: session_id.clone(),
                path: p.clone(),
                size_bytes: 0,
                cleaner_category: "General Junk".to_string(),
                timestamp: chrono::Utc::now().to_rfc3339(),
            })
            .collect();
        let _ = GLOBAL_DELETION_LOGGER.append_entries(&granular_entries);
    }

    res
}

#[tauri::command]
fn check_cleaner_blockers(target_paths: Vec<String>) -> taukudu_lib::BlockerSummary {
    CleanerBlockersEngine::check_blockers(&target_paths)
}

#[tauri::command]
fn close_cleaner_blocker(pid: u32) -> Result<(), String> {
    CleanerBlockersEngine::close_blocker(pid)
}

#[tauri::command]
fn probe_delete_access(paths: Vec<String>) -> DeleteProbeSummary {
    DeleteFailureProbeEngine::probe_paths(&paths)
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

#[tauri::command]
fn get_network_cleanup_items() -> Vec<NetworkItemInfo> {
    NetworkToolsEngine::get_network_items()
}

#[tauri::command]
fn flush_dns_cache() -> Result<(), String> {
    NetworkToolsEngine::flush_dns()
}

#[tauri::command]
fn flush_arp_cache() -> Result<(), String> {
    NetworkToolsEngine::flush_arp()
}

#[tauri::command]
fn reset_tcp_stack() -> Result<(), String> {
    NetworkToolsEngine::reset_winsock()
}

#[tauri::command]
fn get_active_connections() -> Vec<ActiveConnectionInfo> {
    NetworkToolsEngine::list_active_connections()
}

#[tauri::command]
fn scan_registry_issues() -> RegistryScanResult {
    RegistryCleanerEngine::scan_registry()
}

#[tauri::command]
fn fix_registry_targets(targets: Vec<(String, String)>) -> RegistryFixResult {
    RegistryCleanerEngine::fix_registry_issues(&targets)
}

#[tauri::command]
fn get_game_mode_status() -> GameModeStatus {
    GLOBAL_GAME_MODE.get_status()
}

#[tauri::command]
fn toggle_game_mode(activate: bool) -> Result<GameModeStatus, String> {
    if activate {
        GLOBAL_GAME_MODE.activate_game_mode()
    } else {
        GLOBAL_GAME_MODE.deactivate_game_mode()
    }
}

#[tauri::command]
fn get_game_optimizations() -> Vec<GameOptimizationItem> {
    GLOBAL_GAME_MODE.get_optimizations()
}

#[tauri::command]
fn toggle_game_auto_detect(enable: bool) -> GameModeStatus {
    GLOBAL_GAME_MODE.set_auto_detect(enable)
}

#[tauri::command]
fn add_custom_game_process(process_name: String) -> Vec<String> {
    GLOBAL_GAME_MODE.add_custom_game(process_name)
}

#[tauri::command]
fn get_custom_game_processes() -> Vec<String> {
    GLOBAL_GAME_MODE.list_custom_games()
}

#[tauri::command]
fn get_trim_info() -> Vec<TrimDriveStatus> {
    DiskMaintenanceEngine::get_trim_status()
}

#[tauri::command]
fn run_disk_trim(drive_letter: String) -> Result<String, String> {
    DiskMaintenanceEngine::execute_trim(&drive_letter)
}

#[tauri::command]
fn run_sfc_scan() -> Result<DiskRepairOutput, String> {
    DiskMaintenanceEngine::run_sfc()
}

#[tauri::command]
fn run_dism_scan() -> Result<DiskRepairOutput, String> {
    DiskMaintenanceEngine::run_dism()
}

#[tauri::command]
fn run_chkdsk_scan(drive_letter: String) -> Result<DiskRepairOutput, String> {
    DiskMaintenanceEngine::run_chkdsk(&drive_letter)
}

#[tauri::command]
fn get_context_menu_entries() -> ContextMenuScanResult {
    ContextMenuEngine::scan_entries()
}

#[tauri::command]
fn toggle_context_menu_entry(key_path: String, enable: bool) -> Result<(), String> {
    ContextMenuEngine::toggle_entry(&key_path, enable)
}

#[tauri::command]
fn audit_firewall() -> FirewallAuditSummary {
    FirewallAuditEngine::audit_firewall_rules()
}

#[tauri::command]
fn toggle_firewall_rule(rule_name: String, enable: bool) -> Result<(), String> {
    FirewallAuditEngine::toggle_rule(&rule_name, enable)
}

#[tauri::command]
fn scan_cves() -> CveScanSummary {
    CveScannerEngine::scan_system_vulnerabilities()
}

#[tauri::command]
fn check_software_updates() -> SoftwareUpdateSummary {
    SoftwareUpdaterEngine::check_updates()
}

#[tauri::command]
fn upgrade_software_package(package_id: String) -> Result<UpdateExecutionResult, String> {
    SoftwareUpdaterEngine::upgrade_package(&package_id)
}

#[tauri::command]
fn upgrade_all_software_packages() -> Result<UpdateExecutionResult, String> {
    SoftwareUpdaterEngine::upgrade_all_packages()
}

#[tauri::command]
fn get_schedules() -> ScheduleSummary {
    GLOBAL_SCHEDULER.get_schedules()
}

#[tauri::command]
fn toggle_schedule(id: String, enable: bool) -> Result<(), String> {
    GLOBAL_SCHEDULER.toggle_schedule(&id, enable)
}

#[tauri::command]
fn get_breach_summary() -> BreachMonitorSummary {
    GLOBAL_BREACH_MONITOR.get_summary()
}

#[tauri::command]
fn add_breach_email(email: String) -> Result<BreachMonitorSummary, String> {
    GLOBAL_BREACH_MONITOR.add_email(email)
}

#[tauri::command]
fn remove_breach_email(email: String) -> Result<BreachMonitorSummary, String> {
    GLOBAL_BREACH_MONITOR.remove_email(&email)
}

#[tauri::command]
fn acknowledge_breach_incident(breach_id: String) -> Result<BreachMonitorSummary, String> {
    GLOBAL_BREACH_MONITOR.acknowledge_breach(&breach_id)
}

#[tauri::command]
fn scan_uninstall_leftovers() -> LeftoversScanResult {
    LeftoversCleanerEngine::scan_leftovers()
}

#[tauri::command]
fn delete_uninstall_leftovers(paths: Vec<String>) -> LeftoversCleanResult {
    LeftoversCleanerEngine::delete_leftover_folders(&paths)
}

#[tauri::command]
fn get_restore_points() -> RestorePointSummary {
    RestorePointEngine::list_restore_points()
}

#[tauri::command]
fn create_restore_point(description: String) -> RestorePointResult {
    RestorePointEngine::create_restore_point(&description)
}

#[tauri::command]
fn get_recycle_bin_summary() -> RecycleBinSummary {
    RecycleBinEngine::get_summary()
}

#[tauri::command]
fn empty_recycle_bin_fast() -> RecycleBinCleanResult {
    let res = RecycleBinEngine::empty_fast();

    if res.payloads_deleted > 0 {
        let rec = HistoryRecord {
            id: format!("recycle-{}", chrono::Utc::now().timestamp_millis()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            action_type: "recycle_bin".to_string(),
            total_space_saved_bytes: res.bytes_freed,
            total_items_cleaned: res.payloads_deleted,
            duration_ms: 150,
            details_summary: format!("Emptied {} Recycle Bin payload files", res.payloads_deleted),
        };
        let _ = GLOBAL_HISTORY.lock().unwrap().add_record(&rec);
    }

    res
}

#[tauri::command]
fn audit_active_threats() -> ThreatMonitorSummary {
    GLOBAL_THREAT_MONITOR.audit_active_threats()
}

#[tauri::command]
fn add_threat_blacklist_cidr(cidr: String, category: String, reason: String) -> Result<usize, String> {
    GLOBAL_THREAT_MONITOR.add_blacklist_cidr(cidr, category, reason)
}

#[tauri::command]
fn terminate_threat_process(pid: u32) -> Result<(), String> {
    GLOBAL_THREAT_MONITOR.terminate_threat_process(pid)
}

#[tauri::command]
fn discover_browser_cache_targets() -> BrowserCacheScanSummary {
    ChromiumCacheEngine::discover_browser_cache_targets()
}

#[tauri::command]
fn query_deletion_log(
    session_id: Option<String>,
    search_query: Option<String>,
    category_filter: Option<String>,
    limit: Option<usize>,
) -> Vec<GranularDeletedFileEntry> {
    GLOBAL_DELETION_LOGGER.query_entries(&DeletionLogQueryOptions {
        session_id,
        search_query,
        category_filter,
        limit: limit.unwrap_or(200),
    })
}

#[tauri::command]
fn get_deletion_log_stats() -> DeletionLogStats {
    GLOBAL_DELETION_LOGGER.get_stats()
}

#[tauri::command]
fn clear_deletion_log() -> Result<(), String> {
    GLOBAL_DELETION_LOGGER.clear_logs()
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
            check_cleaner_blockers,
            close_cleaner_blocker,
            probe_delete_access,
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
            clear_history_records,
            get_network_cleanup_items,
            flush_dns_cache,
            flush_arp_cache,
            reset_tcp_stack,
            get_active_connections,
            scan_registry_issues,
            fix_registry_targets,
            get_game_mode_status,
            toggle_game_mode,
            get_game_optimizations,
            toggle_game_auto_detect,
            add_custom_game_process,
            get_custom_game_processes,
            get_trim_info,
            run_disk_trim,
            run_sfc_scan,
            run_dism_scan,
            run_chkdsk_scan,
            get_context_menu_entries,
            toggle_context_menu_entry,
            audit_firewall,
            toggle_firewall_rule,
            scan_cves,
            check_software_updates,
            upgrade_software_package,
            upgrade_all_software_packages,
            get_schedules,
            toggle_schedule,
            get_breach_summary,
            add_breach_email,
            remove_breach_email,
            acknowledge_breach_incident,
            scan_uninstall_leftovers,
            delete_uninstall_leftovers,
            get_restore_points,
            create_restore_point,
            get_recycle_bin_summary,
            empty_recycle_bin_fast,
            audit_active_threats,
            add_threat_blacklist_cidr,
            terminate_threat_process,
            discover_browser_cache_targets,
            query_deletion_log,
            get_deletion_log_stats,
            clear_deletion_log
        ])
        .run(tauri::generate_context!())
        .expect("error while running taukudu application");
}
