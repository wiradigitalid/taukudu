// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clap::Parser;
use std::env;
use std::path::PathBuf;
use tauri::Manager;
use taukudu_lib::{
    handle_cli_mode, ActiveConnectionInfo, AppLoggerEngine, AppReleaseInfo, AppUpdaterEngine,
    BloatwareApp, BreachMonitorSummary, BsodAnalyzerEngine, BsodDumpAnalysisSummary,
    BugcheckStopCode, MinidumpCrashReport,
    BrowserCacheScanSummary, BrowserProfileCacheTarget, ChromiumCacheEngine,
    CleanExecutionResult, CleanerBlockersEngine, CleanerEngine, CliArgs, ContextMenuEngine, ContextMenuEntryInfo,
    ContextMenuScanResult, CveItem, CveScanSummary, CveScannerEngine, DatabaseOptimizeSummary,
    DatabaseOptimizerEngine, DatabaseScanSummary, DatabaseTargetInfo, DatabaseVacuumResult, DeduplicationEngine,
    DeleteFailureProbeEngine, DeletePathProbeResult, DeleteProbeSummary, DeletionLogQueryOptions,
    DeletionLogStats, DeletionLoggerEngine, DevCacheCleanResult, DevCacheCleanerEngine,
    DevCacheScanSummary, DevCacheTarget, GranularDeletedFileEntry,
    DiskAnalysisResult, DiskAnalyzerEngine, DiskDriveInfo, DiskMaintenanceEngine,
    DiskRepairOutput, DriverPackageInfo, DuplicateScanOptions, DuplicateScanResult,
    EmptyFolderScanResult, EnvCleanerCleanResult, EnvCleanerScanResult, EnvironmentCleanerEngine,
    EventLogCleanResult, EventLogCleanerEngine, EventLogScanSummary, EventLogTarget,
    FirewallAuditEngine, FirewallAuditSummary, GameModeEngine,
    GameModeStatus, GameOptimizationItem, GamingCleanResult, GamingCleanerEngine, GamingScanSummary, GamingTargetDetail,
    GpuControllerEngine, GpuDiagnosticInfo, HistoryRecord, HostsApplyResult, HostsEntryItem,
    HostsFileSummary, HostsSecurityEngine,
    IconFontCacheEngine, CacheRebuildExecutionResult, CacheRebuildScanSummary, CacheTargetDetail, InstalledProgramInfo,
    LargeFileScanResult, LeftoversCleanerEngine, LeftoversCleanResult, LeftoversScanResult,
    MalwareActionResult, MalwareScanResult, MalwareScannerEngine, MemoryOptimizerEngine,
    MemoryOptimizerSnapshot, MemoryTrimResult, MetricLine, MetricsEngine,
    NetworkItemInfo, NetworkToolsEngine, PerfMonitorEngine, PerformanceSnapshot, ProcessMemoryItem,
    PrivacyApplyResult, PrivacyShieldEngine, PrivacyShieldState, RecycleBinCleanResult,
    RecycleBinDriveStat, RecycleBinEngine, RecycleBinSummary, RegistryBackupEngine,
    RegistryBackupEntry, RegistryBackupSummary, RegistryCleanerEngine,
    RegistryFixResult, RegistryIssue, RegistryScanResult, RestorePointEngine,
    RestorePointItem, RestorePointResult, RestorePointSummary, SafetyIntelligenceEngine,
    SafetyRating, SafetyRatingSummary, ScanResult, ScheduleItem,
    ScheduleSummary, SecurityPostureEngine, SecurityPostureSummary, ServiceDriverEngine, ServiceItemInfo, ShortcutCleanerEngine,
    BrokenShortcutCleanResult, BrokenShortcutItem, BrokenShortcutScanResult, ShredderResult, SmartHealthEngine,
    DriveHealthSummary, PhysicalDriveHealth, SoftwareUpdateSummary,
    AppSettings, CleanerConfig, SettingsStoreEngine,
    SoftwareUpdaterEngine, StartupDebloatEngine, StartupItem, ThreatBlacklistData,
    ThreatBlacklistStore, ThreatBlacklistSummary, ThreatMonitorEngine,
    ThreatMonitorSummary, TrimDriveStatus, TrimHistoryStore, TrimHistorySummary, TrimRecord,
    UninstallerShredderEngine, UpdateExecutionResult, WinUpdateCleanResult, WinUpdateCleanerEngine,
    WinUpdateScanSummary, WinUpdateTarget, WindowGeometryState, WindowStateEngine,
    YaraBundleValidationResult, YaraRuleFileEntry, YaraRulesMetadata, YaraRulesStoreEngine,
    GLOBAL_APP_LOGGER, GLOBAL_BREACH_MONITOR, GLOBAL_DELETION_LOGGER, GLOBAL_GAME_MODE, GLOBAL_HISTORY,
    GLOBAL_SCHEDULER, GLOBAL_SETTINGS, GLOBAL_THREAT_BLACKLIST, GLOBAL_THREAT_MONITOR,
    GLOBAL_TRIM_HISTORY, GLOBAL_WINDOW_STATE, GLOBAL_YARA_RULES_STORE,
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
    let res = DiskMaintenanceEngine::execute_trim(&drive_letter);
    if res.is_ok() {
        GLOBAL_TRIM_HISTORY.record_trim(&drive_letter);
    }
    res
}

