use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanTargetRule {
    pub path: String,
    pub subcategory: String,
    pub description: Option<String>,
    #[serde(default)]
    pub needs_admin: bool,
    #[serde(default)]
    pub deep_recency_check: bool,
    pub pattern: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingleFileTargetRule {
    pub path: String,
    pub subcategory: String,
    pub description: Option<String>,
    #[serde(default)]
    pub needs_admin: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanerRuleFile {
    pub r#type: String,
    #[serde(rename = "cleanTargets", default)]
    pub clean_targets: Vec<CleanTargetRule>,
    #[serde(rename = "singleFileTargets", default)]
    pub single_file_targets: Vec<SingleFileTargetRule>,
}

pub fn resolve_environment_variables(template: &str) -> String {
    let mut resolved = template.to_string();

    // Common Windows Environment Variables
    if cfg!(windows) {
        if let Ok(val) = env::var("LOCALAPPDATA") {
            resolved = resolved.replace("${LOCALAPPDATA}", &val);
        }
        if let Ok(val) = env::var("APPDATA") {
            resolved = resolved.replace("${APPDATA}", &val);
        }
        if let Ok(val) = env::var("WINDIR") {
            resolved = resolved.replace("${WINDIR}", &val);
        }
        if let Ok(val) = env::var("PROGRAMDATA") {
            resolved = resolved.replace("${PROGRAMDATA}", &val);
        }
        if let Ok(val) = env::var("USERPROFILE") {
            resolved = resolved.replace("${USERPROFILE}", &val);
        }
        if let Ok(val) = env::var("TEMP") {
            resolved = resolved.replace("${TEMP}", &val);
        }
    } else {
        // macOS and Linux
        if let Ok(home) = env::var("HOME") {
            resolved = resolved.replace("${HOME}", &home);
            resolved = resolved.replace("~", &home);
        }
    }

    resolved
}

pub fn load_rules_from_dir(rules_dir: &Path) -> Vec<CleanerRuleFile> {
    let mut rules = Vec::new();
    let platform = if cfg!(target_os = "windows") {
        "win32"
    } else if cfg!(target_os = "macos") {
        "darwin"
    } else {
        "linux"
    };

    let platform_rules_dir = rules_dir.join(platform);
    if platform_rules_dir.is_dir() {
        if let Ok(entries) = std::fs::read_dir(platform_rules_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some("json") {
                    if let Ok(content) = std::fs::read_to_string(&path) {
                        if let Ok(rule_file) = serde_json::from_str::<CleanerRuleFile>(&content) {
                            rules.push(rule_file);
                        }
                    }
                }
            }
        }
    }

    rules
}
