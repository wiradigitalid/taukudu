---
title: "Product Brief: TauKudu"
status: "draft"
created: "2026-08-23"
updated: "2026-08-24"
---

# Product Brief: TauKudu

## Executive Summary

TauKudu adalah aplikasi pembersih sistem, deduplikasi, dan pemindaian disk berkinerja tinggi lintas platform (Windows, macOS, Linux) yang gratis dan *open source* (MIT). TauKudu berfokus utama pada kecepatan pembersihan sampah sistem yang mendalam (**BleachBit**), algoritma deduplikasi & analisis file canggih (**Czkawka**), serta mesin penelusuran disk berkecepatan tinggi (**ripgrep**), dengan tetap mengadopsi fitur keamanan dasar (pemindai YARA) dan kontrol privasi OS bawaan dari **Kudu** secara *as-is*.

Kategori *PC cleaner* telah lama rusak oleh perangkat lunak *closed-source* yang penuh iklan, *bloatware*, dan model langganan agresif. TauKudu hadir sebagai utilitas perawatan sistem yang transparan, dapat diaudit kodenya, dan bekerja lokal secara *default*. Fokus utamanya adalah membebaskan ruang disk secara masif dan instan tanpa membebani memori dan CPU komputer pengguna.

## The Problem

Pengguna komputer pribadi dihadapkan pada masalah ruang penyimpanan dan penurunan kinerja akibat akumulasi file sampah:
1. **Penyimpanan Habis oleh Sampah & Duplikasi**: *Cache* browser, sisa aplikasi, *shader cache* game, serta file duplikat berukuran besar menumpuk di berbagai direktori tanpa alat terpadu yang cepat untuk menganalisisnya.
2. **Kelemahan & Fragmentasi Tool Pembersih**: Utilitas yang ada terpisah-pisah—BleachBit matang dalam pembersihan sistem tetapi tidak mendukung macOS; Czkawka unggul dalam deduplikasi namun bukan pembersih sampah sistem (*system junk cleaner*); utilitas komersial umumnya *closed-source* dan sarat iklan.
3. **Pemindaian Disk Konvensional Lambat**: Pemindaian jutaan file pada SSD/HDD berukuran besar sering kali memakan waktu lama dan mengunci antarmuka jika tidak menggunakan algoritma penelusuran direktori paralel yang dioptimalkan (*ripgrep engine*).
4. **Fitur Keamanan & Privasi Tersebar**: Pengguna tetap membutuhkan pemindaian malware dasar dan kontrol telemetri OS tanpa harus menginstal antivirus berat yang berjalan di latar belakang.

## The Solution

TauKudu menyatukan fondasi performa tinggi dan utilitas perawatan lengkap:
- **Pembersihan Residu Sistem Mendalam (Adopsi BleachBit & Kudu)**: Pembersihan menyeluruh untuk *cache* sistem, *browser*, aplikasi pihak ketiga, *game launcher*, sisa *uninstaller*, *registry* (Windows), serta *database vacuuming* berbasis aturan deklaratif JSON/XML yang mudah diperluas komunitas tanpa kompilasi kode.
- **Deduplikasi & Analisis Disk Canggih (Adopsi Czkawka)**: Algoritma pencarian file duplikat (via *multi-stage hashing* cepat), file serupa, direktori kosong, file besar, dan *broken symlinks* dengan performa mendekati *native*.
- **Mesin Penelusuran Cepat (Adopsi ripgrep)**: Pemanfaatan algoritma *parallel directory traversal* dan *regex matching* ala *ripgrep* untuk pemindaian jalur file, log, dan artefak disk secara instan tanpa mengunci antarmuka.
- **Fitur Keamanan & Privasi Bawaan (Adopsi As-Is Kudu)**: Mengadopsi modul bawaan Kudu untuk pemindai malware *on-demand* berbasis YARA-X, penghapusan aman (*secure file shredder*), dan *Privacy Shield* untuk pengaturan privasi/telemetri Windows dasar tanpa perluasan cakupan berlebih.
- **Antarmuka Desktop & CLI Skrip**: GUI modern yang responsif dan mode CLI *headless* penuh untuk integrasi otomasi/admin IT.

## What Makes This Different

- **Fokus Utama Performa & Ruang Disk**: Menyatukan pembersihan mendalam (BleachBit), deduplikasi efisien (Czkawka), dan *traversal engine* super cepat (ripgrep) dalam satu antarmuka terpadu.
- **Keamanan & Privasi Praktis Tanpa Bloat**: Fitur pemindai malware YARA dan kontrol privasi OS disertakan dari basis Kudu sebagai pelengkap praktis tanpa beban proses latar belakang (*resident background process*).
- **Transparan & Lokal Penuh**: Lisensi MIT, tanpa iklan, tanpa telemetri default, dan seluruh operasi destruktif dapat ditinjau sebelum dieksekusi.
- **Katalog Aturan Komunitas Rendah Hambatan**: Aturan pembersihan didefinisikan secara deklaratif dalam JSON yang dapat divalidasi skema otomatis di CI.

## Who This Serves

