---
type: inventory
inventory_type: database
created: '2026-08-25'
updated: '2026-08-25'
---

# Database Table Inventory (SQLite) — TauKudu

Dokumen ini memetakan skema tabel lokal SQLite (`taukudu.db`) yang dikelola oleh `rusqlite`.

| # | Table Name | Component Owner | Key Columns | Description |
|---|---|---|---|---|
| 1 | `cleaning_sessions` | `cleaner-core` | `id (TEXT PRIMARY KEY), started_at, completed_at, total_files_deleted, total_bytes_reclaimed, status` | Log utama per sesi pembersihan |
| 2 | `deletion_records` | `cleaner-core` | `id (INTEGER PRIMARY KEY), session_id (FK), file_path, file_size_bytes, status` | Rincian file yang dihapus per sesi |
| 3 | `yara_scan_reports` | `malware-scanner` | `id (TEXT PRIMARY KEY), scanned_at, scan_type, files_scanned, threats_detected` | Riwayat pemindaian malware YARA |
| 4 | `quarantine_items` | `malware-scanner` | `id (TEXT PRIMARY KEY), original_path, quarantine_path, threat_name, quarantined_at, file_hash` | Daftar file terisolasi dalam karantina |
| 5 | `privacy_snapshots` | `privacy-shield` | `id (TEXT PRIMARY KEY), created_at, note, snapshot_json` | Snapshot kebijakan privasi OS sebelum perubahan |
| 6 | `schedules` | `platform-foundation` | `id (TEXT PRIMARY KEY), frequency, hour_minute, categories_json, is_enabled, last_run_at` | Jadwal pembersihan otomatis periodik |
| 7 | `audit_logs` | `platform-foundation` | `id (INTEGER PRIMARY KEY AUTOINCREMENT), timestamp, action_type, summary, details_json` | Audit trail untuk seluruh aksi sistem |
| 8 | `app_settings` | `platform-foundation` | `key (TEXT PRIMARY KEY), value (TEXT), updated_at` | Key-value store untuk preferensi aplikasi |
