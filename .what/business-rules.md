# Business Rules — TauKudu

Dokumen ini mendefinisikan aturan bisnis lintas komponen (*cross-component business rules*) yang mengikat seluruh subsistem TauKudu.

---

## 1. Safety & Data Protection Invariants

- **BR-SAFE-1 (Safe-by-Default Scan)**: Operasi One-Click Clean dan default quick scan HANYA BOLEH menargetkan kategori aman (misal: temporary system caches, shader cache, error logs). Direktori kerja pengguna, dokumen pribadi, dan file sistem kritis DILARANG dimasukkan dalam rule pembersihan default.
- **BR-SAFE-2 (Explicit Destructive Confirmation)**: Seluruh aksi penghapusan file permanen, secure shredding, perbaikan registry, atau uninstall aplikasi WAJIB meminta konfirmasi eksplisit dari pengguna atau flag `--yes` / `--force` jika dijalankan dari CLI.
- **BR-SAFE-3 (Pre-Execution Restore Point)**: Pada sistem operasi yang mendukung (khususnya Windows), sistem HARUS mencoba membuat System Restore Point sebelum melakukan operasi pembersihan mendalam (registry fix, driver cleanup, atau debloating), kecuali pengguna secara sadar menonaktifkannya di Pengaturan.
- **BR-SAFE-4 (Read-Only Safety Probe)**: Sebelum mengeksekusi penghapusan file, engine HARUS memverifikasi izin baca-tulis (*file lock & permission check*). Jika file sedang terkunci oleh proses aktif (misal browser sedang terbuka), proses DILARANG crash dan HARUS mencatat status `skipped_locked` pada log sesi.

---

## 2. Deduplication & Anomaly Invariants

- **BR-DEDUP-1 (Multi-Stage Hash Integrity)**: Algoritma pencarian file duplikat TIDAK BOLEH memutuskan dua file duplikat hanya berdasarkan nama file atau ukuran file saja. Verifikasi identik WAJIB melalui *Multi-Stage Hashing* (Exact Size Match -> Partial 2KB Hash -> Full Cryptographic Hash Blake3/xxHash).
- **BR-DEDUP-2 (Safe Duplicate Auto-Selection)**: Fitur auto-select untuk menghapus duplikat TIDAK BOLEH memilih seluruh salinan dari grup duplikat yang sama. Minimal 1 salinan file asli (berdasarkan timestamp tertua atau path prioritas) WAJIB dipertahankan.

---

## 3. Privacy & Security Invariants

- **BR-SEC-1 (On-Demand Non-Resident Inspection)**: Pemindai malware berbasis YARA-X beroperasi secara *on-demand*. Aplikasi DILARANG memasang kernel driver atau background resident service yang memonitor I/O secara real-time tanpa izin.
- **BR-PRIV-1 (Zero Outbound Telemetry by Default)**: TauKudu DILARANG mengirimkan data telemetri, statistik penggunaan, log path berkas, atau daftar aplikasi terinstal ke server luar. Seluruh proses analisis dan pencatatan audit history beroperasi 100% lokal di perangkat pengguna.
- **BR-PRIV-2 (Policy Snapshot Reversibility)**: Setiap perubahan kebijakan privasi/telemetri Windows yang diterapkan melalui *Privacy Shield* HARUS dicatat dalam *snapshot* lokal agar pengguna dapat membatalkan (*revert*) perubahan kapan saja ke kondisi default OS.

---

## 4. Audit & History Invariants

- **BR-AUDIT-1 (Persistent Session Log)**: Setiap sesi pembersihan (baik via GUI maupun CLI) WAJIB mencatat ringkasan ke database SQLite lokal (`CleaningSession`): timestamp, kategori aturan yang dieksekusi, jumlah file terhapus, dan total byte yang dibebaskan.
