---
type: srs
component: 'system-tools'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
satisfies: ["FR-6", "FR-8", "FR-9", "FR-10", "FR-11", "FR-12", "FR-16"]
reviewed:
  date: '2026-08-25'
  sha: '044dd2f85f55a79697bb9a4e25a41e8864da1af3'
  lenses: ["edge-case-hunter", "structure", "prose"]
---

# SRS — system-tools

## Decision Summary · [G3]
Rangkaian perkakas pemeliharaan sistem yang mencakup Startup Manager, Windows Debloater, Driver Cleaner, Program Uninstaller tanpa residu, Service Manager, Software Updater terpadu, dan Performance Monitor real-time.

## Why · [G3]
Menyediakan utilitas terpadu untuk mengoptimalkan performa boot, membersihkan driver dan bloatware basi, serta memantau kesehatan hardware.

## Actor Register · [G3]
| Actor | Who they are | What they may do |
| --- | --- | --- |
| Pengguna Desktop | Pengguna akhir aplikasi | Mengelola autostart, layanan latar belakang, paket aplikasi, dan memantau hardware |

## UC Catalogue · [G3]
| id | Use case | Actor | Satisfies | critical |
| --- | --- | --- | --- | --- |
| UC-16 | Mengelola entri autostart program dan mengukur dampak boot | Pengguna Desktop | FR-6 | no |
| UC-17 | Menghapus bloatware dan paket OEM UWP bawaan secara batch | Pengguna Desktop | FR-8 | no |
| UC-18 | Memindai dan membersihkan paket driver kedaluwarsa di DriverStore | Pengguna Desktop | FR-9 | no |
| UC-19 | Meng-uninstall aplikasi dan membersihkan residu file/registry | Pengguna Desktop | FR-10 | no |
| UC-20 | Mengoptimalkan konfigurasi startup background services | Pengguna Desktop | FR-11 | no |
| UC-21 | Mendeteksi dan memperbarui paket software lintas package manager | Pengguna Desktop | FR-12 | no |
| UC-22 | Memantau metrik performa CPU, RAM, Disk I/O, Network, dan S.M.A.R.T. | Pengguna Desktop | FR-16 | no |
