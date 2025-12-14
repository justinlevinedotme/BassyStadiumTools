pub mod models;
pub mod fm26;
pub mod stadium;
pub mod audio;
pub mod configs;
pub mod logs;
pub mod download;

use fm26::{detect_fm26_paths, inspect_fm26_install, install_bepinex_pack, install_custom_stadiums_pack, get_plugin_status, check_bepinex_installed};
use stadium::{list_bundles, read_team_mappings, write_team_mappings};
use audio::{read_audio_mappings, write_audio_mappings, list_audio_folders, inspect_audio_folder};
use configs::{
    read_stadium_injection_config, write_stadium_injection_config,
    read_audio_inject_config, write_audio_inject_config,
    read_crowd_inject_config, write_crowd_inject_config,
    read_adboards_config, write_adboards_config,
    list_config_files
};
use logs::{read_log, get_log_info, clear_log};
use download::{download_bepinex_from_r2, download_bepinex_from_url, cancel_download};

use tauri::Manager;
#[cfg(target_os = "windows")]
use tauri_plugin_decorum::WebviewWindowExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_decorum::init())
        .setup(|_app| {
            #[cfg(target_os = "windows")]
            {
                let main_window = _app.get_webview_window("main").unwrap();
                main_window.create_overlay_titlebar().unwrap();
            }
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            detect_fm26_paths,
            inspect_fm26_install,
            install_bepinex_pack,
            install_custom_stadiums_pack,
            get_plugin_status,
            check_bepinex_installed,
            list_bundles,
            read_team_mappings,
            write_team_mappings,
            read_audio_mappings,
            write_audio_mappings,
            list_audio_folders,
            inspect_audio_folder,
            read_stadium_injection_config,
            write_stadium_injection_config,
            read_audio_inject_config,
            write_audio_inject_config,
            read_crowd_inject_config,
            write_crowd_inject_config,
            read_adboards_config,
            write_adboards_config,
            list_config_files,
            read_log,
            get_log_info,
            clear_log,
            download_bepinex_from_r2,
            download_bepinex_from_url,
            cancel_download,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
