---
type: srs
component: 'deduplication-engine'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
satisfies: ["FR-7"]
reviewed:
  date: '2026-08-25'
  sha: '044dd2f85f55a79697bb9a4e25a41e8864da1af3'
  lenses: ["edge-case-hunter", "structure", "prose"]
---

# SRS — deduplication-engine

## Decision Summary · [G3]
Komponen deduplikasi file dan analisis anomali disk menggunakan multi-stage hashing (size match -> 2KB partial hash -> full Blake3 hash) serta visualisasi treemap penggunaan ruang disk.

## Why · [G3]
Menemukan file duplikat, file berukuran besar, folder kosong, dan tautan rusak tanpa menghabiskan resource I/O secara sia-sia.

## Actor Register · [G3]
| Actor | Who they are | What they may do |
| --- | --- | --- |
| Pengguna Desktop | Pengguna akhir aplikasi | Meninjau grup file duplikat dan visualisasi treemap disk |

## UC Catalogue · [G3]
| id | Use case | Actor | Satisfies | critical |
| --- | --- | --- | --- | --- |
| UC-7 | Memindai dan memvisualisasikan treemap penggunaan disk | Pengguna Desktop | FR-7 | no |
| UC-8 | Mencari dan menghapus file duplikat via multi-stage hash | Pengguna Desktop | FR-7 | no |
| UC-9 | Menemukan file berukuran besar dan folder kosong | Pengguna Desktop | FR-7 | no |
