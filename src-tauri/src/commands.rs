use crate::models::CompetitionState;
use crate::server::SharedState;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn get_state(state: State<'_, Arc<SharedState>>) -> Result<CompetitionState, String> {
    Ok(state.competition.lock().clone())
}

#[tauri::command]
pub fn update_state(
    state: State<'_, Arc<SharedState>>,
    next: CompetitionState,
) -> Result<CompetitionState, String> {
    *state.competition.lock() = next.clone();
    persist_and_broadcast(&state, next.clone())?;
    Ok(next)
}

#[tauri::command]
pub fn export_json(state: State<'_, Arc<SharedState>>, path: String) -> Result<(), String> {
    let snapshot = state.competition.lock().clone();
    let json = serde_json::to_string_pretty(&snapshot).map_err(|err| err.to_string())?;
    fs::write(PathBuf::from(path), json).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn import_json(state: State<'_, Arc<SharedState>>, path: String) -> Result<CompetitionState, String> {
    let raw = fs::read_to_string(PathBuf::from(path)).map_err(|err| err.to_string())?;
    let imported = serde_json::from_str::<CompetitionState>(&raw)
        .map_err(|err| err.to_string())?
        .with_english_labels();
    *state.competition.lock() = imported.clone();
    persist_and_broadcast(&state, imported.clone())?;
    Ok(imported)
}

pub fn persist_and_broadcast(shared: &SharedState, snapshot: CompetitionState) -> Result<(), String> {
    if let Some(parent) = shared.data_path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }

    let json = serde_json::to_string_pretty(&snapshot).map_err(|err| err.to_string())?;
    fs::write(&shared.data_path, json).map_err(|err| err.to_string())?;

    let payload = serde_json::to_string(&snapshot).map_err(|err| err.to_string())?;
    shared.broadcaster.broadcast(&payload);
    Ok(())
}

pub fn load_or_seed(data_path: &PathBuf) -> CompetitionState {
    if data_path.exists() {
        match fs::read_to_string(data_path) {
            Ok(raw) => match serde_json::from_str::<CompetitionState>(&raw) {
                Ok(state) => return state.with_english_labels(),
                Err(err) => eprintln!("[persist] invalid competition_data.json: {err}"),
            },
            Err(err) => eprintln!("[persist] failed to read competition_data.json: {err}"),
        }
    }

    let seeded = CompetitionState::demo();
    if let Some(parent) = data_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(json) = serde_json::to_string_pretty(&seeded) {
        let _ = fs::write(data_path, json);
    }
    seeded
}
