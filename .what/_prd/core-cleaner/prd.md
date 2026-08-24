---
title: "Core Cleaner and Security Suite"
initiative: "core-cleaner"
created: "2026-08-23"
updated: "2026-08-23"
---

# PRD: Core Cleaner and Security Suite

## Revision History

| Date | What changed | Why | Releases affected |
|---|---|---|---|
| 2026-08-23 | Initial version defining core system cleaner, malware scanner, privacy shield, and performance tooling | Initial product requirements definition for v1.0 | v1.0 |

## 0. Document Purpose

This Product Requirements Document defines the core functionality for Kudu's desktop system cleaner and security scanner suite across Windows, macOS, and Linux. It serves product managers, engineers, and open-source contributors by establishing the functional requirements, user journeys, quality attributes, and boundary commitments for the application. All terms are aligned with `.control/product-glossary.md`.

## 1. Vision

Kudu is a free, transparent, open-source desktop application that empowers computer users to reclaim disk space, protect against malware, and maintain privacy without paying subscription fees or subjecting themselves to advertising and telemetry.

By combining deep system cleaning, YARA-based security scanning, and operating system privacy controls into a single unified desktop interface with a scriptable CLI, Kudu eliminates the need for multiple fragmented, proprietary utilities.

## 2. Target User

### 2.1 Jobs To Be Done
- **Reclaim Disk Space**: Free up gigabytes of storage consumed by caches, leftover files, crash dumps, and unneeded packages so storage never becomes an operational bottleneck.
- **Maintain Device Security**: Scan files and startup locations for malicious behavior and signature matches on demand without invasive background agents.
- **Protect Privacy**: Disable unwanted operating system diagnostic tracking, telemetry reporting, and advertising IDs with single-click toggles.
- **Optimize Performance**: Identify and manage startup bottlenecks, unneeded services, and orphaned registry items to maintain responsive boot and runtime performance.
- **Automate Maintenance**: Run headless cleanup scripts in server or automated developer workstation environments.

### 2.2 Non-Users (v1)
- Enterprise IT administrators requiring centralized multi-tenant fleet management dashboards and remote policy push.
- Users seeking real-time antivirus protection with kernel-level file system interception.
- Mobile device users (iOS/Android).

### 2.3 Key User Journeys

- **UJ-1. Alex frees up 15GB of disk space before a large game download.**
  - **Persona + context:** Alex is a software engineer and gamer whose secondary drive is nearing capacity.
  - **Entry state:** Desktop application opened on Windows 11 workstation.
  - **Path:** Alex clicks "One-Click Clean" from the overview dashboard. The engine runs a rapid scan across default-safe categories (temp, shader cache, browser cache). Alex reviews the itemized breakdown.
  - **Climax:** Alex clicks "Clean Now" and watches the space counter increment to 15.2GB freed in 45 seconds.
  - **Resolution:** Space is reclaimed immediately; session details are recorded to history.
  - **Edge case:** If an active browser is open, Kudu alerts Alex to close the browser or skip locked files without crashing.

- **UJ-2. Maria checks for malware after downloading an untrusted package.**
  - **Persona + context:** Maria is a privacy-conscious user who downloaded an executable from an unfamiliar mirror.
  - **Entry state:** Kudu open on macOS Sonoma.
  - **Path:** Maria selects the Security tab, clicks "Quick Malware Scan". The scanner analyzes running processes, autostart entries, and the Downloads directory against compiled YARA rules.
  - **Climax:** The scanner reports completion in under 30 seconds with zero threat detections and displays an audit summary.
  - **Resolution:** Maria proceeds with confidence.
  - **Edge case:** If a suspicious heuristic match is found, Kudu displays file location, rule match name, and quarantine/delete action buttons.

- **UJ-3. DevOps engineer automates weekly server cleanup via CLI.**
  - **Persona + context:** DevOps engineer managing a Linux headless build server.
  - **Entry state:** Terminal shell connected via SSH.
  - **Path:** The engineer executes `kudu clean --system --temp --quiet`.
  - **Climax:** Kudu cleans temporary files and build caches headlessly, returning exit code 0 with structured log output.
  - **Resolution:** Cron job completes reliably without GUI dependencies.

