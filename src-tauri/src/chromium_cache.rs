use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserProfileCacheTarget {
    pub browser_key: String,
    pub browser_name: String,
    pub profile_name: String,
    pub cache_type: String,
    pub path: String,
    pub exists: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserCacheScanSummary {
    pub browsers_detected: Vec<String>,
    pub targets: Vec<BrowserProfileCacheTarget>,
    pub total_targets: usize,
}

pub struct ChromiumCacheEngine;

impl ChromiumCacheEngine {
    /// Detect all installed Chromium-family browsers and enumerate their profile cache directories
    pub fn discover_browser_cache_targets() -> BrowserCacheScanSummary {
        let mut targets = Vec::new();
        let mut detected_browsers = Vec::new();

        let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
        let app_data = std::env::var("APPDATA").unwrap_or_default();

        let browsers: Vec<(&str, &str, PathBuf, bool)> = vec![
            (
                "chrome",
                "Google Chrome",
                PathBuf::from(&local_app_data).join(r"Google\Chrome\User Data"),
                true,
            ),
            (
                "edge",
                "Microsoft Edge",
                PathBuf::from(&local_app_data).join(r"Microsoft\Edge\User Data"),
                true,
            ),
            (
                "brave",
                "Brave Browser",
                PathBuf::from(&local_app_data).join(r"BraveSoftware\Brave-Browser\User Data"),
                true,
            ),
            (
                "vivaldi",
                "Vivaldi",
                PathBuf::from(&local_app_data).join(r"Vivaldi\User Data"),
                true,
            ),
            (
                "opera",
                "Opera Stable",
                PathBuf::from(&app_data).join(r"Opera Software\Opera Stable"),
                false,
            ),
            (
                "opera_gx",
                "Opera GX",
                PathBuf::from(&app_data).join(r"Opera Software\Opera GX Stable"),
                false,
            ),
            (
                "arc",
                "Arc Browser",
                PathBuf::from(&local_app_data).join(r"Arc\User Data"),
                true,
            ),
            (
                "chromium",
                "Chromium",
                PathBuf::from(&local_app_data).join(r"Chromium\User Data"),
                true,
            ),
            (
                "thorium",
                "Thorium",
                PathBuf::from(&local_app_data).join(r"Thorium\User Data"),
                true,
            ),
        ];

        let cache_subdirs = [
            (r"Cache\Cache_Data", "Disk Web Cache"),
            (r"Code Cache\js", "V8 JavaScript Code Cache"),
            (r"Code Cache\wasm", "WebAssembly Code Cache"),
            (r"GPUCache", "GPU Shader Cache"),
            (r"Service Worker\CacheStorage", "Service Worker Offline Cache"),
            (r"DawnGraphiteCache", "Graphite Shader Cache"),
            (r"DawnWebGPUCache", "WebGPU Compute Cache"),
        ];

        let shared_subdirs = [
            (r"ShaderCache", "Shared Angle / Vulkan Shader Cache"),
            (r"GrShaderCache", "Skia Graphics Shader Cache"),
            (r"GraphiteDawnCache", "Dawn Metal / D3D12 Shader Cache"),
        ];

        for (key, name, base_path, has_profiles) in browsers {
            if !base_path.is_dir() {
                continue;
            }

            detected_browsers.push(name.to_string());

            // 1. Shared browser-level caches (outside profile directories)
            for (shared_dir, label) in shared_subdirs {
                let target_p = base_path.join(shared_dir);
                let exists = target_p.exists();
                targets.push(BrowserProfileCacheTarget {
                    browser_key: key.to_string(),
                    browser_name: name.to_string(),
                    profile_name: "Shared".to_string(),
                    cache_type: label.to_string(),
                    path: target_p.to_string_lossy().to_string(),
                    exists,
                });
            }

            // 2. Profile-specific caches
            if has_profiles {
                let mut profiles = vec!["Default".to_string()];

                if let Ok(entries) = fs::read_dir(&base_path) {
                    for e in entries.flatten() {
                        let fname = e.file_name().to_string_lossy().to_string();
                        if e.path().is_dir() && fname.starts_with("Profile ") {
                            profiles.push(fname);
                        }
                    }
                }

                for profile in profiles {
                    let prof_path = base_path.join(&profile);
                    for (subdir, label) in cache_subdirs {
                        let target_p = prof_path.join(subdir);
                        let exists = target_p.exists();
                        targets.push(BrowserProfileCacheTarget {
                            browser_key: key.to_string(),
                            browser_name: name.to_string(),
                            profile_name: profile.clone(),
                            cache_type: label.to_string(),
                            path: target_p.to_string_lossy().to_string(),
                            exists,
                        });
                    }
                }
            } else {
                // Single profile browsers (e.g. Opera)
                for (subdir, label) in cache_subdirs {
                    let target_p = base_path.join(subdir);
                    let exists = target_p.exists();
                    targets.push(BrowserProfileCacheTarget {
                        browser_key: key.to_string(),
                        browser_name: name.to_string(),
                        profile_name: "Default".to_string(),
                        cache_type: label.to_string(),
                        path: target_p.to_string_lossy().to_string(),
                        exists,
                    });
                }
            }
        }

        let total = targets.len();
        BrowserCacheScanSummary {
            browsers_detected: detected_browsers,
            targets,
            total_targets: total,
        }
    }
}
