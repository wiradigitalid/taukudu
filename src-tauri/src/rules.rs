use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
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

    // Standard variable formatting
    if cfg!(windows) {
        if let Ok(val) = env::var("LOCALAPPDATA") {
            resolved = resolved.replace("${LOCALAPPDATA}", &val);
            resolved = resolved.replace("%LocalAppData%", &val);
        }
        if let Ok(val) = env::var("APPDATA") {
            resolved = resolved.replace("${APPDATA}", &val);
            resolved = resolved.replace("%AppData%", &val);
        }
        if let Ok(val) = env::var("WINDIR") {
            resolved = resolved.replace("${WINDIR}", &val);
            resolved = resolved.replace("%WinDir%", &val);
            resolved = resolved.replace("%SystemRoot%", &val);
        }
        if let Ok(val) = env::var("PROGRAMDATA") {
            resolved = resolved.replace("${PROGRAMDATA}", &val);
            resolved = resolved.replace("%ProgramData%", &val);
        }
        if let Ok(val) = env::var("USERPROFILE") {
            resolved = resolved.replace("${USERPROFILE}", &val);
            resolved = resolved.replace("%UserProfile%", &val);
        }
        if let Ok(val) = env::var("TEMP") {
            resolved = resolved.replace("${TEMP}", &val);
            resolved = resolved.replace("%TEMP%", &val);
        }
    } else {
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

    // 1. Load JSON rules from Kudu
    let platform_rules_dir = rules_dir.join(platform);
    if platform_rules_dir.is_dir() {
        if let Ok(entries) = fs::read_dir(platform_rules_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some("json") {
                    if let Ok(content) = fs::read_to_string(&path) {
                        if let Ok(rule_file) = serde_json::from_str::<CleanerRuleFile>(&content) {
                            rules.push(rule_file);
                        }
                    }
                }
            }
        }
    }

    // 2. Load BleachBit CleanerML rules if available
    let bleachbit_dir = rules_dir.join("..").join("bleachbit_cleaners");
    if bleachbit_dir.is_dir() {
        let bb_rules = parse_bleachbit_cleaners(&bleachbit_dir);
        rules.extend(bb_rules);
    }

    rules
}

// ── CleanerML (BleachBit XML) parser ──

fn parse_bleachbit_cleaners(dir: &Path) -> Vec<CleanerRuleFile> {
    let mut result = Vec::new();
    let os_tag = if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "darwin"
    } else {
        "linux"
    };

    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("xml") {
                if let Ok(content) = fs::read_to_string(&path) {
                    let cleaner_id = path.file_stem().unwrap_or_default().to_string_lossy().to_string();
                    let mut clean_targets = Vec::new();

                    // Parse basic delete actions in XML
                    for line in content.lines() {
                        let trimmed = line.trim();
                        if trimmed.starts_with("<action") && trimmed.contains("command=\"delete\"") {
                            if let Some(path_attr) = extract_xml_attr(trimmed, "path") {
                                if !path_attr.contains("$$") {
                                    clean_targets.push(CleanTargetRule {
                                        path: path_attr,
                                        subcategory: format!("BleachBit: {}", cleaner_id),
                                        description: Some(format!("CleanerML rule from BleachBit ({})", cleaner_id)),
                                        needs_admin: false,
                                        deep_recency_check: false,
                                        pattern: None,
                                    });
                                }
                            }
                        }
                    }

                    if !clean_targets.is_empty() {
                        result.push(CleanerRuleFile {
                            r#type: format!("app.{}", cleaner_id),
                            clean_targets,
                            single_file_targets: Vec::new(),
                        });
                    }
                }
            }
        }
    }

    result
}

fn extract_xml_attr(line: &str, attr: &str) -> Option<String> {
    let target = format!("{}=\"", attr);
    if let Some(start) = line.find(&target) {
        let rest = &line[start + target.len()..];
        if let Some(end) = rest.find('"') {
            return Some(rest[..end].to_string());
        }
    }
    None
}
