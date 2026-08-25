# C4 Level 2: Container Diagram — TauKudu

```mermaid
C4Container
    title Container diagram for TauKudu

    Person(user, "Desktop User", "Operates the application via GUI")
    Person(admin, "DevOps / SysAdmin", "Executes headless CLI maintenance")

    Container_Boundary(c1, "TauKudu Application")
        Container(desktop_ui, "Desktop Frontend UI", "React 18, Tailwind CSS, Vite, Lucide Icons, Radix UI", "Provides 34 interactive pages: Dashboard, Cleaners, Privacy, Malware Scanner, Tools, Treemap.")
        Container(rust_app, "TauKudu Core Rust Engine", "Rust, Tauri v2, Rayon, Yara-X, Windows-rs, Sysinfo", "Coordinates scanning, deduplication, YARA inspection, OS policies, and IPC commands.")
        ContainerDb(sqlite_db, "Audit & History Store", "SQLite (rusqlite)", "Stores local cleaning history, audit logs, and scheduled tasks offline.")
    Container_Boundary_End()

    System_Ext(os_api, "Operating System APIs", "Win32 API, POSIX, Registry, Services, DriverStore, Restore Points")
    System_Ext(fs, "File System", "Drives (SSD/HDD), Temp caches, Browser profiles, AppData")

    Rel(user, desktop_ui, "Navigates and triggers actions", "GUI")
    Rel(admin, rust_app, "Runs CLI commands (`taukudu clean --all`)", "Terminal CLI")

    Rel(desktop_ui, rust_app, "Invokes commands and receives streaming scan events", "Tauri IPC (Binary/JSON)")
    Rel(rust_app, sqlite_db, "Reads and writes session audit logs", "rusqlite")

    Rel(rust_app, os_api, "Executes system calls, registry edits, service controls", "FFI / Win32 / POSIX")
    Rel(rust_app, fs, "Traverses directories, reads metadata, deletes files, multi-pass shreds", "Native Parallel I/O")
```

---

## Container Mapping Matrix

| Container Name | Technology | Built By Us | Product Components Housed |
|---|---|---|---|
| `desktop-ui` | React 18, Tailwind CSS, Lucide, Radix UI | `true` | `cleaner-core`, `deduplication-engine`, `malware-scanner`, `privacy-shield`, `system-tools`, `secure-shredder`, `platform-foundation` |
| `rust-engine` | Rust 2021, Tauri v2, Rayon, Yara-X, Windows-rs | `true` | `cleaner-core`, `deduplication-engine`, `malware-scanner`, `privacy-shield`, `system-tools`, `secure-shredder`, `platform-foundation` |
| `sqlite-store` | SQLite 3 (`rusqlite`) | `true` | `platform-foundation`, `cleaner-core` |
