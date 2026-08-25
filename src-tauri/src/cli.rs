use clap::{Parser, Subcommand};
use std::path::PathBuf;
use crate::cleaner::CleanerEngine;
use crate::deduplication::{DeduplicationEngine, DuplicateScanOptions};
use crate::malware_scanner::MalwareScannerEngine;
use crate::privacy::PrivacyShieldEngine;

#[derive(Parser, Debug)]
#[command(name = "taukudu")]
#[command(author = "TauKudu Contributors")]
#[command(version = "0.1.0")]
#[command(about = "High-performance native system cleaner, deduplication tool, and security suite", long_about = None)]
pub struct CliArgs {
    #[command(subcommand)]
    pub command: Option<Commands>,

    /// Run in headless CLI mode
    #[arg(long, default_value_t = false)]
    pub cli: bool,

    /// Scan and clean all categories headlessly
    #[arg(long, default_value_t = false)]
    pub all: bool,

    /// Perform deletion after scanning
    #[arg(long, default_value_t = false)]
    pub clean: bool,

    /// Output results as JSON for automation scripts
    #[arg(long, default_value_t = false)]
    pub json: bool,

    /// Suppress progress output
    #[arg(short, long, default_value_t = false)]
    pub quiet: bool,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Scan and clean junk files
    Clean {
        #[arg(long, default_value_t = false)]
        all: bool,
        #[arg(long, default_value_t = false)]
        clean: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    /// Find duplicate files using Blake3 multi-stage hashing
    Duplicates {
        /// Target directory path to scan
        #[arg(short, long, default_value = ".")]
        directory: String,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    /// Scan for malware threats and masquerading binaries
    Malware {
        #[arg(long, default_value = "quick")]
        scan_type: String,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    /// Inspect or enforce Windows privacy policies
    Privacy {
        #[arg(long, default_value_t = false)]
        enforce_all: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
}

pub fn handle_cli_mode(args: &CliArgs) {
    let rules_dir = PathBuf::from("rules");

    match &args.command {
        Some(Commands::Clean { all: _, clean, json }) => {
            let engine = CleanerEngine::new(&rules_dir);
            let scan = engine.scan_all();

            if *clean {
                let paths: Vec<String> = scan.categories.iter().flat_map(|c| c.items.iter().map(|i| i.path.clone())).collect();
                let clean_res = CleanerEngine::clean_files(&paths);

                if *json {
                    println!("{}", serde_json::json!({
                        "scanned_files": scan.total_files,
                        "reclaimed_bytes": clean_res.deleted_bytes,
                        "deleted_files": clean_res.deleted_files,
                        "errors": clean_res.errors
                    }));
                } else {
                    println!("Scan & Clean complete!");
                    println!("Deleted {} files, reclaimed {} bytes.", clean_res.deleted_files, clean_res.deleted_bytes);
                }
            } else {
                if *json {
                    println!("{}", serde_json::to_string_pretty(&scan).unwrap_or_default());
                } else {
                    println!("Scan found {} junk files totaling {} bytes.", scan.total_files, scan.total_bytes);
                    for cat in &scan.categories {
                        println!(" - {}: {} files ({} bytes)", cat.category, cat.total_files, cat.total_bytes);
                    }
                    println!("Run with --clean to delete these files.");
                }
            }
        }
        Some(Commands::Duplicates { directory, json }) => {
            let options = DuplicateScanOptions {
                directory: directory.clone(),
                min_file_size: 1024,
                max_file_size: None,
                exclude_patterns: vec!["target".to_string(), "node_modules".to_string(), ".git".to_string()],
                extension_filter: vec![],
                max_depth: Some(30),
            };
            let res = DeduplicationEngine::scan_duplicates(&options);
            if *json {
                println!("{}", serde_json::to_string_pretty(&res).unwrap_or_default());
            } else {
                println!("Duplicate Scan Complete in {}ms!", res.scan_duration_ms);
                println!("Found {} duplicate files ({} bytes reclaimable) across {} groups.", res.total_duplicates, res.reclaimable_space, res.groups.len());
            }
        }
        Some(Commands::Malware { scan_type, json }) => {
            let res = MalwareScannerEngine::scan(scan_type, None);
            if *json {
                println!("{}", serde_json::to_string_pretty(&res).unwrap_or_default());
            } else {
                println!("Malware Scan ({}) Complete in {}ms!", res.scan_type, res.duration_ms);
                println!("Files Scanned: {} | Threats Detected: {}", res.files_scanned, res.threats.len());
                for t in &res.threats {
                    println!(" [!] {} ({}) -> {}", t.detection_name, t.severity, t.path);
                }
            }
        }
        Some(Commands::Privacy { enforce_all, json }) => {
            if *enforce_all {
                let state = PrivacyShieldEngine::get_all_settings();
                for s in &state.settings {
                    let _ = PrivacyShieldEngine::apply_setting(&s.id, true);
                }
                println!("Enforced all privacy & telemetry shield policies.");
            } else {
                let state = PrivacyShieldEngine::get_all_settings();
                if *json {
                    println!("{}", serde_json::to_string_pretty(&state).unwrap_or_default());
                } else {
                    println!("Privacy Protection Score: {}% ({} of {} policies protected)", state.score_percentage, state.protected_count, state.total_count);
                    for s in &state.settings {
                        println!(" - [{}] {}: {}", if s.is_enabled { "PROTECTED" } else { "EXPOSED" }, s.label, s.description);
                    }
                }
            }
        }
        None => {
            // If invoked with --all or --clean directly
            if args.all || args.clean {
                let engine = CleanerEngine::new(&rules_dir);
                let scan = engine.scan_all();
                if args.clean {
                    let paths: Vec<String> = scan.categories.iter().flat_map(|c| c.items.iter().map(|i| i.path.clone())).collect();
                    let clean_res = CleanerEngine::clean_files(&paths);
                    if args.json {
                        println!("{}", serde_json::json!({
                            "deleted_files": clean_res.deleted_files,
                            "deleted_bytes": clean_res.deleted_bytes
                        }));
                    } else if !args.quiet {
                        println!("Cleaned {} files, reclaimed {} bytes.", clean_res.deleted_files, clean_res.deleted_bytes);
                    }
                } else {
                    if args.json {
                        println!("{}", serde_json::to_string_pretty(&scan).unwrap_or_default());
                    } else if !args.quiet {
                        println!("Scan found {} junk files totaling {} bytes.", scan.total_files, scan.total_bytes);
                    }
                }
            }
        }
    }
}
