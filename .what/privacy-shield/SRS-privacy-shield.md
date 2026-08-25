---
type: srs
component: 'privacy-shield'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
satisfies: ["FR-14"]
reviewed:
  date: '2026-08-25'
  sha: '044dd2f85f55a79697bb9a4e25a41e8864da1af3'
  lenses: ["edge-case-hunter", "structure", "prose"]
---

# SRS — privacy-shield

## Decision Summary · [G3]
Komponen pengendali privasi dan telemetri sistem operasi dengan 30+ toggle pengaturan diagnostik, tracking, dan policy.

## Why · [G3]
Memberikan kendali penuh kepada pengguna untuk mematikan pengumpulan data telemetri dan iklan bawaan sistem operasi.

## Actor Register · [G3]
| Actor | Who they are | What they may do |
| --- | --- | --- |
| Pengguna Desktop | Pengguna akhir aplikasi | Meninjau dan mengubah kebijakan privasi OS |

## UC Catalogue · [G3]
| id | Use case | Actor | Satisfies | critical |
| --- | --- | --- | --- | --- |
| UC-13 | Membaca status kebijakan privasi dan telemetri OS saat ini | Pengguna Desktop | FR-14 | no |
| UC-14 | Mengubah dan menerapkan toggle privasi/telemetri secara individual atau batch | Pengguna Desktop | FR-14 | no |
| UC-15 | Mengembalikan konfigurasi privasi ke snapshot default bawaan | Pengguna Desktop | FR-14 | no |