## 3. Glossary

- **Cleaner Rule** — A JSON file defining a specific cleaning target (e.g., browser cache, temp files), including paths to scan, files to delete, and platform applicability.
- **Cleaning Session** — A single execution of one or more cleaner rules that scans and/or removes files, producing a result record in the cleaning history.
- **Disk Treemap** — An interactive hierarchical visualization of disk space usage by folder and file size.
- **Heuristic Analysis** — Malware detection technique analyzing file behavior and characteristics rather than static signatures alone.
- **One-Click Clean** — An automated workflow that runs a predefined set of safe cleaner rules across all enabled categories in a single user action.
- **Privacy Shield** — A subsystem for toggling OS-level telemetry, tracking, and diagnostic data collection settings.
- **Restore Point** — A system snapshot created before cleaning operations to allow recovery in case of system instability.
- **Secure Delete** — A file deletion method that overwrites file contents with random data before unlinking from the filesystem.
- **Startup Impact** — A measured or estimated metric of how much a startup program delays system boot time.
- **YARA Rule** — A pattern-matching rule used by the malware scanner to identify malicious files by signature or behavior pattern.

## 4. Features

### 4.1 System Cleaning Engine
**Capability:** CAP-1 — serves BG-1.

**Description:** Cross-platform cleaner targeting temporary files, error reports, system logs, and application caches. Realizes UJ-1, UJ-3.

#### FR-1: System Temp and Cache Cleaner
Users can scan and delete temporary operating system files, logs, and system cache artifacts. Realizes UJ-1.
- **Proof of done:** User selects System Cleaner, runs scan, sees categorized file list with reclaimable size, clicks clean, and verified files are removed.

### 4.2 Browser Cleaning
**Capability:** CAP-2 — serves BG-1.

**Description:** Cleans caches, cookies, session history, and download logs across all major web browsers. Realizes UJ-1.

#### FR-2: Browser Cache Purge
Users can selectively scan and clear browser data per installed browser. Realizes UJ-1.
- **Proof of done:** User selects Browser Cleaner for Chrome/Firefox/Safari/Edge, runs scan, sees itemized cache sizes, clicks clean, and browser caches are purged.

### 4.3 Application Cleaning
**Capability:** CAP-3 — serves BG-1.

**Description:** Scans and purges leftover application caches, logs, and temporary working data for third-party desktop applications. Realizes UJ-1.

#### FR-3: Application Cache Cleaner
Users can scan and remove residual data left by third-party desktop applications. Realizes UJ-1.
- **Proof of done:** User selects App Cleaner, runs scan, sees detected third-party app caches/logs, clicks clean, and target files are removed.

### 4.4 Gaming Cleaner
**Capability:** CAP-4 — serves BG-1.

**Description:** Reclaims space consumed by gaming client caches, shader compilation caches, and unneeded crash dumps. Realizes UJ-1.

#### FR-4: Game Shader and Launcher Cache Purge
Users can clean shader caches and launcher temporary files for Steam, Epic Games, and DirectX. Realizes UJ-1.
- **Proof of done:** User selects Gaming Cleaner, scans Steam/Epic/DirectX shader caches, sees reclaimable space, clicks clean, and shader caches are deleted.

### 4.5 Registry Cleaner
**Capability:** CAP-5 — serves BG-1.

**Description:** Scans Windows registry for missing shared DLLs, unused file extensions, and orphaned installer references. Realizes UJ-1.

#### FR-5: Windows Registry Fixer
Windows users can identify and repair orphaned registry keys with safety backups. Realizes UJ-1.
- **Proof of done:** User selects Registry Cleaner on Windows, scans for orphaned entries, sees itemized list with issue descriptions, clicks fix, and invalid entries are removed.

### 4.6 Startup Manager
**Capability:** CAP-6 — serves BG-1.

**Description:** Enumerates all applications configured to launch on boot and provides impact ratings and toggle controls. Realizes UJ-1.

#### FR-6: Startup Program Management
Users can inspect autostart entries with measured boot impact ratings and disable unneeded items. Realizes UJ-1.
- **Proof of done:** User opens Startup Manager, views all autostart programs with measured boot impact ratings, toggles any program on/off, and state persists.

