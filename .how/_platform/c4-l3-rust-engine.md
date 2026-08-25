# C4 Level 3: Component Diagram (`rust-engine`) — TauKudu

```mermaid
C4Component
    title Component diagram for TauKudu Core Rust Engine

    Container_Boundary(rust_engine, "TauKudu Core Rust Engine (src-tauri)")
        Component(ipc_handlers, "Tauri IPC Command Router", "commands/*", "Exposes commands to Frontend UI via Tauri IPC (`#[tauri::command]`).")
        Component(cli_handler, "CLI Entrypoint", "cli.rs / clap", "Parses terminal arguments and dispatches headless maintenance routines.")
        
        Component(scanner_mod, "Parallel Traversal Engine", "core::scanner", "Fast multi-threaded file directory traversal inspired by ripgrep (`rayon` + `walkdir`).")
        Component(rules_engine, "Cleaner Rules Matcher", "core::rules", "Parses JSON rules and matches target paths across OS, browsers, and applications.")
        Component(dedup_mod, "Deduplication Engine", "core::deduplication", "Multi-stage fast hasher (Size -> 2KB Partial -> Full Blake3) from Czkawka concepts.")
        Component(yara_mod, "YARA-X Malware Engine", "core::yara_engine", "Compiles YARA rules and inspects files, persistence autostarts, and memory.")
        Component(shredder_mod, "Cryptographic Shredder", "core::shredder", "Overwrites file blocks with multi-pass random data prior to unlinking.")
        
        Component(platform_win, "Windows Platform Manager", "platform::windows", "Interfaces with Windows Registry, Services, Restore Points, DriverStore, and Debloater.")
        Component(sys_monitor, "System Performance Monitor", "platform::perf / sysinfo", "Captures live CPU, RAM, Disk I/O, Network, and S.M.A.R.T. health metrics.")
        Component(history_repo, "Audit Log & History Repository", "core::history", "Manages SQLite database reads and writes for audit logs and settings.")
    Container_Boundary_End()

    Rel(ipc_handlers, scanner_mod, "Triggers parallel scan")
    Rel(ipc_handlers, rules_engine, "Loads rules & evaluates targets")
    Rel(ipc_handlers, dedup_mod, "Runs duplicate search")
    Rel(ipc_handlers, yara_mod, "Executes malware scan")
    Rel(ipc_handlers, shredder_mod, "Sends shredding jobs")
    Rel(ipc_handlers, platform_win, "Invokes OS-specific tools")
    Rel(ipc_handlers, sys_monitor, "Polls live hardware metrics")
    Rel(ipc_handlers, history_repo, "Reads/writes history")

    Rel(cli_handler, scanner_mod, "Executes headless scans")
    Rel(cli_handler, rules_engine, "Applies cleaning rules")
    Rel(cli_handler, history_repo, "Logs headless sessions")
```
