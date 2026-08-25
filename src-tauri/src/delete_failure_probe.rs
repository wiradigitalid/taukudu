use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeleteProbeStatus {
    Accessible,
    InUse,
    PermissionDenied,
    NotFound,
    OtherError(u32),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeletePathProbeResult {
    pub path: String,
    pub status: String,
    pub error_code: u32,
    pub is_deletable: bool,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeleteProbeSummary {
    pub total_probed: usize,
    pub accessible_count: usize,
    pub in_use_count: usize,
    pub permission_denied_count: usize,
    pub results: Vec<DeletePathProbeResult>,
}

pub struct DeleteFailureProbeEngine;

impl DeleteFailureProbeEngine {
    #[cfg(windows)]
    fn probe_single_path_windows(path_str: &str) -> (String, u32, bool, String) {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;
        use windows::Win32::Foundation::{CloseHandle, GENERIC_READ, HANDLE, INVALID_HANDLE_VALUE};
        use windows::Win32::Storage::FileSystem::{
            CreateFileW, FILE_FLAGS_AND_ATTRIBUTES, FILE_FLAG_BACKUP_SEMANTICS,
            FILE_SHARE_DELETE, FILE_SHARE_READ, FILE_SHARE_WRITE, OPEN_EXISTING,
        };

        const DELETE_ACCESS: u32 = 0x00010000;
        let p = Path::new(path_str);
        if !p.exists() {
            return (
                "NotFound".to_string(),
                2,
                false,
                "File or directory does not exist".to_string(),
            );
        }

        let is_dir = p.is_dir();
        let wide: Vec<u16> = OsStr::new(path_str)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        let flags = if is_dir {
            FILE_FLAG_BACKUP_SEMANTICS
        } else {
            FILE_FLAGS_AND_ATTRIBUTES(0)
        };

        unsafe {
            let handle_res = CreateFileW(
                windows::core::PCWSTR(wide.as_ptr()),
                DELETE_ACCESS,
                FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
                None,
                OPEN_EXISTING,
                flags,
                HANDLE::default(),
            );

            match handle_res {
                Ok(handle) => {
                    if handle == INVALID_HANDLE_VALUE {
                        let err = windows::core::Error::from_win32().code().0 as u32;
                        Self::classify_win32_error(err)
                    } else {
                        let _ = CloseHandle(handle);
                        (
                            "Accessible".to_string(),
                            0,
                            true,
                            "File is unlocked and ready for deletion".to_string(),
                        )
                    }
                }
                Err(e) => {
                    let err = e.code().0 as u32;
                    Self::classify_win32_error(err)
                }
            }
        }
    }

    #[cfg(windows)]
    fn classify_win32_error(code: u32) -> (String, u32, bool, String) {
        match code {
            5 => (
                "PermissionDenied".to_string(),
                5,
                false,
                "Access Denied (Requires administrator elevation or file ownership)".to_string(),
            ),
            32 | 33 => (
                "InUse".to_string(),
                code,
                false,
                "Sharing Violation (File is locked by an active running process)".to_string(),
            ),
            2 | 3 => (
                "NotFound".to_string(),
                code,
                false,
                "File path not found".to_string(),
            ),
            _ => (
                format!("Win32Error({})", code),
                code,
                false,
                format!("Locked by Windows OS (Error code {})", code),
            ),
        }
    }

    #[cfg(not(windows))]
    fn probe_single_path_windows(path_str: &str) -> (String, u32, bool, String) {
        let p = Path::new(path_str);
        if !p.exists() {
            return ("NotFound".to_string(), 2, false, "Path not found".to_string());
        }
        ("Accessible".to_string(), 0, true, "Ready".to_string())
    }

    pub fn probe_paths(paths: &[String]) -> DeleteProbeSummary {
        let mut results = Vec::new();
        let mut accessible = 0;
        let mut in_use = 0;
        let mut perm_denied = 0;

        for path in paths {
            let (status, code, deletable, reason) = Self::probe_single_path_windows(path);
            if status == "Accessible" {
                accessible += 1;
            } else if status == "InUse" {
                in_use += 1;
            } else if status == "PermissionDenied" {
                perm_denied += 1;
            }

            results.push(DeletePathProbeResult {
                path: path.clone(),
                status,
                error_code: code,
                is_deletable: deletable,
                reason,
            });
        }

        let total = results.len();
        DeleteProbeSummary {
            total_probed: total,
            accessible_count: accessible,
            in_use_count: in_use,
            permission_denied_count: perm_denied,
            results,
        }
    }
}