### 4.7 Disk Analyzer
**Capability:** CAP-7 — serves BG-1.

**Description:** Interactive hierarchical treemap displaying visual breakdown of storage usage across selected drives. Realizes UJ-1.

#### FR-7: Interactive Disk Treemap Visualization
Users can explore disk storage distribution interactively by drive and folder depth. Realizes UJ-1.
- **Proof of done:** User opens Disk Analyzer, selects a drive, views hierarchical treemap of space usage, clicks into folders to zoom, and can open items in file explorer.

### 4.8 Debloater
**Capability:** CAP-8 — serves BG-1.

**Description:** Identifies and uninstalls pre-installed OEM and system bloatware packages on Windows. Realizes UJ-1.

#### FR-8: Windows Bloatware Removal
Windows users can safely remove pre-installed bloatware packages in bulk. Realizes UJ-1.
- **Proof of done:** User selects Debloater on Windows, sees list of pre-installed UWP/system apps with safe-to-remove tags, selects items, and uninstalls them in batch.

### 4.9 Driver Cleanup
**Capability:** CAP-9 — serves BG-1.

**Description:** Identifies stale and superseded device driver packages stored in the OS driver store. Realizes UJ-1.

#### FR-9: Stale Driver Store Purge
Users can scan and remove obsolete driver packages to reclaim disk space. Realizes UJ-1.
- **Proof of done:** User selects Driver Manager, scans for outdated driver packages in DriverStore, selects stale packages, and removes them.

### 4.10 Program Uninstaller
**Capability:** CAP-10 — serves BG-1.

**Description:** Executes application uninstallers and performs secondary scans for orphaned files and registry artifacts. Realizes UJ-1.

#### FR-10: Residual-Free Software Uninstaller
Users can uninstall desktop software and automatically purge associated leftover data. Realizes UJ-1.
- **Proof of done:** User selects Program Uninstaller, chooses an installed app, runs uninstall, and app automatically scans for and removes leftover files/keys.

### 4.11 Service Manager
**Capability:** CAP-11 — serves BG-1.

**Description:** Displays Windows background services with safe optimization recommendations. Realizes UJ-1.

#### FR-11: Background Service Optimization
Windows users can review service configurations and apply safe startup state adjustments. Realizes UJ-1.
- **Proof of done:** User opens Service Manager, views services with recommendations (safe to disable / manual / automatic), and applies recommended optimizations.

### 4.12 Software Updater
**Capability:** CAP-12 — serves BG-1.

**Description:** Aggregates package updates across system package managers (winget, Chocolatey, Scoop, npm). Realizes UJ-1.

#### FR-12: Multi-Package Manager Bulk Updater
Users can detect and update outdated desktop software packages across multiple package managers in one view. Realizes UJ-1.
- **Proof of done:** User opens Software Updater, sees list of outdated packages across winget/Chocolatey/Scoop/npm, clicks update all, and packages are updated.

### 4.13 Malware Scanner
**Capability:** CAP-13 — serves BG-2.

**Description:** On-demand malware scanner matching files against YARA signature rules and heuristic indicators. Realizes UJ-2.

#### FR-13: On-Demand Malware and Heuristic Scan
Users can perform quick or full malware scans against files, memory, and persistence locations. Realizes UJ-2.
- **Proof of done:** User initiates Malware Scan (quick or full), scanner evaluates files against YARA rules and heuristic signatures, and displays detected threats with quarantine/delete options.

### 4.14 Privacy Shield
**Capability:** CAP-14 — serves BG-3.

**Description:** Centralized control center for 30+ Windows privacy, telemetry, advertising ID, and diagnostic data settings. Realizes UJ-2.

#### FR-14: OS Privacy and Telemetry Controls
Users can inspect and toggle operating system telemetry and tracking switches. Realizes UJ-2.
- **Proof of done:** User opens Privacy Shield, views 30+ privacy settings organized by category with descriptions, toggles settings, and system policies are updated accordingly.

### 4.15 Secure Delete
**Capability:** CAP-15 — serves BG-1.

