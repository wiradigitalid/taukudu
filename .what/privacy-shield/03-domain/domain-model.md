---
type: domain-model
component: 'privacy-shield'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
---

# Domain Model — privacy-shield

## Entities

### PrivacySetting
Pengaturan privasi atau telemetri sistem operasi.
- `id`: string (e.g. "win.telemetry.diagnostic_data", "win.privacy.advertising_id")
- `category`: enum(telemetry | diagnostic | advertising | location | edge | cortana)
- `title`: string
- `description`: string
- `impact_level`: enum(recommended | optional | advanced)
- `registry_keys`: list<RegistryTarget>
- `is_enabled`: boolean (status aktif/tidak)

### PolicySnapshot
Cadangan snapshot status registri/kebijakan sebelum dilakukan perubahan batch.
- `id`: uuid
- `created_at`: datetime
- `note`: string
- `entries`: list<SnapshotEntry> (path, name, previous_value)
