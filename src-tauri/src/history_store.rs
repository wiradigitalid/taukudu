use chrono::Utc;
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryRecord {
    pub id: String,
    pub timestamp: String,
    pub action_type: String, // "cleaner" | "duplicates" | "privacy" | "debloat" | "malware"
    pub total_space_saved_bytes: u64,
    pub total_items_cleaned: usize,
    pub duration_ms: u64,
    pub details_summary: String,
}

pub struct HistoryStore {
    db_path: PathBuf,
}

impl HistoryStore {
    pub fn new() -> Self {
        let app_dir = env::temp_dir().join("taukudu_data");
        let _ = fs::create_dir_all(&app_dir);
        let db_path = app_dir.join("history.db");

        let store = Self { db_path };
        store.init_db().expect("Failed to initialize SQLite history store");
        store
    }

    fn get_connection(&self) -> Result<Connection> {
        Connection::open(&self.db_path)
    }

    fn init_db(&self) -> Result<()> {
        let conn = self.get_connection()?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS history_records (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                action_type TEXT NOT NULL,
                total_space_saved_bytes INTEGER NOT NULL,
                total_items_cleaned INTEGER NOT NULL,
                duration_ms INTEGER NOT NULL,
                details_summary TEXT NOT NULL
            )",
            [],
        )?;
        Ok(())
    }

    pub fn add_record(&self, record: &HistoryRecord) -> Result<()> {
        let conn = self.get_connection()?;
        conn.execute(
            "INSERT INTO history_records (id, timestamp, action_type, total_space_saved_bytes, total_items_cleaned, duration_ms, details_summary)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                record.id,
                record.timestamp,
                record.action_type,
                record.total_space_saved_bytes,
                record.total_items_cleaned,
                record.duration_ms,
                record.details_summary
            ],
        )?;
        Ok(())
    }

    pub fn get_all_records(&self) -> Result<Vec<HistoryRecord>> {
        let conn = self.get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, timestamp, action_type, total_space_saved_bytes, total_items_cleaned, duration_ms, details_summary
             FROM history_records ORDER BY timestamp DESC LIMIT 100",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(HistoryRecord {
                id: row.get(0)?,
                timestamp: row.get(1)?,
                action_type: row.get(2)?,
                total_space_saved_bytes: row.get(3)?,
                total_items_cleaned: row.get(4)?,
                duration_ms: row.get(5)?,
                details_summary: row.get(6)?,
            })
        })?;

        let mut records = Vec::new();
        for r in rows.flatten() {
            records.push(r);
        }
        Ok(records)
    }

    pub fn clear_all_records(&self) -> Result<()> {
        let conn = self.get_connection()?;
        conn.execute("DELETE FROM history_records", [])?;
        Ok(())
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_HISTORY: Mutex<HistoryStore> = Mutex::new(HistoryStore::new());
}
