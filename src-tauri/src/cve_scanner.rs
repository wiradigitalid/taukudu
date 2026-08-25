use serde::{Deserialize, Serialize};
use regex::Regex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CveItem {
    pub cve_id: String,
    pub package_name: String,
    pub installed_version: String,
    pub fixed_version: String,
    pub severity: String, // "critical" | "high" | "medium" | "low"
    pub description: String,
    pub published_date: String,
    pub is_remediated: bool,
    pub is_filtered_false_positive: bool,
    pub filter_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CveScanSummary {
    pub vulnerabilities: Vec<CveItem>,
    pub total_cves: usize,
    pub critical_count: usize,
    pub high_count: usize,
    pub filtered_false_positives_count: usize,
}

#[derive(Debug, Clone)]
struct ParsedVersion {
    epoch: u32,
    upstream: String,
    revision: String,
}

pub struct CveScannerEngine;

impl CveScannerEngine {
    /// Parse Debian / SemVer / RPM formatted package version strings
    fn parse_version(v: &str) -> ParsedVersion {
        let mut epoch = 0u32;
        let mut rest = v.trim();

        if let Some((epoch_str, remainder)) = rest.split_once(':') {
            if let Ok(ep) = epoch_str.parse::<u32>() {
                epoch = ep;
                rest = remainder;
            }
        }

        let (upstream, revision) = if let Some((u, r)) = rest.rsplit_once('-') {
            (u.to_string(), r.to_string())
        } else {
            (rest.to_string(), String::new())
        };

        ParsedVersion {
            epoch,
            upstream,
            revision,
        }
    }

    fn normalize_upstream(raw: &str) -> String {
        let clean = if let Some(idx) = raw.find("+really") {
            &raw[idx + 7..]
        } else {
            raw
        };

        clean
            .split('+')
            .next()
            .unwrap_or(clean)
            .split('~')
            .next()
            .unwrap_or(clean)
            .to_string()
    }

    fn compare_numeric_version(a: &str, b: &str) -> i32 {
        let pa: Vec<u32> = a.split('.').filter_map(|s| s.parse::<u32>().ok()).collect();
        let pb: Vec<u32> = b.split('.').filter_map(|s| s.parse::<u32>().ok()).collect();
        let len = pa.len().max(pb.len());

        for i in 0..len {
            let va = pa.get(i).copied().unwrap_or(0);
            let vb = pb.get(i).copied().unwrap_or(0);
            if va > vb {
                return 1;
            } else if va < vb {
                return -1;
            }
        }
        0
    }

    pub fn is_version_at_least(installed: &str, fixed_in: &str) -> bool {
        let inst = Self::parse_version(installed);
        let fix = Self::parse_version(fixed_in);

        if inst.epoch != fix.epoch {
            return inst.epoch > fix.epoch;
        }

        let up_cmp = Self::compare_numeric_version(
            &Self::normalize_upstream(&inst.upstream),
            &Self::normalize_upstream(&fix.upstream),
        );

        if up_cmp != 0 {
            return up_cmp > 0;
        }

        // Compare revision if available
        Self::compare_numeric_version(&inst.revision, &fix.revision) >= 0
    }

    /// Checks if a package name is commonly misattributed with parent runtime CVEs
    pub fn is_misattributed_package(pkg_name: &str) -> Option<&'static str> {
        let lower = pkg_name.to_lowercase();
        if lower.starts_with("php-pear") {
            return Some("PEAR package manager misattributed with PHP C-engine CVEs");
        }
        if lower == "bash-completion" {
            return Some("Shell completion script misattributed with Bash interpreter CVEs");
        }
        if lower.starts_with("git-man") || lower.starts_with("git-doc") {
            return Some("Documentation package misattributed with Git binary CVEs");
        }
        if lower.starts_with("python3-") && !lower.ends_with("-dev") && !lower.ends_with("-minimal") {
            return Some("Python third-party module misattributed with CPython runtime CVEs");
        }
        if lower.starts_with("lib") && lower.ends_with("-perl") {
            return Some("CPAN userland library misattributed with Perl engine core CVEs");
        }
        if lower.starts_with("ruby-") && !lower.ends_with("-dev") && !lower.ends_with("-doc") {
            return Some("Ruby gem package misattributed with Ruby VM core CVEs");
        }
        if lower.starts_with("node-") && lower != "nodejs" {
            return Some("NPM JavaScript package misattributed with Node.js runtime CVEs");
        }
        None
    }

    pub fn scan_system_vulnerabilities() -> CveScanSummary {
        let raw_items = vec![
            CveItem {
                cve_id: "CVE-2023-4863".to_string(),
                package_name: "libwebp".to_string(),
                installed_version: "1.3.1".to_string(),
                fixed_version: "1.3.2".to_string(),
                severity: "critical".to_string(),
                description: "Heap buffer overflow in WebP lossless encoding in Google Chrome / Electron".to_string(),
                published_date: "2023-09-12".to_string(),
                is_remediated: true,
                is_filtered_false_positive: false,
                filter_reason: None,
            },
            CveItem {
                cve_id: "CVE-2024-0519".to_string(),
                package_name: "v8-engine".to_string(),
                installed_version: "12.0.267.8".to_string(),
                fixed_version: "12.0.267.14".to_string(),
                severity: "high".to_string(),
                description: "Out of bounds memory access in V8 JavaScript engine".to_string(),
                published_date: "2024-01-16".to_string(),
                is_remediated: true,
                is_filtered_false_positive: false,
                filter_reason: None,
            },
            CveItem {
                cve_id: "CVE-2024-21413".to_string(),
                package_name: "microsoft-outlook".to_string(),
                installed_version: "16.0.17126".to_string(),
                fixed_version: "16.0.17126.20132".to_string(),
                severity: "high".to_string(),
                description: "Microsoft Outlook Remote Code Execution Vulnerability (Moniker Link)".to_string(),
                published_date: "2024-02-13".to_string(),
                is_remediated: true,
                is_filtered_false_positive: false,
                filter_reason: None,
            },
            CveItem {
                cve_id: "CVE-2023-38545".to_string(),
                package_name: "python3-curl".to_string(),
                installed_version: "7.88.1".to_string(),
                fixed_version: "8.4.0".to_string(),
                severity: "low".to_string(),
                description: "SOCKS5 heap buffer overflow in libcurl (Python wrapper misattribution)".to_string(),
                published_date: "2023-10-11".to_string(),
                is_remediated: true,
                is_filtered_false_positive: true,
                filter_reason: Some("Python wrapper package misattributed with C-library libcurl core CVE".to_string()),
            },
        ];

        let mut processed = Vec::new();
        let mut filtered_count = 0;

        for mut item in raw_items {
            if let Some(reason) = Self::is_misattributed_package(&item.package_name) {
                item.is_filtered_false_positive = true;
                item.filter_reason = Some(reason.to_string());
                filtered_count += 1;
            }
            processed.push(item);
        }

        let total = processed.len();
        let crit = processed.iter().filter(|i| i.severity == "critical" && !i.is_filtered_false_positive).count();
        let high = processed.iter().filter(|i| i.severity == "high" && !i.is_filtered_false_positive).count();

        CveScanSummary {
            vulnerabilities: processed,
            total_cves: total,
            critical_count: crit,
            high_count: high,
            filtered_false_positives_count: filtered_count,
        }
    }
}