**Description:** Overwrites file contents with multi-pass random data prior to deletion to prevent data recovery. Realizes UJ-2.

#### FR-15: Secure Multi-Pass File Shredder
Users can destroy sensitive files with cryptographic overwrite passes prior to filesystem unlinking. Realizes UJ-2.
- **Proof of done:** User drags files to Secure Delete or enables secure deletion mode, files are overwritten with random passes before filesystem unlinking, and space is unrecoverable.

### 4.16 Performance Monitor
**Capability:** CAP-16 — serves BG-1.

**Description:** Real-time hardware and resource utilization dashboards with disk health reporting. Realizes UJ-1.

#### FR-16: Real-Time Hardware Performance and Health Dashboard
Users can monitor live CPU, memory, disk I/O, network bandwidth, and drive S.M.A.R.T. health metrics. Realizes UJ-1.
- **Proof of done:** User opens Performance Monitor, sees live CPU/memory/disk/network utilization graphs, per-core metrics, and disk S.M.A.R.T. health status.

### 4.17 System Restore Points
**Capability:** CAP-17 — serves BG-1.

**Description:** Integrates with system restore mechanisms to create checkpoints before destructive actions. Realizes UJ-1.

#### FR-17: Pre-Cleaning System Checkpoints
System creates restore points before major cleaning runs when supported by the OS. Realizes UJ-1.
- **Proof of done:** System automatically creates a Windows Restore Point before executing destructive cleaning operations when enabled, or user manually triggers one.

### 4.18 Cleaning History
**Capability:** CAP-18 — serves BG-1.

**Description:** Persistent audit log of all completed cleaning and scanning sessions with space reclaimed metrics. Realizes UJ-1, UJ-3.

#### FR-18: Session Audit and Reclaimed Space Log
Users can review a historical log of all cleaning sessions, dates, rules run, and total space freed. Realizes UJ-1.
- **Proof of done:** User navigates to History tab, views paginated list of past cleaning sessions with timestamps, categories cleaned, and total bytes reclaimed.

### 4.19 Scheduled Scans
**Capability:** CAP-19 — serves BG-1.

**Description:** Configurable background scheduler for periodic automated cleaning and scanning runs. Realizes UJ-1.

#### FR-19: Automated Scheduled Scans
Users can schedule daily, weekly, or monthly automatic scans with custom rule sets. Realizes UJ-1.
- **Proof of done:** User sets a cleaning schedule (daily/weekly/monthly) with selected categories, and system performs automated scans at designated intervals.

### 4.20 One-Click Clean
**Capability:** CAP-20 — serves BG-1.

**Description:** Unified quick-action workflow executing safe default cleaning rules across all categories. Realizes UJ-1.

#### FR-20: Rapid One-Click Maintenance Workflow
Users can scan and clean all safe default targets in a single coordinated action. Realizes UJ-1.
- **Proof of done:** User clicks One-Click Clean from dashboard, app scans all default-safe categories, displays summary of found items, and cleans upon confirmation.

### 4.21 CLI Mode
**Capability:** CAP-21 — serves BG-5.

**Description:** Scriptable command-line interface supporting all core scan and clean operations without GUI overhead. Realizes UJ-3.

#### FR-21: Scriptable Headless Command-Line Interface
Users can invoke scans, cleaning operations, and reporting from terminal scripts headlessly. Realizes UJ-3.
- **Proof of done:** User runs `kudu clean --all` or `kudu scan` from terminal, CLI outputs structured progress and summary, and returns exit code 0 on success.

### 4.22 Multi-Language Support
**Capability:** CAP-22 — serves BG-4.

**Description:** Comprehensive internationalization supporting 30+ languages dynamically. Realizes UJ-1, UJ-2.

#### FR-22: Dynamic Multi-Language Localization
Users can switch application language across 30 supported locales with instantaneous interface re-rendering. Realizes UJ-1.
- **Proof of done:** User selects language from settings dropdown, entire UI re-renders in chosen language immediately without app restart.

### 4.23 Auto-Updater
**Capability:** CAP-23 — serves BG-1.

**Description:** Background version check and seamless update application via GitHub releases. Realizes UJ-1, UJ-2.

