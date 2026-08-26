use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SafetyRating {
    pub key: String,
    pub name: String,
    pub publisher: String,
    pub safety_score: u8, // 0 - 100 (higher = safer)
    pub classification: String, // "Essential System", "Trusted Application", "Optional Utility", "Known Bloatware", "Suspicious / PUP"
    pub recommendation: String, // "Keep Enabled", "Optional", "Disable to Improve Boot Time", "Recommended to Uninstall"
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SafetyRatingSummary {
    pub total_ratings_known: usize,
    pub ratings: Vec<SafetyRating>,
}

pub struct SafetyIntelligenceEngine;

impl SafetyIntelligenceEngine {
    pub fn get_curated_safety_database() -> Vec<SafetyRating> {
        vec![
            // Essential System Runtimes
            SafetyRating {
                key: "microsoft.windows.explorer".to_string(),
                name: "Windows Explorer".to_string(),
                publisher: "Microsoft Corporation".to_string(),
                safety_score: 100,
                classification: "Essential System".to_string(),
                recommendation: "Keep Enabled".to_string(),
                description: "Core Windows desktop and file management shell.".to_string(),
            },
            SafetyRating {
                key: "securityhealthsystray".to_string(),
                name: "Windows Security Notification Icon".to_string(),
                publisher: "Microsoft Corporation".to_string(),
                safety_score: 100,
                classification: "Essential System".to_string(),
                recommendation: "Keep Enabled".to_string(),
                description: "Provides alerts regarding antivirus, firewall, and device security health.".to_string(),
            },
            SafetyRating {
                key: "realtek.audio".to_string(),
                name: "Realtek HD Audio Manager (RtkNGUI64.exe)".to_string(),
                publisher: "Realtek Semiconductor".to_string(),
                safety_score: 95,
                classification: "Essential Driver".to_string(),
                recommendation: "Keep Enabled".to_string(),
                description: "Audio hardware jack detection and sound enhancement driver utility.".to_string(),
            },
            SafetyRating {
                key: "nvidia.backend".to_string(),
                name: "NVIDIA Container (nvcontainer.exe)".to_string(),
                publisher: "NVIDIA Corporation".to_string(),
                safety_score: 95,
                classification: "Essential Driver".to_string(),
                recommendation: "Keep Enabled".to_string(),
                description: "Powers NVIDIA graphics display control and GPU performance optimization.".to_string(),
            },

            // Trusted Productivity Applications
            SafetyRating {
                key: "spotify".to_string(),
                name: "Spotify Music".to_string(),
                publisher: "Spotify AB".to_string(),
                safety_score: 90,
                classification: "Trusted Application".to_string(),
                recommendation: "Optional (Disable startup to save 2.5s boot time)".to_string(),
                description: "Digital music streaming desktop application.".to_string(),
            },
            SafetyRating {
                key: "discord".to_string(),
                name: "Discord".to_string(),
                publisher: "Discord Inc.".to_string(),
                safety_score: 90,
                classification: "Trusted Application".to_string(),
                recommendation: "Optional".to_string(),
                description: "Voice, video, and text communication platform for communities.".to_string(),
            },
            SafetyRating {
                key: "steam".to_string(),
                name: "Steam Client Bootstrapper".to_string(),
                publisher: "Valve Corporation".to_string(),
                safety_score: 95,
                classification: "Trusted Application".to_string(),
                recommendation: "Optional (Disable autostart if gaming on demand)".to_string(),
                description: "Digital game distribution client and community platform.".to_string(),
            },
            SafetyRating {
                key: "epicgameslauncher".to_string(),
                name: "Epic Games Launcher".to_string(),
                publisher: "Epic Games Inc.".to_string(),
                safety_score: 90,
                classification: "Trusted Application".to_string(),
                recommendation: "Optional".to_string(),
                description: "Digital storefront and engine runner for Epic Games and Unreal Engine.".to_string(),
            },
            SafetyRating {
                key: "slack".to_string(),
                name: "Slack".to_string(),
                publisher: "Slack Technologies (Salesforce)".to_string(),
                safety_score: 90,
                classification: "Trusted Application".to_string(),
                recommendation: "Keep Enabled if work machine".to_string(),
                description: "Enterprise workplace collaboration and messaging platform.".to_string(),
            },
            SafetyRating {
                key: "microsoft.teams".to_string(),
                name: "Microsoft Teams".to_string(),
                publisher: "Microsoft Corporation".to_string(),
                safety_score: 90,
                classification: "Trusted Application".to_string(),
                recommendation: "Optional".to_string(),
                description: "Unified communication and collaboration platform.".to_string(),
            },
            SafetyRating {
                key: "onedrive".to_string(),
                name: "Microsoft OneDrive Sync Engine".to_string(),
                publisher: "Microsoft Corporation".to_string(),
                safety_score: 90,
                classification: "Trusted Cloud Sync".to_string(),
                recommendation: "Keep Enabled if using cloud backup".to_string(),
                description: "Synchronizes local files with Microsoft cloud storage.".to_string(),
            },
            SafetyRating {
                key: "googledrive".to_string(),
                name: "Google Drive for Desktop".to_string(),
                publisher: "Google LLC".to_string(),
                safety_score: 90,
                classification: "Trusted Cloud Sync".to_string(),
                recommendation: "Keep Enabled if using cloud backup".to_string(),
                description: "Automated cloud backup and streaming for Google Workspace.".to_string(),
            },
            SafetyRating {
                key: "dropbox".to_string(),
                name: "Dropbox".to_string(),
                publisher: "Dropbox Inc.".to_string(),
                safety_score: 90,
                classification: "Trusted Cloud Sync".to_string(),
                recommendation: "Keep Enabled if using cloud backup".to_string(),
                description: "Cloud file synchronization client.".to_string(),
            },

            // OEM & Bloatware Telemetry
            SafetyRating {
                key: "ccleaner".to_string(),
                name: "CCleaner Monitoring Assistant".to_string(),
                publisher: "Piriform (Gen Digital)".to_string(),
                safety_score: 45,
                classification: "Known Bloatware / Background Telemetry".to_string(),
                recommendation: "Recommended to Uninstall".to_string(),
                description: "Redundant background active monitor with known past telemetry telemetry concerns.".to_string(),
            },
            SafetyRating {
                key: "mcafee.livesafe".to_string(),
                name: "McAfee Security Suite (OEM Pre-installed)".to_string(),
                publisher: "McAfee LLC".to_string(),
                safety_score: 40,
                classification: "Known Bloatware / High Resource Usage".to_string(),
                recommendation: "Recommended to Uninstall (Windows Defender is built-in)".to_string(),
                description: "OEM pre-installed trial antivirus with aggressive popups and heavy RAM usage.".to_string(),
            },
            SafetyRating {
                key: "norton.360".to_string(),
                name: "Norton 360 / LifeLock Assistant".to_string(),
                publisher: "Gen Digital".to_string(),
                safety_score: 40,
                classification: "Known Bloatware".to_string(),
                recommendation: "Recommended to Uninstall".to_string(),
                description: "High CPU background scanning utility with crypto promotion and upsells.".to_string(),
            },
            SafetyRating {
                key: "cortana".to_string(),
                name: "Microsoft Cortana Voice Assistant".to_string(),
                publisher: "Microsoft Corporation".to_string(),
                safety_score: 50,
                classification: "Deprecated OEM Utility".to_string(),
                recommendation: "Recommended to Uninstall / Debloat".to_string(),
                description: "Deprecated voice assistant service replaced by Copilot.".to_string(),
            },
            SafetyRating {
                key: "xbox.app".to_string(),
                name: "Xbox Gaming Overlay & Game Bar".to_string(),
                publisher: "Microsoft Corporation".to_string(),
                safety_score: 80,
                classification: "Optional Utility".to_string(),
                recommendation: "Optional (Disable if not using Xbox controller overlays)".to_string(),
                description: "Screen recording and widget bar for PC gaming.".to_string(),
            },
            SafetyRating {
                key: "edge.startup".to_string(),
                name: "Microsoft Edge Startup Boost".to_string(),
                publisher: "Microsoft Corporation".to_string(),
                safety_score: 75,
                classification: "Optional Utility".to_string(),
                recommendation: "Disable if not using Edge as default browser".to_string(),
                description: "Pre-loads Edge background processes during Windows boot to accelerate initial launch.".to_string(),
            },
        ]
    }

    pub fn get_safety_summary() -> SafetyRatingSummary {
        let list = Self::get_curated_safety_database();
        let total = list.len();
        SafetyRatingSummary {
            total_ratings_known: total,
            ratings: list,
        }
    }

    /// Match an application or startup item name against safety intelligence
    pub fn lookup_rating(query: &str) -> Option<SafetyRating> {
        let q = query.to_lowercase();
        let db = Self::get_curated_safety_database();

        for item in db {
            if q.contains(&item.key) || q.contains(&item.name.to_lowercase()) {
                return Some(item);
            }
        }
        None
    }
}
