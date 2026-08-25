use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartupItem {
    pub id: String,
    pub name: String,
    pub command: String,
    pub location: String,
    pub is_enabled: bool,
    pub impact_rating: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BloatwareApp {
    pub id: String,
    pub name: String,
    pub package_name: String,
    pub publisher: String,
    pub category: String,
    pub description: String,
    pub is_installed: bool,
}

#[cfg(windows)]
mod win_startup {
    use super::StartupItem;
    use std::env;
    use std::fs;
    use std::path::Path;
    use winreg::enums::*;
    use winreg::RegKey;

    pub fn list_items() -> Vec<StartupItem> {
        let mut items = Vec::new();

        // 1. HKCU Run
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        if let Ok(key) = hkcu.open_subkey(r"Software\Microsoft\Windows\CurrentVersion\Run") {
            for (name, val) in key.enum_values().flatten() {
                let cmd = val.to_string();
                let impact = estimate_impact(&cmd);
                items.push(StartupItem {
                    id: format!("hkcu:{}", name),
                    name: name.clone(),
                    command: cmd,
                    location: "HKCU Run".to_string(),
                    is_enabled: true,
                    impact_rating: impact,
                });
            }
        }

        // 2. HKLM Run
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        if let Ok(key) = hklm.open_subkey(r"Software\Microsoft\Windows\CurrentVersion\Run") {
            for (name, val) in key.enum_values().flatten() {
                let cmd = val.to_string();
                let impact = estimate_impact(&cmd);
                items.push(StartupItem {
                    id: format!("hklm:{}", name),
                    name: name.clone(),
                    command: cmd,
                    location: "HKLM Run".to_string(),
                    is_enabled: true,
                    impact_rating: impact,
                });
            }
        }

        // 3. User Startup Folder
        if let Ok(appdata) = env::var("APPDATA") {
            let startup_dir = Path::new(&appdata)
                .join(r"Microsoft\Windows\Start Menu\Programs\Startup");
            if startup_dir.is_dir() {
                if let Ok(entries) = fs::read_dir(startup_dir) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() {
                            let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                            let cmd = path.to_string_lossy().to_string();
                            items.push(StartupItem {
                                id: format!("folder:{}", name),
                                name: name.clone(),
                                command: cmd,
                                location: "Startup Folder".to_string(),
                                is_enabled: true,
                                impact_rating: "Medium".to_string(),
                            });
                        }
                    }
                }
            }
        }

        items
    }

    pub fn toggle_item(id: &str, enable: bool) -> Result<(), String> {
        let parts: Vec<&str> = id.splitn(2, ':').collect();
        if parts.len() != 2 {
            return Err("Invalid ID format".to_string());
        }
        let loc_type = parts[0];
        let name = parts[1];

        match loc_type {
            "hkcu" => {
                let hkcu = RegKey::predef(HKEY_CURRENT_USER);
                let (key, _) = hkcu
                    .create_subkey(r"Software\Microsoft\Windows\CurrentVersion\Run")
                    .map_err(|e| e.to_string())?;
                if !enable {
                    let _ = key.delete_value(name);
                }
                Ok(())
            }
            "hklm" => {
                let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
                let (key, _) = hklm
                    .create_subkey(r"Software\Microsoft\Windows\CurrentVersion\Run")
                    .map_err(|e| e.to_string())?;
                if !enable {
                    let _ = key.delete_value(name);
                }
                Ok(())
            }
            _ => Ok(()),
        }
    }

    fn estimate_impact(command: &str) -> String {
        let lower = command.to_lowercase();
        if lower.contains("steam") || lower.contains("discord") || lower.contains("spotify") || lower.contains("epicgames") {
            "High".to_string()
        } else if lower.contains("onedrive") || lower.contains("dropbox") || lower.contains("security") {
            "Medium".to_string()
        } else {
            "Low".to_string()
        }
    }
}

pub struct StartupDebloatEngine;

impl StartupDebloatEngine {
    pub fn list_startup_items() -> Vec<StartupItem> {
        #[cfg(windows)]
        {
            win_startup::list_items()
        }
        #[cfg(not(windows))]
        {
            Vec::new()
        }
    }

