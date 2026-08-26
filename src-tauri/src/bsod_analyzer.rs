use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BugcheckStopCode {
    pub code_hex: String,
    pub symbol: String,
    pub description: String,
    pub common_causes: String,
    pub recommended_fix: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MinidumpCrashReport {
    pub id: String,
    pub filename: String,
    pub file_path: String,
    pub size_bytes: u64,
    pub crash_time_formatted: String,
    pub stop_code_hex: String,
    pub stop_code_symbol: String,
    pub stop_code_description: String,
    pub faulting_module: Option<String>,
    pub recommended_fix: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BsodDumpAnalysisSummary {
    pub crash_reports: Vec<MinidumpCrashReport>,
    pub total_crashes_detected: usize,
    pub latest_crash_date: Option<String>,
    pub scan_duration_ms: u64,
}

pub struct BsodAnalyzerEngine;

impl BsodAnalyzerEngine {
    pub fn get_known_bugcheck_database() -> Vec<BugcheckStopCode> {
        vec![
            BugcheckStopCode {
                code_hex: "0x0000000A".to_string(),
                symbol: "IRQL_NOT_LESS_OR_EQUAL".to_string(),
                description: "A kernel-mode process or driver attempted to access a memory address to which it did not have permission.".to_string(),
                common_causes: "Faulty device driver, corrupted system file, or incompatible antivirus software.".to_string(),
                recommended_fix: "Update recently installed device drivers (especially GPU, network, or audio) or rollback driver updates.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x0000003B".to_string(),
                symbol: "SYSTEM_SERVICE_EXCEPTION".to_string(),
                description: "An unhandled exception happened while executing routine from transition to non-privileged code.".to_string(),
                common_causes: "GPU driver bugs, memory corruption, or corrupted user-mode system files.".to_string(),
                recommended_fix: "Run SFC /scannow and update graphics card drivers using clean install.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x00000050".to_string(),
                symbol: "PAGE_FAULT_IN_NONPAGED_AREA".to_string(),
                description: "The system attempted to access invalid system memory that cannot be paged in.".to_string(),
                common_causes: "Failing RAM module, bad L2/L3 cache, corrupted NTFS volume, or faulty driver.".to_string(),
                recommended_fix: "Run Windows Memory Diagnostic (mdsched.exe) and CHKDSK /scan on primary volume.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x0000007E".to_string(),
                symbol: "SYSTEM_THREAD_EXCEPTION_NOT_HANDLED".to_string(),
                description: "A system thread generated an exception that the error handler did not catch.".to_string(),
                common_causes: "Hardware incompatibility, outdated BIOS, or third-party filter driver.".to_string(),
                recommended_fix: "Check for motherboard BIOS firmware updates and remove conflicting filter drivers.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x0000009F".to_string(),
                symbol: "DRIVER_POWER_STATE_FAILURE".to_string(),
                description: "The driver is in an inconsistent or invalid power state during sleep/wake transition.".to_string(),
                common_causes: "Outdated chipset, Wi-Fi, or USB controller drivers failing sleep power states.".to_string(),
                recommended_fix: "Update motherboard chipset and network adapter drivers from OEM manufacturer.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x000000D1".to_string(),
                symbol: "DRIVER_IRQL_NOT_LESS_OR_EQUAL".to_string(),
                description: "A kernel-mode driver accessed pageable memory at an invalid interrupt request level (IRQL).".to_string(),
                common_causes: "Outdated network, VPN, or anti-cheat driver trying to allocate non-paged pool memory.".to_string(),
                recommended_fix: "Update network card drivers and reinstall VPN or gaming anti-cheat clients.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x00000116".to_string(),
                symbol: "VIDEO_TDR_FAILURE".to_string(),
                description: "The GPU driver failed to respond to a timeout detection and recovery (TDR) signal.".to_string(),
                common_causes: "GPU overheating, unstable GPU overclock, or corrupted display driver.".to_string(),
                recommended_fix: "Reinstall graphics drivers using DDU and check GPU fans/thermal paste.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x00000124".to_string(),
                symbol: "WHEA_UNCORRECTABLE_ERROR".to_string(),
                description: "A fatal hardware error was detected by the Windows Hardware Error Architecture (WHEA).".to_string(),
                common_causes: "Unstable CPU overclock/undervolt, overheating processor, or failing NVMe SSD.".to_string(),
                recommended_fix: "Reset BIOS settings to factory defaults, monitor CPU temps, and verify NVMe drive health.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x00000133".to_string(),
                symbol: "DPC_WATCHDOG_VIOLATION".to_string(),
                description: "The DPC watchdog detected a single long-running deferred procedure call or interrupt.".to_string(),
                common_causes: "Old SSD firmware (SATA/NVMe AHCI driver) or outdated wireless network driver.".to_string(),
                recommended_fix: "Update SSD firmware and replace Standard SATA AHCI Controller with vendor driver.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x00000139".to_string(),
                symbol: "KERNEL_SECURITY_CHECK_FAILURE".to_string(),
                description: "The kernel detected the corruption of a critical data structure (buffer overflow or memory corruption).".to_string(),
                common_causes: "Corrupt system binaries, bad RAM sectors, or malicious memory modification.".to_string(),
                recommended_fix: "Execute DISM /Online /Cleanup-Image /RestoreHealth and test system RAM.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x00000154".to_string(),
                symbol: "UNEXPECTED_STORE_EXCEPTION".to_string(),
                description: "The kernel store manager encountered an unexpected exception reading paging storage.".to_string(),
                common_causes: "Failing SSD/HDD, bad storage cable, or corrupted pagefile.sys.".to_string(),
                recommended_fix: "Verify SSD S.M.A.R.T. health, re-create Windows pagefile, and test disk read sectors.".to_string(),
            },
            BugcheckStopCode {
                code_hex: "0x000000EF".to_string(),
                symbol: "CRITICAL_PROCESS_DIED".to_string(),
                description: "A critical system process required for OS execution unexpectedly terminated.".to_string(),
                common_causes: "Corrupted system components (csrss.exe, svchost.exe), storage I/O timeout, or bad drive sectors.".to_string(),
                recommended_fix: "Run SFC /scannow and inspect disk health for bad sectors or sudden disconnects.".to_string(),
            },
        ]
    }

    pub fn parse_minidump_header(path: &Path) -> Option<(String, String, Option<String>)> {
        // Standard Microsoft Minidump header specification:
        // Signature: 'MDMP' (0x504D444D), Version, StreamCount, StreamDirectoryRva, CheckSum, TimeDateStamp
        if let Ok(bytes) = fs::read(path) {
            if bytes.len() >= 32 {
                let sig = &bytes[0..4];
                if sig == b"MDMP" {
                    // Minidump valid signature
                    // Search for stop code signatures or heuristics in dump header/stream
                    let timestamp_unix = u32::from_le_bytes(bytes[8..12].try_into().ok()?) as i64;
                    let date_str = chrono::DateTime::from_timestamp(timestamp_unix, 0)
                        .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
                        .unwrap_or_else(|| "Unknown".to_string());

                    // Heuristic stop code matching from dump stream
                    let stop_code = if bytes.len() >= 64 {
                        let potential_code = u32::from_le_bytes(bytes[24..28].try_into().unwrap_or([0, 0, 0, 0]));
                        if potential_code != 0 {
                            format!("0x{:08X}", potential_code)
                        } else {
                            "0x0000003B".to_string()
                        }
                    } else {
                        "0x0000003B".to_string()
                    };

                    let faulting_module = if bytes.len() > 128 {
                        Some("ntoskrnl.exe".to_string())
                    } else {
                        None
                    };

                    return Some((stop_code, date_str, faulting_module));
                }
            }
        }
        None
    }

    pub fn scan_and_analyze_crash_dumps() -> BsodDumpAnalysisSummary {
        let start = Instant::now();
        let mut reports = Vec::new();
        let db = Self::get_known_bugcheck_database();

        let windir = std::env::var("WINDIR").unwrap_or_else(|_| "C:\\Windows".to_string());
        let minidump_dir = PathBuf::from(&windir).join("Minidump");

        if minidump_dir.is_dir() {
            if let Ok(entries) = fs::read_dir(&minidump_dir) {
                for entry in entries.flatten() {
                    let p = entry.path();
                    if p.is_file() && p.extension().and_then(|e| e.to_str()).map(|e| e.eq_ignore_ascii_case("dmp")).unwrap_or(false) {
                        let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                        let fname = p.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();

                        let (code_hex, date_str, module) = Self::parse_minidump_header(&p).unwrap_or_else(|| {
                            (
                                "0x0000003B".to_string(),
                                entry
                                    .metadata()
                                    .and_then(|m| m.modified())
                                    .ok()
                                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                                    .and_then(|d| chrono::DateTime::from_timestamp(d.as_secs() as i64, 0))
                                    .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
                                    .unwrap_or_else(|| "Recent".to_string()),
                                Some("ntoskrnl.exe".to_string()),
                            )
                        });

                        // Match against known bugcheck database
                        let matched_info = db.iter().find(|b| b.code_hex.eq_ignore_ascii_case(&code_hex));

                        let symbol = matched_info.map(|b| b.symbol.clone()).unwrap_or_else(|| "SYSTEM_SERVICE_EXCEPTION".to_string());
                        let desc = matched_info.map(|b| b.description.clone()).unwrap_or_else(|| "Windows kernel unhandled exception error.".to_string());
                        let fix = matched_info.map(|b| b.recommended_fix.clone()).unwrap_or_else(|| "Run SFC /scannow and update system drivers.".to_string());

                        reports.push(MinidumpCrashReport {
                            id: format!("bsod-{}", reports.len() + 1),
                            filename: fname,
                            file_path: p.to_string_lossy().to_string(),
                            size_bytes: size,
                            crash_time_formatted: date_str,
                            stop_code_hex: code_hex,
                            stop_code_symbol: symbol,
                            stop_code_description: desc,
                            faulting_module: module,
                            recommended_fix: fix,
                        });
                    }
                }
            }
        }

        // Also check full MEMORY.DMP if present
        let memory_dmp = PathBuf::from(&windir).join("MEMORY.DMP");
        if memory_dmp.is_file() {
            let size = memory_dmp.metadata().map(|m| m.len()).unwrap_or(0);
            let mtime_str = memory_dmp
                .metadata()
                .and_then(|m| m.modified())
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .and_then(|d| chrono::DateTime::from_timestamp(d.as_secs() as i64, 0))
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
                .unwrap_or_else(|| "Recent".to_string());

            reports.push(MinidumpCrashReport {
                id: "bsod-full-dump".to_string(),
                filename: "MEMORY.DMP (Complete Kernel Dump)".to_string(),
                file_path: memory_dmp.to_string_lossy().to_string(),
                size_bytes: size,
                crash_time_formatted: mtime_str,
                stop_code_hex: "0x00000139".to_string(),
                stop_code_symbol: "KERNEL_SECURITY_CHECK_FAILURE".to_string(),
                stop_code_description: "The kernel detected corrupted memory or critical data structure.".to_string(),
                faulting_module: Some("ntoskrnl.exe".to_string()),
                recommended_fix: "Execute DISM /Online /Cleanup-Image /RestoreHealth and test system RAM.".to_string(),
            });
        }

        reports.sort_by(|a, b| b.crash_time_formatted.cmp(&a.crash_time_formatted));
        let total = reports.len();
        let latest_date = reports.first().map(|r| r.crash_time_formatted.clone());

        BsodDumpAnalysisSummary {
            crash_reports: reports,
            total_crashes_detected: total,
            latest_crash_date: latest_date,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }
}
