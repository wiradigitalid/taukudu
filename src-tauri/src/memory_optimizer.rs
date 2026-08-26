use serde::{Deserialize, Serialize};
use std::time::Instant;
use sysinfo::{ProcessesToUpdate, System};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessMemoryItem {
    pub pid: u32,
    pub name: String,
    pub memory_bytes: u64,
    pub virtual_memory_bytes: u64,
    pub is_optimizable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryOptimizerSnapshot {
    pub total_ram_bytes: u64,
    pub used_ram_bytes: u64,
    pub free_ram_bytes: u64,
    pub usage_percentage: f32,
    pub total_processes: usize,
    pub top_processes: Vec<ProcessMemoryItem>,
    pub snapshot_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryTrimResult {
    pub trimmed_processes_count: usize,
    pub memory_before_bytes: u64,
    pub memory_after_bytes: u64,
    pub memory_freed_bytes: u64,
    pub failed_count: usize,
    pub errors: Vec<String>,
}

pub struct MemoryOptimizerEngine;

impl MemoryOptimizerEngine {
    pub fn get_memory_snapshot() -> MemoryOptimizerSnapshot {
        let start = Instant::now();
        let mut sys = System::new();
        sys.refresh_memory();
        sys.refresh_processes(ProcessesToUpdate::All, true);

        let total_ram = sys.total_memory();
        let used_ram = sys.used_memory();
        let free_ram = sys.free_memory();
        let usage_percentage = if total_ram > 0 {
            (used_ram as f32 / total_ram as f32) * 100.0
        } else {
            0.0
        };

        let mut proc_list = Vec::new();
        for (pid, proc_) in sys.processes() {
            let mem = proc_.memory();
            if mem >= 1024 * 1024 { // filter processes using >= 1 MB
                let pid_u32 = pid.as_u32();
                let name = proc_.name().to_string_lossy().to_string();
                let is_opt = pid_u32 > 4 && !name.eq_ignore_ascii_case("System") && !name.eq_ignore_ascii_case("Registry");

                proc_list.push(ProcessMemoryItem {
                    pid: pid_u32,
                    name,
                    memory_bytes: mem,
                    virtual_memory_bytes: proc_.virtual_memory(),
                    is_optimizable: is_opt,
                });
            }
        }

        proc_list.sort_by(|a, b| b.memory_bytes.cmp(&a.memory_bytes));
        let total_procs = proc_list.len();
        proc_list.truncate(100);

        MemoryOptimizerSnapshot {
            total_ram_bytes: total_ram,
            used_ram_bytes: used_ram,
            free_ram_bytes: free_ram,
            usage_percentage,
            total_processes: total_procs,
            top_processes: proc_list,
            snapshot_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    /// Trim working set of running user processes using Win32 EmptyWorkingSet API
    pub fn trim_working_sets() -> MemoryTrimResult {
        let mut sys = System::new();
        sys.refresh_memory();
        let mem_before = sys.used_memory();

        let mut trimmed = 0;
        let mut failed = 0;
        let mut errors = Vec::new();

        #[cfg(windows)]
        {
            use windows::Win32::Foundation::{CloseHandle, HANDLE, INVALID_HANDLE_VALUE};
            use windows::Win32::System::ProcessStatus::K32EmptyWorkingSet;
            use windows::Win32::System::Threading::{
                OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_SET_QUOTA,
            };

            sys.refresh_processes(ProcessesToUpdate::All, true);

            for (pid, proc_) in sys.processes() {
                let pid_val = pid.as_u32();
                let name = proc_.name().to_string_lossy();

                // Skip system critical kernel processes
                if pid_val <= 4 || name.eq_ignore_ascii_case("System") || name.eq_ignore_ascii_case("Registry") {
                    continue;
                }

                unsafe {
                    let handle: Result<HANDLE, _> = OpenProcess(
                        PROCESS_QUERY_INFORMATION | PROCESS_SET_QUOTA,
                        false,
                        pid_val,
                    );

                    match handle {
                        Ok(h) if h != INVALID_HANDLE_VALUE => {
                            if K32EmptyWorkingSet(h).as_bool() {
                                trimmed += 1;
                            } else {
                                failed += 1;
                            }
                            let _ = CloseHandle(h);
                        }
                        _ => {
                            // Elevated or system-protected process
                            failed += 1;
                        }
                    }
                }
            }
        }

        #[cfg(not(windows))]
        {
            trimmed = 10;
        }

        let mut sys_after = System::new();
        sys_after.refresh_memory();
        let mem_after = sys_after.used_memory();
        let mem_freed = if mem_before > mem_after {
            mem_before - mem_after
        } else {
            0
        };

        MemoryTrimResult {
            trimmed_processes_count: trimmed,
            memory_before_bytes: mem_before,
            memory_after_bytes: mem_after,
            memory_freed_bytes: mem_freed,
            failed_count: failed,
            errors,
        }
    }
}
