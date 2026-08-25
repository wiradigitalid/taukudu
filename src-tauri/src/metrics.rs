use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use sysinfo::{CpuRefreshKind, MemoryRefreshKind, RefreshKind, System};
use crate::history_store::GLOBAL_HISTORY;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricLine {
    pub name: String,
    pub r#type: String, // "gauge" | "counter"
    pub help: String,
    pub labels: HashMap<String, String>,
    pub value: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrometheusMetricsSummary {
    pub metrics: Vec<MetricLine>,
    pub raw_prometheus_text: String,
}

pub struct MetricsEngine;

impl MetricsEngine {
    pub fn collect_metrics() -> Vec<MetricLine> {
        let mut metrics = Vec::new();

        // 1. App Info
        let mut app_labels = HashMap::new();
        app_labels.insert("version".to_string(), env!("CARGO_PKG_VERSION").to_string());
        app_labels.insert("platform".to_string(), std::env::consts::OS.to_string());
        app_labels.insert("arch".to_string(), std::env::consts::ARCH.to_string());

        metrics.push(MetricLine {
            name: "taukudu_info".to_string(),
            r#type: "gauge".to_string(),
            help: "TauKudu application release information".to_string(),
            labels: app_labels,
            value: 1.0,
        });

        // 2. System Uptime & Hardware
        let mut sys = System::new_with_specifics(
            RefreshKind::nothing()
                .with_cpu(CpuRefreshKind::everything())
                .with_memory(MemoryRefreshKind::everything()),
        );
        sys.refresh_cpu_all();
        sys.refresh_memory();

        metrics.push(MetricLine {
            name: "taukudu_system_uptime_seconds".to_string(),
            r#type: "gauge".to_string(),
            help: "System uptime in seconds".to_string(),
            labels: HashMap::new(),
            value: System::uptime() as f64,
        });

        metrics.push(MetricLine {
            name: "taukudu_system_cpu_usage_percent".to_string(),
            r#type: "gauge".to_string(),
            help: "Current aggregate CPU usage percentage".to_string(),
            labels: HashMap::new(),
            value: sys.global_cpu_usage() as f64,
        });

        metrics.push(MetricLine {
            name: "taukudu_system_memory_total_bytes".to_string(),
            r#type: "gauge".to_string(),
            help: "Total physical memory in bytes".to_string(),
            labels: HashMap::new(),
            value: sys.total_memory() as f64,
        });

        metrics.push(MetricLine {
            name: "taukudu_system_memory_used_bytes".to_string(),
            r#type: "gauge".to_string(),
            help: "Used physical memory in bytes".to_string(),
            labels: HashMap::new(),
            value: sys.used_memory() as f64,
        });

        // 3. History statistics from SQLite store
        let history = GLOBAL_HISTORY
            .lock()
            .unwrap()
            .get_all_records()
            .unwrap_or_default();

        metrics.push(MetricLine {
            name: "taukudu_scans_total".to_string(),
            r#type: "gauge".to_string(),
            help: "Total number of recorded cleaning sessions in audit history".to_string(),
            labels: HashMap::new(),
            value: history.len() as f64,
        });

        let total_items: usize = history.iter().map(|h| h.total_items_cleaned).sum();
        metrics.push(MetricLine {
            name: "taukudu_items_cleaned_total".to_string(),
            r#type: "gauge".to_string(),
            help: "Total files and items cleaned across all historical sessions".to_string(),
            labels: HashMap::new(),
            value: total_items as f64,
        });

        let total_space: u64 = history.iter().map(|h| h.total_space_saved_bytes).sum();
        metrics.push(MetricLine {
            name: "taukudu_space_saved_bytes_total".to_string(),
            r#type: "gauge".to_string(),
            help: "Total storage bytes reclaimed across all historical sessions".to_string(),
            labels: HashMap::new(),
            value: total_space as f64,
        });

        if let Some(latest) = history.first() {
            metrics.push(MetricLine {
                name: "taukudu_last_scan_duration_ms".to_string(),
                r#type: "gauge".to_string(),
                help: "Duration of the most recent cleaning operation in milliseconds".to_string(),
                labels: HashMap::new(),
                value: latest.duration_ms as f64,
            });

            metrics.push(MetricLine {
                name: "taukudu_last_scan_items_cleaned".to_string(),
                r#type: "gauge".to_string(),
                help: "Number of items cleaned in the most recent session".to_string(),
                labels: HashMap::new(),
                value: latest.total_items_cleaned as f64,
            });
        }

        metrics
    }

    pub fn format_prometheus(metrics: &[MetricLine]) -> String {
        let mut lines = Vec::new();

        for m in metrics {
            lines.push(format!("# HELP {} {}", m.name, m.help));
            lines.push(format!("# TYPE {} {}", m.name, m.r#type));

            if !m.labels.is_empty() {
                let label_str: Vec<String> = m
                    .labels
                    .iter()
                    .map(|(k, v)| {
                        let clean_v = v.replace('\\', "\\\\").replace('"', "\\\"");
                        format!("{}=\"{}\"", k, clean_v)
                    })
                    .collect();
                lines.push(format!("{}{{{}}} {}", m.name, label_str.join(","), m.value));
            } else {
                lines.push(format!("{} {}", m.name, m.value));
            }

            lines.push(String::new());
        }

        lines.join("\n")
    }

    pub fn get_summary() -> PrometheusMetricsSummary {
        let metrics = Self::collect_metrics();
        let raw = Self::format_prometheus(&metrics);

        PrometheusMetricsSummary {
            metrics,
            raw_prometheus_text: raw,
        }
    }
}
