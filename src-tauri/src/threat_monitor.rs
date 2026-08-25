use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::net::Ipv4Addr;
use std::process::Command;
use std::os::windows::process::CommandExt;
use std::sync::Mutex;
use sysinfo::{ProcessRefreshKind, RefreshKind, System};

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlaggedConnection {
    pub id: String,
    pub protocol: String,
    pub local_addr: String,
    pub remote_addr: String,
    pub remote_ip: String,
    pub remote_port: u16,
    pub pid: u32,
    pub process_name: String,
    pub threat_category: String,
    pub risk_reason: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatMonitorSummary {
    pub total_connections_scanned: usize,
    pub flagged_threats_count: usize,
    pub flagged_connections: Vec<FlaggedConnection>,
    pub monitored_blacklist_entries: usize,
    pub is_monitoring_active: bool,
}

#[derive(Debug, Clone)]
struct ParsedIpv4Cidr {
    network: u32,
    mask: u32,
    raw: String,
    category: String,
    reason: String,
}

pub struct ThreatMonitorEngine {
    blacklisted_cidrs: Mutex<Vec<ParsedIpv4Cidr>>,
    flagged_history: Mutex<Vec<FlaggedConnection>>,
}

impl ThreatMonitorEngine {
    pub fn new() -> Self {
        let mut initial_cidrs = Vec::new();

        // Populate known malicious ranges (sample known botnets, mining pools, C2 IPs)
        let defaults = [
            ("185.220.101.0/24", "Tor Exit Relay", "Known Tor public exit node / suspicious proxy"),
            ("198.51.100.0/24", "Test Threat Range", "Flagged malicious outbound staging host"),
            ("45.154.255.0/24", "C2 Infrastructure", "Known CobaltStrike command and control relay"),
            ("185.180.143.0/24", "Cryptominer Pool", "Unauthorized Monero mining stratum endpoint"),
            ("91.240.118.0/24", "Malicious Scanner", "Known mass scanning and brute-force subnet"),
        ];

        for (cidr_str, cat, reason) in defaults {
            if let Some(parsed) = Self::parse_cidr(cidr_str, cat, reason) {
                initial_cidrs.push(parsed);
            }
        }

        Self {
            blacklisted_cidrs: Mutex::new(initial_cidrs),
            flagged_history: Mutex::new(Vec::new()),
        }
    }

    fn parse_cidr(cidr_str: &str, category: &str, reason: &str) -> Option<ParsedIpv4Cidr> {
        let (ip_str, prefix_str) = cidr_str.split_once('/')?;
        let ip: Ipv4Addr = ip_str.parse().ok()?;
        let prefix: u32 = prefix_str.parse().ok()?;

        if prefix > 32 {
            return None;
        }

        let ip_u32 = u32::from(ip);
        let mask = if prefix == 0 {
            0
        } else {
            !((1u32 << (32 - prefix)) - 1)
        };

        Some(ParsedIpv4Cidr {
            network: ip_u32 & mask,
            mask,
            raw: cidr_str.to_string(),
            category: category.to_string(),
            reason: reason.to_string(),
        })
    }

    fn ip_matches_cidr(ip: Ipv4Addr, cidr: &ParsedIpv4Cidr) -> bool {
        let ip_u32 = u32::from(ip);
        (ip_u32 & cidr.mask) == cidr.network
    }

    pub fn audit_active_threats(&self) -> ThreatMonitorSummary {
        let output = Command::new("netstat")
            .args(["-ano", "-p", "TCP"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        let mut sys = System::new_with_specifics(
            RefreshKind::nothing().with_processes(ProcessRefreshKind::nothing()),
        );
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

        let mut scanned_count = 0usize;
        let mut flagged = Vec::new();
        let cidrs = self.blacklisted_cidrs.lock().unwrap();

        if let Ok(out) = output {
            let stdout = String::from_utf8_lossy(&out.stdout);
            for line in stdout.lines() {
                let trimmed = line.trim();
                let parts: Vec<&str> = trimmed.split_whitespace().collect();

                if parts.len() >= 5 && (parts[0] == "TCP" || parts[0] == "UDP") {
                    scanned_count += 1;
                    let proto = parts[0].to_string();
                    let local = parts[1].to_string();
                    let foreign = parts[2].to_string();
                    let pid_str = parts[parts.len() - 1];
                    let pid = pid_str.parse::<u32>().unwrap_or(0);

                    // Extract IP and Port from foreign address (e.g. 1.2.3.4:443)
                    if let Some((ip_part, port_part)) = foreign.rsplit_once(':') {
                        let port = port_part.parse::<u16>().unwrap_or(0);
                        if let Ok(ipv4) = ip_part.parse::<Ipv4Addr>() {
                            if !ipv4.is_loopback() && !ipv4.is_unspecified() && !ipv4.is_private() {
                                for cidr in cidrs.iter() {
                                    if Self::ip_matches_cidr(ipv4, cidr) {
                                        let proc_name = sys
                                            .process(sysinfo::Pid::from_u32(pid))
                                            .map(|p| p.name().to_string_lossy().to_string())
                                            .unwrap_or_else(|| "Unknown".to_string());

                                        flagged.push(FlaggedConnection {
                                            id: format!("threat-{}-{}", pid, port),
                                            protocol: proto.clone(),
                                            local_addr: local.clone(),
                                            remote_addr: foreign.clone(),
                                            remote_ip: ip_part.to_string(),
                                            remote_port: port,
                                            pid,
                                            process_name: proc_name,
                                            threat_category: cidr.category.clone(),
                                            risk_reason: cidr.reason.clone(),
                                            timestamp: chrono::Utc::now().to_rfc3339(),
                                        });
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        let total_flagged = flagged.len();
        let total_monitored = cidrs.len();

        // Update history
        if !flagged.is_empty() {
            let mut hist = self.flagged_history.lock().unwrap();
            for f in &flagged {
                if !hist.iter().any(|x| x.id == f.id) {
                    hist.push(f.clone());
                }
            }
        }

        ThreatMonitorSummary {
            total_connections_scanned: scanned_count,
            flagged_threats_count: total_flagged,
            flagged_connections: flagged,
            monitored_blacklist_entries: total_monitored,
            is_monitoring_active: true,
        }
    }

    pub fn add_blacklist_cidr(&self, cidr_str: String, category: String, reason: String) -> Result<usize, String> {
        if let Some(parsed) = Self::parse_cidr(&cidr_str, &category, &reason) {
            let mut list = self.blacklisted_cidrs.lock().unwrap();
            list.push(parsed);
            Ok(list.len())
        } else {
            Err("Invalid IPv4 CIDR format (expected e.g. 192.0.2.0/24)".to_string())
        }
    }

    pub fn terminate_threat_process(&self, pid: u32) -> Result<(), String> {
        let mut sys = System::new_with_specifics(
            RefreshKind::nothing().with_processes(ProcessRefreshKind::nothing()),
        );
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

        let pid_sys = sysinfo::Pid::from_u32(pid);
        if let Some(proc) = sys.process(pid_sys) {
            proc.kill();
            Ok(())
        } else {
            Err(format!("Process PID {} not found", pid))
        }
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_THREAT_MONITOR: ThreatMonitorEngine = ThreatMonitorEngine::new();
}
