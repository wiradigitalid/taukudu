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

---

## 2. Log Eksekusi Area

### Area 15 — Windows Registry Orphan Cleaner (Selesai: 2026-08-26)
- **Yang telah dikerjakan:**
  1. **Registry Cleaner Engine (`src-tauri/src/registry_cleaner.rs`):** Menggunakan `winreg` untuk memindai: (a) Shared DLLs yang hilang dari disk di `HKLM\...\SharedDLLs`, (b) Invalid App Paths executable di `HKLM\...\App Paths`, dan (c) Stale MUI Cache entries di `HKCU\...\MuiCache`.
  2. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `scan_registry_issues` dan `fix_registry_targets`.
  3. **Frontend UI (`src/App.tsx`):** Menambahkan antarmuka *Registry Fixer* dengan daftar issue, target file path yang rusak, deskripsi error, dan tombol *Fix Selected*.
  4. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.
