pub mod models;
pub mod fm26;
pub mod stadium;
pub mod audio;
pub mod configs;
pub mod logs;

use fm26::{inspect_fm26_install, install_bepinex_pack, install_custom_stadiums_pack, get_plugin_status};
use stadium::{list_bundles, read_team_mappings, write_team_mappings};
use audio::{read_audio_mappings, write_audio_mappings, list_audio_folders, inspect_audio_folder};
use configs::{read_stadium_injection_config, write_stadium_injection_config, list_config_files};
use logs::{read_log, get_log_info, clear_log};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            inspect_fm26_install,
            install_bepinex_pack,
            install_custom_stadiums_pack,
            get_plugin_status,
            list_bundles,
            read_team_mappings,
            write_team_mappings,
            read_audio_mappings,
            write_audio_mappings,
            list_audio_folders,
            inspect_audio_folder,
            read_stadium_injection_config,
            write_stadium_injection_config,
            list_config_files,
            read_log,
            get_log_info,
            clear_log,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
