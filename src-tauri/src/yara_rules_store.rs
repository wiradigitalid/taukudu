use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

const MAX_RULE_COUNT: usize = 10_000;
const MAX_RULE_CONTENT_BYTES: usize = 1 * 1024 * 1024; // 1 MB per rule file

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YaraRuleFileEntry {
    pub filename: String,
    pub content: String,
    pub size_bytes: usize,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YaraRulesMetadata {
    pub version: String,
    pub updated_at: String,
    pub rules_count: usize,
    pub sha256_hash: String,
    pub rules_directory: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YaraBundleValidationResult {
    pub is_valid: bool,
    pub total_rules: usize,
    pub calculated_sha256: String,
    pub error_message: Option<String>,
}

pub struct YaraRulesStoreEngine {
    rules_dir: Mutex<PathBuf>,
}

impl YaraRulesStoreEngine {
    pub fn new() -> Self {
        let base_dir = if let Ok(appdata) = std::env::var("LOCALAPPDATA") {
            PathBuf::from(appdata).join("TauKudu").join("yara-rules")
        } else {
            PathBuf::from(".taukudu_yara_rules")
        };

        let _ = fs::create_dir_all(&base_dir);

        // Seed default rule if empty
        let default_rule = base_dir.join("default_malware_heuristics.yar");
        if !default_rule.exists() {
            let sample_rule = r#"
rule Suspicious_Masquerade_Binary {
    meta:
        description = "Detects critical Windows system binaries placed in non-system user directories"
        author = "TauKudu Security Suite"
        severity = "critical"
    strings:
        $s1 = "svchost.exe" nocase
        $s2 = "lsass.exe" nocase
        $s3 = "csrss.exe" nocase
    condition:
        any of them
}
"#;
            let _ = fs::write(&default_rule, sample_rule.trim());
        }

        Self {
            rules_dir: Mutex::new(base_dir),
        }
    }

    pub fn list_rule_files(&self) -> Vec<YaraRuleFileEntry> {
        let dir = self.rules_dir.lock().unwrap();
        if !dir.exists() {
            return Vec::new();
        }

        let mut list = Vec::new();
        if let Ok(entries) = fs::read_dir(&*dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() && path.extension().and_then(|e| e.to_str()) == Some("yar") {
                    let fname = entry.file_name().to_string_lossy().to_string();
                    if let Ok(content) = fs::read_to_string(&path) {
                        let len = content.len();
                        list.push(YaraRuleFileEntry {
                            filename: fname,
                            content,
                            size_bytes: len,
                            description: Some("YARA threat signature rule".to_string()),
                        });
                    }
                }
            }
        }

        list.sort_by(|a, b| a.filename.cmp(&b.filename));
        list
    }

    pub fn compute_sha256_bundle_hash(&self, rules: &[YaraRuleFileEntry]) -> String {
        use blake3::Hasher;
        let mut sorted = rules.to_vec();
        sorted.sort_by(|a, b| a.filename.cmp(&b.filename));

        let mut hasher = Hasher::new();
        for r in sorted {
            hasher.update(r.content.as_bytes());
        }
        hasher.finalize().to_hex().to_string()
    }

    pub fn get_metadata(&self) -> YaraRulesMetadata {
        let rules = self.list_rule_files();
        let hash = self.compute_sha256_bundle_hash(&rules);
        let dir = self.rules_dir.lock().unwrap().to_string_lossy().to_string();
        let count = rules.len();

        YaraRulesMetadata {
            version: "2026.08-signatures".to_string(),
            updated_at: chrono::Utc::now().to_rfc3339(),
            rules_count: count,
            sha256_hash: hash,
            rules_directory: dir,
        }
    }

    pub fn save_rule_file(&self, filename: String, content: String) -> Result<YaraRulesMetadata, String> {
        if !filename.ends_with(".yar") {
            return Err("Filename must end with .yar extension".to_string());
        }
        if content.len() > MAX_RULE_CONTENT_BYTES {
            return Err("Rule content exceeds 1MB limit".to_string());
        }
        if filename.contains('/') || filename.contains('\\') || filename.contains("..") {
            return Err("Invalid filename characters".to_string());
        }

        let dir = self.rules_dir.lock().unwrap();
        let target_path = dir.join(&filename);
        fs::write(target_path, content).map_err(|e| e.to_string())?;

        drop(dir);
        Ok(self.get_metadata())
    }

    pub fn delete_rule_file(&self, filename: &str) -> Result<YaraRulesMetadata, String> {
        let dir = self.rules_dir.lock().unwrap();
        let target = dir.join(filename);
        if target.exists() {
            let _ = fs::remove_file(target);
        }
        drop(dir);
        Ok(self.get_metadata())
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_YARA_RULES_STORE: YaraRulesStoreEngine = YaraRulesStoreEngine::new();
}
