---
type: domain-model
component: 'system-tools'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
---

# Domain Model — system-tools

## Entities

### StartupItem
Aplikasi yang terdaftar untuk berjalan saat booting sistem.
- `id`: string
- `name`: string
- `command`: string
- `location`: enum(hkcu_run | hklm_run | startup_folder | task_scheduler)
- `is_enabled`: boolean
- `impact_rating`: enum(high | medium | low | none | not_measured)

### ServiceItem
Layanan latar belakang sistem operasi (Windows Service).
- `service_name`: string
- `display_name`: string
- `status`: enum(running | stopped | paused)
- `startup_type`: enum(automatic | manual | disabled)
- `recommendation`: enum(safe_to_disable | keep_default | optional)

### InstalledPackage
Paket aplikasi terinstal yang dapat dikelola atau di-uninstall.
- `id`: string
- `name`: string
- `publisher`: string
- `version`: string
- `install_date`: string
- `package_type`: enum(win32 | uwp_bloatware | winget | choco | scoop)
- `uninstall_string`: string

### DriverPackage
Paket driver perangkat pada OS DriverStore.
- `oem_name`: string
- `original_name`: string
- `provider`: string
- `class_name`: string
- `driver_version`: string
- `driver_date`: string
- `is_superseded`: boolean
