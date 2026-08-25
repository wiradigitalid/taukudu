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

---

## 2. Log Eksekusi Area

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
