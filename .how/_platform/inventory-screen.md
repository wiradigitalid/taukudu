---
type: inventory
inventory_type: screen
created: '2026-08-25'
updated: '2026-08-25'
---

# Screen Inventory — TauKudu

Dokumen ini memetakan seluruh 34 halaman antarmuka pengguna desktop yang di-porting 1:1 dari `kudu`.

| # | Screen ID | Page Title | Component Owner | Source Path (Kudu) | Description |
|---|---|---|---|---|---|
| 1 | `SCR-DASH` | Dashboard | `platform-foundation` | `DashboardPage.tsx` | Ringkasan status sistem, quick health score, disk usage gauge, One-Click Clean |
| 2 | `SCR-CLEAN` | System Cleaner | `cleaner-core` | `CleanerPage.tsx` | Kategori pembersih (System, Browser, App, Gaming, Registry) + breakdown list |
| 3 | `SCR-DEDUP` | Duplicate Finder | `deduplication-engine` | `DuplicateFinderPage.tsx` | Antarmuka pencarian file duplikat bertenaga engine Czkawka |
| 4 | `SCR-EMPTY` | Empty Folder Cleaner | `deduplication-engine` | `EmptyFolderCleanerPage.tsx` | Deteksi dan pembersihan direktori kosong |
| 5 | `SCR-LARGE` | Large File Finder | `deduplication-engine` | `LargeFileFinderPage.tsx` | Analisis berkas berukuran besar yang menyita ruang disk |
| 6 | `SCR-DISK-ANA` | Disk Analyzer | `deduplication-engine` | `DiskAnalyzerPage.tsx` | Visualisasi treemap interaktif penggunaan ruang penyimpanan |
| 7 | `SCR-PRIV` | Privacy Shield | `privacy-shield` | `PrivacyShieldPage.tsx` | 30+ switches privasi & telemetri OS Windows |
| 8 | `SCR-MALWARE` | Malware Scanner | `malware-scanner` | `MalwareScannerPage.tsx` | Pemindai malware YARA on-demand, daftar deteksi & karantina |
| 9 | `SCR-THREAT-MON`| Threat Monitor | `malware-scanner` | `ThreatMonitorPage.tsx` | Log audit aktivitas keamanan dan proteksi |
| 10 | `SCR-BREACH` | Breach Monitor | `malware-scanner` | `BreachMonitorPage.tsx` | Pemeriksaan kebocoran data akun lokal/online |
| 11 | `SCR-CVE` | CVE Scanner | `malware-scanner` | `CveScannerPage.tsx` | Audit kerentanan keamanan software terinstal |
| 12 | `SCR-SHRED` | File Shredder | `secure-shredder` | `FileShredderPage.tsx` | Drag-and-drop secure multi-pass file eraser |
| 13 | `SCR-STARTUP` | Startup Manager | `system-tools` | `StartupPage.tsx` | Tabel autostart program beserta impact rating boot |
| 14 | `SCR-DEBLOAT` | Windows Debloater | `system-tools` | `DebloaterPage.tsx` | Daftar paket bloatware/UWP yang dapat dihapus aman |
| 15 | `SCR-UNINSTALL` | Software Uninstaller| `system-tools` | `UninstallerPage.tsx` | Uninstaller software tanpa meninggalkan residu file/registry |
| 16 | `SCR-SERVICE` | Service Manager | `system-tools` | `ServiceManagerPage.tsx` | Manajemen dan rekomendasi konfigurasi background services |
| 17 | `SCR-DRIVER` | Driver Manager | `system-tools` | `DriverManagerPage.tsx` | Scan & purge driver store usang |
| 18 | `SCR-UPDATE-PKG`| Software Updater | `system-tools` | `SoftwareUpdaterPage.tsx` | Bulk package updater (winget, choco, scoop, npm) |
| 19 | `SCR-PERF` | Performance Monitor | `system-tools` | `PerformanceMonitorPage.tsx` | Real-time graph CPU, RAM, Disk I/O, Network, S.M.A.R.T. |
| 20 | `SCR-REGISTRY` | Registry Cleaner | `cleaner-core` | `RegistryPage.tsx` | Scan & fix orphaned Windows registry keys |
| 21 | `SCR-GAME` | Game Mode | `system-tools` | `GameModePage.tsx` | Optimasi alokasi resource saat bermain game |
| 22 | `SCR-DISK-MAINT`| Disk Maintenance | `system-tools` | `DiskMaintenancePage.tsx` | TRIM SSD, defragmentasi HDD, dan pemeliharaan disk |
| 23 | `SCR-DISK-REPAIR`| Disk Repair | `system-tools` | `DiskRepairPage.tsx` | CHKDSK / SFC filesystem integrity repair |
| 24 | `SCR-NET-CLEAN` | Network Cleanup | `system-tools` | `NetworkCleanupPage.tsx` | Flush DNS cache, reset TCP/IP stack, purge socket cache |
| 25 | `SCR-FIREWALL` | Firewall Audit | `system-tools` | `FirewallAuditPage.tsx` | Inspeksi port terbuka dan aturan Windows Firewall |
| 26 | `SCR-SYS-HARDEN`| System Hardening | `system-tools` | `SystemHardeningPage.tsx` | Audit kepatuhan keamanan dan proteksi mitigasi exploit |
| 27 | `SCR-CTX-MENU` | Context Menu Cleaner| `system-tools` | `ContextMenuCleanerPage.tsx`| Pengelola entri menu klik kanan Explorer |
| 28 | `SCR-SCHEDULE` | Schedules | `platform-foundation` | `SchedulesPage.tsx` | Penjadwalan pemindaian otomatis periodik |
| 29 | `SCR-HISTORY` | Cleaning History | `platform-foundation` | `HistoryPage.tsx` | Log audit sesi pembersihan dan statistik storage |
| 30 | `SCR-CLOUD` | Cloud Sync / Agent | `platform-foundation` | `CloudPage.tsx` | Manajemen profil aturan (opsional/lokal) |
| 31 | `SCR-SETTINGS` | App Settings | `platform-foundation` | `SettingsPage.tsx` | Bahasa (30+ i18n), tema dark/light, perilaku app |
| 32 | `SCR-ABOUT` | About TauKudu | `platform-foundation` | `AboutPage.tsx` | Informasi versi, lisensi MIT, tautan GitHub |
| 33 | `SCR-UPDATES` | App Updates | `platform-foundation` | `UpdatesPage.tsx` | Changelog rilis dan status auto-updater |
| 34 | `SCR-ONBOARD` | Onboarding Wizard | `platform-foundation` | `components/OnboardingModal`| Panduan pengenalan pertama kali untuk pengguna |
