---
type: domain-model
component: 'deduplication-engine'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
---

# Domain Model — deduplication-engine

## Entities

### DuplicateGroup
Grup kumpulan berkas identik yang memiliki ukuran dan cryptographic hash yang sama.
- `hash`: string (Blake3 / xxHash64)
- `file_size_bytes`: integer (u64)
- `files`: list<string> (daftar path absolut berkas identik)
- `created_at`: datetime

### DiskScanResult
Hasil analisis penggunaan direktori untuk treemap visualizer.
- `root_path`: string
- `total_bytes`: integer (u64)
- `folder_count`: integer
- `file_count`: integer
- `tree_node`: json (hierarchical node structure dengan name, size, children)
