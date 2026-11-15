mod commands;
mod models;
mod server;

use commands::{export_json, get_state, import_json, load_or_seed, update_state};
use parking_lot::Mutex;
use server::{start, SharedState, SseBroadcaster};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            let _ = std::fs::create_dir_all(&data_dir);
            let data_path = data_dir.join("competition_data.json");

            let static_dir = resolve_static_dir(app.handle());
            let competition = load_or_seed(&data_path);

            let shared = Arc::new(SharedState {
                competition: Mutex::new(competition),
                broadcaster: SseBroadcaster::new(),
                data_path,
                static_dir,
            });

            start(Arc::clone(&shared));
            app.manage(shared);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_state,
            update_state,
            export_json,
            import_json
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn resolve_static_dir(app: &tauri::AppHandle) -> PathBuf {
    if let Ok(resource_dir) = app.path().resource_dir() {
        let bundled = resource_dir.join("resources").join("dist");
        if bundled.join("index.html").exists() {
            return bundled;
        }

        let flat = resource_dir.join("dist");
        if flat.join("index.html").exists() {
            return flat;
        }
    }

    let manifest_resources = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/dist");
    if manifest_resources.join("index.html").exists() {
        return manifest_resources;
    }

    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../dist")
}
