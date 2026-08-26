use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseTargetInfo {
    pub id: String,
    pub app_name: String,
    pub db_name: String,
    pub file_path: String,
    pub size_bytes: u64,
    pub wal_size_bytes: u64,
    pub estimated_reclaimable_bytes: u64,
    pub is_locked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseScanSummary {
    pub databases: Vec<DatabaseTargetInfo>,
    pub total_databases_found: usize,
    pub total_estimated_reclaimable_bytes: u64,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseVacuumResult {
    pub file_path: String,
    pub size_before_bytes: u64,
    pub size_after_bytes: u64,
    pub bytes_reclaimed: u64,
    pub is_successful: bool,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseOptimizeSummary {
    pub optimized_count: usize,
    pub failed_count: usize,
    pub total_bytes_reclaimed: u64,
    pub results: Vec<DatabaseVacuumResult>,
}

pub struct DatabaseOptimizerEngine;

impl DatabaseOptimizerEngine {
    /// Verify if a file has the standard SQLite 3 magic header
    pub fn is_sqlite_database(path: &Path) -> bool {
        if let Ok(mut f) = fs::File::open(path) {
            use std::io::Read;
            let mut buf = [0u8; 16];
            if f.read_exact(&mut buf).is_ok() {
                return &buf == b"SQLite format 3\0";
            }
        }
        false
    }

    /// Enumerate known desktop applications and browser SQLite database targets
    pub fn get_known_targets() -> Vec<(&'static str, PathBuf, Vec<&'static str>)> {
        let mut targets = Vec::new();
        let appdata = std::env::var("APPDATA").unwrap_or_default();
        let localappdata = std::env::var("LOCALAPPDATA").unwrap_or_default();

        if !localappdata.is_empty() {
            let local = PathBuf::from(&localappdata);

            // Google Chrome
            targets.push((
                "Google Chrome",
                local.join("Google").join("Chrome").join("User Data"),
                vec!["History", "Cookies", "Web Data", "Favicons", "Shortcuts", "Top Sites", "Network Action Predictor"],
            ));

            // Microsoft Edge
            targets.push((
                "Microsoft Edge",
                local.join("Microsoft").join("Edge").join("User Data"),
                vec!["History", "Cookies", "Web Data", "Favicons", "Shortcuts", "Top Sites"],
            ));

            // Brave Browser
            targets.push((
                "Brave Browser",
                local.join("BraveSoftware").join("Brave-Browser").join("User Data"),
                vec!["History", "Cookies", "Web Data", "Favicons", "Shortcuts"],
            ));

            // Vivaldi
            targets.push((
                "Vivaldi",
                local.join("Vivaldi").join("User Data"),
                vec!["History", "Cookies", "Web Data", "Favicons"],
            ));

            // Opera Stable
            targets.push((
                "Opera",
                PathBuf::from(&appdata).join("Opera Software").join("Opera Stable"),
                vec!["History", "Cookies", "Web Data", "Favicons"],
            ));

            // Opera GX
            targets.push((
                "Opera GX",
                PathBuf::from(&appdata).join("Opera Software").join("Opera GX Stable"),
                vec!["History", "Cookies", "Web Data", "Favicons"],
            ));

            // Spotify
            targets.push((
                "Spotify",
                local.join("Spotify").join("Users"),
                vec!["ad-state-storage.sqlite", "local-files.sqlite"],
            ));

            // Discord
            targets.push((
                "Discord",
                PathBuf::from(&appdata).join("discord"),
                vec!["Cookies", "QuotaManager"],
            ));
        }

        if !appdata.is_empty() {
            let roaming = PathBuf::from(&appdata);

            // Mozilla Firefox Profiles
            targets.push((
                "Mozilla Firefox",
                roaming.join("Mozilla").join("Firefox").join("Profiles"),
                vec!["places.sqlite", "cookies.sqlite", "favicons.sqlite", "formhistory.sqlite", "permissions.sqlite", "webappsstore.sqlite"],
            ));

            // Thunderbird
            targets.push((
                "Thunderbird",
                roaming.join("Thunderbird").join("Profiles"),
                vec!["places.sqlite", "cookies.sqlite", "favicons.sqlite", "formhistory.sqlite"],
            ));
        }

        targets
    }

    pub fn scan_databases() -> DatabaseScanSummary {
        let start = Instant::now();
        let targets = Self::get_known_targets();
        let mut dbs = Vec::new();
        let mut total_reclaimable = 0u64;

        for (app_name, base_dir, db_filenames) in targets {
            if !base_dir.exists() {
                continue;
            }

            // Gather candidate directories (Default, Profile 1..N, or base itself)
            let mut search_dirs = Vec::new();
            search_dirs.push(base_dir.clone());

            if let Ok(entries) = fs::read_dir(&base_dir) {
                for e in entries.flatten() {
                    let p = e.path();
                    if p.is_dir() {
                        let fname = p.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
                        if fname == "Default" || fname.starts_with("Profile ") || fname.ends_with(".default") || fname.ends_with(".default-release") {
                            search_dirs.push(p);
                        }
                    }
                }
            }

            for dir in search_dirs {
                for db_name in &db_filenames {
                    let db_path = dir.join(db_name);
                    if db_path.is_file() && Self::is_sqlite_database(&db_path) {
                        let size = db_path.metadata().map(|m| m.len()).unwrap_or(0);
                        if size < 4096 {
                            continue;
                        }

                        let wal_path = PathBuf::from(format!("{}-wal", db_path.to_string_lossy()));
                        let wal_size = wal_path.metadata().map(|m| m.len()).unwrap_or(0);

                        // Estimated reclaimable: WAL file capacity + approx 10% freelist internal fragmentation
                        let estimated_waste = wal_size + (size / 10);

                        // Quick lock check (can we open readonly?)
                        let is_locked = Connection::open_with_flags(&db_path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY).is_err();

                        total_reclaimable += estimated_waste;

                        dbs.push(DatabaseTargetInfo {
                            id: format!("db-{}", dbs.len() + 1),
                            app_name: app_name.to_string(),
                            db_name: db_name.to_string(),
                            file_path: db_path.to_string_lossy().to_string(),
                            size_bytes: size,
                            wal_size_bytes: wal_size,
                            estimated_reclaimable_bytes: estimated_waste,
                            is_locked,
                        });
                    }
                }
            }
        }

        DatabaseScanSummary {
            total_databases_found: dbs.len(),
            total_estimated_reclaimable_bytes: total_reclaimable,
            databases: dbs,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    /// Execute SQLite VACUUM and re-indexing on target database file
    pub fn vacuum_database(file_path: &str) -> DatabaseVacuumResult {
        let p = Path::new(file_path);
        if !p.exists() {
            return DatabaseVacuumResult {
                file_path: file_path.to_string(),
                size_before_bytes: 0,
                size_after_bytes: 0,
                bytes_reclaimed: 0,
                is_successful: false,
                error_message: Some("Database file does not exist".to_string()),
            };
        }

        let size_before = p.metadata().map(|m| m.len()).unwrap_or(0);

        match Connection::open_with_flags(
            p,
            rusqlite::OpenFlags::SQLITE_OPEN_READ_WRITE | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
        ) {
            Ok(conn) => {
                // Check original journal mode
                let journal_mode: String = conn
                    .query_row("PRAGMA journal_mode;", [], |row| row.get(0))
                    .unwrap_or_else(|_| "delete".to_string());

                // Execute VACUUM and REINDEX
                let vacuum_res = conn.execute_batch("PRAGMA busy_timeout = 3000; VACUUM; PRAGMA optimize;");

                if let Err(e) = vacuum_res {
                    return DatabaseVacuumResult {
                        file_path: file_path.to_string(),
                        size_before_bytes: size_before,
                        size_after_bytes: size_before,
                        bytes_reclaimed: 0,
                        is_successful: false,
                        error_message: Some(format!("VACUUM error (file may be in use): {}", e)),
                    };
                }

                // If originally in WAL mode, re-apply WAL pragma
                if journal_mode.eq_ignore_ascii_case("wal") {
                    let _ = conn.execute_batch("PRAGMA journal_mode = WAL;");
                }

                drop(conn);

                let size_after = p.metadata().map(|m| m.len()).unwrap_or(size_before);
                let reclaimed = if size_before > size_after {
                    size_before - size_after
                } else {
                    0
                };

                DatabaseVacuumResult {
                    file_path: file_path.to_string(),
                    size_before_bytes: size_before,
                    size_after_bytes: size_after,
                    bytes_reclaimed: reclaimed,
                    is_successful: true,
                    error_message: None,
                }
            }
            Err(e) => DatabaseVacuumResult {
                file_path: file_path.to_string(),
                size_before_bytes: size_before,
                size_after_bytes: size_before,
                bytes_reclaimed: 0,
                is_successful: false,
                error_message: Some(format!("Failed to open SQLite database: {}", e)),
            },
        }
    }

    pub fn optimize_databases(paths: &[String]) -> DatabaseOptimizeSummary {
        let mut results = Vec::new();
        let mut opt_count = 0;
        let mut fail_count = 0;
        let mut total_reclaimed = 0u64;

        for path in paths {
            let res = Self::vacuum_database(path);
            if res.is_successful {
                opt_count += 1;
                total_reclaimed += res.bytes_reclaimed;
            } else {
                fail_count += 1;
            }
            results.push(res);
        }

        DatabaseOptimizeSummary {
            optimized_count: opt_count,
            failed_count: fail_count,
            total_bytes_reclaimed: total_reclaimed,
            results,
        }
    }
}
