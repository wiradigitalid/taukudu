# Product Brief Addendum: TauKudu

## Input Context & Comparative Research

Dokumen ini melengkapi `brief.md` dengan rangkuman riset komparatif berdasarkan [kudu-oss-alternatives-2026-08-23.md](../../kudu-oss-alternatives-2026-08-23.md) dan [kudu-system-cleaner-2026-08-23.md](../../kudu-system-cleaner-2026-08-23.md).

### Sinergi Arsitektur & Penentuan Fokus

| Pilar / Komponen | Sumber Inspirasi / Basis & Repositori | Peran & Tingkat Fokus dalam TauKudu |
|---|---|---|
| **Pembersihan Residu & Sistem** | [BleachBit](https://github.com/bleachbit/bleachbit) + [Kudu](https://github.com/adventdevinc/kudu) | **FOKUS UTAMA**: Aturan pembersihan menyeluruh lintas OS (Windows, macOS, Linux), *browser cache*, *app cache*, *shader cache*, *database vacuuming*, dan *registry cleaning*. |
| **Deduplikasi & Analisis File** | [Czkawka](https://github.com/qarmin/czkawka) | **FOKUS UTAMA**: Algoritma deteksi file duplikat berkecepatan tinggi via *multi-stage hashing*, pencarian file besar, folder kosong, dan *broken symlinks*. |
| **Mesin Pemindaian & Traversal** | [ripgrep](https://github.com/burntsushi/ripgrep) | **FOKUS UTAMA**: Algoritma *parallel directory traversal* dan *regex pattern matching* untuk pemindaian ratusan ribu file tanpa *I/O lag*. |
| **Keamanan & Malware Scanning** | [Kudu](https://github.com/adventdevinc/kudu) (Bawaan) | **SEKUNDER (ADOPTI AS-IS)**: Pemindai malware *on-demand* berbasis mesin YARA-X (`@litko/yara-x`) dan *secure multi-pass shredder* tanpa penambahan modul EDR/real-time kompleks. |
| **Pengaturan Privasi OS** | [Kudu](https://github.com/adventdevinc/kudu) (Bawaan) | **SEKUNDER (ADOPTI AS-IS)**: *Privacy Shield* untuk 30+ setelan privasi dan telemetri Windows dasar. |

---

## Analisis Opsi Arsitektur

### 1. Mesin Pemindaian Disk (ripgrep Integration)
- Menggunakan pustaka *glob/traversal* multithreaded atau *native Rust module/binding* yang mengadopsi mekanisme *worker pool* dan *memory-mapped file scanning* ala ripgrep untuk pemindaian pola file/log berkecepatan tinggi.

### 2. Algoritma Deduplikasi (Czkawka Concept)
- **Tahap 1**: Filter cepat berdasarkan ukuran file persis (*exact size match*).
- **Tahap 2**: Pengambilan hash parsial (header/footer file misal 2KB awal) untuk kandidat dengan ukuran sama.
- **Tahap 3**: Pengambilan hash penuh (Blake3 / xxHash / SHA-256) hanya jika hash parsial cocok.
- **Hasil**: Deteksi duplikat instan tanpa perlu membaca seluruh isi file di muka.

### 3. Modul Keamanan & Privasi (Kudu Baseline)
- Mengintegrasikan kode service `src/main/services/yara-engine.ts` dan `src/main/platform/win32/privacy.ts` bawaan Kudu secara langsung tanpa menambah beban rekayasa baru.

---

## Detail Asumsi & Mitigasi Risiko

| Asumsi | Risiko | Rencana Validasi / Mitigasi |
|---|---|---|
| Pengguna memprioritaskan pembersihan dan deduplikasi disk | Ekspektasi berlebih terhadap fitur antivirus | Komunikasi yang jelas di UI bahwa pemindai YARA adalah *on-demand inspection*, bukan antivirus resident background |
| Mesin traversal ripgrep memberikan lonjakan performa signifikan | Overhead IPC antara native worker dan renderer Electron | Benchmark scan rate (files/sec) pada corpus test 100k files |
| Aturan JSON aman dari eksploitasi | Potensi kesalahan penulisan path yang menghapus direktori penting | Validasi skema ketat di CI + proteksi hardcoded untuk direktori sistem esensial |
