---
type: inventory
inventory_type: api
created: '2026-08-25'
updated: '2026-08-25'
---

# API & IPC Command Inventory — TauKudu

Dokumen ini memetakan seluruh perintah Tauri IPC (`#[tauri::command]`) yang diekspos oleh Rust Engine ke Frontend UI.

| # | Command Name | Component Owner | Input Payload | Return Type | Description |
|---|---|---|---|---|---|
| 1 | `cmd_scan_cleaners` | `cleaner-core` | `{ categories: Vec<String> }` | `Vec<CleanerScanResult>` | Memindai target file sampah berdasarkan aturan JSON |
| 2 | `cmd_execute_clean` | `cleaner-core` | `{ targets: Vec<CleanTarget> }` | `CleanExecutionSummary` | Menghapus berkas yang dipilih dan mencatat byte yang bebas |
| 3 | `cmd_scan_duplicates` | `deduplication-engine` | `{ root_paths: Vec<String> }` | `Vec<DuplicateGroup>` | Mencari file duplikat via multi-stage Blake3 hashing |
| 4 | `cmd_analyze_disk_treemap` | `deduplication-engine` | `{ target_drive: String }` | `DiskTreeNode` | Menghasilkan struktur pohon direktori untuk treemap |
| 5 | `cmd_scan_empty_folders` | `deduplication-engine` | `{ root_path: String }` | `Vec<String>` | Memindai direktori kosong yang siap dihapus |
| 6 | `cmd_scan_large_files` | `deduplication-engine` | `{ root_path: String, min_bytes: u64 }` | `Vec<FileInfo>` | Mencari file berukuran besar di atas batas minimum |
| 7 | `cmd_get_privacy_settings` | `privacy-shield` | `()` | `Vec<PrivacySetting>` | Membaca status seluruh toggle privasi/telemetri OS |
| 8 | `cmd_set_privacy_setting` | `privacy-shield` | `{ id: String, enabled: bool }` | `Result<(), String>` | Mengubah dan menerapkan status kebijakan privasi OS |
| 9 | `cmd_scan_malware_yara` | `malware-scanner` | `{ scan_type: String, custom_path: Option<String> }` | `ScanReport` | Menjalankan pemindaian malware berbasis YARA-X |
| 10 | `cmd_quarantine_file` | `malware-scanner` | `{ target_path: String }` | `Result<(), String>` | Memindahkan file mencurigakan ke folder isolasi karantina |
| 11 | `cmd_execute_shredder` | `secure-shredder` | `{ paths: Vec<String>, algorithm: String }` | `ShredResult` | Menghancurkan file dengan multi-pass cryptographic overwrite |
| 12 | `cmd_get_startup_items` | `system-tools` | `()` | `Vec<StartupItem>` | Mengambil daftar autostart beserta impact rating |
| 13 | `cmd_set_startup_item_state` | `system-tools` | `{ id: String, enabled: bool }` | `Result<(), String>` | Mengaktifkan atau menonaktifkan program autostart |
| 14 | `cmd_get_debloat_packages` | `system-tools` | `()` | `Vec<InstalledPackage>` | Mengambil daftar bloatware/UWP bawaan Windows |
| 15 | `cmd_uninstall_packages` | `system-tools` | `{ package_ids: Vec<String> }` | `Vec<UninstallResult>` | Menghapus aplikasi & membersihkan sisa residunya |
| 16 | `cmd_get_services` | `system-tools` | `()` | `Vec<ServiceItem>` | Membaca status dan rekomendasi Windows Services |
| 17 | `cmd_get_driver_packages` | `system-tools` | `()` | `Vec<DriverPackage>` | Mengambil daftar driver usang pada DriverStore |
| 18 | `cmd_get_perf_metrics` | `system-tools` | `()` | `HardwareMetrics` | Membaca utilisasi CPU, RAM, Disk I/O, Network, dan S.M.A.R.T. |
| 19 | `cmd_create_restore_point` | `platform-foundation` | `{ description: String }` | `Result<(), String>` | Memicu pembuatan System Restore Point Windows |
| 20 | `cmd_get_cleaning_history` | `platform-foundation` | `{ limit: u32, offset: u32 }` | `Vec<CleaningSession>` | Mengambil log riwayat sesi pembersihan dari SQLite |
| 21 | `cmd_get_app_settings` | `platform-foundation` | `()` | `AppSettings` | Membaca konfigurasi aplikasi (bahasa, tema, update) |
| 22 | `cmd_save_app_settings` | `platform-foundation` | `{ settings: AppSettings }` | `Result<(), String>` | Menyimpan konfigurasi aplikasi |
