---
type: srs
component: 'privacy-shield'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
satisfies: ["FR-14"]
reviewed:
  date: ''
  sha: ''
  lenses: []
---

# SRS — privacy-shield

## Decision Summary · [G3]
Komponen pengendali privasi dan telemetri sistem operasi dengan 30+ toggle pengaturan diagnostik, tracking, dan policy.

## Why · [G3]
Memberikan kendali penuh kepada pengguna untuk mematikan pengumpulan data telemetri dan iklan bawaan sistem operasi.

## Actors · [G3]
- **Pengguna Desktop**: Meninjau dan mengubah kebijakan privasi OS.

## Use Case Catalogue · [G3]
- `UC-PRIV-1`: Membaca status kebijakan privasi dan telemetri OS saat ini (FR-14, critical: no)
- `UC-PRIV-2`: Mengubah dan menerapkan toggle privasi/telemetri secara individual atau batch (FR-14, critical: no)
- `UC-PRIV-3`: Mengembalikan konfigurasi privasi ke snapshot default bawaan (FR-14, critical: no)
