pub mod app_logger;
pub mod app_updater;
pub mod breach_monitor;
pub mod chromium_cache;
pub mod cleaner;
pub mod cleaner_blockers;
pub mod cli;
pub mod context_menu;
pub mod cve_scanner;
pub mod database_optimizer;
pub mod deduplication;
pub mod delete_failure_probe;
pub mod deletion_logger;
pub mod disk_analyzer;
pub mod disk_maintenance;
pub mod environment_cleaner;
pub mod event_log_cleaner;
pub mod firewall_audit;
pub mod game_mode;
pub mod gaming_cleaner;
pub mod gpu_controller;
pub mod history_store;
pub mod icon_font_cache;
pub mod leftovers_cleaner;
pub mod malware_scanner;
pub mod metrics;
pub mod network_tools;
pub mod perf_monitor;
pub mod privacy;
pub mod recycle_bin;
pub mod registry_backup;
pub mod registry_cleaner;
pub mod restore_point;
pub mod rules;
pub mod scheduler;
pub mod security_posture;
pub mod service_driver;
pub mod settings_store;
pub mod shortcut_cleaner;
pub mod software_updater;
pub mod startup_debloat;
pub mod threat_blacklist;
pub mod threat_monitor;
pub mod trim_history;
pub mod uninstaller_shredder;
pub mod win_update_cleaner;
pub mod window_state;
pub mod yara_rules_store;

