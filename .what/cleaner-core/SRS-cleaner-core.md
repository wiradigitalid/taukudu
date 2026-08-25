---
type: srs
component: 'cleaner-core'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
satisfies: ["FR-1", "FR-2", "FR-3", "FR-4", "FR-5", "FR-20"]
reviewed:
  date: ''
  sha: ''
  lenses: []
---

# SRS — cleaner-core

## Decision Summary · [G3]
Komponen cleaner-core adalah modul pembersih utama TauKudu yang mengeksekusi aturan pembersihan deklaratif pada berkas sementara sistem operasi, cache browser, sisa aplikasi pihak ketiga, cache shader game, dan registry Windows.

## Why · [G3]
Menyediakan fungsionalitas pembebasan ruang disk secara cepat, aman, dan dapat ditinjau sebelum eksekusi melalui parallel traversal engine.

## Actors · [G3]
- **Pengguna Desktop**: Menjalankan pemindaian dan pembersihan melalui UI.
- **SysAdmin / Skrip CLI**: Menjalankan pembersihan headlessly via terminal.

## Use Case Catalogue · [G3]
- `UC-CLEAN-1`: Memindai dan membersihkan file temporary dan cache sistem (FR-1, critical: no)
- `UC-CLEAN-2`: Membersihkan cache dan riwayat browser per profil (FR-2, critical: no)
- `UC-CLEAN-3`: Membersihkan residu cache aplikasi pihak ketiga (FR-3, critical: no)
- `UC-CLEAN-4`: Membersihkan cache shader gaming dan launcher (FR-4, critical: no)
- `UC-CLEAN-5`: Memperbaiki dan membersihkan entri registry Windows yang tidak valid (FR-5, critical: no)
- `UC-CLEAN-6`: Menjalankan One-Click Clean untuk kategori aman (FR-20, critical: no)
