use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkItemInfo {
    pub id: String,
    pub item_type: String, // "dns_cache" | "arp_cache" | "tcp_connections"
    pub label: String,
    pub detail: String,
    pub is_selected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkCleanResult {
    pub cleaned_items: usize,
    pub failed_items: usize,
    pub details: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveConnectionInfo {
    pub protocol: String,
    pub local_address: String,
    pub foreign_address: String,
    pub state: String,
    pub pid: u32,
}

pub struct NetworkToolsEngine;

impl NetworkToolsEngine {
    pub fn get_network_items() -> Vec<NetworkItemInfo> {
        let mut items = Vec::new();

        // 1. DNS Cache Item
        items.push(NetworkItemInfo {
            id: "net-dns".to_string(),
            item_type: "dns_cache".to_string(),
            label: "DNS Resolver Cache".to_string(),
            detail: "Flush local DNS resolver cache to clear stale IP mappings".to_string(),
            is_selected: true,
        });

        // 2. ARP Cache Item
        items.push(NetworkItemInfo {
            id: "net-arp".to_string(),
            item_type: "arp_cache".to_string(),
            label: "ARP Protocol Cache".to_string(),
            detail: "Flush Address Resolution Protocol (ARP) table mappings".to_string(),
            is_selected: true,
        });

        // 3. TCP/IP Stack & Sockets
        items.push(NetworkItemInfo {
            id: "net-tcp-reset".to_string(),
            item_type: "tcp_connections".to_string(),
            label: "TCP/IP Stack Reset".to_string(),
            detail: "Reset TCP/IP stack configuration (Winsock catalog reset)".to_string(),
            is_selected: false,
        });

        items
    }

    pub fn flush_dns() -> Result<(), String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let output = Command::new("ipconfig")
                .arg("/flushdns")
                .output();

            match output {
                Ok(o) if o.status.success() => Ok(()),
                Ok(o) => Err(String::from_utf8_lossy(&o.stderr).to_string()),
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            Ok(())
        }
    }

    pub fn flush_arp() -> Result<(), String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let output = Command::new("netsh")
                .args(["interface", "ip", "delete", "arpcache"])
                .output();

            match output {
                Ok(o) if o.status.success() => Ok(()),
                Ok(o) => Err(String::from_utf8_lossy(&o.stderr).to_string()),
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            Ok(())
        }
    }

    pub fn reset_winsock() -> Result<(), String> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let output = Command::new("netsh")
                .args(["winsock", "reset"])
                .output();

            match output {
                Ok(o) if o.status.success() => Ok(()),
                Ok(o) => Err(String::from_utf8_lossy(&o.stderr).to_string()),
                Err(e) => Err(e.to_string()),
            }
        }
        #[cfg(not(windows))]
        {
            Ok(())
        }
    }

    pub fn list_active_connections() -> Vec<ActiveConnectionInfo> {
        #[cfg(windows)]
        {
            use std::process::Command;
            let output = Command::new("netstat")
                .args(["-ano", "-p", "tcp"])
                .output();

            if let Ok(out) = output {
                let stdout = String::from_utf8_lossy(&out.stdout);
                let mut conns = Vec::new();

                for line in stdout.lines() {
                    let trimmed = line.trim();
                    if trimmed.starts_with("TCP") && trimmed.contains("ESTABLISHED") {
                        let cols: Vec<&str> = trimmed.split_whitespace().collect();
                        if cols.len() >= 5 {
                            let pid: u32 = cols[4].parse().unwrap_or(0);
                            conns.push(ActiveConnectionInfo {
                                protocol: cols[0].to_string(),
                                local_address: cols[1].to_string(),
                                foreign_address: cols[2].to_string(),
                                state: cols[3].to_string(),
                                pid,
                            });
                        }
                    }
                }
                return conns;
            }
        }
        Vec::new()
    }
}
