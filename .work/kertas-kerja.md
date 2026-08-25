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
| **AREA-16** | **Game Mode & Latency Optimizer**| Power plan switching, GameDVR toggle, Search indexer pause | `winreg`, powercfg, net service, `GameModePage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-17** | **Disk Maintenance & Repair** | SSD Storage ReTrim, SFC file checker, DISM repair, CHKDSK | fsutil, PowerShell ReTrim, sfc, dism, `DiskRepairPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-18** | **Context Menu Cleaner** | Explorer right-click shell extensions & handlers cleaner | `winreg`, PowerShell registry toggle, `ContextMenuPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-19** | **Windows Firewall Security Audit**| Inbound open ports audit, broad rule risk assessment | NetFirewallRule PowerShell, `FirewallAuditPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-20** | **CVE Vulnerability Audit Scanner**| Client library and runtime memory-safety CVE advisory checks | `CveScannerEngine`, `CveScannerPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-21** | **Multi-Package Software Updater** | Winget/Choco package manager inspection & bulk update runner | `winget` upgrade CLI parser, `SoftwareUpdaterPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-22** | **Automated Task Scheduler** | Daily, weekly, monthly automated background maintenance jobs | `ScheduleEngine`, `SchedulesPage` UI | ✅ COMPLETED | 2026-08-26 |

---

## 2. Log Eksekusi Area

### Area 22 — Automated Background Maintenance Scheduler (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Schedule Engine (`src-tauri/src/scheduler.rs`):** Manajemen jadwal pembersihan latar belakang otomatis berbasis frekuensi (Daily, Weekly, Monthly) dengan opsi target kategori dan eksekusi Auto-Clean.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_schedules` dan `toggle_schedule`.
  3. **Frontend UI (`src/App.tsx`):** Menambahkan antarmuka *Schedules* lengkap dengan daftar jadwal, waktu eksekusi, kategori pembersihan, dan tombol switch *Active / Disabled*.
  4. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.
