# C4 Level 3: Component Diagram (`desktop-ui`) — TauKudu

```mermaid
C4Component
    title Component diagram for Desktop Frontend UI (desktop-ui)

    Container_Boundary(ui_container, "Desktop Frontend UI (src/)")
        Component(router, "Page Router", "React Router", "Mengatur navigasi antara 34 halaman aplikasi.")
        Component(dash_view, "Dashboard & Cleaner Views", "pages/DashboardPage, CleanerPage", "Menampilkan status kesehatan sistem, ringkasan disk, dan rincian pembersihan.")
        Component(dedup_view, "Deduplication & Disk Views", "pages/DuplicateFinderPage, DiskAnalyzerPage", "Menampilkan visualisasi treemap dan seleksi file duplikat.")
        Component(sec_view, "Security & Privacy Views", "pages/MalwareScannerPage, PrivacyShieldPage", "Menampilkan scan status malware dan 30+ switches privasi.")
        Component(tools_view, "System Tools Views", "pages/StartupPage, DebloaterPage, ServiceManagerPage", "Menampilkan tabel autostart, layanan Windows, dan paket uninstaller.")
        Component(ipc_client, "Tauri IPC Client Bridge", "lib/ipc", "Memanggil Tauri IPC commands (`invoke()`) dan mendengarkan progress streaming events.")
    Container_Boundary_End()

    Rel(dash_view, ipc_client, "Memanggil scan & clean commands")
    Rel(dedup_view, ipc_client, "Memanggil duplicate search & treemap query")
    Rel(sec_view, ipc_client, "Memanggil YARA scan & toggle privasi")
    Rel(tools_view, ipc_client, "Mengambil & menerapkan setelan autostart/services")
```
