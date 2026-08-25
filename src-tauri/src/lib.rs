pub mod cleaner;
pub mod cli;
pub mod deduplication;
pub mod disk_analyzer;
pub mod game_mode;
pub mod history_store;
pub mod malware_scanner;
pub mod network_tools;
pub mod perf_monitor;
pub mod privacy;
pub mod registry_cleaner;
pub mod rules;
pub mod service_driver;
pub mod startup_debloat;
pub mod uninstaller_shredder;

pub use cleaner::{CleanExecutionResult, CleanerEngine, ScanResult};
pub use cli::{handle_cli_mode, CliArgs, Commands};
pub use deduplication::{
    DeduplicationEngine, DuplicateFile, DuplicateGroup, DuplicateScanOptions, DuplicateScanResult,
    EmptyFolderScanResult, LargeFileScanResult,
};
pub use disk_analyzer::{
    DiskAnalysisResult, DiskAnalyzerEngine, DiskDriveInfo, DiskTreemapNode, FileTypeBreakdown,
};
pub use game_mode::{GameModeEngine, GameModeStatus, GameOptimizationItem};
pub use history_store::{HistoryRecord, HistoryStore, GLOBAL_HISTORY};
pub use malware_scanner::{
    MalwareActionResult, MalwareScanResult, MalwareScannerEngine, MalwareThreat, QuarantinedItem,
};
pub use network_tools::{ActiveConnectionInfo, NetworkItemInfo, NetworkToolsEngine};
pub use perf_monitor::{PerfMonitorEngine, PerformanceSnapshot, ProcessItem};
pub use privacy::{PrivacyApplyResult, PrivacySetting, PrivacyShieldEngine, PrivacyShieldState};
pub use registry_cleaner::{RegistryCleanerEngine, RegistryFixResult, RegistryIssue, RegistryScanResult};
pub use service_driver::{DriverPackageInfo, ServiceDriverEngine, ServiceItemInfo};
pub use startup_debloat::{BloatwareApp, StartupDebloatEngine, StartupItem};
pub use uninstaller_shredder::{
    InstalledProgramInfo, ShredderResult, UninstallerShredderEngine,
};
