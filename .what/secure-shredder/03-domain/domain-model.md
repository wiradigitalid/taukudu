---
type: domain-model
component: 'secure-shredder'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
---

# Domain Model — secure-shredder

## Entities

### ShredderJob
Instruksi penghapusan berkas dengan multi-pass overwrite.
- `id`: uuid
- `target_paths`: list<string>
- `algorithm`: enum(dod_5220_22_m_3pass | dod_7pass | random_single_pass | gutmann_35pass)
- `total_bytes`: integer (u64)
- `passes_completed`: integer
- `status`: enum(pending | in_progress | completed | failed)
- `completed_at`: datetime
