# Design System — TauKudu

Dokumen ini mendefinisikan panduan antarmuka, tema, dan design token TauKudu yang di-porting 1:1 dari `kudu`.

---

## 1. Color Palette & Theming

- **Dark Theme (Default):**
  - Background Base: `#0B0F19` (Deep Navy Black)
  - Card / Panel Surface: `#111827` (Gray 900)
  - Border Color: `#1F2937` (Gray 800)
  - Primary Accent: `#3B82F6` (Blue 500) / `#6366F1` (Indigo 500)
  - Text Primary: `#F9FAFB` (Gray 50)
  - Text Secondary: `#9CA3AF` (Gray 400)
  - Success / Safe: `#10B981` (Emerald 500)
  - Warning: `#F59E0B` (Amber 500)
  - Danger / Threat: `#EF4444` (Red 500)

---

## 2. Typography

- **Font Family:** Inter, system-ui, -apple-system, sans-serif.
- **Monospace:** JetBrains Mono, Fira Code, monospace (untuk log, YARA output, dan CLI path display).

---

## 3. Component Hierarchy

- **Layout Structure:**
  - `SidebarNavigation`: Navigasi kiri persisten memuat 6 grup utama (Dashboard, Cleaners, Duplicate & Disk, Security & Privacy, System Tools, Settings).
  - `HeaderBar`: Menampilkan judul halaman, status elevasi admin, dan tombol aksi cepat.
  - `MainContent`: Area kerja halaman aktif yang responsif.
  - `StatusBar`: Menampilkan background job status, free memory, dan total disk usage.
