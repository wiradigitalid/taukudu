pub mod cleaner;
pub mod deduplication;
pub mod disk_analyzer;
pub mod privacy;
pub mod rules;
pub mod startup_debloat;

pub use cleaner::{CleanExecutionResult, CleanerEngine, ScanResult};
pub use deduplication::{
    DeduplicationEngine, DuplicateFile, DuplicateGroup, DuplicateScanOptions, DuplicateScanResult,
    EmptyFolderScanResult, LargeFileScanResult,
};
pub use disk_analyzer::{
    DiskAnalysisResult, DiskAnalyzerEngine, DiskDriveInfo, DiskTreemapNode, FileTypeBreakdown,
};
pub use privacy::{PrivacyApplyResult, PrivacySetting, PrivacyShieldEngine, PrivacyShieldState};
pub use startup_debloat::{BloatwareApp, StartupDebloatEngine, StartupItem};