| Role | Need | Tier |
|---|---|---|
| Pengguna PC yang membutuhkan pembersih & deduplikasi cepat | Satu aplikasi aman, cepat, dan transparan untuk membersihkan sampah disk, menghapus file duplikat, dan mengelola ruang penyimpanan | **primary** |
| Power user & Developer | Mesin pembersih dan deduplikasi cepat yang dapat diaudit kodenya, dilengkapi CLI untuk otomasi | secondary |
| Kontributor Komunitas | Kemudahan menambah aturan *cleaner* aplikasi baru tanpa harus menulis kode aplikasi | secondary |
| SysAdmin / IT Support | Eksekusi pembersihan dan analisis disk secara *headless* via skrip CLI | secondary |

*Tujuan Bersama:* Memiliki komputer yang bersih, cepat, bebas duplikat, dan terawat ruang penyimpanannya melalui perangkat lunak *open-source* yang dapat dipercaya sepenuhnya.

## Goals

- **BG-1** — Nilai Inti: Menyediakan aplikasi pembersih sistem dan manajemen ruang disk berkinerja tinggi lintas OS yang 100% transparan, aman, dan dapat diaudit kodenya.
- **BG-2** — Mengintegrasikan kapabilitas deduplikasi file komprehensif (duplikat, *empty folders*, *broken symlinks*) terinspirasi dari Czkawka.
- **BG-3** — Mengadopsi cakupan pembersihan mendalam dan fleksibilitas aturan sistem terinspirasi dari BleachBit dan Kudu.
- **BG-4** — Memanfaatkan mesin pemindaian dan pencarian pola berkecepatan tinggi berbasis prinsip ripgrep untuk *traversal* disk skala besar.
- **BG-5** — Menyertakan pemindai malware berbasis YARA dan pengaturan privasi OS (*Privacy Shield*) bawaan Kudu secara *as-is*.
- **BG-6** — Menyediakan mode CLI skrip yang efisien untuk otomasi dan lingkungan *headless*.

## Success Criteria

- Kecepatan *quick scan* sistem & *cache* selesai dalam waktu < 20 detik pada penyimpanan SSD standar (didorong optimasi pemindaian ala ripgrep).
- Tingkat akurasi deteksi duplikat 100% tanpa risiko *false deletion* pada file berbeda.
- Cakupan aturan *cleaner* mencakup > 100 aplikasi populer lintas Windows, macOS, dan Linux.
- 0 *telemetry bytes* terkirim keluar tanpa tindakan eksplisit (*opt-in*) pengguna.
- *Crash rate* aplikasi di bawah 1% pada pengujian multi-platform.

## Scope

### Scope In

- Aplikasi desktop terpadu untuk Windows, macOS, dan Linux.
- Modul Pembersih Sistem, Browser, Aplikasi, Game, dan Database (BleachBit + Kudu rules).
- Modul Deduplikasi & Pencarian File: File Duplikat, File Besar, Folder Kosong, *Broken Links* (Czkawka).
- Mesin pemindaian pola berbasis regex/glob cepat (ripgrep integration/concept).
- Pemindai Malware berbasis YARA-X dan *Secure Shredder* (bawaan Kudu *as-is*).
- *Privacy Shield* untuk pengaturan privasi dan penonaktifan telemetri OS (bawaan Kudu *as-is*).
- Mode CLI *headless* dengan keluaran terstruktur (JSON/Text) dan Prometheus metrics.
- Dukungan multi-bahasa (30+ bahasa).

### Scope Out

- Antivirus *resident real-time background protection* (fokus pada *on-demand scan*).
- Perluasan fitur keamanan enterprise / EDR / SIEM ingestion (keamanan tetap pada cakupan bawaan Kudu).
- Aplikasi mobile (Android / iOS).
- Layanan *cloud fleet management* terpusat enterprise.
- Driver kernel tingkat rendah (*kernel-level drivers*).
- Fitur berbayar / *paywall*.

## Constraints

- **Lisensi Terbuka (MIT)**: Bebas dari klausul restriktif dan dapat diaudit secara publik.
- **Lokal Secara Default**: Tidak ada ketergantungan jaringan atau server wajib untuk fungsi inti.
- **Safety First**: Setiap tindakan destruktif wajib menyediakan ringkasan verifikasi, opsi pembuatan *Restore Point*, dan konfirmasi pengguna.
- **Paritas Arsitektur**: Mesin pembersih dan pemindai harus mempertahankan antarmuka konsisten di Windows, macOS, dan Linux.

## Assumptions

- Pengguna memprioritaskan kecepatan pembersihan dan pembebasan ruang disk (deduplikasi) sebagai nilai utama aplikasi.
- Fitur keamanan (YARA) dan privasi (Privacy Shield) bawaan Kudu sudah mencukupi kebutuhan dasar tanpa perlu rekayasa ulang besar.
- Arsitektur pemindaian berbasis konsep ripgrep & Rust/Node bindings mampu mengatasi beban *I/O bottleneck* pada penyimpanan modern.

## Prerequisites

- Repositori dan *build pipeline* multi-platform (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`/`.deb`).
- Set sertifikat penandatanganan kode (*code signing*) untuk verifikasi integritas biner rilis.
- Repositori aturan pembersih (JSON) dan basis aturan YARA yang terkelola.