use crate::models::{BepInExStatus, Fm26Installation, PluginStatus};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use chrono::Local;
use tauri::Manager;
use zip::ZipArchive;

/// Detects possible FM26 installation paths on the system
#[tauri::command]
pub fn detect_fm26_paths() -> Vec<String> {
    let mut paths: Vec<String> = Vec::new();

    #[cfg(target_os = "windows")]
    {
        // Common Steam paths
        let steam_paths = vec![
            r"C:\Program Files (x86)\Steam\steamapps\common\Football Manager 2026",
            r"C:\Program Files\Steam\steamapps\common\Football Manager 2026",
            r"D:\Steam\steamapps\common\Football Manager 2026",
            r"D:\SteamLibrary\steamapps\common\Football Manager 2026",
            r"E:\Steam\steamapps\common\Football Manager 2026",
            r"E:\SteamLibrary\steamapps\common\Football Manager 2026",
            r"F:\Steam\steamapps\common\Football Manager 2026",
            r"F:\SteamLibrary\steamapps\common\Football Manager 2026",
        ];

        // Common Epic Games paths
        let epic_paths = vec![
            r"C:\Program Files\Epic Games\FootballManager2026",
            r"C:\Program Files (x86)\Epic Games\FootballManager2026",
            r"D:\Epic Games\FootballManager2026",
            r"E:\Epic Games\FootballManager2026",
        ];

        // Check Steam paths
        for path_str in steam_paths {
            let path = Path::new(path_str);
            if path.exists() && is_valid_fm26_dir(path) {
                paths.push(path_str.to_string());
            }
        }

        // Check Epic paths
        for path_str in epic_paths {
            let path = Path::new(path_str);
            if path.exists() && is_valid_fm26_dir(path) {
                paths.push(path_str.to_string());
            }
        }

        // Try to find Steam library folders from libraryfolders.vdf
        if let Some(steam_libs) = find_steam_library_folders() {
            for lib in steam_libs {
                let fm_path = lib.join("steamapps").join("common").join("Football Manager 2026");
                if fm_path.exists() && is_valid_fm26_dir(&fm_path) {
                    let path_str = fm_path.to_string_lossy().to_string();
                    if !paths.contains(&path_str) {
                        paths.push(path_str);
                    }
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        // Steam on macOS
        if let Some(home) = dirs::home_dir() {
            let steam_path = home
                .join("Library/Application Support/Steam/steamapps/common/Football Manager 2026");
            if steam_path.exists() && is_valid_fm26_dir(&steam_path) {
                paths.push(steam_path.to_string_lossy().to_string());
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        // Steam on Linux
        if let Some(home) = dirs::home_dir() {
            let steam_paths = vec![
                home.join(".steam/steam/steamapps/common/Football Manager 2026"),
                home.join(".local/share/Steam/steamapps/common/Football Manager 2026"),
            ];
            for steam_path in steam_paths {
                if steam_path.exists() && is_valid_fm26_dir(&steam_path) {
                    paths.push(steam_path.to_string_lossy().to_string());
                }
            }
        }
    }

    paths
}

/// Checks if a directory looks like a valid FM26 installation
fn is_valid_fm26_dir(path: &Path) -> bool {
    // Look for common FM files/folders
    let exe_path = path.join("fm.exe");
    let exe_path_alt = path.join("Football Manager 2026.exe");
    let data_path = path.join("data");

    exe_path.exists() || exe_path_alt.exists() || data_path.exists()
}

/// Find Steam library folders from libraryfolders.vdf
#[cfg(target_os = "windows")]
fn find_steam_library_folders() -> Option<Vec<PathBuf>> {
    let vdf_paths = vec![
        PathBuf::from(r"C:\Program Files (x86)\Steam\steamapps\libraryfolders.vdf"),
        PathBuf::from(r"C:\Program Files\Steam\steamapps\libraryfolders.vdf"),
    ];

    for vdf_path in vdf_paths {
        if vdf_path.exists() {
            if let Ok(content) = fs::read_to_string(&vdf_path) {
                let mut folders = Vec::new();
                // Simple parsing - look for "path" entries
                for line in content.lines() {
                    let line = line.trim();
                    if line.starts_with("\"path\"") {
                        // Extract path between quotes
                        if let Some(start) = line.find("\"path\"") {
                            let rest = &line[start + 6..];
                            if let Some(path_start) = rest.find('"') {
                                let rest = &rest[path_start + 1..];
                                if let Some(path_end) = rest.find('"') {
                                    let path_str = &rest[..path_end];
                                    // Handle escaped backslashes
                                    let path_str = path_str.replace("\\\\", "\\");
                                    folders.push(PathBuf::from(path_str));
                                }
                            }
                        }
                    }
                }
                if !folders.is_empty() {
                    return Some(folders);
                }
            }
        }
    }
    None
}

#[cfg(not(target_os = "windows"))]
fn find_steam_library_folders() -> Option<Vec<PathBuf>> {
    None
}

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

/// Installs the BepInEx pack by extracting a zip file
/// If zip_path is provided, uses that file; otherwise falls back to bundled resource
#[tauri::command]
pub fn install_bepinex_pack(
    zip_path: Option<String>,
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

    // Determine the zip file path
    let zip_file_path: PathBuf = if let Some(path) = zip_path {
        // Use provided path (from download or local file selection)
        let p = PathBuf::from(&path);
        if !p.exists() {
            return Err(format!("Zip file not found: {}", path));
        }
        p
    } else {
        // Fall back to bundled resource
        let resource_path = app_handle
            .path()
            .resolve("resources/bepinex_pack.zip", tauri::path::BaseDirectory::Resource)
            .map_err(|e| format!("Failed to resolve resource path: {}", e))?;

        if !resource_path.exists() {
            return Err("BepInEx pack not found. Please download from server or select a local file.".to_string());
        }
        resource_path
    };

    // Extract the zip file
    let file = fs::File::open(&zip_file_path)
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

/// Checks if BepInEx is installed and returns status for overwrite warning
#[tauri::command]
pub fn check_bepinex_installed(install: Fm26Installation) -> BepInExStatus {
    let bepinex_path = Path::new(&install.bep_in_ex_path);
    let plugins_path = Path::new(&install.plugins_path);

    let installed = bepinex_path.exists();

    // Count installed plugins if BepInEx exists
    let mut plugin_count: u32 = 0;
    let mut has_plugins = false;

    if installed && plugins_path.exists() {
        // Check for known plugins
        let known_plugins = vec![
            "StadiumInjection/StadiumInjection.dll",
            "AudioInject/AudioInject.dll",
            "CrowdInject/CrowdInject.dll",
        ];

        for rel_path in known_plugins {
            if plugins_path.join(rel_path).exists() {
                plugin_count += 1;
            }
        }

        has_plugins = plugin_count > 0;
    }

    BepInExStatus {
        installed,
        path: install.bep_in_ex_path,
        has_plugins,
        plugin_count,
    }
}
