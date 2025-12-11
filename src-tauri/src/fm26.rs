use crate::models::{Fm26Installation, PluginStatus};
use std::fs;
use std::io;
use std::path::Path;
use chrono::Local;
use tauri::Manager;
use zip::ZipArchive;

/// Inspects an FM26 installation directory and returns structured paths
#[tauri::command]
pub fn inspect_fm26_install(root_path: String) -> Result<Fm26Installation, String> {
    let root = Path::new(&root_path);

    // Check if the root path exists
    if !root.exists() {
        return Err(format!("Directory does not exist: {}", root_path));
    }

    if !root.is_dir() {
        return Err(format!("Path is not a directory: {}", root_path));
    }

    // Build the expected paths
    let bep_in_ex_path = root.join("BepInEx");
    let plugins_path = bep_in_ex_path.join("plugins");
    let custom_stadium_path = plugins_path.join("CustomStadium");
    let audio_inject_path = plugins_path.join("AudioInject");
    let config_path = bep_in_ex_path.join("config");
    let log_path = bep_in_ex_path.join("LogOutput.log");

    Ok(Fm26Installation {
        root_path: root_path.clone(),
        bep_in_ex_path: bep_in_ex_path.to_string_lossy().to_string(),
        plugins_path: plugins_path.to_string_lossy().to_string(),
        custom_stadium_path: custom_stadium_path.to_string_lossy().to_string(),
        audio_inject_path: audio_inject_path.to_string_lossy().to_string(),
        config_path: config_path.to_string_lossy().to_string(),
        log_path: log_path.to_string_lossy().to_string(),
    })
}

/// Installs the BepInEx pack by extracting the bundled zip file
#[tauri::command]
pub fn install_bepinex_pack(
    app_handle: tauri::AppHandle,
    install: Fm26Installation,
) -> Result<(), String> {
    let root = Path::new(&install.root_path);
    let bepinex_path = root.join("BepInEx");

    // Backup existing BepInEx folder if it exists
    if bepinex_path.exists() {
        let timestamp = Local::now().format("%Y%m%d_%H%M%S");
        let backup_name = format!("BepInEx_backup_{}", timestamp);
        let backup_path = root.join(&backup_name);

        // Remove any previous backup (keep only most recent)
        if let Ok(entries) = fs::read_dir(root) {
            for entry in entries.flatten() {
                let name = entry.file_name();
                let name_str = name.to_string_lossy();
                if name_str.starts_with("BepInEx_backup_") && entry.path() != backup_path {
                    if entry.path().is_dir() {
                        let _ = fs::remove_dir_all(entry.path());
                    }
                }
            }
        }

        // Rename current BepInEx to backup
        fs::rename(&bepinex_path, &backup_path)
            .map_err(|e| format!("Failed to backup existing BepInEx folder: {}", e))?;
    }

    // Get the resource path for the bundled zip
    let resource_path = app_handle
        .path()
        .resolve("resources/bepinex_pack.zip", tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve resource path: {}", e))?;

    if !resource_path.exists() {
        return Err("BepInEx pack not found in resources. Please reinstall the application.".to_string());
    }

    // Extract the zip file
    let file = fs::File::open(&resource_path)
        .map_err(|e| format!("Failed to open BepInEx pack: {}", e))?;

    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read BepInEx pack archive: {}", e))?;

    // The zip has a root folder "BepInExStadiums/" that we need to strip
    let strip_prefix = "BepInExStadiums/";

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("Failed to read archive entry: {}", e))?;

        let file_path = match file.enclosed_name() {
            Some(path) => path.to_path_buf(),
            None => continue,
        };

        // Strip the root folder prefix
        let relative_path = file_path
            .to_string_lossy()
            .strip_prefix(strip_prefix)
            .map(|s| std::path::PathBuf::from(s))
            .unwrap_or(file_path);

        // Skip if this is just the root folder itself
        if relative_path.as_os_str().is_empty() {
            continue;
        }

        let outpath = root.join(&relative_path);

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath)
                .map_err(|e| format!("Failed to create directory {}: {}", outpath.display(), e))?;
        } else {
            if let Some(parent) = outpath.parent() {
                if !parent.exists() {
                    fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create parent directory: {}", e))?;
                }
            }

            let mut outfile = fs::File::create(&outpath)
                .map_err(|e| format!("Failed to create file {}: {}", outpath.display(), e))?;

            io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("Failed to write file {}: {}", outpath.display(), e))?;
        }

        // Set permissions on Unix systems
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).ok();
            }
        }
    }

    Ok(())
}

/// Installs custom stadiums from a user-selected zip file
#[tauri::command]
pub fn install_custom_stadiums_pack(
    zip_path: String,
    install: Fm26Installation,
) -> Result<u32, String> {
    let zip_file = Path::new(&zip_path);

    if !zip_file.exists() {
        return Err(format!("Zip file not found: {}", zip_path));
    }

    let custom_stadium_path = Path::new(&install.custom_stadium_path);

    // Create CustomStadium directory if it doesn't exist
    if !custom_stadium_path.exists() {
        fs::create_dir_all(custom_stadium_path)
            .map_err(|e| format!("Failed to create CustomStadium directory: {}", e))?;
    }

    // Open and extract the zip
    let file = fs::File::open(zip_file)
        .map_err(|e| format!("Failed to open zip file: {}", e))?;

    let mut archive = ZipArchive::new(file)
        .map_err(|e| format!("Failed to read zip archive: {}", e))?;

    // The zip has a root folder "CustomStadium/" that we need to strip
    let strip_prefix = "CustomStadium/";
    let mut files_extracted: u32 = 0;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("Failed to read archive entry: {}", e))?;

        let file_path = match file.enclosed_name() {
            Some(path) => path.to_path_buf(),
            None => continue,
        };

        // Strip the root folder prefix
        let relative_path = file_path
            .to_string_lossy()
            .strip_prefix(strip_prefix)
            .map(|s| std::path::PathBuf::from(s))
            .unwrap_or(file_path);

        // Skip if this is just the root folder itself
        if relative_path.as_os_str().is_empty() {
            continue;
        }

        let outpath = custom_stadium_path.join(&relative_path);

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath)
                .map_err(|e| format!("Failed to create directory {}: {}", outpath.display(), e))?;
        } else {
            if let Some(parent) = outpath.parent() {
                if !parent.exists() {
                    fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create parent directory: {}", e))?;
                }
            }

            let mut outfile = fs::File::create(&outpath)
                .map_err(|e| format!("Failed to create file {}: {}", outpath.display(), e))?;

            io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("Failed to write file {}: {}", outpath.display(), e))?;

            files_extracted += 1;
        }

        // Set permissions on Unix systems
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).ok();
            }
        }
    }

    Ok(files_extracted)
}

/// Gets the status of all BepInEx plugins
#[tauri::command]
pub fn get_plugin_status(install: Fm26Installation) -> Vec<PluginStatus> {
    let plugins = vec![
        ("StadiumInjection", "StadiumInjection/StadiumInjection.dll"),
        ("AudioInject", "AudioInject/AudioInject.dll"),
        ("CrowdInject", "CrowdInject/CrowdInject.dll"),
    ];

    let plugins_path = Path::new(&install.plugins_path);

    plugins
        .into_iter()
        .map(|(name, rel_path)| {
            let full_path = plugins_path.join(rel_path);
            PluginStatus {
                name: name.to_string(),
                path: full_path.to_string_lossy().to_string(),
                installed: full_path.exists(),
            }
        })
        .collect()
}
