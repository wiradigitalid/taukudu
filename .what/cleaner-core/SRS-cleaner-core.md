---
type: srs
component: 'cleaner-core'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
satisfies: ["FR-1", "FR-2", "FR-3", "FR-4", "FR-5", "FR-20"]
reviewed:
  date: '2026-08-25'
  sha: '044dd2f85f55a79697bb9a4e25a41e8864da1af3'
  lenses: ["edge-case-hunter", "structure", "prose"]
---

# SRS — cleaner-core

## Decision Summary · [G3]
Komponen cleaner-core adalah modul pembersih utama TauKudu yang mengeksekusi aturan pembersihan deklaratif pada berkas sementara sistem operasi, cache browser, sisa aplikasi pihak ketiga, cache shader game, dan registry Windows.

## Why · [G3]
Menyediakan fungsionalitas pembebasan ruang disk secara cepat, aman, dan dapat ditinjau sebelum eksekusi melalui parallel traversal engine.

## Actor Register · [G3]
| Actor | Who they are | What they may do |
| --- | --- | --- |
| Pengguna Desktop | Pengguna akhir aplikasi | Menjalankan pemindaian dan pembersihan via GUI |
| SysAdmin / Skrip CLI | Administrator sistem | Menjalankan pembersihan headlessly via terminal |

## UC Catalogue · [G3]
| id | Use case | Actor | Satisfies | critical |
| --- | --- | --- | --- | --- |
| UC-1 | Memindai dan membersihkan file temporary dan cache sistem | Pengguna Desktop | FR-1 | no |
| UC-2 | Membersihkan cache dan riwayat browser per profil | Pengguna Desktop | FR-2 | no |
| UC-3 | Membersihkan residu cache aplikasi pihak ketiga | Pengguna Desktop | FR-3 | no |
| UC-4 | Membersihkan cache shader gaming dan launcher | Pengguna Desktop | FR-4 | no |
| UC-5 | Memperbaiki dan membersihkan entri registry Windows yang tidak valid | Pengguna Desktop | FR-5 | no |
| UC-6 | Menjalankan One-Click Clean untuk kategori aman | Pengguna Desktop | FR-20 | no |
