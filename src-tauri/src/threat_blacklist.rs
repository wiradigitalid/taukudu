use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::path::PathBuf;
use std::sync::Mutex;

const MAX_ENTRIES_PER_ARRAY: usize = 500_000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatBlacklistData {
    pub version: String,
    pub updated_at: String,
    pub domains: Vec<String>,
    pub ips: Vec<String>,
    pub cidrs: Vec<String>,
}

impl Default for ThreatBlacklistData {
    fn default() -> Self {
        Self {
            version: "2026.08.1".to_string(),
            updated_at: chrono::Utc::now().to_rfc3339(),
            domains: vec![
                "malware-traffic-analysis.net".to_string(),
                "c2-relay.evil-domain.com".to_string(),
                "mining-pool.stratum.host".to_string(),
                "botnet-controller.xyz".to_string(),
            ],
            ips: vec![
                "185.220.101.5".to_string(),
                "198.51.100.22".to_string(),
                "45.154.255.89".to_string(),
            ],
            cidrs: vec![
                "185.220.101.0/24".to_string(),
                "198.51.100.0/24".to_string(),
                "45.154.255.0/24".to_string(),
                "185.180.143.0/24".to_string(),
                "91.240.118.0/24".to_string(),
            ],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatBlacklistSummary {
    pub version: String,
    pub updated_at: String,
    pub total_domains: usize,
    pub total_ips: usize,
    pub total_cidrs: usize,
    pub file_path: String,
}

pub struct ThreatBlacklistStore {
    file_path: Mutex<PathBuf>,
    data: Mutex<ThreatBlacklistData>,
}

impl ThreatBlacklistStore {
    pub fn new() -> Self {
        let base_dir = if let Ok(appdata) = std::env::var("LOCALAPPDATA") {
            PathBuf::from(appdata).join("TauKudu")
        } else {
            PathBuf::from(".taukudu_data")
        };
        let _ = fs::create_dir_all(&base_dir);
        let path = base_dir.join("threat_blacklist.json");

        let mut current = ThreatBlacklistData::default();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(parsed) = serde_json::from_str::<ThreatBlacklistData>(&content) {
                    current = parsed;
                }
            }
        } else {
            if let Ok(json) = serde_json::to_string_pretty(&current) {
                let _ = fs::write(&path, json);
            }
        }

        Self {
            file_path: Mutex::new(path),
            data: Mutex::new(current),
        }
    }

    fn persist(&self) {
        let d = self.data.lock().unwrap();
        let path = self.file_path.lock().unwrap();
        if let Ok(content) = serde_json::to_string_pretty(&*d) {
            let mut tmp = path.clone();
            tmp.set_extension("tmp");
            if fs::write(&tmp, content).is_ok() {
                let _ = fs::rename(tmp, &*path);
            }
        }
    }

    pub fn get_summary(&self) -> ThreatBlacklistSummary {
        let d = self.data.lock().unwrap();
        let p = self.file_path.lock().unwrap();
        ThreatBlacklistSummary {
            version: d.version.clone(),
            updated_at: d.updated_at.clone(),
            total_domains: d.domains.len(),
            total_ips: d.ips.len(),
            total_cidrs: d.cidrs.len(),
            file_path: p.to_string_lossy().to_string(),
        }
    }

    pub fn get_data(&self) -> ThreatBlacklistData {
        self.data.lock().unwrap().clone()
    }

    pub fn update_data(&self, new_data: ThreatBlacklistData) -> Result<ThreatBlacklistSummary, String> {
        if new_data.domains.len() > MAX_ENTRIES_PER_ARRAY
            || new_data.ips.len() > MAX_ENTRIES_PER_ARRAY
            || new_data.cidrs.len() > MAX_ENTRIES_PER_ARRAY
        {
            return Err("Blacklist array size exceeds maximum permissible bounds (500k entries)".to_string());
        }

        {
            let mut d = self.data.lock().unwrap();
            *d = new_data;
        }
        self.persist();
        Ok(self.get_summary())
    }

    pub fn add_threat_domain(&self, domain: String) -> ThreatBlacklistSummary {
        {
            let mut d = self.data.lock().unwrap();
            let clean = domain.trim().to_lowercase();
            if !d.domains.contains(&clean) {
                d.domains.push(clean);
                d.updated_at = chrono::Utc::now().to_rfc3339();
            }
        }
        self.persist();
        self.get_summary()
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_THREAT_BLACKLIST: ThreatBlacklistStore = ThreatBlacklistStore::new();
}
