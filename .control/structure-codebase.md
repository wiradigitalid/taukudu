---
type: structure
scope: codebase
verified: '2026-08-25'
commit: '044dd2f85f55a79697bb9a4e25a41e8864da1af3'
---

# Codebase Structure

Dokumen ini memetakan struktur kontainer dan codebase taukudu sesuai registry `containers:`.

## Verified
2026-08-25 at 044dd2f

## Containers

### desktop-ui
Frontend desktop berbasis React 18, Tailwind CSS, Lucide Icons, dan Radix UI.
- `src/` — Komponen antarmuka, pages, stores, hooks, dan konfigurasi Tailwind.

### rust-engine
Core engine native Rust terintegrasi dengan Tauri v2.
- `src-tauri/` — Backend Tauri commands, traversal engine ripgrep, deduplikasi Czkawka, YARA-X scanner, dan Windows platform APIs.

### sqlite-store
Database SQLite lokal untuk penyimpanan riwayat pembersihan, log audit, dan preferensi aplikasi.
- Embedded file `taukudu.db` dikelola oleh `rusqlite`.
