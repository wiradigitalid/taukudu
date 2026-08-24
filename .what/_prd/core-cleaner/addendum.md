# PRD Addendum: Core Cleaner and Security Suite

## Architecture Notes & Technology Stack

- **Desktop Framework:** Electron 41 with `electron-builder` cross-platform packaging.
- **Frontend Architecture:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4.
- **Local Storage / Persistence:** `better-sqlite3` for local cleaning session histories and rule indices.
- **System Metrics & Inspection:** `systeminformation` package for cross-platform hardware, sensor, and OS stats.
- **Malware Scanning:** `@litko/yara-x` providing WebAssembly/native bindings to YARA-X rule compiler and scanner.
- **Localization:** `i18next` with 30 language JSON resource bundles loaded dynamically.
- **Auto-Updates:** `electron-updater` querying GitHub release endpoints.

## Rule Schema Architecture

Cleaner definitions are decoupled from the application runtime into declarative JSON files under `rules/{win32,darwin,linux}/`:
```json
{
  "$schema": "../schema/cleaner-rule.schema.json",
  "id": "chrome-cache",
  "name": "Google Chrome Cache",
  "category": "browsers",
  "platforms": ["win32", "darwin", "linux"],
  "scan": [
    {
      "path": "%LOCALAPPDATA%/Google/Chrome/User Data/Default/Cache",
      "recursive": true
    }
  ]
}
```

## Rejected Technical Alternatives

1. **Kernel-level File System Filters:** Rejected to maintain cross-platform parity, avoid OS stability risks, and preserve open-source build accessibility.
2. **Mandatory Cloud Account Sync:** Rejected to ensure 100% offline functionality and maintain strict user privacy guarantees.
3. **Monolithic Binary Rules:** Rejected in favor of modular JSON rules to enable zero-code community contributions.