use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

pub const MIN_WINDOW_WIDTH: u32 = 900;
pub const MIN_WINDOW_HEIGHT: u32 = 600;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowGeometryState {
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub width: u32,
    pub height: u32,
    pub is_maximized: bool,
}

impl Default for WindowGeometryState {
    fn default() -> Self {
        Self {
            x: None,
            y: None,
            width: 1150,
            height: 750,
            is_maximized: false,
        }
    }
}

pub struct WindowStateEngine {
    file_path: Mutex<PathBuf>,
    state: Mutex<WindowGeometryState>,
}

impl WindowStateEngine {
    pub fn new() -> Self {
        let base_dir = if let Ok(appdata) = std::env::var("LOCALAPPDATA") {
            PathBuf::from(appdata).join("TauKudu")
        } else {
            PathBuf::from(".taukudu_data")
        };
        let _ = fs::create_dir_all(&base_dir);
        let path = base_dir.join("window_state.json");

        let mut current = WindowGeometryState::default();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(parsed) = serde_json::from_str::<WindowGeometryState>(&content) {
                    current = parsed;
                }
            }
        }

        Self {
            file_path: Mutex::new(path),
            state: Mutex::new(current),
        }
    }

    fn persist(&self) {
        let s = self.state.lock().unwrap();
        let path = self.file_path.lock().unwrap();
        if let Ok(content) = serde_json::to_string_pretty(&*s) {
            let mut tmp = path.clone();
            tmp.set_extension("tmp");
            if fs::write(&tmp, content).is_ok() {
                let _ = fs::rename(tmp, &*path);
            }
        }
    }

    pub fn get_window_state(&self) -> WindowGeometryState {
        let s = self.state.lock().unwrap().clone();
        let width = s.width.max(MIN_WINDOW_WIDTH);
        let height = s.height.max(MIN_WINDOW_HEIGHT);
        WindowGeometryState {
            width,
            height,
            ..s
        }
    }

    pub fn save_window_state(&self, mut state: WindowGeometryState) -> WindowGeometryState {
        state.width = state.width.max(MIN_WINDOW_WIDTH);
        state.height = state.height.max(MIN_WINDOW_HEIGHT);
        {
            let mut s = self.state.lock().unwrap();
            *s = state.clone();
        }
        self.persist();
        state
    }
}

// Global Singleton
lazy_static::lazy_static! {
    pub static ref GLOBAL_WINDOW_STATE: WindowStateEngine = WindowStateEngine::new();
}
