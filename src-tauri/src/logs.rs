use crate::models::Fm26Installation;
use std::fs;
use std::path::Path;

/// Reads the BepInEx log file content
#[tauri::command]
pub fn read_log(install: Fm26Installation) -> Result<String, String> {
    let log_path = Path::new(&install.log_path);

    if !log_path.exists() {
        return Ok(String::new());
    }

    fs::read_to_string(log_path)
        .map_err(|e| format!("Failed to read log file: {}", e))
}

/// Gets log file metadata
#[tauri::command]
pub fn get_log_info(install: Fm26Installation) -> Result<LogInfo, String> {
    let log_path = Path::new(&install.log_path);

    if !log_path.exists() {
        return Ok(LogInfo {
            exists: false,
            size_bytes: 0,
            modified: None,
            path: install.log_path,
        });
    }

    let metadata = fs::metadata(log_path)
        .map_err(|e| format!("Failed to read log metadata: {}", e))?;

    let modified = metadata
        .modified()
        .ok()
        .map(|t| {
            let datetime: chrono::DateTime<chrono::Utc> = t.into();
            datetime.format("%Y-%m-%d %H:%M:%S").to_string()
        });

    Ok(LogInfo {
        exists: true,
        size_bytes: metadata.len(),
        modified,
        path: install.log_path,
    })
}

/// Clears the log file
#[tauri::command]
pub fn clear_log(install: Fm26Installation) -> Result<(), String> {
    let log_path = Path::new(&install.log_path);

    if log_path.exists() {
        fs::write(log_path, "")
            .map_err(|e| format!("Failed to clear log file: {}", e))?;
    }

    Ok(())
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogInfo {
    pub exists: bool,
    pub size_bytes: u64,
    pub modified: Option<String>,
    pub path: String,
}
