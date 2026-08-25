# Kertas Kerja Porting TauKudu (Electron/TypeScript -> Tauri v2/Rust + React)

Dokumen ini adalah **kertas kerja eksekusi (work breakdown & tracking)** untuk memantau progress porting 100% dari baseline `kudu` (diperkuat oleh `czkawka`, `bleachbit`, dan `ripgrep`) ke dalam aplikasi native **TauKudu**.

---

## 1. Matrix Area & Progress Porting

| Area ID | Area / Modul | Deskripsi & Komponen Kudu | Rust Crates / Target Tech | Status | Selesai Pada |
|---|---|---|---|---|---|
| **AREA-00** | **App Shell & Scaffolding** | Kerangka Tauri v2 + Vite + React 18 + Tailwind v4 + Lucide + IPC Bridge | `tauri v2`, `tauri-build`, `sysinfo`, Vite, React 18, Tailwind v4 | ✅ COMPLETED | 2026-08-25 |
| **AREA-01** | **Cleaner Core Engine & UI** | Pemindaian berkas sampah (System, Browser, App, Gaming, Registry) + CleanerPage | `walkdir`, `rayon`, `regex`, `CleanerPage.tsx` | ⏳ NEXT UP | — |
| **AREA-02** | **Rules Registry & Importer** | Parser rules JSON Kudu + integrasi CleanerML BleachBit | `serde_json`, `quick-xml` / YAML | ⬜ PENDING | — |
| **AREA-03** | **Deduplication & Disk Tools** | Multi-stage hash (Czkawka concept) + DuplicateFinderPage, LargeFile, EmptyFolder | `blake3`, `xxhash-rust`, `rayon` | ⬜ PENDING | — |
| **AREA-04** | **Disk Analyzer (Treemap)** | Visualisasi Treemap penggunaan disk + DiskAnalyzerPage | `jwalk`, `rayon`, Canvas / D3 Treemap | ⬜ PENDING | — |
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
- **Yang telah dikerjakan:**
  1. Inisialisasi package backend Rust `src-tauri` dengan dependensi Tauri v2, `sysinfo`, `rusqlite`, `blake3`, `rayon`, `walkdir`, `zeroize`, dan Windows API.
  2. Konfigurasi `src-tauri/tauri.conf.json` dengan identitas `id.wiradigital.taukudu` dan icon aset resmi.
  3. Implementasi IPC command awal di Rust: `greet` dan `get_system_overview` (`sysinfo`).
  4. Inisialisasi frontend React 18 + Vite + Tailwind CSS v4 (`globals.css` Kudu dipertahankan 1:1).
  5. Impor bundle translasi 30+ bahasa (`src/locales/`), library utilities, dan types `@shared`.
  6. Verifikasi build: `cargo check` PASS, `npm run build` PASS.
