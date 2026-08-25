---
type: srs
component: 'deduplication-engine'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
satisfies: ["FR-7"]
reviewed:
  date: ''
  sha: ''
  lenses: []
---

# SRS — deduplication-engine

## Decision Summary · [G3]
Komponen deduplikasi file dan analisis anomali disk menggunakan multi-stage hashing (size match -> 2KB partial hash -> full Blake3 hash) serta visualisasi treemap penggunaan ruang disk.

## Why · [G3]
Menemukan file duplikat, file berukuran besar, folder kosong, dan tautan rusak tanpa menghabiskan resource I/O secara sia-sia.

## Actors · [G3]
- **Pengguna Desktop**: Meninjau grup file duplikat dan visualisasi treemap disk.

## Use Case Catalogue · [G3]
- `UC-DEDUP-1`: Memindai dan memvisualisasikan treemap penggunaan disk (FR-7, critical: no)
- `UC-DEDUP-2`: Mencari dan menghapus file duplikat via multi-stage hash (FR-7, critical: no)
- `UC-DEDUP-3`: Menemukan file berukuran besar dan folder kosong (FR-7, critical: no)
