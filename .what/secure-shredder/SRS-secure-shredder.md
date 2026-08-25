---
type: srs
component: 'secure-shredder'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
satisfies: ["FR-15"]
reviewed:
  date: '2026-08-25'
  sha: '044dd2f85f55a79697bb9a4e25a41e8864da1af3'
  lenses: ["edge-case-hunter", "structure", "prose"]
---

# SRS — secure-shredder

## Decision Summary · [G3]
Komponen penghancur file kriptografis multi-pass (DoD 5220.22-M / Random) untuk mencegah pemulihan data sebelum file di-unlink dari filesystem.

## Why · [G3]
Memastikan penghapusan data sensitif dilakukan secara permanen tanpa kemungkinan data recovery.

## Actor Register · [G3]
| Actor | Who they are | What they may do |
| --- | --- | --- |
| Pengguna Desktop | Pengguna akhir aplikasi | Memilih file/folder untuk dihancurkan secara permanen |

## UC Catalogue · [G3]
| id | Use case | Actor | Satisfies | critical |
| --- | --- | --- | --- | --- |
| UC-23 | Menghancurkan file/folder dengan multi-pass cryptographic overwrite | Pengguna Desktop | FR-15 | yes |
