pub mod breach_monitor;
pub mod chromium_cache;
pub mod cleaner;
pub mod cleaner_blockers;
pub mod cli;
pub mod context_menu;
pub mod cve_scanner;
pub mod deduplication;
pub mod delete_failure_probe;
pub mod deletion_logger;
pub mod disk_analyzer;
pub mod disk_maintenance;
pub mod firewall_audit;
pub mod game_mode;
pub mod history_store;
pub mod leftovers_cleaner;
pub mod malware_scanner;
pub mod network_tools;
pub mod perf_monitor;
pub mod privacy;
pub mod recycle_bin;
pub mod registry_cleaner;
pub mod restore_point;
pub mod rules;
pub mod scheduler;
pub mod service_driver;
pub mod software_updater;
pub mod startup_debloat;
pub mod threat_monitor;
pub mod uninstaller_shredder;

pub use breach_monitor::{BreachIncident, BreachMonitorEngine, BreachMonitorSummary, MonitoredEmailStatus, GLOBAL_BREACH_MONITOR};
pub use chromium_cache::{BrowserCacheScanSummary, BrowserProfileCacheTarget, ChromiumCacheEngine};
pub use cleaner::{CleanExecutionResult, CleanerEngine, ScanResult};
pub use cleaner_blockers::{BlockerSummary, CleanerBlockersEngine, ProcessBlockerInfo};
pub use cli::{handle_cli_mode, CliArgs, Commands};
pub use context_menu::{ContextMenuEngine, ContextMenuEntryInfo, ContextMenuScanResult};
pub use cve_scanner::{CveItem, CveScanSummary, CveScannerEngine};
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
pub use firewall_audit::{FirewallAuditEngine, FirewallAuditSummary, FirewallRuleInfo};
pub use game_mode::{
    DetectedGameInfo, GameModeEngine, GameModeStatus, GameOptimizationItem, GLOBAL_GAME_MODE,
};
pub use history_store::{HistoryRecord, HistoryStore, GLOBAL_HISTORY};
pub use leftovers_cleaner::{
    LeftoverFolderItem, LeftoversCleanResult, LeftoversCleanerEngine, LeftoversScanResult,
};
pub use malware_scanner::{
    MalwareActionResult, MalwareScanResult, MalwareScannerEngine, MalwareThreat, QuarantinedItem,
};
pub use network_tools::{ActiveConnectionInfo, NetworkItemInfo, NetworkToolsEngine};
pub use perf_monitor::{PerfMonitorEngine, PerformanceSnapshot, ProcessItem};
pub use privacy::{PrivacyApplyResult, PrivacySetting, PrivacyShieldEngine, PrivacyShieldState};
pub use recycle_bin::{
    RecycleBinCleanResult, RecycleBinDriveStat, RecycleBinEngine, RecycleBinSummary,
};
pub use registry_cleaner::{RegistryCleanerEngine, RegistryFixResult, RegistryIssue, RegistryScanResult};
pub use restore_point::{
    RestorePointEngine, RestorePointItem, RestorePointResult, RestorePointSummary,
};
pub use scheduler::{ScheduleEngine, ScheduleItem, ScheduleSummary, GLOBAL_SCHEDULER};
pub use service_driver::{DriverPackageInfo, ServiceDriverEngine, ServiceItemInfo};
pub use software_updater::{SoftwareUpdateSummary, SoftwareUpdaterEngine, UpdatablePackage, UpdateExecutionResult};
pub use startup_debloat::{BloatwareApp, StartupDebloatEngine, StartupItem};
pub use threat_monitor::{
    FlaggedConnection, ThreatMonitorEngine, ThreatMonitorSummary, GLOBAL_THREAT_MONITOR,
};
pub use uninstaller_shredder::{
    InstalledProgramInfo, ShredderResult, UninstallerShredderEngine,
};
