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

---

## 2. Log Eksekusi Area

### Area 00 — App Shell & Scaffolding (Selesai: 2026-08-25)
- Inisialisasi Tauri v2 + React 18 + Tailwind v4 dan IPC basic bridge.

### Area 01 & 02 — Cleaner Core Engine, Rules Parser & Cleaner UI (Selesai: 2026-08-25 / Diperluas: 2026-08-26)
- Rules parser deklaratif, parallel scanner rayon + walkdir, scan & clean IPC commands, Cleaner split-view UI, dan integrasi 100+ aturan XML CleanerML dari **BleachBit** (`src-tauri/bleachbit_cleaners/`).

### Area 03 — Deduplication & Disk Tools (Selesai: 2026-08-25)
- Multi-stage hasher Blake3, disk anomaly scanners, dan Duplicate Finder UI.

### Area 04 — Disk Analyzer (Selesai: 2026-08-25)
- Drive Enumerator via `sysinfo::Disks` dan Folder/Extension breakdown UI.

### Area 05 — Privacy Shield (Selesai: 2026-08-25)
- Win32 Privacy Registry Engine & Privacy Shield UI.

### Area 07 — System Tools: Startup & Debloat (Selesai: 2026-08-25)
- Startup Manager & Windows Debloater UI & IPC commands.

### Area 06 — Malware Scanner & Quarantine (Selesai: 2026-08-26)
- Heuristic malware scanner, masquerading detection, double-extension hunter, dan quarantine utilities.

### Area 08 — Services & Driver Cleaner (Selesai: 2026-08-26)
- Windows Services manager & DriverStore obsolete driver purge.

### Area 09 — Program Uninstaller & Cryptographic File Shredder (Selesai: 2026-08-26)
- Program uninstaller dari registry dan DoD 5220.22-M multi-pass cryptographic file shredder.

### Area 10 — Hardware & Performance Monitor (Selesai: 2026-08-26)
- Real-time CPU/RAM metrics, process manager, dan terminate process capability.

### Area 11 — Cleaning History & SQLite Audit Store (Selesai: 2026-08-26)
- SQLite history store via `rusqlite`, automated session logging, dan History UI.

### Area 12 — App Settings & Multi-Language i18n (Selesai: 2026-08-26)
- i18next engine dengan 30 bahasa, toggle Dark/Light theme, dan Settings UI.

### Area 13 — Scriptable Headless CLI Interface (Selesai: 2026-08-26)
- CLI parser berbasis `clap` dengan subcommands `clean`, `duplicates`, `malware`, `privacy` dan output JSON/quiet.
