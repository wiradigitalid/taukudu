---
type: domain-model
component: 'cleaner-core'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
---

# Domain Model — cleaner-core

## Entities

### CleanerRule
Aturan pembersihan deklaratif yang mendefinisikan target pemindaian.
- `id`: string (e.g. "windows.temp", "chrome.cache")
- `category`: enum (system | browser | app | gaming | registry)
- `title`: string
- `description`: string
- `platform`: list<enum(windows, macos, linux)>
- `paths`: list<string> (dengan template variable seperti `%TEMP%`, `%APPDATA%`)
- `patterns`: list<string> (glob / regex)
- `safe_default`: boolean

### CleaningSession
Satu siklus eksekusi pembersihan.
- `id`: uuid
- `started_at`: datetime
- `completed_at`: datetime
- `target_categories`: list<string>
- `total_files_scanned`: integer
- `total_files_deleted`: integer
- `total_bytes_reclaimed`: integer (u64)
- `status`: enum(scanning | ready | cleaning | completed | aborted | failed)

### DeletionRecord
Rincian item berkas yang dihapus dalam suatu sesi pembersihan.
- `id`: integer / autoincrement
- `session_id`: uuid (fk -> CleaningSession)
- `file_path`: string
- `file_size_bytes`: integer (u64)
- `status`: enum(deleted | skipped_locked | permission_denied | failed)
