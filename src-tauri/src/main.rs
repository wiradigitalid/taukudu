// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust in TauKudu!", name)
}

#[tauri::command]
fn get_system_overview() -> serde_json::Value {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();

    serde_json::json!({
        "os_name": sysinfo::System::name().unwrap_or_else(|| "Unknown".to_string()),
        "os_version": sysinfo::System::os_version().unwrap_or_else(|| "".to_string()),
        "host_name": sysinfo::System::host_name().unwrap_or_else(|| "localhost".to_string()),
        "total_memory_bytes": sys.total_memory(),
        "used_memory_bytes": sys.used_memory(),
        "cpu_count": sys.cpus().len(),
    })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_system_overview])
        .run(tauri::generate_context!())
        .expect("error while running taukudu application");
}
