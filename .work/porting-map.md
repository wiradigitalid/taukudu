# TauKudu Reverse-Engineering & Porting Map (TypeScript/Electron -> Rust/Tauri)

Dokumen ini adalah peta arsitektur lengkap untuk mem-porting **Kudu** (beserta konsep **Czkawka**, **BleachBit**, dan **ripgrep**) menjadi **TauKudu** berbasis **Rust + Tauri v2**.

---

## 1. Upstream Source Analysis & Rust Equivalents

| Subsystem / Feature | Kudu (TypeScript/Node.js/Win32) | TauKudu Target (Rust Crates & Tauri) | Keterangan & Referensi Tambahan |
|---|---|---|---|
| **App Framework & Shell** | Electron 30 + React 18 + Vite | **Tauri v2 + React 18 / Svelte + Vite** | Mengurangi konsumsi RAM dari ~200MB menjadi ~30MB. Binary size turun dari ~150MB ke ~15MB. |
| **UI Components & Styling** | Tailwind CSS + Lucide Icons + Radix UI | **Tailwind CSS + Lucide React + Radix UI / shadcn/ui** | Copy 1:1 design tokens, palet warna, dan aset ikon dari `.work/upstream/kudu/src/renderer`. |
| **System Cleaning Engine** | `src/main/services/file-utils.ts`, custom glob/regex scan | **`walkdir` + `rayon` + `regex`** | Scanning multi-threaded berkecepatan tinggi ala **ripgrep** (crate `ignore` / `walkdir`). |
| **Cleaner Rules Registry** | `.work/upstream/kudu/rules/*.json` | **`serde_json` + `serde_yaml`** | Mengimpor rules Kudu + CleanerML dari **BleachBit** (`.work/upstream/bleachbit/cleaners/`). |
| **Deduplication Engine** | `DuplicateFinderPage.tsx` | **`czkawka_core` / porting algoritma Czkawka** | Multi-stage hash (size match -> 2KB header/footer hash -> full Blake3/xxHash). |
| **Malware Scanner** | `@litko/yara-x` + `yara-engine.ts` | **`yara-x` / `yara-sys` (Rust native)** | Kompilasi YARA rules & scanning file tanpa Node.js native addon boundary. |
| **Privacy Shield** | `src/main/platform/win32/privacy.ts` (Registry & PowerShell) | **`winreg` + `windows-rs` (Win32 API)** | Manipulasi registry langsung di Rust tanpa spawn process powershell/cmd. |
| **Startup Manager** | `src/main/platform/win32/startup.ts` | **`winreg` (HKCU/HKLM Run, RunOnce, StartupApproved)** | Enumerasi cepat autostart Windows & systemd/launchd di Linux/macOS. |
| **Disk Analyzer (Treemap)** | `DiskAnalyzerPage.tsx` | **`rayon` + `jwalk` + D3 / Treemap Canvas** | Pengumpulan ukuran direktori multi-core paralel. |
| **Windows Debloater** | `DebloaterPage.tsx` + AppX package queries | **`windows-rs` (AppxPackaging / WinRT API) / DISM** | Uninstall UWP & OEM bloatware aman. |
| **Driver Cleaner** | `DriverManagerPage.tsx` + pnputil calls | **`windows-rs` / `setupapi.dll`** | Scan & purge driver store yang kedaluwarsa. |
| **Service Manager** | `ServiceManagerPage.tsx` + sc.exe / WMI | **`windows-service` crate** | Kontrol start/stop/config Windows Services. |
| **File Shredder (Secure Delete)**| `FileShredderPage.tsx` | **`zeroize` + `rand` (DoD 5220.22-M 3/7 pass overwrite)** | Overwrite disk blocks secara kriptografis sebelum unlink. |
| **Hardware & Perf Monitor** | `src/main/services/perf-monitor.ts` | **`sysinfo` crate** | Real-time CPU, RAM, Disk I/O, Network, dan S.M.A.R.T. metrics. |
| **Local Database & History** | `history-store.ts` (JSON store) | **`rusqlite` (SQLite)** | Log riwayat pembersihan, audit log, dan statistik hemat storage. |
| **CLI Mode** | `src/main/cli.ts` (Commander.js) | **`clap` crate** | Scriptable headless CLI (`taukudu clean --all --quiet`). |

