use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacySetting {
    pub id: String,
    pub category: String,
    pub label: String,
    pub description: String,
    pub requires_admin: bool,
    pub is_enabled: bool, // true means privacy-friendly (telemetry disabled / protected)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyShieldState {
    pub settings: Vec<PrivacySetting>,
    pub protected_count: usize,
    pub total_count: usize,
    pub score_percentage: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyApplyResult {
    pub success: bool,
    pub applied_ids: Vec<String>,
    pub failed_ids: Vec<String>,
    pub errors: Vec<String>,
}

#[cfg(windows)]
mod win_ops {
    use winreg::enums::*;
    use winreg::RegKey;

    pub fn query_dword(hive_str: &str, subkey: &str, value_name: &str) -> Option<u32> {
        let hive = if hive_str == "HKLM" {
            RegKey::predef(HKEY_LOCAL_MACHINE)
        } else {
            RegKey::predef(HKEY_CURRENT_USER)
        };

        if let Ok(key) = hive.open_subkey(subkey) {
            if let Ok(val) = key.get_value::<u32, _>(value_name) {
                return Some(val);
            }
        }
        None
    }

    pub fn set_dword(hive_str: &str, subkey: &str, value_name: &str, val: u32) -> Result<(), String> {
        let hive = if hive_str == "HKLM" {
            RegKey::predef(HKEY_LOCAL_MACHINE)
        } else {
            RegKey::predef(HKEY_CURRENT_USER)
        };

        let (key, _) = hive
            .create_subkey(subkey)
            .map_err(|e| format!("Failed to open/create subkey {}: {}", subkey, e))?;

        key.set_value(value_name, &val)
            .map_err(|e| format!("Failed to set {}: {}", value_name, e))?;

        Ok(())
    }

    pub fn delete_value(hive_str: &str, subkey: &str, value_name: &str) -> Result<(), String> {
        let hive = if hive_str == "HKLM" {
            RegKey::predef(HKEY_LOCAL_MACHINE)
        } else {
            RegKey::predef(HKEY_CURRENT_USER)
        };

        if let Ok(key) = hive.open_subkey_with_flags(subkey, KEY_WRITE) {
            let _ = key.delete_value(value_name);
        }
        Ok(())
    }
}

pub struct PrivacyShieldEngine;

impl PrivacyShieldEngine {
    pub fn get_all_settings() -> PrivacyShieldState {
        let mut settings = Vec::new();

        // 1. Windows Telemetry Level
        let telem_val = Self::query_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\DataCollection", "AllowTelemetry");
        settings.push(PrivacySetting {
            id: "telemetry-level".to_string(),
            category: "telemetry".to_string(),
            label: "Windows Telemetry".to_string(),
            description: "Set diagnostic data collection to minimum (Security level only)".to_string(),
            requires_admin: true,
            is_enabled: telem_val == Some(0),
        });

        // 2. Activity History
        let act_val = Self::query_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\System", "EnableActivityFeed");
        settings.push(PrivacySetting {
            id: "activity-history".to_string(),
            category: "telemetry".to_string(),
            label: "Activity History".to_string(),
            description: "Stop Windows from tracking and syncing your app and file usage".to_string(),
            requires_admin: true,
            is_enabled: act_val == Some(0),
        });

        // 3. Publish User Activities
        let pub_val = Self::query_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\System", "PublishUserActivities");
        settings.push(PrivacySetting {
            id: "publish-activity".to_string(),
            category: "telemetry".to_string(),
            label: "Publish User Activities".to_string(),
            description: "Prevent Windows from publishing your activities to Microsoft".to_string(),
            requires_admin: true,
            is_enabled: pub_val == Some(0),
        });

        // 4. Feedback Prompts
        let siuf_val = Self::query_val("HKCU", r"SOFTWARE\Microsoft\Siuf\Rules", "NumberOfSIUFInPeriod");
        settings.push(PrivacySetting {
            id: "feedback-frequency".to_string(),
            category: "telemetry".to_string(),
            label: "Feedback Prompts".to_string(),
            description: "Disable periodic Microsoft feedback prompts and surveys".to_string(),
            requires_admin: false,
            is_enabled: siuf_val == Some(0),
        });

        // 5. Handwriting Telemetry
        let hand_val = Self::query_val("HKCU", r"SOFTWARE\Microsoft\Input\TIPC", "Enabled");
        settings.push(PrivacySetting {
            id: "handwriting-telemetry".to_string(),
            category: "telemetry".to_string(),
            label: "Handwriting Data".to_string(),
            description: "Stop sending handwriting and typing data to Microsoft".to_string(),
            requires_admin: false,
            is_enabled: hand_val == Some(0),
        });

        // 6. Input Personalization
        let in_val = Self::query_val("HKCU", r"SOFTWARE\Microsoft\Personalization\Settings", "AcceptedPrivacyPolicy");
        settings.push(PrivacySetting {
            id: "input-personalization".to_string(),
            category: "telemetry".to_string(),
            label: "Input Personalization".to_string(),
            description: "Disable typing and inking personalization data collection".to_string(),
            requires_admin: false,
            is_enabled: in_val == Some(0),
        });

        // 7. Tailored Experiences
        let tail_val = Self::query_val("HKCU", r"SOFTWARE\Microsoft\Windows\CurrentVersion\Privacy", "TailoredExperiencesWithDiagnosticDataEnabled");
        settings.push(PrivacySetting {
            id: "tailored-experiences".to_string(),
            category: "telemetry".to_string(),
            label: "Tailored Experiences".to_string(),
            description: "Stop Microsoft from using diagnostic data to personalize tips and ads".to_string(),
            requires_admin: false,
            is_enabled: tail_val == Some(0),
        });

        // 8. Advertising ID
        let ad_val = Self::query_val("HKCU", r"SOFTWARE\Microsoft\Windows\CurrentVersion\AdvertisingInfo", "Enabled");
        settings.push(PrivacySetting {
            id: "advertising-id".to_string(),
            category: "advertising".to_string(),
            label: "Advertising ID".to_string(),
            description: "Prevent apps from using advertising ID for personalized experiences".to_string(),
            requires_admin: false,
            is_enabled: ad_val == Some(0),
        });

        // 9. Location Tracking
        let loc_val = Self::query_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors", "DisableLocation");
        settings.push(PrivacySetting {
            id: "location-tracking".to_string(),
            category: "location".to_string(),
            label: "Location Tracking".to_string(),
            description: "Disable operating system location sensor and tracking APIs".to_string(),
            requires_admin: true,
            is_enabled: loc_val == Some(1),
        });

        // 10. Web Search in Start Menu (Bing in Start)
        let bing_val = Self::query_val("HKCU", r"SOFTWARE\Policies\Microsoft\Windows\Explorer", "DisableSearchBoxSuggestions");
        settings.push(PrivacySetting {
            id: "bing-search-start".to_string(),
            category: "cortana".to_string(),
            label: "Bing Web Search in Start".to_string(),
            description: "Stop Start menu search queries from being sent to Bing".to_string(),
            requires_admin: false,
            is_enabled: bing_val == Some(1),
        });

        // 11. Cortana Voice Assistant
        let cort_val = Self::query_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\Windows Search", "AllowCortana");
        settings.push(PrivacySetting {
            id: "cortana-voice".to_string(),
            category: "cortana".to_string(),
            label: "Cortana Voice Assistant".to_string(),
            description: "Disable Cortana voice assistant integration and background listening".to_string(),
            requires_admin: true,
            is_enabled: cort_val == Some(0),
        });

        let total_count = settings.len();
        let protected_count = settings.iter().filter(|s| s.is_enabled).count();
        let score_percentage = if total_count > 0 {
            ((protected_count as f32 / total_count as f32) * 100.0) as u32
        } else {
            100
        };

        PrivacyShieldState {
            settings,
            protected_count,
            total_count,
            score_percentage,
        }
    }

    pub fn apply_setting(id: &str, enable_privacy: bool) -> Result<(), String> {
        match id {
            "telemetry-level" => {
                if enable_privacy {
                    Self::set_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\DataCollection", "AllowTelemetry", 0)
                } else {
                    Self::del_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\DataCollection", "AllowTelemetry")
                }
            }
            "activity-history" => {
                if enable_privacy {
                    Self::set_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\System", "EnableActivityFeed", 0)
                } else {
                    Self::del_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\System", "EnableActivityFeed")
                }
            }
            "publish-activity" => {
                if enable_privacy {
                    Self::set_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\System", "PublishUserActivities", 0)
                } else {
                    Self::del_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\System", "PublishUserActivities")
                }
            }
            "feedback-frequency" => {
                if enable_privacy {
                    Self::set_val("HKCU", r"SOFTWARE\Microsoft\Siuf\Rules", "NumberOfSIUFInPeriod", 0)
                } else {
                    Self::del_val("HKCU", r"SOFTWARE\Microsoft\Siuf\Rules", "NumberOfSIUFInPeriod")
                }
            }
            "handwriting-telemetry" => {
                Self::set_val("HKCU", r"SOFTWARE\Microsoft\Input\TIPC", "Enabled", if enable_privacy { 0 } else { 1 })
            }
            "input-personalization" => {
                Self::set_val("HKCU", r"SOFTWARE\Microsoft\Personalization\Settings", "AcceptedPrivacyPolicy", if enable_privacy { 0 } else { 1 })
            }
            "tailored-experiences" => {
                Self::set_val("HKCU", r"SOFTWARE\Microsoft\Windows\CurrentVersion\Privacy", "TailoredExperiencesWithDiagnosticDataEnabled", if enable_privacy { 0 } else { 1 })
            }
            "advertising-id" => {
                Self::set_val("HKCU", r"SOFTWARE\Microsoft\Windows\CurrentVersion\AdvertisingInfo", "Enabled", if enable_privacy { 0 } else { 1 })
            }
            "location-tracking" => {
                if enable_privacy {
                    Self::set_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors", "DisableLocation", 1)
                } else {
                    Self::del_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors", "DisableLocation")
                }
            }
            "bing-search-start" => {
                if enable_privacy {
                    Self::set_val("HKCU", r"SOFTWARE\Policies\Microsoft\Windows\Explorer", "DisableSearchBoxSuggestions", 1)
                } else {
                    Self::del_val("HKCU", r"SOFTWARE\Policies\Microsoft\Windows\Explorer", "DisableSearchBoxSuggestions")
                }
            }
            "cortana-voice" => {
                if enable_privacy {
                    Self::set_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\Windows Search", "AllowCortana", 0)
                } else {
                    Self::del_val("HKLM", r"SOFTWARE\Policies\Microsoft\Windows\Windows Search", "AllowCortana")
                }
            }
            _ => Err(format!("Unknown privacy setting ID: {}", id)),
        }
    }

    fn query_val(hive: &str, subkey: &str, value: &str) -> Option<u32> {
        #[cfg(windows)]
        {
            win_ops::query_dword(hive, subkey, value)
        }
        #[cfg(not(windows))]
        {
            let _ = (hive, subkey, value);
            None
        }
    }

    fn set_val(hive: &str, subkey: &str, value: &str, val: u32) -> Result<(), String> {
        #[cfg(windows)]
        {
            win_ops::set_dword(hive, subkey, value, val)
        }
        #[cfg(not(windows))]
        {
            let _ = (hive, subkey, value, val);
            Ok(())
        }
    }

    fn del_val(hive: &str, subkey: &str, value: &str) -> Result<(), String> {
        #[cfg(windows)]
        {
            win_ops::delete_value(hive, subkey, value)
        }
        #[cfg(not(windows))]
        {
            let _ = (hive, subkey, value);
            Ok(())
        }
    }
}
