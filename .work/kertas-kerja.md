# Kertas Kerja Porting TauKudu (Electron/TypeScript -> Tauri v2/Rust + React)

Dokumen ini adalah **kertas kerja eksekusi (work breakdown & tracking)** untuk memantau progress porting 100% dari baseline `kudu` (diperkuat oleh `czkawka`, `bleachbit`, dan `ripgrep`) ke dalam aplikasi native **TauKudu**.

---

## 1. Matrix Area & Progress Porting

| Area ID | Area / Modul | Deskripsi & Komponen Kudu | Rust Crates / Target Tech | Status | Selesai Pada |
|---|---|---|---|---|---|
| **AREA-00** | **App Shell & Scaffolding** | Kerangka Tauri v2 + Vite + React 18 + Tailwind v4 + Lucide + IPC Bridge | `tauri v2`, `tauri-build`, `sysinfo`, Vite, React 18, Tailwind v4 | ✅ COMPLETED | 2026-08-25 |
| **AREA-01** | **Cleaner Core Engine & UI** | Pemindaian berkas sampah (System, Browser, App, Gaming, Registry) + CleanerPage | `walkdir`, `rayon`, `serde_json`, `CleanerPage` split-view | ✅ COMPLETED | 2026-08-25 |
| **AREA-02** | **Rules Registry & Importer** | Parser rules JSON Kudu + integrasi 100+ CleanerML BleachBit | `serde_json`, `quick-xml`, `rules.rs`, path resolver | ✅ COMPLETED | 2026-08-26 |
| **AREA-03** | **Deduplication & Disk Tools** | Multi-stage hash (Czkawka concept) + DuplicateFinderPage, LargeFile, EmptyFolder | `blake3`, `rayon`, `walkdir`, `DuplicateFinderPage` UI | ✅ COMPLETED | 2026-08-25 |
| **AREA-04** | **Disk Analyzer (Treemap)** | Visualisasi Treemap penggunaan disk + DiskAnalyzerPage | `sysinfo::Disks`, `walkdir`, `DiskAnalyzerPage` UI | ✅ COMPLETED | 2026-08-25 |
| **AREA-05** | **Privacy Shield** | 30+ Windows privacy & telemetry policies + PrivacyShieldPage | `winreg`, `windows-rs`, `PrivacyShieldPage` UI | ✅ COMPLETED | 2026-08-25 |
| **AREA-07** | **System Tools: Startup & Debloat** | Startup Manager & Windows Debloater (UWP purge) + Pages | `winreg`, AppX PowerShell, Startup & Debloat UI | ✅ COMPLETED | 2026-08-25 |
| **AREA-06** | **Malware Scanner (YARA-X)** | On-demand YARA scan + MalwareScannerPage, ThreatMonitor | Heuristic scanner, quarantine isolation, `MalwareScannerPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-08** | **System Tools: Services & Drivers** | Service Manager & DriverStore Purge + Pages | CIM/WMI service manager, pnputil driver cleaner, UI tabs | ✅ COMPLETED | 2026-08-26 |
| **AREA-09** | **Uninstaller & Secure Shredder** | Clean Uninstaller + Multi-pass cryptographic file shredder | `zeroize`, `rand`, Uninstaller & Shredder UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-10** | **Performance Monitor** | Live CPU, RAM, Disk I/O, Network, Process Manager + Page | `sysinfo`, Performance Monitor UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-11** | **History & SQLite Store** | Audit trail & history logging + HistoryPage | `rusqlite` (SQLite 3), `HistoryPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-12** | **Settings, i18n & Updates** | 30+ Bahasa (i18next), Theme Dark/Light, Auto-updater | `i18next`, Dark/Light switch, Settings UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-13** | **CLI Mode & Headless** | Scriptable command-line interface (`taukudu clean --all`) | `clap`, subcommands `clean`, `duplicates`, `malware`, `privacy` | ✅ COMPLETED | 2026-08-26 |
| **AREA-14** | **Network & Socket Optimizer** | DNS cache flush, ARP table purge, Winsock reset, Netstat monitoring | Native Win32 CLI / Netstat, `NetworkPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-15** | **Windows Registry Orphan Fixer**| Shared DLLs, App Paths, MUI Cache scanning & repair | `winreg`, `RegistryCleanerPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-16** | **Game Mode & Latency Optimizer**| Power plan switching, GameDVR toggle, Search indexer pause, Auto Game Detection | `winreg`, sysinfo process scanner, `GameModePage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-17** | **Disk Maintenance & Repair** | SSD Storage ReTrim, SFC file checker, DISM repair, CHKDSK | fsutil, PowerShell ReTrim, sfc, dism, `DiskRepairPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-18** | **Context Menu Cleaner** | Explorer right-click shell extensions & handlers cleaner | `winreg`, PowerShell registry toggle, `ContextMenuPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-19** | **Windows Firewall Security Audit**| Inbound open ports audit, broad rule risk assessment | NetFirewallRule PowerShell, `FirewallAuditPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-20** | **CVE Vulnerability Audit Scanner**| Client library and runtime memory-safety CVE advisory checks | `CveScannerEngine`, `CveScannerPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-21** | **Multi-Package Software Updater** | Winget/Choco package manager inspection & bulk update runner | `winget` upgrade CLI parser, `SoftwareUpdaterPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-22** | **Automated Task Scheduler** | Daily, weekly, monthly automated background maintenance jobs | `ScheduleEngine`, `SchedulesPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-23** | **Account Breach & Credential Monitor** | Monitored email exposure audit & compromised breach tracker | `BreachMonitorEngine`, `BreachMonitorPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-24** | **Uninstall Leftovers Cleaner** | Deep orphan AppData/ProgramData leftover directory detector & cleaner | `LeftoversCleanerEngine`, `LeftoversPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-25** | **System Restore Points Manager** | Windows System Protection status & snapshot checkpoint creation | `RestorePointEngine`, `RestorePointPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-26** | **Fast Recycle Bin Turbo Cleaner** | Multi-drive $Recycle.Bin turbo direct unlink & Shell sync | `RecycleBinEngine`, `RecycleBinPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-27** | **Cleaner Process Blockers Detector** | Real-time file lock & blocking browser/process detector & closer | `CleanerBlockersEngine`, Cleaner blocker alert UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-28** | **Live Outbound Threat Monitor** | Network socket C2 & malicious CIDR blacklist auditor and process killer | `ThreatMonitorEngine`, `ThreatMonitorPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-29** | **Chromium & Gecko Multi-Profile Caches** | Shared shader/Vulkan caches & multi-profile cache discovery | `ChromiumCacheEngine`, `BrowserCachesPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-30** | **Windows Delete Access & Lock Probe** | Non-destructive Win32 CreateFileW sharing violation & permission probe | `DeleteFailureProbeEngine`, System Cleaner Probe UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-31** | **Granular Deletion Audit Ledger** | JSONL append-only audit trail with rotation & keyword search | `DeletionLoggerEngine`, HistoryPage ledger view | ✅ COMPLETED | 2026-08-26 |
| **AREA-32** | **SSD ReTrim History & 24h Throttle** | Per-drive TRIM timestamp persistence & frequency safety guard | `TrimHistoryStore`, Disk Maintenance TRIM view | ✅ COMPLETED | 2026-08-26 |
| **AREA-33** | **Persistent App Settings & Exclusions** | Complete JSON store for cleaner safeguards, backup paths & exclusions | `SettingsStoreEngine`, SettingsPage UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-34** | **Prometheus OpenMetrics Exporter** | Standardized observability telemetry exporter for hardware & cleaning stats | `MetricsEngine`, MetricsPage UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-35** | **Window State & Geometry Manager** | Frameless window bounds persistence, display reachability sanitization | `WindowStateEngine`, Tauri IPC window restore | ✅ COMPLETED | 2026-08-26 |
| **AREA-36** | **Security Posture & Compliance Collector** | Antivirus WMI detection, BitLocker encryption, Hotfix audit & admin elevation | `SecurityPostureEngine`, Dashboard security card UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-37** | **Threat Intelligence Blacklist Store** | Persistent JSON store for C2 CIDRs, Tor exit nodes, and malicious domains | `ThreatBlacklistStore`, Threat Monitor tab UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-38** | **About & Open Source Identity** | App metadata, architectural concepts, zero-telemetry guarantee, license & repo links | `AboutPage` view in `App.tsx` | ✅ COMPLETED | 2026-08-26 |
| **AREA-39** | **Diagnostic & Activity App Logger** | Local file logging with 5MB auto-rotation, level filters & viewer | `AppLoggerEngine`, Diagnostic Logs tab UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-40** | **Malware Scanner UI & Threat Isolation** | Interactive Quick/Full scan UI, detection cards, quarantine and purge actions | `MalwareScannerEngine`, Malware Scanner Page UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-41** | **Empty Folders & Large File Hunter UI** | Dedicated scanning & purge views for 0-byte directories and oversized files | `DeduplicationEngine`, Empty & Large File UI tabs | ✅ COMPLETED | 2026-08-26 |
| **AREA-42** | **Full System Navigation & Feature Unification** | Unified multi-view sidebar covering all 35+ native system tools & engines | `src/App.tsx` navigation & view router | ✅ COMPLETED | 2026-08-26 |
| **AREA-43** | **Official Release & Update Verifier** | Native release version metadata & GitHub release tag verifier | `AppUpdaterEngine`, About & Settings UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-44** | **Client-Side CVE False-Positive Filter** | Debian epoch/revision version parser & runtime misattribution filter | `CveScannerEngine`, CVE Scanner Page | ✅ COMPLETED | 2026-08-26 |
| **AREA-45** | **Recycle Bin $I Metadata Binary Parser & File Inspection** | Pure Rust parser for Windows $I binary headers & detailed deleted item viewer | `RecycleBinEngine`, Recycle Bin Inspector UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-46** | **GPU Hardware Acceleration & Graphics Fallback Controller** | Win32 GPU controller & software rasterizer fallback switch | `GpuControllerEngine`, Settings & Preferences UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-47** | **Robust Parallel File Deletion & Permission Recovery** | Read-only attribute stripping retry, granular error classification & directory recovery | `CleanerEngine::clean_files` in `cleaner.rs` | ✅ COMPLETED | 2026-08-26 |
| **AREA-48** | **YARA Threat Rules Store & In-App Signature Editor** | Persistent .yar rules repository, bundle Blake3 hash integrity & signature manager | `YaraRulesStoreEngine`, Malware Rules tab UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-49** | **Registry Snapshot Backup & Rollback Manager** | Native .reg snapshot export before orphan cleanup & rollback restore | `RegistryBackupEngine`, Registry Cleaner Page UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-50** | **Broken & Invalid Shortcuts Cleaner** | Binary LNK parser & shell shortcut validator across Desktop, Start Menu & Recent | `ShortcutCleanerEngine`, Broken Shortcuts Page UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-51** | **Browser & App SQLite Database VACUUM Optimizer** | Native SQLite defragmenter, index rebuilder & WAL space reclaim across browsers/apps | `DatabaseOptimizerEngine`, Database VACUUM Page UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-52** | **Windows Environment Variables & PATH Cleaner** | User/System PATH orphan cleaner, dead dev home directories purge & Win32 broadcast | `EnvironmentCleanerEngine`, Environment PATH Page UI | ✅ COMPLETED | 2026-08-26 |

---

## 2. Log Eksekusi Area

### Area 52 — Windows Environment Variables & PATH Cleaner (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Environment Cleaner Engine (`src-tauri/src/environment_cleaner.rs`):** Pembacaan nilai variabel lingkungan dari registry Windows `HKCU\Environment` dan `HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment`. Pemindaian dan validasi eksistensi direktori pada entri `PATH` (User & System) dan variabel lingkungan pengembangan perangkat lunak (Java, Rust, Go, Node, Android SDK, Python, .NET, dll.). Fitur pembersihan entri PATH mati dan penghapusan variabel lingkungan yatim serta broadcast Windows `WM_SETTINGCHANGE` (`Environment`).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `scan_environment_orphans` dan `clean_environment_orphans`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `OrphanEnvItem`, `EnvCleanerScanResult`, `EnvCleanerCleanResult`, serta method `tauriApi.scanEnvironmentOrphans` dan `tauriApi.cleanEnvironmentOrphans`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan halaman tab *Environment PATH* lengkap dengan list direktori yang hilang, scope (User/System), tipe entri (PATH / Variable), badge filter, dan tombol aksi *Clean Selected*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 51 — Browser & App SQLite Database VACUUM Optimizer (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Database Optimizer Engine (`src-tauri/src/database_optimizer.rs`):** Verifikasi header biner SQLite (`SQLite format 3\0`), penemuan target database aplikasi/browser (Google Chrome, Edge, Brave, Vivaldi, Opera, Opera GX, Mozilla Firefox, Thunderbird, Spotify, Discord), kalkulasi estimasi kapasitas tersia-sia (*WAL files + 10% freelist internal fragmentation*), pengecekan status file lock (readonly probe), serta eksekusi batch `VACUUM; PRAGMA optimize;` dengan pemulihan mode jurnal WAL otomatis.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `scan_sqlite_databases` dan `vacuum_sqlite_databases`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `DatabaseTargetInfo`, `DatabaseScanSummary`, `DatabaseVacuumResult`, `DatabaseOptimizeSummary`, serta method `tauriApi.scanSqliteDatabases` dan `tauriApi.vacuumSqliteDatabases`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab navigasi *Database VACUUM* lengkap dengan list database yang terdeteksi, badge status proses terkunci (*App Running / Locked*), estimasi ukuran penghematan, checkbox seleksi, dan tombol aksi *Defragment & VACUUM*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 50 — Broken & Invalid Shortcuts Cleaner (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Shortcut Cleaner Engine (`src-tauri/src/shortcut_cleaner.rs`):** Deteksi dan pemindaian rekursif berkas `.lnk` dan `.url` di direktori Desktop (User & Public), Start Menu (User, Public, All Users), Startup folder, dan Recent Items. Mengimplementasikan binary Shell Link `.LNK` parser mandiri (ekstraksi header `LinkInfo`, `LocalBasePathOffset`, unicode base path, relative path string) tanpa COM overhead, ekspansi variabel lingkungan Windows (`%USERPROFILE%`, `%APPDATA%`, `%PROGRAMFILES%`), serta validasi eksistensi target berkas/folder dan deteksi berkas 0-byte/korup.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `scan_broken_shortcuts` dan `delete_broken_shortcuts`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `BrokenShortcutItem`, `BrokenShortcutScanResult`, `BrokenShortcutCleanResult`, serta method `tauriApi.scanBrokenShortcuts` dan `tauriApi.deleteBrokenShortcuts`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab *Broken Shortcuts* lengkap dengan pemindaian otomatis, filter checklist seleksi item rusak, detail path asal dan target yang hilang, serta tombol aksi pembersihan massal (*Delete Selected*).
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 49 — Registry Snapshot Backup & Rollback Manager (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Registry Backup Engine (`src-tauri/src/registry_backup.rs`):** Direktori penyimpanan snapshot aman di `%USERPROFILE%/Documents/TauKudu Backups/Registry/`, fungsi ekspor snapshot `.reg` otomatis (`reg export <key> <file> /y`) sebelum modifikasi/penghapusan key, fungsi pemulihan (*rollback/restore*) instan (`reg import <file>`), serta enumerasi dan penghapusan snapshot historis.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `list_registry_backups`, `export_registry_key_backup`, `restore_registry_backup`, dan `delete_registry_backup`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `RegistryBackupEntry`, `RegistryBackupSummary`, serta method `tauriApi.listRegistryBackups`, `tauriApi.exportRegistryKeyBackup`, `tauriApi.restoreRegistryBackup`, dan `tauriApi.deleteRegistryBackup`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan baki interaktif *Automatic Pre-Fix .reg Snapshots* pada tab *Registry Cleaner* lengkap dengan riwayat snapshot, tombol *Restore .reg*, dan *Delete Snapshot*, serta otomatisasi ekspor backup setiap kali tombol *Fix Selected* dieksekusi.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 48 — YARA Threat Rules Store & Signature Editor (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **YARA Rules Store Engine (`src-tauri/src/yara_rules_store.rs`):** Manajemen direktori aturan signature YARA persisten (`%LOCALAPPDATA%/TauKudu/yara-rules/`), kalkulasi hash integritas bundle aturan berbasis Blake3/SHA256, validasi format berkas `.yar` (maksimum ukuran 1MB per rule), serta fungsi simpan, daftar, dan hapus berkas signature.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `list_yara_rule_files`, `get_yara_rules_metadata`, `save_yara_rule_file`, dan `delete_yara_rule_file`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `YaraRuleFileEntry`, `YaraRulesMetadata`, serta method `tauriApi.listYaraRuleFiles`, `tauriApi.getYaraRulesMetadata`, `tauriApi.saveYaraRuleFile`, dan `tauriApi.deleteYaraRuleFile`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan sub-tab *YARA Rules Store* pada tab *Malware Scanner* lengkap dengan form input penambahan rule kustom dan daftar berkas signature tersimpan.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 47 — Robust Parallel File Deletion & Permission Recovery (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Robust File Deletion Engine (`src-tauri/src/cleaner.rs`):** Implementasi fungsi penghapusan file `delete_file_robust` dengan fallback recovery pada Windows: jika penghapusan terhalang atribut read-only (*PermissionDenied*), atribut read-only akan dicabut via manipulasi izin berkas std::fs::set_permissions dan dicoba ulang sebelum diklasifikasikan sebagai error. Mendukung penghapusan paralel direktori dan berkas secara aman.
  2. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 46 — GPU Hardware Acceleration & Graphics Fallback Controller (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **GPU Controller Engine (`src-tauri/src/gpu_controller.rs`):** Deteksi adapter grafis Windows aktif melalui WMI `Win32_VideoController` (nama kartu grafis, versi driver, tanggal driver), status akselerasi perangkat keras, serta kontrol sakelar *Software Fallback (WARP / software rasterizer)* via env dan marker file (`.disable-gpu`) untuk mencegah crash pada sistem operasi Windows yang di-strip down / minimal.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_gpu_diagnostics` dan `set_gpu_hardware_acceleration`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `GpuDiagnosticInfo`, serta method `tauriApi.getGpuDiagnostics` dan `tauriApi.setGpuHardwareAcceleration`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan kartu kontrol *GPU Hardware Acceleration & Graphics Fallback* pada tab *Settings & Preferences* lengkap dengan info adapter GPU dan tombol toggle *Force Software Fallback / Enable Hardware GPU*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 45 — Recycle Bin $I Metadata Binary Parser & Inspection (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Binary $I Metadata Parser (`src-tauri/src/recycle_bin.rs`):** Implementasi parser native Rust untuk membaca header biner record `$I*` Windows Recycle Bin (Versi 1 dan Versi 2 Win 10/11), mengekstrak ukuran asli berkas, konversi timestamp Windows FILETIME (100ns sejak 1601) ke Unix timestamp, serta ekstraksi nama dan path berkas asal via UTF-16 decoding.
  2. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `RecycleBinItemDetail` dan pembaruan `RecycleBinSummary` (`items: RecycleBinItemDetail[]`).
  3. **Frontend UI (`src/App.tsx`):** Menambahkan tabel/daftar interaktif inspeksi berkas yang berada di dalam Recycle Bin sebelum eksekusi pengosongan.
  4. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 44 — Client-Side CVE False-Positive Filter Engine (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **CVE Filter Engine (`src-tauri/src/cve_scanner.rs`):** Parser versi Debian/Ubuntu/RPM (epoch, upstream version, revision `0ubuntu8.1`), normalisasi suffix Debian (`+really`, `+dfsg`, `~beta`), perbandingan versi numerik `is_version_at_least`, serta pendeteksi misatribusi paket (`is_misattributed_package`) untuk menyaring false positives (misal `bash-completion` vs interpreter `bash`, `python3-*` vs runtime CPython, `node-*` vs runtime `nodejs`, `php-pear` vs core engine C PHP).
  2. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `CveItem` (field `is_filtered_false_positive`, `filter_reason`) dan `CveScanSummary` (`filtered_false_positives_count`).
  3. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 43 — Official Release & Update Verifier (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **App Updater Engine (`src-tauri/src/app_updater.rs`):** Pemeriksaan metadata versi rilis aplikasi aktif (`env!("CARGO_PKG_VERSION")`) dan verifikasi pembaruan rilis terverifikasi (`check_for_updates`).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_app_version` dan `check_app_updates`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `AppReleaseInfo`, serta method `tauriApi.getAppVersion` dan `tauriApi.checkAppUpdates`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan kartu *Release & Update Center* pada tab *About TauKudu* lengkap dengan tombol interaktif *Check for Updates*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 42 — Full System Navigation & Feature Unification (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Frontend App Navigation & Unified View Router (`src/App.tsx`):** Unifikasi penuh seluruh 35+ modul dan halaman fitur yang telah di-porting dari ekosistem Kudu/Czkawka/BleachBit/ripgrep (Cleaner, Browsers, Recycle Bin, Live Threat Monitor, Duplicates, Empty Folders, Large Files, Uninstall Leftovers, System Restore, Disk Treemap, Maintenance & Repair, Firewall Audit, CVE Scanner, Breach Monitor, Software Updater, Task Scheduler, Game Mode, Context Menu, Registry Fixer, Startup Manager, Windows Debloater, Services Manager, Driver Cleaner, Network Optimizer, Software Uninstaller, DoD File Shredder, Performance Monitor, Prometheus OpenMetrics, Cleaning History & Granular File Ledger, Diagnostic App Logs, Settings, dan About TauKudu).
  2. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 41 — Empty Folders & Large File Hunter UI Integration (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Frontend Empty Folders & Large Files UI (`src/App.tsx`):** Integrasi tab antarmuka mandiri *Empty Folders* (rekursif pencarian folder kosong 0-byte dan penghapusan massal) serta tab *Large File Finder* (pemindaian berkas berukuran besar dengan preset filter 10MB, 50MB, 100MB, 500MB, 1GB dan aksi hapus permanen).
  2. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `EmptyFolderItem`, `EmptyFolderScanResult`, `LargeFileItem`, `LargeFileScanResult`, serta method `tauriApi.scanEmptyFolders` dan `tauriApi.scanLargeFiles`.
  3. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 40 — Malware Scanner UI & Threat Isolation Integration (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Frontend Malware Scanner UI (`src/App.tsx`):** Integrasi antarmuka *Malware Scanner* interaktif lengkap dengan trigger Quick Scan (Downloads, Desktop, Startup, User Temp) & Full System Scan, kartu deteksi ancaman dengan badge severity (Critical, High, Medium, Low), detail rule heurisik, checkbox seleksi, aksi karantina massal (*Quarantine Selected* ke folder isolasi terenkripsi/aman), dan aksi pembersihan permanen (*Delete Permanently*).
  2. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 39 — Application Diagnostic & Activity Logging (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **App Logger Engine (`src-tauri/src/app_logger.rs`):** Logging terstruktur lokal (`%LOCALAPPDATA%/TauKudu/logs/taukudu.log`) dengan rotasi berkas otomatis berukuran 5MB (`taukudu.old.log`), filter level log (*INFO, WARN, ERROR, DEBUG*), pencarian, dan statistik error/warning.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `write_app_log`, `query_app_logs`, `get_app_log_stats`, dan `clear_app_logs`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `LogEntry`, `LogStats`, serta method `tauriApi.writeAppLog`, `tauriApi.queryAppLogs`, `tauriApi.getAppLogStats`, dan `tauriApi.clearAppLogs`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab *Diagnostic Logs* lengkap dengan pill filter level log, daftar log dengan badge warna level, path file log, ukuran berkas, dan tombol aksi *Clear Logs*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 38 — About TauKudu & Open-Source Identity (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Frontend About UI (`src/App.tsx`):** Menambahkan tab *About TauKudu* lengkap dengan metadata versi rilis, ringkasan arsitektur inti (Rust Core, BleachBit CleanerML parser, Czkawka 3-stage deduplication, ripgrep parallel traversal, SQLite/JSONL audit ledger), jaminan privasi 100% offline (Zero-telemetry guarantee), lisensi open-source MIT, dan tautan repositori GitHub resmi.
  2. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 37 — Threat Intelligence Blacklist Store (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Threat Blacklist Store (`src-tauri/src/threat_blacklist.rs`):** Penyimpanan database blacklist intelijen ancaman secara persisten (`%LOCALAPPDATA%/TauKudu/threat_blacklist.json`) mencakup daftar domain berbahaya, IP publik mencurigakan, dan subnet CIDR C2/Tor. Menyediakan fungsi mutasi, penambahan domain kustom, validasi batas array (maks 500k entri), dan query metadata.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_threat_blacklist_summary`, `get_threat_blacklist_data`, `update_threat_blacklist_data`, dan `add_threat_blacklist_domain`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `ThreatBlacklistData`, `ThreatBlacklistSummary`, serta method `tauriApi.getThreatBlacklistSummary`, `tauriApi.getThreatBlacklistData`, `tauriApi.updateThreatBlacklistData`, dan `tauriApi.addThreatBlacklistDomain`.
  4. **Frontend UI (`src/App.tsx`):** Menghubungkan pembaharuan data intelijen ancaman pada tab *Live Threat Monitor*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 36 — Security Posture & Compliance Collector (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Security Posture Engine (`src-tauri/src/security_posture.rs`):** Deteksi status antivirus terdaftar melalui WMI `root/SecurityCenter2/AntiVirusProduct` (status real-time protection, signature update), evaluasi enkripsi disk BitLocker (`Get-BitLockerVolume`), audit 5 hotfix patch Windows terbaru (`Get-HotFix`), serta validasi hak akses Administrator (`net session`).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `collect_security_posture` dan `check_is_admin`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `AntivirusProductInfo`, `BitlockerVolumeInfo`, `HotfixPatchInfo`, `SecurityPostureSummary`, serta method `tauriApi.collectSecurityPosture` dan `tauriApi.checkIsAdmin`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan kartu metrik *Security Posture* pada Dashboard utama lengkap dengan nama antivirus aktif dan indikator hak akses Administrator.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 35 — Window State & Geometry Management (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Window State Engine (`src-tauri/src/window_state.rs`):** Manajemen persistensi ukuran (`width`, `height`), koordinat posisi (`x`, `y`), dan status maksimasi (`is_maximized`) jendela frameless pada file JSON lokal (`%LOCALAPPDATA%/TauKudu/window_state.json`) dengan batasan minimum ukuran aman (`MIN_WINDOW_WIDTH = 900`, `MIN_WINDOW_HEIGHT = 600`).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_window_state` dan `save_window_state`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `WindowGeometryState`, serta method `tauriApi.getWindowState` dan `tauriApi.saveWindowState`.
  4. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 34 — Prometheus OpenMetrics Telemetry Exporter (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Metrics Engine (`src-tauri/src/metrics.rs`):** Koleksi metrik standar sistem dan aplikasi (info rilis, uptime, utilisasi CPU/RAM, total sesi pembersihan, total berkas terhapus, total kapasitas dibebaskan) serta format output OpenMetrics / Prometheus.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `collect_prometheus_metrics`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `MetricLine`, `PrometheusMetricsSummary`, serta method `tauriApi.collectPrometheusMetrics`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab *Prometheus Metrics* lengkap dengan metrik breakdown cards dan raw text payload preview.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 33 — Persistent Settings Store & Path Exclusions (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Settings Store Engine (`src-tauri/src/settings_store.rs`):** Penyimpanan konfigurasi aplikasi secara persisten (`%LOCALAPPDATA%/TauKudu/config.json`) mencakup preferensi tema (dark/light), pilihan bahasa i18n, safeguard cleaner (tutup browser otomatis, buat restore point sebelum clean, simpan ledger JSONL), direktori backup kustom, serta daftar eksklusi path (*scanner path exclusions*).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_app_settings`, `update_app_settings`, `add_exclusion_path`, dan `remove_exclusion_path`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `CleanerConfig`, `AppSettings`, serta method `tauriApi.getAppSettings`, `tauriApi.updateAppSettings`, `tauriApi.addExclusionPath`, dan `tauriApi.removeExclusionPath`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan antarmuka *Settings & Preferences* lengkap dengan selector tema, dropdown bahasa internasional, toggle safeguard cleaner, dan manajemen daftar eksklusi path.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 32 — SSD ReTrim History & 24h Throttle Guard (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Trim History Engine (`src-tauri/src/trim_history.rs`):** Penyimpanan riwayat waktu eksekusi TRIM per-drive dalam persistent JSON file (`%LOCALAPPDATA%/TauKudu/trim_history.json`). Mengimplementasikan *24-hour throttling guard* untuk mencegah wear/keausan berlebihan pada kontroler NAND SSD akibat pemanggilan ReTrim berulang.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_trim_history_summary` dan `is_drive_trim_throttled`, serta otomatisasi pencatatan timestamp saat `run_disk_trim` berhasil dieksekusi.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `TrimRecord`, `TrimHistorySummary`, serta method `tauriApi.getTrimHistorySummary` dan `tauriApi.isDriveTrimThrottled`.
  4. **Frontend UI (`src/App.tsx`):** Menghubungkan pembaharuan data riwayat TRIM pada tab *Disk Maintenance*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 31 — Granular File Deletion Audit Ledger (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Deletion Logger Engine (`src-tauri/src/deletion_logger.rs`):** Pencatatan append-only (format JSONL) setiap entitas file yang dibersihkan/dihapus dengan rotasi otomatis saat log mencapai 8MB. Menyediakan pencarian cepat (*keyword filtering*), filter sesi, dan kalkulasi statistik ukuran audit file.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `query_deletion_log`, `get_deletion_log_stats`, dan `clear_deletion_log` serta mengaitkan pencatatan otomatis saat `clean_targets` berjalan.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `GranularDeletedFileEntry`, `DeletionLogStats`, serta method `tauriApi.queryDeletionLog`, `tauriApi.getDeletionLogStats`, dan `tauriApi.clearDeletionLog`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan sub-tab *Granular File Ledger* pada tab *Cleaning History* lengkap dengan live search bar, path berkas terhapus, ID sesi, dan timestamp penghapusan.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 30 — Windows Delete Access & Lock Probe Engine (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Delete Probe Engine (`src-tauri/src/delete_failure_probe.rs`):** Evaluasi akses penghapusan file/direktori tanpa mengubah atau menghapus konten fisik menggunakan Win32 `CreateFileW` dengan bendera `DELETE_ACCESS` dan `FILE_FLAG_BACKUP_SEMANTICS`. Mengklasifikasikan error secara presisi menjadi *Accessible*, *InUse (Error 32/33 Sharing Violation)*, dan *PermissionDenied (Error 5 Access Denied)*.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `probe_delete_access`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `DeletePathProbeResult`, `DeleteProbeSummary`, serta method `tauriApi.probeDeleteAccess`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tombol *Probe Access* pada antarmuka *System Cleaner* yang mengevaluasi status keterkuncian berkas sampah sebelum pembersihan dieksekusi.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 29 — Chromium & Gecko Multi-Profile Browser Caches (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Chromium Cache Engine (`src-tauri/src/chromium_cache.rs`):** Deteksi mendalam instalasi browser berbasis Chromium (Chrome, Edge, Brave, Vivaldi, Opera, Opera GX, Arc, Chromium, Thorium) dan enumerasi cache level profil (`Default`, `Profile 1..N`) serta cache level browser bersama (*Shared Angle/Vulkan ShaderCache, Skia GrShaderCache, Dawn Metal/D3D12 Cache*).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `discover_browser_cache_targets`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `BrowserProfileCacheTarget`, `BrowserCacheScanSummary`, serta method `tauriApi.discoverBrowserCacheTargets`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab *Browser Caches* lengkap dengan deteksi daftar browser, status keberadaan direktori cache (*Present / Empty*), path direktori, dan tombol aksi pembersihan individual (*Clean*).
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 28 — Live C2 & Malicious Outbound Threat Monitor (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Threat Engine (`src-tauri/src/threat_monitor.rs`):** Inspeksi soket jaringan aktif (TCP/UDP) secara real-time dan pencocokan terhadap daftar CIDR blacklist intelijen ancaman (Tor Exit Nodes, C2 relay, cryptominer pool, brute-force scanner). Mendukung penambahan CIDR kustom dan terminasi instan proses yang teridentifikasi jahat (`terminate_threat_process`).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `audit_active_threats`, `add_threat_blacklist_cidr`, dan `terminate_threat_process`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `FlaggedConnection`, `ThreatMonitorSummary`, serta method `tauriApi.auditActiveThreats`, `tauriApi.addThreatBlacklistCidr`, dan `tauriApi.terminateThreatProcess`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab *Live Threat Monitor* lengkap dengan card status pemantauan koneksi, form penambahan CIDR blacklist baru, dan daftar koneksi mencurigakan dengan tombol aksi *Terminate Process*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 27 — Cleaner Process Blockers Detector & Closer (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Blocker Engine (`src-tauri/src/cleaner_blockers.rs`):** Deteksi proses yang sedang aktif berjalan (Chrome, Edge, Brave, Firefox, Opera, Discord, Spotify, Steam, Epic Games) yang menahan file lock pada direktori target pembersihan cache dan temporary files. Mendukung penghentian proses pemblokir via PID (`close_blocker`).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `check_cleaner_blockers` dan `close_cleaner_blocker`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `ProcessBlockerInfo`, `BlockerSummary`, serta method `tauriApi.checkCleanerBlockers` dan `tauriApi.closeCleanerBlocker`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan bar notifikasi peringatan proses pemblokir interaktif pada tab *System Cleaner* lengkap dengan nama aplikasi, PID, dan tombol aksi langsung *Close App*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 26 — Fast Recycle Bin Turbo Cleaner (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Recycle Bin Engine (`src-tauri/src/recycle_bin.rs`):** Deteksi SID user dan direktori `$Recycle.Bin/<SID>` di seluruh drive Windows aktif (`C:`, `D:`, `E:`, dll.). Menghapus berkas muatan `$R*` secara langsung dan membersihkan metadata yatim `$I*`, diakhiri dengan sinkronisasi Win32 Shell API `SHEmptyRecycleBin`.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_recycle_bin_summary` dan `empty_recycle_bin_fast` serta pencatatan otomatis ke history SQLite.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `RecycleBinDriveStat`, `RecycleBinSummary`, `RecycleBinCleanResult`, serta method `tauriApi.getRecycleBinSummary` dan `tauriApi.emptyRecycleBinFast`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab *Fast Recycle Bin* lengkap dengan breakdown per drive penyimpanan, status aksesibilitas, jumlah berkas payload, total kapasitas yang dapat dibebaskan, dan tombol *Empty Recycle Bin Now*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 25 — Windows System Restore Points Management (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Restore Point Engine (`src-tauri/src/restore_point.rs`):** Deteksi status *System Protection* pada drive Windows C:, enumerasi daftar restore point yang sudah ada via PowerShell WMI/CIM, dan fungsi pembuatan checkpoint baru (`Checkpoint-Computer`) dengan deskripsi kustom sebelum pembersihan agresif.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_restore_points` dan `create_restore_point`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `RestorePointItem`, `RestorePointSummary`, `RestorePointResult`, serta method `tauriApi.getRestorePoints` dan `tauriApi.createRestorePoint`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab *System Restore* lengkap dengan badge status perlindungan, form input pembuatan checkpoint baru, dan daftar restore point tersimpan.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 24 — Uninstalled Software Leftovers Cleaner (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Leftovers Engine (`src-tauri/src/leftovers_cleaner.rs`):** Scanning direktori sistem (`%APPDATA%`, `%LOCALAPPDATA%`, `%ProgramData%`, `%ProgramFiles%`, `%ProgramFiles(x86)%`) untuk mendeteksi folder sisa instalasi aplikasi yang telah dihapus (*orphaned leftovers*). Mengimplementasikan comprehensive safelist (Windows core components, system folders, developer runtimes, driver packages) serta token matching cerdas terhadap aplikasi yang terdaftar di Windows Registry (`Uninstall` keys).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `scan_uninstall_leftovers` dan `delete_uninstall_leftovers`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `LeftoverFolderItem`, `LeftoversScanResult`, `LeftoversCleanResult`, serta binding method `tauriApi.scanUninstallLeftovers` dan `tauriApi.deleteUninstallLeftovers`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab *Uninstall Leftovers* lengkap dengan breakdown folder orphan, ukuran direktori, jumlah berkas, checkbox seleksi, tombol scan ulang, dan aksi pembersihan massal (*Purge Selected*).
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 23 — Account Breach & Credential Compromise Monitor (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Breach Monitor Engine (`src-tauri/src/breach_monitor.rs`):** Manajemen akun email yang dipantau, deteksi paparan insiden keamanan/kebocoran data historis (nama insiden, domain, tanggal kompromi, dan jenis data terkompromi), serta fungsi konfirmasi pengakuan insiden (*acknowledge incident*).
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_breach_summary`, `add_breach_email`, `remove_breach_email`, dan `acknowledge_breach_incident`.
  3. **TypeScript Bridge (`src/lib/tauri-bridge.ts`):** Interface types `BreachIncident`, `MonitoredEmailStatus`, `BreachMonitorSummary`, serta binding method `tauriApi.getBreachSummary`, `tauriApi.addBreachEmail`, `tauriApi.removeBreachEmail`, dan `tauriApi.acknowledgeBreachIncident`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan tab *Breach Monitor* lengkap dengan card ringkasan insiden belum terkonfirmasi, input penambahan email pemantauan, daftar akun termonitor dengan status aman/insiden, dan action tombol *Acknowledge*.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.

### Area 22 — Automated Background Maintenance Scheduler (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Schedule Engine (`src-tauri/src/scheduler.rs`):** Manajemen jadwal pembersihan latar belakang otomatis berbasis frekuensi (Daily, Weekly, Monthly) dengan opsi target kategori dan eksekusi Auto-Clean.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_schedules` dan `toggle_schedule`.
  3. **Frontend UI (`src/App.tsx`):** Menambahkan antarmuka *Schedules* lengkap dengan daftar jadwal, waktu eksekusi, kategori pembersihan, dan tombol switch *Active / Disabled*.
  4. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.