---

## 2. Upstream Directory Structure vs Target Codebase

```
taukudu/
├── .work/upstream/             # (Referensi Source Code)
│   ├── kudu/                   # Baseline UI/UX, Pages, Services, YARA, Rules
│   ├── czkawka/                # Referensi algoritma Deduplikasi & Anomali Disk
│   ├── bleachbit/              # Referensi ribuan cleaner rules & CleanerML
│   └── ripgrep/                # Referensi pattern matching & parallel directory walk
│
├── src-tauri/                  # (Rust Native Engine)
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/           # Tauri IPC handlers (memanggil core engine)
│   │   │   ├── cleaner.rs
│   │   │   ├── duplicate.rs
│   │   │   ├── security.rs
│   │   │   ├── privacy.rs
│   │   │   ├── system_tools.rs
│   │   │   └── perf.rs
│   │   ├── core/               # Pure Rust business logic
│   │   │   ├── scanner/        # Parallel filesystem traversal (ripgrep/walkdir)
│   │   │   ├── rules/          # JSON/CleanerML rules parser & matcher
│   │   │   ├── deduplication/  # Czkawka multi-stage hasher
│   │   │   ├── yara_engine/    # YARA-X scanner
│   │   │   ├── shredder/       # Multi-pass secure delete
│   │   │   └── history/        # SQLite audit store
│   │   └── platform/           # Platform-specific APIs
│   │       ├── windows/        # winreg, services, restore points, privacy toggles
│   │       ├── macos/          # LaunchAgents, caches
│   │       └── linux/          # systemd, desktop autostart, caches
│
└── src/                        # (Frontend React/Tailwind - Porting 1:1 dari kudu/src/renderer)
    ├── assets/                 # Icons, Logos, Theme styles
    ├── components/             # Reusable UI widgets (Dashboard cards, Gauges, Treemap)
    ├── pages/                  # CleanerPage, DuplicateFinderPage, PrivacyShieldPage, dll.
    └── lib/                    # IPC bridge ke Tauri commands
```

---

## 3. UI/UX Porting Checklist (1:1 Pages to Migrate)

Dari `.work/upstream/kudu/src/renderer/src/pages/`:
1. `DashboardPage.tsx` -> Overview status sistem, quick health score, disk usage gauge, One-Click Clean.
2. `CleanerPage.tsx` -> Kategori cleaner (System, Browser, App, Gaming, Registry) + breakdown list file.
3. `DuplicateFinderPage.tsx` -> UI deduplikasi file terintegrasi dengan engine Czkawka.
4. `EmptyFolderCleanerPage.tsx` & `LargeFileFinderPage.tsx` -> Analisis file besar & folder kosong.
5. `PrivacyShieldPage.tsx` -> 30+ toggles privasi/telemetri Windows.
6. `MalwareScannerPage.tsx` -> Quick/Full scan malware berbasis YARA, log deteksi, karantina.
7. `StartupPage.tsx` -> Tabel autostart program beserta impact rating.
8. `DiskAnalyzerPage.tsx` -> Visualisasi treemap storage interaktif.
9. `DebloaterPage.tsx` -> Daftar paket bloatware/UWP yang siap di-uninstall.
10. `ServiceManagerPage.tsx` -> Daftar services Windows & tombol optimasi rekomendasi.
11. `DriverManagerPage.tsx` -> Scan & purge stale DriverStore.
12. `FileShredderPage.tsx` -> Drag-and-drop secure file eraser.
13. `PerformanceMonitorPage.tsx` -> Real-time graph CPU, RAM, Disk I/O, Network.
14. `HistoryPage.tsx` -> Log audit sesi pembersihan dan total storage yang dibebaskan.
15. `SettingsPage.tsx` -> Pilihan bahasa (i18n 30+ bahasa), tema (dark/light), opsi auto-update.
