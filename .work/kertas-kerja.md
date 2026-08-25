# Kertas Kerja Porting TauKudu (Electron/TypeScript -> Tauri v2/Rust + React)

Dokumen ini adalah **kertas kerja eksekusi (work breakdown & tracking)** untuk memantau progress porting 100% dari baseline `kudu` (diperkuat oleh `czkawka`, `bleachbit`, dan `ripgrep`) ke dalam aplikasi native **TauKudu**.

---

## 1. Matrix Area & Progress Porting

| Area ID | Area / Modul | Deskripsi & Komponen Kudu | Rust Crates / Target Tech | Status | Selesai Pada |
|---|---|---|---|---|---|
| **AREA-00** | **App Shell & Scaffolding** | Kerangka Tauri v2 + Vite + React 18 + Tailwind v4 + Lucide + IPC Bridge | `tauri v2`, `tauri-build`, `sysinfo`, Vite, React 18, Tailwind v4 | ✅ COMPLETED | 2026-08-25 |
| **AREA-01** | **Cleaner Core Engine & UI** | Pemindaian berkas sampah (System, Browser, App, Gaming, Registry) + CleanerPage | `walkdir`, `rayon`, `serde_json`, `CleanerPage` split-view | ✅ COMPLETED | 2026-08-25 |
| **AREA-02** | **Rules Registry & Importer** | Parser rules JSON Kudu + integrasi CleanerML BleachBit | `serde_json`, `rules.rs`, path resolver | ✅ COMPLETED | 2026-08-25 |
| **AREA-03** | **Deduplication & Disk Tools** | Multi-stage hash (Czkawka concept) + DuplicateFinderPage, LargeFile, EmptyFolder | `blake3`, `rayon`, `walkdir`, `DuplicateFinderPage` UI | ✅ COMPLETED | 2026-08-25 |
| **AREA-04** | **Disk Analyzer (Treemap)** | Visualisasi Treemap penggunaan disk + DiskAnalyzerPage | `sysinfo::Disks`, `walkdir`, `DiskAnalyzerPage` UI | ✅ COMPLETED | 2026-08-25 |
| **AREA-05** | **Privacy Shield** | 30+ Windows privacy & telemetry policies + PrivacyShieldPage | `winreg`, `windows-rs`, `PrivacyShieldPage` UI | ✅ COMPLETED | 2026-08-25 |
| **AREA-07** | **System Tools: Startup & Debloat** | Startup Manager & Windows Debloater (UWP purge) + Pages | `winreg`, AppX PowerShell, Startup & Debloat UI | ✅ COMPLETED | 2026-08-25 |
| **AREA-06** | **Malware Scanner (YARA-X)** | On-demand YARA scan + MalwareScannerPage, ThreatMonitor | Heuristic scanner, quarantine isolation, `MalwareScannerPage` UI | ✅ COMPLETED | 2026-08-26 |
| **AREA-08** | **System Tools: Services & Drivers** | Service Manager & DriverStore Purge + Pages | CIM/WMI service manager, pnputil driver cleaner, UI tabs | ✅ COMPLETED | 2026-08-26 |
| **AREA-09** | **Uninstaller & Secure Shredder** | Clean Uninstaller + Multi-pass cryptographic file shredder | `zeroize`, `rand`, `windows-rs` | ⏳ NEXT UP | — |
| **AREA-10** | **Performance Monitor** | Live CPU, RAM, Disk I/O, Network, S.M.A.R.T. health + Page | `sysinfo` | ⬜ PENDING | — |
| **AREA-11** | **History & SQLite Store** | Audit trail & history logging + HistoryPage | `rusqlite` (SQLite 3) | ⬜ PENDING | — |
| **AREA-12** | **Settings, i18n & Updates** | 30+ Bahasa (i18next), Theme Dark/Light, Auto-updater | `i18next`, Tauri updater plugin | ⬜ PENDING | — |
| **AREA-13** | **CLI Mode & Headless** | Scriptable command-line interface (`taukudu clean --all`) | `clap` | ⬜ PENDING | — |

---

## 2. Log Eksekusi Area

### Area 00 — App Shell & Scaffolding (Selesai: 2026-08-25)
- Inisialisasi Tauri v2 + React 18 + Tailwind v4 dan IPC basic bridge.

### Area 01 & 02 — Cleaner Core Engine, Rules Parser & Cleaner UI (Selesai: 2026-08-25)
- Rules parser deklaratif, parallel scanner rayon + walkdir, scan & clean IPC commands, dan Cleaner split-view UI.

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
- **Yang telah dikerjakan:**
  1. **Windows Services Manager (`src-tauri/src/service_driver.rs`):** Inspeksi status service, klasifikasi rekomendasi optimasi (`safe_to_disable`), dan pengaturan startup type (Automatic/Manual/Disabled).
  2. **DriverStore Purge Engine:** Parsing dan enumerasi paket driver OEM (`pnputil /enum-drivers`) serta penghapusan paket driver kedaluwarsa/superseded (`pnputil /delete-driver /force`).
  3. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `get_services`, `set_service_start_mode`, `get_driver_packages`, dan `delete_driver`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan halaman Services Manager dan Driver Cleaner dengan badge rekomendasi dan tombol aksi cepat.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.
