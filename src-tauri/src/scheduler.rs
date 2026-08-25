use chrono::{DateTime, Datelike, Local, Timelike, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleItem {
    pub id: String,
    pub name: String,
    pub frequency: String, // "daily" | "weekly" | "monthly"
    pub hour: u32,
    pub minute: u32,
    pub day_of_week: Option<u32>, // 0 = Sunday .. 6 = Saturday
    pub day_of_month: Option<u32>,
    pub categories: Vec<String>,
    pub is_enabled: bool,
    pub auto_clean: bool,
    pub last_run_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleSummary {
    pub schedules: Vec<ScheduleItem>,
    pub total_schedules: usize,
    pub active_count: usize,
    pub next_scheduled_run: Option<String>,
}

pub struct ScheduleEngine {
    items: Mutex<Vec<ScheduleItem>>,
}

impl ScheduleEngine {
    pub fn new() -> Self {
        let default_schedules = vec![
            ScheduleItem {
                id: "sched-daily-quick".to_string(),
                name: "Daily Quick Clean".to_string(),
                frequency: "daily".to_string(),
                hour: 18,
                minute: 0,
                day_of_week: None,
                day_of_month: None,
                categories: vec!["system".to_string(), "browser".to_string()],
                is_enabled: true,
                auto_clean: true,
                last_run_at: None,
            },
            ScheduleItem {
                id: "sched-weekly-deep".to_string(),
                name: "Weekly Full Maintenance".to_string(),
                frequency: "weekly".to_string(),
                hour: 20,
                minute: 0,
                day_of_week: Some(0), // Sunday
                day_of_month: None,
                categories: vec!["system".to_string(), "browser".to_string(), "app".to_string(), "gaming".to_string()],
                is_enabled: false,
                auto_clean: false,
                last_run_at: None,
            },
        ];

        Self {
            items: Mutex::new(default_schedules),
        }
    }

    pub fn get_schedules(&self) -> ScheduleSummary {
        let items = self.items.lock().unwrap().clone();
        let total = items.len();
        let active = items.iter().filter(|s| s.is_enabled).count();

        // Calculate next run time preview
        let next_run = items
            .iter()
            .filter(|s| s.is_enabled)
            .map(|s| format!("Today at {:02}:{:02}", s.hour, s.minute))
            .next();

        ScheduleSummary {
            schedules: items,
            total_schedules: total,
            active_count: active,
            next_scheduled_run: next_run,
        }
    }

    pub fn toggle_schedule(&self, id: &str, enable: bool) -> Result<(), String> {
        let mut items = self.items.lock().unwrap();
        if let Some(item) = items.iter_mut().find(|s| s.id == id) {
            item.is_enabled = enable;
            return Ok(());
        }
        Err(format!("Schedule {} not found", id))
    }

    pub fn add_schedule(&self, item: ScheduleItem) {
        let mut items = self.items.lock().unwrap();
        items.push(item);
    }

    pub fn delete_schedule(&self, id: &str) -> Result<(), String> {
        let mut items = self.items.lock().unwrap();
        let init_len = items.len();
        items.retain(|s| s.id != id);
        if items.len() < init_len {
            Ok(())
        } else {
            Err(format!("Schedule {} not found", id))
        }
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_SCHEDULER: ScheduleEngine = ScheduleEngine::new();
}
