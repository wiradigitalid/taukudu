use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevCacheTarget {
    pub id: String,
    pub ecosystem: String, // "JavaScript/Node", "Rust", "Python", "Go", ".NET", "Java/JVM", "PHP", "IDEs & Tools"
    pub name: String,
    pub description: String,
    pub file_path: String,
    pub size_bytes: u64,
    pub file_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevCacheScanSummary {
    pub targets: Vec<DevCacheTarget>,
    pub total_size_bytes: u64,
    pub total_targets_count: usize,
    pub scan_duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevCacheCleanResult {
    pub cleaned_targets_count: usize,
    pub bytes_freed: u64,
    pub failed_count: usize,
    pub errors: Vec<String>,
}

pub struct DevCacheCleanerEngine;

impl DevCacheCleanerEngine {
    pub fn scan_dev_caches() -> DevCacheScanSummary {
        let start = Instant::now();
        let mut targets = Vec::new();
        let mut total_size = 0u64;

        let userprofile = std::env::var("USERPROFILE").unwrap_or_default();
        let localappdata = std::env::var("LOCALAPPDATA").unwrap_or_default();
        let appdata = std::env::var("APPDATA").unwrap_or_default();

        let home = if !userprofile.is_empty() {
            PathBuf::from(&userprofile)
        } else {
            PathBuf::from(".")
        };

        let local = if !localappdata.is_empty() {
            PathBuf::from(&localappdata)
        } else {
            PathBuf::from(".")
        };

        let roaming = if !appdata.is_empty() {
            PathBuf::from(&appdata)
        } else {
            PathBuf::from(".")
        };

        let candidates = vec![
            // JavaScript / Node Ecosystem
            ("JavaScript/Node", "npm Download Cache", "Downloaded package tarballs and metadata cache", local.join("npm-cache")),
            ("JavaScript/Node", "npm Legacy Roaming Cache", "Legacy roaming npm cache directory", roaming.join("npm-cache")),
            ("JavaScript/Node", "Yarn Global Cache", "Yarn downloaded package tarballs", local.join("Yarn").join("Cache")),
            ("JavaScript/Node", "pnpm Store", "pnpm content-addressable package store", local.join("pnpm").join("store")),
            ("JavaScript/Node", "pnpm Global Cache", "pnpm downloaded metadata and packages cache", local.join("pnpm-cache")),
            ("JavaScript/Node", "Bun Download Cache", "Bun package manager install cache", local.join(".bun").join("install").join("cache")),
            ("JavaScript/Node", "node-gyp Build Cache", "Node.js native C/C++ addon header cache", local.join("node-gyp").join("Cache")),
            ("JavaScript/Node", "electron-builder Cache", "Downloaded Electron binaries and Windows SDK headers", local.join("electron-builder").join("Cache")),
            ("JavaScript/Node", "Electron Runtime Cache", "Downloaded Electron runtime archives", local.join("electron").join("Cache")),

            // Rust / Cargo
            ("Rust", "Cargo Registry Cache", "Downloaded .crate archive packages", home.join(".cargo").join("registry").join("cache")),
            ("Rust", "Cargo Git DB Cache", "Cloned git dependency repositories", home.join(".cargo").join("git").join("db")),

            // Python
            ("Python", "pip Wheels & Download Cache", "Downloaded Python wheel files and HTTP cache", local.join("pip").join("Cache")),
            ("Python", "pip Legacy Cache", "User home pip cache directory", home.join(".cache").join("pip")),

            // Go
            ("Go", "Go Module Download Cache", "Downloaded Go source packages and checksums", home.join("go").join("pkg").join("mod").join("cache")),

            // .NET / NuGet
            (".NET", "NuGet v3 HTTP Response Cache", "Cached NuGet package metadata and service indexes", local.join("NuGet").join("v3-cache")),
            (".NET", "NuGet Plugins Cache", "Downloaded NuGet plugin extensions", local.join("NuGet").join("plugins-cache")),

            // Java / JVM
            ("Java/JVM", "Gradle Cache", "Downloaded dependencies, wrapper distributions, and build daemon logs", home.join(".gradle").join("caches")),
            ("Java/JVM", "Maven Repository", "Maven local dependency artifacts cache", home.join(".m2").join("repository")),

            // PHP
            ("PHP", "Composer Cache", "Downloaded PHP Composer package archives", local.join("Composer").join("cache")),

            // IDEs & AI Development Tools
            ("IDEs & Tools", "JetBrains IDEs Caches", "Compiled indexes and syntax caches for IntelliJ, WebStorm, PyCharm", local.join("JetBrains")),
            ("IDEs & Tools", "VS Code Extension Cache", "Cached extensions and compiled code cache", roaming.join("Code").join("CachedExtensions")),
            ("IDEs & Tools", "Cursor IDE Extension Cache", "Cursor AI extension and web caches", roaming.join("Cursor").join("CachedExtensions")),
            ("IDEs & Tools", "Claude Code CLI Cache", "Claude CLI plugin and tools download cache", home.join(".claude").join("cache")),
        ];

        for (ecosystem, name, desc, path) in candidates {
            if path.exists() {
                let (size, count) = Self::calculate_dir_metrics(&path);
                if size > 0 {
                    total_size += size;
                    targets.push(DevCacheTarget {
                        id: format!("dev-cache-{}", targets.len() + 1),
                        ecosystem: ecosystem.to_string(),
                        name: name.to_string(),
                        description: desc.to_string(),
                        file_path: path.to_string_lossy().to_string(),
                        size_bytes: size,
                        file_count: count,
                    });
                }
            }
        }

        let total_targets = targets.len();

        DevCacheScanSummary {
            targets,
            total_size_bytes: total_size,
            total_targets_count: total_targets,
            scan_duration_ms: start.elapsed().as_millis() as u64,
        }
    }

    pub fn clean_dev_cache_targets(paths: &[String]) -> DevCacheCleanResult {
        let mut cleaned = 0;
        let mut freed = 0u64;
        let mut failed = 0;
        let mut errors = Vec::new();

        for p_str in paths {
            let p = Path::new(p_str);
            if p.exists() {
                let (size, _) = Self::calculate_dir_metrics(p);
                // Purge children contents
                if let Ok(entries) = fs::read_dir(p) {
                    for e in entries.flatten() {
                        let child = e.path();
                        let res = if child.is_dir() {
                            fs::remove_dir_all(&child)
                        } else {
                            fs::remove_file(&child)
                        };
                        if res.is_err() {
                            // Non-critical file lock
                        }
                    }
                    cleaned += 1;
                    freed += size;
                } else {
                    failed += 1;
                    errors.push(format!("Failed to open directory {}", p_str));
                }
            }
        }

        DevCacheCleanResult {
            cleaned_targets_count: cleaned,
            bytes_freed: freed,
            failed_count: failed,
            errors,
        }
    }

    fn calculate_dir_metrics(path: &Path) -> (u64, usize) {
        let mut total_bytes = 0u64;
        let mut file_count = 0usize;

        for entry in walkdir::WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() {
                if let Ok(meta) = entry.metadata() {
                    total_bytes += meta.len();
                    file_count += 1;
                }
            }
        }

        (total_bytes, file_count)
    }
}
