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
| **AREA-04** | **Disk Analyzer (Treemap)** | Visualisasi Treemap penggunaan disk + DiskAnalyzerPage | `jwalk`, `rayon`, Canvas / D3 Treemap | ⏳ NEXT UP | — |
| **AREA-05** | **Privacy Shield** | 30+ Windows privacy & telemetry policies + PrivacyShieldPage | `winreg`, `windows-rs` | ⬜ PENDING | — |
| **AREA-06** | **Malware Scanner (YARA-X)** | On-demand YARA scan + MalwareScannerPage, ThreatMonitor | `yara-x` / `yara-sys` | ⬜ PENDING | — |
| **AREA-07** | **System Tools: Startup & Debloat** | Startup Manager & Windows Debloater (UWP purge) + Pages | `winreg`, `windows-rs` | ⬜ PENDING | — |
| **AREA-08** | **System Tools: Services & Drivers** | Service Manager & DriverStore Purge + Pages | `windows-service`, `windows-rs` | ⬜ PENDING | — |
| **AREA-09** | **Uninstaller & Secure Shredder** | Clean Uninstaller + Multi-pass cryptographic file shredder | `zeroize`, `rand`, `windows-rs` | ⬜ PENDING | — |
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
- **Yang telah dikerjakan:**
  1. **Multi-Stage Hasher (`src-tauri/src/deduplication.rs`):** Mengadopsi algoritma Czkawka (Exact File Size grouping $\rightarrow$ 4KB partial hash $\rightarrow$ Full cryptographic Blake3 hash) untuk pencarian duplikat instan tanpa full read I/O di muka.
  2. **Disk Anomaly Scanners:** Scanner folder kosong (`scan_empty_folders`) dan pemindai berkas besar (`scan_large_files`).
  3. **Tauri IPC Handlers (`src-tauri/src/main.rs`):** Menambahkan commands `scan_duplicates`, `scan_empty_folders`, `scan_large_files`, dan `delete_duplicate_files`.
  4. **Frontend UI (`src/App.tsx`):** Menambahkan antarmuka Duplicate Finder dengan konfigurasi direktori, visualisasi grup duplikat berdasar hash Blake3, auto-selection salinan redundan, dan eksekusi penghapusan selektif.
  5. **Verifikasi:** `cargo check` PASS, `npm run build` PASS.
