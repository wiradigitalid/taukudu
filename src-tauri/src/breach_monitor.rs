use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BreachIncident {
    pub id: String,
    pub title: String,
    pub domain: String,
    pub breach_date: String,
    pub compromised_accounts: u64,
    pub compromised_data: Vec<String>,
    pub is_acknowledged: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoredEmailStatus {
    pub email: String,
    pub breaches: Vec<BreachIncident>,
    pub added_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BreachMonitorSummary {
    pub monitored_emails: Vec<MonitoredEmailStatus>,
    pub total_emails: usize,
    pub total_breaches: usize,
    pub unacknowledged_count: usize,
}

pub struct BreachMonitorEngine {
    emails: Mutex<Vec<MonitoredEmailStatus>>,
}

impl BreachMonitorEngine {
    pub fn new() -> Self {
        let default_state = vec![
            MonitoredEmailStatus {
                email: "user@example.com".to_string(),
                added_at: "2026-08-20".to_string(),
                breaches: vec![
                    BreachIncident {
                        id: "breach-1".to_string(),
                        title: "Adobe Data Incident".to_string(),
                        domain: "adobe.com".to_string(),
                        breach_date: "2013-10-04".to_string(),
                        compromised_accounts: 153000000,
                        compromised_data: vec!["Email addresses".to_string(), "Password hints".to_string(), "Passwords".to_string()],
                        is_acknowledged: true,
                    },
                    BreachIncident {
                        id: "breach-2".to_string(),
                        title: "Dropbox Credential Exposure".to_string(),
                        domain: "dropbox.com".to_string(),
                        breach_date: "2012-07-01".to_string(),
                        compromised_accounts: 68000000,
                        compromised_data: vec!["Email addresses".to_string(), "Passwords".to_string()],
                        is_acknowledged: false,
                    },
                ],
            },
        ];

        Self {
            emails: Mutex::new(default_state),
        }
    }

    pub fn get_summary(&self) -> BreachMonitorSummary {
        let list = self.emails.lock().unwrap().clone();
        let total_emails = list.len();
        let all_breaches: Vec<&BreachIncident> = list.iter().flat_map(|e| &e.breaches).collect();
        let total_breaches = all_breaches.len();
        let unacknowledged = all_breaches.iter().filter(|b| !b.is_acknowledged).count();

        BreachMonitorSummary {
            monitored_emails: list,
            total_emails,
            total_breaches,
            unacknowledged_count: unacknowledged,
        }
    }

    pub fn add_email(&self, email: String) -> Result<BreachMonitorSummary, String> {
        let mut list = self.emails.lock().unwrap();
        if list.iter().any(|e| e.email.to_lowercase() == email.to_lowercase()) {
            return Err("Email is already monitored".to_string());
        }

        list.push(MonitoredEmailStatus {
            email: email.clone(),
            added_at: chrono::Utc::now().format("%Y-%m-%d").to_string(),
            breaches: Vec::new(),
        });
        drop(list);

        Ok(self.get_summary())
    }

    pub fn remove_email(&self, email: &str) -> Result<BreachMonitorSummary, String> {
        let mut list = self.emails.lock().unwrap();
        list.retain(|e| e.email.to_lowercase() != email.to_lowercase());
        drop(list);

        Ok(self.get_summary())
    }

    pub fn acknowledge_breach(&self, breach_id: &str) -> Result<BreachMonitorSummary, String> {
        let mut list = self.emails.lock().unwrap();
        for item in list.iter_mut() {
            for b in item.breaches.iter_mut() {
                if b.id == breach_id {
                    b.is_acknowledged = true;
                }
            }
        }
        drop(list);

        Ok(self.get_summary())
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_BREACH_MONITOR: BreachMonitorEngine = BreachMonitorEngine::new();
}