    pub fn toggle_startup_item(id: &str, enable: bool) -> Result<(), String> {
        #[cfg(windows)]
        {
            win_startup::toggle_item(id, enable)
        }
        #[cfg(not(windows))]
        {
            let _ = (id, enable);
            Ok(())
        }
    }

    pub fn list_known_bloatware() -> Vec<BloatwareApp> {
        let catalog = vec![
            ("Microsoft.Microsoft3DViewer", "3D Viewer", "Microsoft", "microsoft", "3D model viewer — rarely used"),
            ("Microsoft.BingNews", "Bing News", "Microsoft", "microsoft", "News aggregator with promotional feeds"),
            ("Microsoft.BingWeather", "Bing Weather", "Microsoft", "microsoft", "Weather app with news & ads"),
            ("Clipchamp.Clipchamp", "Clipchamp", "Microsoft", "microsoft", "Video editor promoting paid subscription"),
            ("Microsoft.549981C3F5F10", "Cortana", "Microsoft", "microsoft", "Voice assistant background resource"),
            ("Microsoft.WindowsFeedbackHub", "Feedback Hub", "Microsoft", "microsoft", "Feedback submission tool"),
            ("Microsoft.GetHelp", "Get Help", "Microsoft", "microsoft", "Windows help app with online links"),
            ("Microsoft.WindowsMaps", "Maps", "Microsoft", "microsoft", "Windows Maps application"),
            ("Microsoft.MicrosoftSolitaireCollection", "Solitaire Collection", "Microsoft", "gaming", "Solitaire with ads and Xbox sync"),
            ("Microsoft.Getstarted", "Microsoft Tips", "Microsoft", "microsoft", "Tips and promotional guidance app"),
            ("Microsoft.Todos", "Microsoft To Do", "Microsoft", "microsoft", "Task management app"),
            ("Microsoft.MixedReality.Portal", "Mixed Reality Portal", "Microsoft", "microsoft", "VR/AR portal for Windows headsets"),
            ("Microsoft.ZuneVideo", "Films & TV", "Microsoft", "media", "Built-in media player"),
            ("Microsoft.ZuneMusic", "Groove Music", "Microsoft", "media", "Legacy music player"),
            ("Microsoft.YourPhone", "Phone Link", "Microsoft", "communication", "Phone-to-PC sync background service"),
            ("Microsoft.SkypeApp", "Skype", "Microsoft", "communication", "Skype UWP application"),
            ("SpotifyAB.SpotifyMusic", "Spotify (UWP)", "Spotify", "media", "Pre-installed Spotify promotional package"),
            ("BytedancePte.Ltd.TikTok", "TikTok (UWP)", "ByteDance", "media", "Pre-installed TikTok shortcut package"),
            ("Facebook.InstagramBeta", "Instagram", "Meta", "communication", "Pre-installed Instagram package"),
            ("king.com.CandyCrushSaga", "Candy Crush Saga", "King", "gaming", "Pre-installed promotional game"),
            ("king.com.CandyCrushFriends", "Candy Crush Friends", "King", "gaming", "Pre-installed promotional game"),
            ("PlaytikaSantaMonica.CaesarsSlotsFreeCasino", "Caesars Slots", "Playtika", "gaming", "Pre-installed promotional game"),
        ];

        catalog
            .into_iter()
            .enumerate()
            .map(|(i, (pkg, name, publ, cat, desc))| BloatwareApp {
                id: format!("bloat-{}", i),
                name: name.to_string(),
                package_name: pkg.to_string(),
                publisher: publ.to_string(),
                category: cat.to_string(),
                description: desc.to_string(),
                is_installed: true,
            })
            .collect()
    }

    pub fn remove_bloatware_packages(package_names: &[String]) -> Vec<String> {
        let mut uninstalled = Vec::new();

        #[cfg(windows)]
        {
            use std::process::Command;
            for pkg in package_names {
                let script = format!("Get-AppxPackage -Name {} | Remove-AppxPackage -ErrorAction SilentlyContinue", pkg);
                let _ = Command::new("powershell")
                    .args(["-NoProfile", "-NonInteractive", "-Command", &script])
                    .output();
                uninstalled.push(pkg.clone());
            }
        }
        #[cfg(not(windows))]
        {
            for pkg in package_names {
                uninstalled.push(pkg.clone());
            }
        }

        uninstalled
    }
}
