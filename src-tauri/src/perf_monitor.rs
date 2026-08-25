use serde::{Deserialize, Serialize};
use sysinfo::{Pid, System};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessItem {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceSnapshot {
    pub cpu_usage_percent: f32,
    pub total_memory_bytes: u64,
    pub used_memory_bytes: u64,
    pub memory_usage_percent: f32,
    pub top_processes: Vec<ProcessItem>,
    pub process_count: usize,
    pub uptime_seconds: u64,
}

pub struct PerfMonitorEngine;

impl PerfMonitorEngine {
    pub fn collect_snapshot() -> PerformanceSnapshot {
        let mut sys = System::new_all();

        // Refresh CPU and processes
        std::thread::sleep(std::time::Duration::from_millis(200));
        sys.refresh_all();

        let cpu_usage = sys.global_cpu_usage();
        let total_mem = sys.total_memory();
        let used_mem = sys.used_memory();
        let mem_percent = if total_mem > 0 {
            (used_mem as f32 / total_mem as f32) * 100.0
        } else {
            0.0
        };

        let mut processes: Vec<ProcessItem> = sys
            .processes()
            .iter()
            .map(|(pid, proc)| ProcessItem {
                pid: pid.as_u32(),
                name: proc.name().to_string_lossy().to_string(),
                cpu_usage: proc.cpu_usage(),
                memory_bytes: proc.memory(),
            })
            .collect();

        // Sort by memory usage descending
        processes.sort_by(|a, b| b.memory_bytes.cmp(&a.memory_bytes));
        let top = processes.into_iter().take(25).collect();

        PerformanceSnapshot {
            cpu_usage_percent: cpu_usage,
            total_memory_bytes: total_mem,
            used_memory_bytes: used_mem,
            memory_usage_percent: mem_percent,
            top_processes: top,
            process_count: sys.processes().len(),
            uptime_seconds: System::uptime(),
        }
    }

    pub fn kill_process(pid: u32) -> Result<(), String> {
        let sys = System::new_all();
        if let Some(process) = sys.process(Pid::from_u32(pid)) {
            if process.kill() {
                return Ok(());
            }
        }

        #[cfg(windows)]
        {
            use std::process::Command;
            let output = Command::new("taskkill")
                .args(["/F", "/PID", &pid.to_string()])
                .output();

            match output {
                Ok(o) if o.status.success() => Ok(()),
                Ok(o) => Err(String::from_utf8_lossy(&o.stderr).to_string()),
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            Err(format!("Process with PID {} could not be terminated", pid))
        }
    }
}