pub use app_logger::{AppLoggerEngine, LogEntry, LogStats, GLOBAL_APP_LOGGER};
pub use app_updater::{AppReleaseInfo, AppUpdaterEngine};
pub use breach_monitor::{BreachIncident, BreachMonitorEngine, BreachMonitorSummary, MonitoredEmailStatus, GLOBAL_BREACH_MONITOR};
pub use chromium_cache::{BrowserCacheScanSummary, BrowserProfileCacheTarget, ChromiumCacheEngine};
pub use cleaner::{CleanExecutionResult, CleanerEngine, ScanResult};
pub use cleaner_blockers::{BlockerSummary, CleanerBlockersEngine, ProcessBlockerInfo};
pub use cli::{handle_cli_mode, CliArgs, Commands};
pub use context_menu::{ContextMenuEngine, ContextMenuEntryInfo, ContextMenuScanResult};
pub use cve_scanner::{CveItem, CveScanSummary, CveScannerEngine};
pub use database_optimizer::{
    DatabaseOptimizeSummary, DatabaseOptimizerEngine, DatabaseScanSummary, DatabaseTargetInfo,
    DatabaseVacuumResult,
};
pub use deduplication::{
    DeduplicationEngine, DuplicateFile, DuplicateGroup, DuplicateScanOptions, DuplicateScanResult,
    EmptyFolderScanResult, LargeFileScanResult,
};
pub use delete_failure_probe::{
    DeleteFailureProbeEngine, DeletePathProbeResult, DeleteProbeStatus, DeleteProbeSummary,
};
pub use deletion_logger::{
    DeletionLogQueryOptions, DeletionLogStats, DeletionLoggerEngine, GranularDeletedFileEntry,
    GLOBAL_DELETION_LOGGER,
};
pub use disk_analyzer::{
    DiskAnalysisResult, DiskAnalyzerEngine, DiskDriveInfo, DiskTreemapNode, FileTypeBreakdown,
};
pub use disk_maintenance::{DiskMaintenanceEngine, DiskRepairOutput, TrimDriveStatus};
pub use environment_cleaner::{
    EnvCleanerCleanResult, EnvCleanerScanResult, EnvironmentCleanerEngine, OrphanEnvItem,
};
pub use event_log_cleaner::{
    EventLogCleanResult, EventLogCleanerEngine, EventLogScanSummary, EventLogTarget,
};
pub use firewall_audit::{FirewallAuditEngine, FirewallAuditSummary, FirewallRuleInfo};
pub use game_mode::{
    DetectedGameInfo, GameModeEngine, GameModeStatus, GameOptimizationItem, GLOBAL_GAME_MODE,
};
pub use gaming_cleaner::{
    GamingCleanResult, GamingCleanerEngine, GamingScanSummary, GamingTargetDetail,
};
pub use gpu_controller::{GpuControllerEngine, GpuDiagnosticInfo};
pub use history_store::{HistoryRecord, HistoryStore, GLOBAL_HISTORY};
pub use icon_font_cache::{
    CacheRebuildExecutionResult, CacheRebuildScanSummary, CacheTargetDetail, IconFontCacheEngine,
};
pub use leftovers_cleaner::{
    LeftoverFolderItem, LeftoversCleanResult, LeftoversCleanerEngine, LeftoversScanResult,
};
pub use malware_scanner::{
    MalwareActionResult, MalwareScanResult, MalwareScannerEngine, MalwareThreat, QuarantinedItem,
};
pub use metrics::{MetricLine, MetricsEngine, PrometheusMetricsSummary};
pub use network_tools::{ActiveConnectionInfo, NetworkItemInfo, NetworkToolsEngine};
pub use perf_monitor::{PerfMonitorEngine, PerformanceSnapshot, ProcessItem};
pub use privacy::{PrivacyApplyResult, PrivacySetting, PrivacyShieldEngine, PrivacyShieldState};
pub use recycle_bin::{
    RecycleBinCleanResult, RecycleBinDriveStat, RecycleBinEngine, RecycleBinItemDetail,
    RecycleBinSummary,
};
pub use registry_backup::{
    RegistryBackupEngine, RegistryBackupEntry, RegistryBackupSummary,
};
pub use registry_cleaner::{RegistryCleanerEngine, RegistryFixResult, RegistryIssue, RegistryScanResult};
pub use restore_point::{
    RestorePointEngine, RestorePointItem, RestorePointResult, RestorePointSummary,
};
pub use scheduler::{ScheduleEngine, ScheduleItem, ScheduleSummary, GLOBAL_SCHEDULER};
pub use security_posture::{
    AntivirusProductInfo, BitlockerVolumeInfo, HotfixPatchInfo, SecurityPostureEngine,
    SecurityPostureSummary,
};
pub use service_driver::{DriverPackageInfo, ServiceDriverEngine, ServiceItemInfo};
pub use settings_store::{
    AppSettings, CleanerConfig, SettingsStoreEngine, GLOBAL_SETTINGS,
};
pub use shortcut_cleaner::{
    BrokenShortcutCleanResult, BrokenShortcutItem, BrokenShortcutScanResult, ShortcutCleanerEngine,
};
pub use software_updater::{SoftwareUpdateSummary, SoftwareUpdaterEngine, UpdatablePackage, UpdateExecutionResult};
pub use startup_debloat::{BloatwareApp, StartupDebloatEngine, StartupItem};
pub use threat_blacklist::{
    ThreatBlacklistData, ThreatBlacklistStore, ThreatBlacklistSummary, GLOBAL_THREAT_BLACKLIST,
};
pub use threat_monitor::{
    FlaggedConnection, ThreatMonitorEngine, ThreatMonitorSummary, GLOBAL_THREAT_MONITOR,
};
pub use trim_history::{
    TrimHistoryStore, TrimHistorySummary, TrimRecord, GLOBAL_TRIM_HISTORY,
};
pub use uninstaller_shredder::{
    InstalledProgramInfo, ShredderResult, UninstallerShredderEngine,
};
pub use win_update_cleaner::{
    WinUpdateCleanResult, WinUpdateCleanerEngine, WinUpdateScanSummary, WinUpdateTarget,
};
pub use window_state::{
    WindowGeometryState, WindowStateEngine, GLOBAL_WINDOW_STATE, MIN_WINDOW_HEIGHT,
    MIN_WINDOW_WIDTH,
};
pub use yara_rules_store::{
    YaraBundleValidationResult, YaraRuleFileEntry, YaraRulesMetadata, YaraRulesStoreEngine,
    GLOBAL_YARA_RULES_STORE,
};
