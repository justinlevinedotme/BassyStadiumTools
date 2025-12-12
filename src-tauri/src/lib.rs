pub mod models;
pub mod fm26;
pub mod stadium;
pub mod audio;
pub mod configs;
pub mod logs;

use dotenvy_macro::dotenv;
use tauri_plugin_posthog::PostHogConfig;
use fm26::{detect_fm26_paths, inspect_fm26_install, install_bepinex_pack, install_custom_stadiums_pack, get_plugin_status};
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_posthog::init(PostHogConfig {
            api_key: dotenv!("POSTHOG_KEY").to_string(),
            api_host: "https://us.i.posthog.com".to_string(),
            options: None,
        }))
        .invoke_handler(tauri::generate_handler![
            detect_fm26_paths,
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
        ])
        .setup(|_app| {
            // Analytics tracking happens on the frontend via PostHog API
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_handler, _event| {
            // PostHog handles event flushing automatically
        });
}
