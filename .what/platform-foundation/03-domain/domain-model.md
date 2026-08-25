---
type: domain-model
component: 'platform-foundation'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
---

# Domain Model — platform-foundation

## Entities

### RestorePoint
Titik pemulihan sistem (System Restore Point).
- `sequence_number`: integer
- `description`: string
- `created_at`: datetime
- `event_type`: enum(pre_clean | manual | pre_update)

### HistoryAuditLog
Catatan audit permanen untuk kepatuhan dan pelaporan.
- `id`: integer / autoincrement
- `timestamp`: datetime
- `action_type`: enum(clean | shred | registry_fix | debloat | yara_scan | privacy_change)
- `summary`: string
- `details_json`: json

### ScheduleJob
Jadwal otomatisasi tugas pemeliharaan berkala.
- `id`: string
- `frequency`: enum(daily | weekly | monthly)
- `day_of_week`: integer (optional)
- `hour_minute`: string ("HH:MM")
- `categories`: list<string>
- `is_enabled`: boolean
- `last_run_at`: datetime

### AppSetting
Pengaturan aplikasi TauKudu.
- `key`: string
- `value`: string (JSON serialized)