#[tauri::command]
fn get_trim_history_summary() -> TrimHistorySummary {
    GLOBAL_TRIM_HISTORY.get_summary()
}

#[tauri::command]
fn is_drive_trim_throttled(drive_letter: String) -> bool {
    GLOBAL_TRIM_HISTORY.is_throttled(&drive_letter)
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

#[tauri::command]
fn get_app_settings() -> AppSettings {
    GLOBAL_SETTINGS.get_settings()
}

#[tauri::command]
fn update_app_settings(settings: AppSettings) -> AppSettings {
    GLOBAL_SETTINGS.update_settings(settings)
}

#[tauri::command]
fn add_exclusion_path(path: String) -> Vec<String> {
    GLOBAL_SETTINGS.add_exclusion(path)
}

#[tauri::command]
fn remove_exclusion_path(path: String) -> Vec<String> {
    GLOBAL_SETTINGS.remove_exclusion(&path)
}

#[tauri::command]
fn collect_prometheus_metrics() -> taukudu_lib::PrometheusMetricsSummary {
    MetricsEngine::get_summary()
}

#[tauri::command]
fn get_window_state() -> WindowGeometryState {
    GLOBAL_WINDOW_STATE.get_window_state()
}

#[tauri::command]
fn save_window_state(state: WindowGeometryState) -> WindowGeometryState {
    GLOBAL_WINDOW_STATE.save_window_state(state)
}

#[tauri::command]
fn collect_security_posture() -> SecurityPostureSummary {
    SecurityPostureEngine::collect_security_posture()
}

#[tauri::command]
fn check_is_admin() -> bool {
    SecurityPostureEngine::is_admin()
}

#[tauri::command]
fn get_threat_blacklist_summary() -> ThreatBlacklistSummary {
    GLOBAL_THREAT_BLACKLIST.get_summary()
}

#[tauri::command]
fn get_threat_blacklist_data() -> ThreatBlacklistData {
    GLOBAL_THREAT_BLACKLIST.get_data()
}

#[tauri::command]
fn update_threat_blacklist_data(data: ThreatBlacklistData) -> Result<ThreatBlacklistSummary, String> {
    GLOBAL_THREAT_BLACKLIST.update_data(data)
}

#[tauri::command]
fn add_threat_blacklist_domain(domain: String) -> ThreatBlacklistSummary {
    GLOBAL_THREAT_BLACKLIST.add_threat_domain(domain)
}

#[tauri::command]
fn write_app_log(level: String, message: String, source: Option<String>) {
    GLOBAL_APP_LOGGER.log(&level, &message, source.as_deref());
}

#[tauri::command]
fn query_app_logs(limit: Option<usize>, filter_level: Option<String>) -> Vec<taukudu_lib::LogEntry> {
    GLOBAL_APP_LOGGER.query_logs(limit.unwrap_or(100), filter_level)
}

#[tauri::command]
fn get_app_log_stats() -> taukudu_lib::LogStats {
    GLOBAL_APP_LOGGER.get_stats()
}

#[tauri::command]
fn clear_app_logs() -> Result<(), String> {
    GLOBAL_APP_LOGGER.clear()
}

#[tauri::command]
fn get_app_version() -> String {
    AppUpdaterEngine::get_current_version()
}

#[tauri::command]
fn check_app_updates() -> AppReleaseInfo {
    AppUpdaterEngine::check_for_updates()
}

#[tauri::command]
fn get_gpu_diagnostics() -> GpuDiagnosticInfo {
    GpuControllerEngine::get_gpu_diagnostics()
}

#[tauri::command]
fn set_gpu_hardware_acceleration(disable: bool) -> Result<GpuDiagnosticInfo, String> {
    GpuControllerEngine::set_gpu_disabled(disable)
}

#[tauri::command]
fn list_yara_rule_files() -> Vec<YaraRuleFileEntry> {
    GLOBAL_YARA_RULES_STORE.list_rule_files()
}

#[tauri::command]
fn get_yara_rules_metadata() -> YaraRulesMetadata {
    GLOBAL_YARA_RULES_STORE.get_metadata()
}

#[tauri::command]
fn save_yara_rule_file(filename: String, content: String) -> Result<YaraRulesMetadata, String> {
    GLOBAL_YARA_RULES_STORE.save_rule_file(filename, content)
}

#[tauri::command]
fn delete_yara_rule_file(filename: String) -> Result<YaraRulesMetadata, String> {
    GLOBAL_YARA_RULES_STORE.delete_rule_file(&filename)
}

#[tauri::command]
fn list_registry_backups() -> RegistryBackupSummary {
    RegistryBackupEngine::list_backups()
}

#[tauri::command]
fn export_registry_key_backup(key_path: String, tag: String) -> Result<RegistryBackupEntry, String> {
    RegistryBackupEngine::export_key(&key_path, &tag)
}

#[tauri::command]
fn restore_registry_backup(file_path: String) -> Result<String, String> {
    RegistryBackupEngine::restore_backup_file(&file_path)
}

#[tauri::command]
fn delete_registry_backup(file_path: String) -> Result<(), String> {
    RegistryBackupEngine::delete_backup(&file_path)
}

#[tauri::command]
fn scan_broken_shortcuts() -> BrokenShortcutScanResult {
    ShortcutCleanerEngine::scan_broken_shortcuts()
}

#[tauri::command]
fn delete_broken_shortcuts(paths: Vec<String>) -> BrokenShortcutCleanResult {
    ShortcutCleanerEngine::delete_shortcuts(&paths)
}

#[tauri::command]
fn scan_sqlite_databases() -> DatabaseScanSummary {
    DatabaseOptimizerEngine::scan_databases()
}

#[tauri::command]
fn vacuum_sqlite_databases(paths: Vec<String>) -> DatabaseOptimizeSummary {
    DatabaseOptimizerEngine::optimize_databases(&paths)
}

#[tauri::command]
fn scan_environment_orphans() -> EnvCleanerScanResult {
    EnvironmentCleanerEngine::scan_environment()
}

#[tauri::command]
fn clean_environment_orphans(items: Vec<taukudu_lib::OrphanEnvItem>) -> EnvCleanerCleanResult {
    EnvironmentCleanerEngine::clean_environment_items(&items)
}

#[tauri::command]
fn scan_icon_font_caches() -> CacheRebuildScanSummary {
    IconFontCacheEngine::scan_caches()
}

#[tauri::command]
fn rebuild_and_purge_caches(restart_explorer: bool) -> CacheRebuildExecutionResult {
    IconFontCacheEngine::rebuild_and_purge_caches(restart_explorer)
}

#[tauri::command]
fn scan_gaming_cleaner() -> GamingScanSummary {
    GamingCleanerEngine::scan_gaming_targets()
}

#[tauri::command]
fn clean_gaming_targets(paths: Vec<String>) -> GamingCleanResult {
    GamingCleanerEngine::clean_gaming_targets(&paths)
}

#[tauri::command]
fn scan_windows_event_logs() -> EventLogScanSummary {
    EventLogCleanerEngine::scan_event_logs()
}

#[tauri::command]
fn clean_windows_event_logs(targets: Vec<taukudu_lib::EventLogTarget>) -> EventLogCleanResult {
    EventLogCleanerEngine::clean_event_log_targets(&targets)
}

#[tauri::command]
fn scan_windows_updates() -> WinUpdateScanSummary {
    WinUpdateCleanerEngine::scan_update_caches()
}

#[tauri::command]
fn clean_windows_updates(paths: Vec<String>) -> WinUpdateCleanResult {
    WinUpdateCleanerEngine::clean_update_targets(&paths)
}

#[tauri::command]
fn get_memory_optimizer_snapshot() -> MemoryOptimizerSnapshot {
    MemoryOptimizerEngine::get_memory_snapshot()
}

#[tauri::command]
fn trim_memory_working_sets() -> MemoryTrimResult {
    MemoryOptimizerEngine::trim_working_sets()
}

#[tauri::command]
fn get_safety_intelligence_summary() -> SafetyRatingSummary {
    SafetyIntelligenceEngine::get_safety_summary()
}

#[tauri::command]
fn lookup_safety_rating(query: String) -> Option<SafetyRating> {
    SafetyIntelligenceEngine::lookup_rating(&query)
}

#[tauri::command]
fn scan_hosts_file_security() -> HostsFileSummary {
    HostsSecurityEngine::scan_hosts_file()
}

#[tauri::command]
fn apply_hosts_telemetry_block(enable_block: bool) -> Result<HostsApplyResult, String> {
    HostsSecurityEngine::apply_telemetry_block(enable_block)
}

#[tauri::command]
fn scan_developer_caches() -> DevCacheScanSummary {
    DevCacheCleanerEngine::scan_dev_caches()
}

#[tauri::command]
fn clean_developer_caches(paths: Vec<String>) -> DevCacheCleanResult {
    DevCacheCleanerEngine::clean_dev_cache_targets(&paths)
}

#[tauri::command]
fn inspect_physical_drives_health() -> DriveHealthSummary {
    SmartHealthEngine::inspect_physical_drives()
}

#[tauri::command]
fn analyze_bsod_crash_dumps() -> BsodDumpAnalysisSummary {
    BsodAnalyzerEngine::scan_and_analyze_crash_dumps()
}

#[tauri::command]
fn get_known_bugcheck_codes() -> Vec<BugcheckStopCode> {
    BsodAnalyzerEngine::get_known_bugcheck_database()
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
            get_trim_history_summary,
            is_drive_trim_throttled,
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
            clear_deletion_log,
            get_app_settings,
            update_app_settings,
            add_exclusion_path,
            remove_exclusion_path,
            collect_prometheus_metrics,
            get_window_state,
            save_window_state,
            collect_security_posture,
            check_is_admin,
            get_threat_blacklist_summary,
            get_threat_blacklist_data,
            update_threat_blacklist_data,
            add_threat_blacklist_domain,
            write_app_log,
            query_app_logs,
            get_app_log_stats,
            clear_app_logs,
            get_app_version,
            check_app_updates,
            get_gpu_diagnostics,
            set_gpu_hardware_acceleration,
            list_yara_rule_files,
            get_yara_rules_metadata,
            save_yara_rule_file,
            delete_yara_rule_file,
            list_registry_backups,
            export_registry_key_backup,
            restore_registry_backup,
            delete_registry_backup,
            scan_broken_shortcuts,
            delete_broken_shortcuts,
            scan_sqlite_databases,
            vacuum_sqlite_databases,
            scan_environment_orphans,
            clean_environment_orphans,
            scan_icon_font_caches,
            rebuild_and_purge_caches,
            scan_gaming_cleaner,
            clean_gaming_targets,
            scan_windows_event_logs,
            clean_windows_event_logs,
            scan_windows_updates,
            clean_windows_updates,
            get_memory_optimizer_snapshot,
            trim_memory_working_sets,
            get_safety_intelligence_summary,
            lookup_safety_rating,
            scan_hosts_file_security,
            apply_hosts_telemetry_block,
            scan_developer_caches,
            clean_developer_caches,
            inspect_physical_drives_health,
            analyze_bsod_crash_dumps,
            get_known_bugcheck_codes
        ])
        .run(tauri::generate_context!())
        .expect("error while running taukudu application");
}