#### FR-23: Background Update Checker and Installer
App checks for newer releases and guides user through seamless in-place updates. Realizes UJ-1.
- **Proof of done:** App checks for new GitHub releases on launch, notifies user when update is available, downloads in background, and prompts to restart and apply.

## 5. Non-Goals (Explicit)

- **No Mobile Support:** Kudu will not develop iOS or Android companion apps in v1.
- **No Mandatory Cloud Dependencies:** Core cleaning and scanning will never require cloud accounts or network connectivity.
- **No Background Antivirus Engine:** Kudu is an on-demand scanner and cleaner, not a real-time kernel-resident AV suite.
- **No Monetization or Paid Tiers:** Kudu will not gate features behind commercial licenses or in-app purchases.

## 6. MVP Scope

### 6.1 In Scope
- Core cleaners (System, Browser, App, Gaming, Registry)
- YARA-based malware scanning engine
- Privacy Shield (30+ Windows privacy toggles)
- Startup Manager, Disk Analyzer, Debloater, Driver Manager
- Performance Monitor and Cleaning History
- Headless CLI mode for all core actions
- 30-language localization support
- Seamless automatic updater

### 6.2 Out of Scope for MVP
- Cloud-synced rule profiles across multiple personal devices (deferred to v2)
- Custom community rule marketplace inside the desktop client (rules remain GitHub-driven in v1)
- Deep memory dump malware forensics

## 7. Success Metrics

**Primary**
- **SM-1**: 100k+ monthly active desktop sessions within 6 months of v1.0 release. Validates FR-1 through FR-23.
- **SM-2**: Average reclaimed storage per one-click clean session > 2.5 GB. Validates FR-1, FR-2, FR-3, FR-4, FR-20.

**Secondary**
- **SM-3**: Less than 0.1% false-positive rule deletion reports in community issue tracker. Validates FR-1, FR-2, FR-3, FR-5.

**Counter-metrics (do not optimize)**
- **SM-C1**: Total bytes deleted must not be maximized by including risky or user-sensitive file directories. Counterbalances SM-2.

## 8. Open Questions

1. Which code-signing authority will sponsor Windows SmartScreen EV certificates for open-source builds?
2. What is the optimal refresh frequency for bundled YARA malware definition updates?

## 9. Assumptions Index

- **§1**: Users will review scan results and accept personal responsibility as specified in the open-source disclaimer.
- **§4.13**: Community-curated YARA rules combined with heuristic scanning provide meaningful malware detection without kernel hooks.
- **§4.21**: Headless CLI mode operates with zero display server dependencies on Linux.

---

## Adapt-In Clusters

### Cross-Cutting NFRs

- **NFR-1**: Quick scan completes within 30 seconds on standard SSD systems.
  - *Goal:* BG-1
  - *Enforced by:* Performance benchmarking test suite running against standard 10GB test corpus.
- **NFR-2**: UI thread remains responsive (>= 30 fps) during background scans and disk analysis.
  - *Goal:* BG-1
  - *Enforced by:* Electron IPC worker thread architecture separating UI from scan engine.
- **NFR-3**: Zero telemetry or usage data collected or transmitted without explicit user opt-in.
  - *Goal:* BG-3
  - *Enforced by:* Network request audit in CI blocking unauthorized outbound connections.
- **NFR-4**: Memory footprint remains under 150MB during idle system monitoring.
  - *Goal:* BG-1
  - *Enforced by:* Memory budget assertions in automated performance tests.
- **NFR-5**: All cleaner rules validated against JSON schema in continuous integration.
  - *Goal:* BG-1
  - *Enforced by:* `npm run validate:rules` script blocking PR merge on schema violations.

### Constraints and Guardrails

- **Constraints (delta beyond brief):** None beyond the brief. All cleaning rules must strictly conform to JSON schema definitions without embedded executable scripts.
- **Privacy Guardrail:** No scanning operation may inspect the contents of non-cache personal document directories (Documents, Pictures, Desktop) without explicit user-initiated custom selection.
- **Safety Guardrail:** Any cleaner rule targeting system files or registry entries must require explicit confirmation or have a safe restore fallback.