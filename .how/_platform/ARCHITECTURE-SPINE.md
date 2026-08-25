---
type: spine
status: draft
created: '2026-08-25'
updated: '2026-08-25'
reviewed:
  date: '2026-08-25'
  sha: '044dd2f85f55a79697bb9a4e25a41e8864da1af3'
  lenses: ["structure", "prose"]
---

# Architecture Spine — TauKudu

Dokumen ini mendefinisikan keputusan arsitektural inti (*Architecture Decisions / Invariants*) yang mengikat seluruh implementasi sistem TauKudu.

---

## Architecture Decisions (AD)

### AD-1: Tauri v2 + React 18 / Tailwind Frontend Architecture
- **Binds:** Seluruh tampilan desktop GUI, komponen UI, dan IPC bridge.
- **Prevents:** Penggunaan Electron yang boros memori (RAM > 200MB) atau web server terpisah.
- **Rule:** Frontend harus berjalan di dalam Tauri Webview2 (Windows) / WebKit (macOS/Linux) dengan layer presentasi React 18 + Tailwind CSS. Seluruh komunikasi antarmuka ke logika sistem WAJIB melalui Tauri Commands IPC (`invoke()`), bukan REST/HTTP lokal.

### AD-2: Pure Native Rust Core Subsystems
- **Binds:** Seluruh engine pemrosesan (cleaner, deduplikasi, YARA scanner, shredder, platform APIs).
- **Prevents:** Ketergantungan pada runtime Node.js, Python, atau script shell eksternal saat runtime.
- **Rule:** Logika bisnis dan pemrosesan I/O WAJIB diimplementasikan 100% dalam Rust murni di dalam `src-tauri/`. Operasi sistem kritis (Registry, Services, DISM, File I/O) WAJIB menggunakan Win32 / POSIX API langsung melalui crate Rust (`windows-rs`, `winreg`, `rayon`, `sysinfo`).

### AD-3: Ripgrep-Inspired Parallel Directory Traversal
- **Binds:** Modul `scanner` di `cleaner-core` dan `malware-scanner`.
- **Prevents:** Blocking UI saat memindai jutaan file dan I/O bottleneck single-threaded.
- **Rule:** Pemindaian direktori WAJIB menggunakan worker pool paralel multi-core (`rayon` + `walkdir`/`ignore`) dengan streaming progress events ke UI melalui Tauri Event emitter (`emit()`).

### AD-4: Multi-Stage Hash Deduplication Engine (Czkawka Concept)
- **Binds:** Modul `deduplication-engine`.
- **Prevents:** Pembacaan I/O penuh (full file read) yang lambat pada tahap awal penemuan duplikat.
- **Rule:** Algoritma deduplikasi WAJIB mengikuti 3 tahap: (1) Exact File Size filter, (2) 2KB Partial Header/Footer Hash, dan (3) Full Cryptographic Hash (Blake3).

### AD-5: SQLite Embedded Local Audit & History Store
- **Binds:** Modul `history` dan pencatatan sesi pembersihan di `platform-foundation`.
- **Prevents:** Kerusakan file konfigurasi JSON besar saat penulisan konkuren dan kehilangan log audit.
- **Rule:** Data riwayat pembersihan, audit log, dan statistik storage WAJIB disimpan dalam database SQLite lokal tertanam via `rusqlite`.

### AD-6: Zero-Telemetry Local Execution & Safety First
- **Binds:** Seluruh komponen aplikasi.
- **Prevents:** Pengiriman data pengguna ke internet dan penghapusan file sistem esensial secara tidak sengaja.
- **Rule:** Aplikasi beroperasi 100% offline secara default. Operasi destruktif WAJIB memvalidasi path terhadap daftar proteksi sistem (*protected paths deny-list*) sebelum melakukan *unlink*.
