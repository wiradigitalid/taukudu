pub mod cleaner;
pub mod deduplication;
pub mod rules;

pub use cleaner::{CleanExecutionResult, CleanerEngine, ScanResult};
pub use deduplication::{
    DeduplicationEngine, DuplicateFile, DuplicateGroup, DuplicateScanOptions, DuplicateScanResult,
    EmptyFolderScanResult, LargeFileScanResult,
};
