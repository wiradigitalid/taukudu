# Cross-Cutting Concerns — TauKudu

Dokumen ini mendefinisikan aspek lintas sistem (*cross-cutting concerns*) dan kepemilikan platform.

---

## 1. Security & Authentication
- Aplikasi desktop berjalan sebagai executable lokal dengan hak akses pengguna standar (*Standard User*).
- Operasi yang membutuhkan hak administratif (seperti modifikasi Registry `HKLM`, manipulasi Windows Services, pembersihan DriverStore, atau pembuatan Restore Point) akan memicu eskalasi UAC via Win32 API.

---

## 2. Performance & Threading Model
- **UI Non-Blocking**: Seluruh I/O disk, hashing deduplikasi, dan kompilasi YARA dieksekusi di background thread pool (`rayon` / `tokio`).
- **Streaming Progress**: Progress scanning dikirimkan secara real-time ke UI via Tauri events (`emit("scan-progress", payload)`).

---

## 3. Platform-owned Entities
Platform foundation mengelola entity umum yang tidak dimiliki oleh satu domain bisnis spesifik:
- `RestorePoint`: Entitas titik pemulihan sistem operasi sebelum aksi pembersihan.
- `HistoryAuditLog`: Entitas catatan riwayat sesi dan audit pembersihan lokal.
- `ScheduleJob`: Entitas penjadwalan pemindaian latar belakang.
- `AppSetting`: Entitas preferensi aplikasi (tema, bahasa, update).

---

## 4. Internationalization & Localization
- Menggunakan `i18next` di frontend dengan bundle translasi JSON di `src/locales/` untuk mendukung 30+ bahasa secara dinamis tanpa restart aplikasi.
