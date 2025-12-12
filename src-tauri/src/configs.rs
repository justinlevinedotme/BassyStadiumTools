use crate::models::{AdboardsConfig, AudioInjectConfig, CrowdInjectConfig, Fm26Installation, StadiumInjectionConfig};
use std::fs;
use std::path::Path;

const STADIUM_INJECTION_CONFIG: &str = "com.bassy.fm26.stadiuminjection.cfg";
const AUDIO_INJECT_CONFIG: &str = "com.bassy.fm26.audioinject.cfg";
const CROWD_INJECT_CONFIG: &str = "com.bassy.fm26.crowdinject.cfg";

/// Reads the StadiumInjection plugin configuration
#[tauri::command]
pub fn read_stadium_injection_config(
    install: Fm26Installation,
) -> Result<StadiumInjectionConfig, String> {
    let config_path = Path::new(&install.config_path).join(STADIUM_INJECTION_CONFIG);

    if !config_path.exists() {
        return Ok(StadiumInjectionConfig::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read {}: {}", STADIUM_INJECTION_CONFIG, e))?;

    parse_stadium_injection_config(&content)
}

/// Writes the StadiumInjection plugin configuration
#[tauri::command]
pub fn write_stadium_injection_config(
    install: Fm26Installation,
    config: StadiumInjectionConfig,
) -> Result<(), String> {
    let config_path_dir = Path::new(&install.config_path);

    // Create config directory if it doesn't exist
    if !config_path_dir.exists() {
        fs::create_dir_all(config_path_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    let content = format_stadium_injection_config(&config);
    let config_file_path = config_path_dir.join(STADIUM_INJECTION_CONFIG);

    fs::write(&config_file_path, content)
        .map_err(|e| format!("Failed to write {}: {}", STADIUM_INJECTION_CONFIG, e))?;

    Ok(())
}

/// Reads the AudioInject plugin configuration
#[tauri::command]
pub fn read_audio_inject_config(
    install: Fm26Installation,
) -> Result<AudioInjectConfig, String> {
    let config_path = Path::new(&install.config_path).join(AUDIO_INJECT_CONFIG);

    if !config_path.exists() {
        return Ok(AudioInjectConfig::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read {}: {}", AUDIO_INJECT_CONFIG, e))?;

    parse_audio_inject_config(&content)
}

/// Writes the AudioInject plugin configuration
#[tauri::command]
pub fn write_audio_inject_config(
    install: Fm26Installation,
    config: AudioInjectConfig,
) -> Result<(), String> {
    let config_path_dir = Path::new(&install.config_path);

    if !config_path_dir.exists() {
        fs::create_dir_all(config_path_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    let content = format_audio_inject_config(&config);
    let config_file_path = config_path_dir.join(AUDIO_INJECT_CONFIG);

    fs::write(&config_file_path, content)
        .map_err(|e| format!("Failed to write {}: {}", AUDIO_INJECT_CONFIG, e))?;

    Ok(())
}

/// Reads the CrowdInject plugin configuration
#[tauri::command]
pub fn read_crowd_inject_config(
    install: Fm26Installation,
) -> Result<CrowdInjectConfig, String> {
    let config_path = Path::new(&install.config_path).join(CROWD_INJECT_CONFIG);

    if !config_path.exists() {
        return Ok(CrowdInjectConfig::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read {}: {}", CROWD_INJECT_CONFIG, e))?;

    parse_crowd_inject_config(&content)
}

/// Writes the CrowdInject plugin configuration
#[tauri::command]
pub fn write_crowd_inject_config(
    install: Fm26Installation,
    config: CrowdInjectConfig,
) -> Result<(), String> {
    let config_path_dir = Path::new(&install.config_path);

    if !config_path_dir.exists() {
        fs::create_dir_all(config_path_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    let content = format_crowd_inject_config(&config);
    let config_file_path = config_path_dir.join(CROWD_INJECT_CONFIG);

    fs::write(&config_file_path, content)
        .map_err(|e| format!("Failed to write {}: {}", CROWD_INJECT_CONFIG, e))?;

    Ok(())
}

/// Reads the Adboards configuration from StadiumInjection config
#[tauri::command]
pub fn read_adboards_config(
    install: Fm26Installation,
) -> Result<AdboardsConfig, String> {
    let config_path = Path::new(&install.config_path).join(STADIUM_INJECTION_CONFIG);

    if !config_path.exists() {
        return Ok(AdboardsConfig::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read {}: {}", STADIUM_INJECTION_CONFIG, e))?;

    parse_adboards_config(&content)
}

/// Writes the Adboards configuration to StadiumInjection config
#[tauri::command]
pub fn write_adboards_config(
    install: Fm26Installation,
    config: AdboardsConfig,
) -> Result<(), String> {
    let config_path = Path::new(&install.config_path).join(STADIUM_INJECTION_CONFIG);

    // Read existing config to preserve other settings
    let existing_content = if config_path.exists() {
        fs::read_to_string(&config_path).unwrap_or_default()
    } else {
        String::new()
    };

    let content = update_adboards_in_config(&existing_content, &config);

    let config_path_dir = Path::new(&install.config_path);
    if !config_path_dir.exists() {
        fs::create_dir_all(config_path_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write {}: {}", STADIUM_INJECTION_CONFIG, e))?;

    Ok(())
}

/// Lists all .cfg files in the config directory
#[tauri::command]
pub fn list_config_files(install: Fm26Installation) -> Result<Vec<String>, String> {
    let config_path = Path::new(&install.config_path);

    if !config_path.exists() {
        return Ok(vec![]);
    }

    let mut configs = Vec::new();

    let entries = fs::read_dir(config_path)
        .map_err(|e| format!("Failed to read config directory: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "cfg" {
                    if let Some(name) = path.file_name() {
                        configs.push(name.to_string_lossy().to_string());
                    }
                }
            }
        }
    }

    configs.sort();
    Ok(configs)
}

/// Parses BepInEx INI-style config into StadiumInjectionConfig
fn parse_stadium_injection_config(content: &str) -> Result<StadiumInjectionConfig, String> {
    let mut config = StadiumInjectionConfig::default();

    for line in content.lines() {
        let line = line.trim();

        // Skip empty lines, comments, and section headers
        if line.is_empty() || line.starts_with('#') || line.starts_with(';') {
            continue;
        }

        // Skip section headers like [General]
        if line.starts_with('[') && line.ends_with(']') {
            continue;
        }

        // Parse key = value
        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim();
            let value = value.trim();

            match key {
                "EnableCustomStadiums" => {
                    config.enable_custom_stadiums = parse_bool(value);
                }
                "ReplaceAllStadiums" => {
                    config.replace_all_stadiums = parse_bool(value);
                }
                "DefaultBundle" => {
                    config.default_bundle = value.to_string();
                }
                "UseCustomPitchDimensions" => {
                    config.use_custom_pitch_dimensions = parse_bool(value);
                }
                "PitchLength" => {
                    config.pitch_length = parse_float(value) as i32;
                }
                "PitchWidth" => {
                    config.pitch_width = parse_float(value) as i32;
                }
                _ => {}
            }
        }
    }

    Ok(config)
}

/// Formats StadiumInjectionConfig to BepInEx INI-style config
fn format_stadium_injection_config(config: &StadiumInjectionConfig) -> String {
    let mut content = String::new();

    content.push_str("## Settings file was created by plugin Stadium Injection\n");
    content.push_str("## Plugin GUID: com.bassy.fm26.stadiuminjection\n\n");

    content.push_str("[General]\n\n");

    content.push_str("## Enable or disable custom stadium injection entirely\n");
    content.push_str(&format!(
        "EnableCustomStadiums = {}\n\n",
        format_bool(config.enable_custom_stadiums)
    ));

    content.push_str("## If true, replace ALL stadiums. If false, only replace stadiums listed in StadiumMappings\n");
    content.push_str(&format!(
        "ReplaceAllStadiums = {}\n\n",
        format_bool(config.replace_all_stadiums)
    ));

    content.push_str("## Default stadium bundle to use when ReplaceAllStadiums is true\n");
    content.push_str(&format!("DefaultBundle = {}\n\n", config.default_bundle));

    content.push_str("[PitchDimensions]\n\n");

    content.push_str("## If true, use the custom pitch dimensions below for goal/corner flag placement\n");
    content.push_str(&format!(
        "UseCustomPitchDimensions = {}\n\n",
        format_bool(config.use_custom_pitch_dimensions)
    ));

    content.push_str("## Pitch length in meters (goal-to-goal distance). Standard FIFA: 105m\n");
    content.push_str(&format!("PitchLength = {}\n\n", config.pitch_length));

    content.push_str("## Pitch width in meters (sideline-to-sideline distance). Standard FIFA: 68m\n");
    content.push_str(&format!("PitchWidth = {}\n", config.pitch_width));

    content
}

/// Parses AudioInject config
fn parse_audio_inject_config(content: &str) -> Result<AudioInjectConfig, String> {
    let mut config = AudioInjectConfig::default();

    for line in content.lines() {
        let line = line.trim();

        if line.is_empty() || line.starts_with('#') || line.starts_with(';') {
            continue;
        }

        if line.starts_with('[') && line.ends_with(']') {
            continue;
        }

        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim();
            let value = value.trim();

            match key {
                "EnableAudioInjection" => {
                    config.enable_audio_injection = parse_bool(value);
                }
                "MasterVolume" => {
                    config.master_volume = parse_float(value);
                }
                "DebugMode" => {
                    config.debug_mode = parse_bool(value);
                }
                "MusicVolume" => {
                    config.music_volume = parse_float(value);
                }
                "EventVolume" => {
                    config.event_volume = parse_float(value);
                }
                "LoopMusic" => {
                    config.loop_music = parse_bool(value);
                }
                _ => {}
            }
        }
    }

    Ok(config)
}

/// Formats AudioInjectConfig to BepInEx INI-style config
fn format_audio_inject_config(config: &AudioInjectConfig) -> String {
    let mut content = String::new();

    content.push_str("## Settings file was created by plugin Audio Injection\n");
    content.push_str("## Plugin GUID: com.bassy.fm26.audioinject\n\n");

    content.push_str("[General]\n\n");

    content.push_str("## Master toggle for audio injection\n");
    content.push_str(&format!(
        "EnableAudioInjection = {}\n\n",
        format_bool(config.enable_audio_injection)
    ));

    content.push_str("## Master volume (0.0 to 1.0)\n");
    content.push_str(&format!("MasterVolume = {}\n\n", config.master_volume));

    content.push_str("## Enable verbose logging\n");
    content.push_str(&format!(
        "DebugMode = {}\n\n",
        format_bool(config.debug_mode)
    ));

    content.push_str("[Audio]\n\n");

    content.push_str("## Music channel volume (anthems, halftime)\n");
    content.push_str(&format!("MusicVolume = {}\n\n", config.music_volume));

    content.push_str("## Event channel volume (goals, reactions)\n");
    content.push_str(&format!("EventVolume = {}\n\n", config.event_volume));

    content.push_str("## Loop music tracks\n");
    content.push_str(&format!("LoopMusic = {}\n", format_bool(config.loop_music)));

    content
}

/// Parses CrowdInject config
fn parse_crowd_inject_config(content: &str) -> Result<CrowdInjectConfig, String> {
    let mut config = CrowdInjectConfig::default();

    for line in content.lines() {
        let line = line.trim();

        if line.is_empty() || line.starts_with('#') || line.starts_with(';') {
            continue;
        }

        if line.starts_with('[') && line.ends_with(']') {
            continue;
        }

        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim();
            let value = value.trim();

            match key {
                "EnableCrowdInjection" => {
                    config.enable_crowd_injection = parse_bool(value);
                }
                "CrowdDensity" => {
                    config.crowd_density = value.parse().unwrap_or(100);
                }
                "AlwaysFullCapacity" => {
                    config.always_full_capacity = parse_bool(value);
                }
                "DebugMode" => {
                    config.debug_mode = parse_bool(value);
                }
                "CrowdSkipRate" => {
                    config.crowd_skip_rate = value.parse().unwrap_or(4);
                }
                "UseBillboards" => {
                    config.use_billboards = parse_bool(value);
                }
                "UseFMCrowdRender" => {
                    config.use_fm_crowd_render = parse_bool(value);
                }
                "UseGPUInstancing" => {
                    config.use_gpu_instancing = parse_bool(value);
                }
                "UseTeamColors" => {
                    config.use_team_colors = parse_bool(value);
                }
                _ => {}
            }
        }
    }

    Ok(config)
}

/// Formats CrowdInjectConfig to BepInEx INI-style config
fn format_crowd_inject_config(config: &CrowdInjectConfig) -> String {
    let mut content = String::new();

    content.push_str("## Settings file was created by plugin Dynamic Crowd Injection\n");
    content.push_str("## Plugin GUID: com.bassy.fm26.crowdinject\n\n");

    content.push_str("[General]\n\n");

    content.push_str("## Enable or disable crowd injection for custom stadiums\n");
    content.push_str(&format!(
        "EnableCrowdInjection = {}\n\n",
        format_bool(config.enable_crowd_injection)
    ));

    content.push_str("## Crowd density percentage (10-100). Lower values = fewer people in stands.\n");
    content.push_str(&format!("CrowdDensity = {}\n\n", config.crowd_density));

    content.push_str("## When true, always fill stadium to 100% capacity regardless of real match attendance.\n");
    content.push_str(&format!(
        "AlwaysFullCapacity = {}\n\n",
        format_bool(config.always_full_capacity)
    ));

    content.push_str("## Enable verbose logging for debugging crowd placement\n");
    content.push_str(&format!(
        "DebugMode = {}\n\n",
        format_bool(config.debug_mode)
    ));

    content.push_str("[Performance]\n\n");

    content.push_str("## Only render every Nth seat (1=all, 2=50%, 4=25%, 8=12.5%). Higher = better performance.\n");
    content.push_str(&format!("CrowdSkipRate = {}\n\n", config.crowd_skip_rate));

    content.push_str("[Rendering]\n\n");

    content.push_str("## Use 2D billboard sprites instead of 3D crowd models. Better performance but lower quality.\n");
    content.push_str(&format!(
        "UseBillboards = {}\n\n",
        format_bool(config.use_billboards)
    ));

    content.push_str("## EXPERIMENTAL: Use FM26's native CrowdRender system (GPU instanced, high performance).\n");
    content.push_str(&format!(
        "UseFMCrowdRender = {}\n\n",
        format_bool(config.use_fm_crowd_render)
    ));

    content.push_str("## EXPERIMENTAL: Skip AUDIAREA crowd creation for GPU instancing tests.\n");
    content.push_str(&format!(
        "UseGPUInstancing = {}\n\n",
        format_bool(config.use_gpu_instancing)
    ));

    content.push_str("## Apply team colors from FM26 match data to crowd clothing.\n");
    content.push_str(&format!(
        "UseTeamColors = {}\n",
        format_bool(config.use_team_colors)
    ));

    content
}

/// Parses Adboards config from StadiumInjection config
fn parse_adboards_config(content: &str) -> Result<AdboardsConfig, String> {
    let mut config = AdboardsConfig::default();

    for line in content.lines() {
        let line = line.trim();

        if line.is_empty() || line.starts_with('#') || line.starts_with(';') {
            continue;
        }

        if line.starts_with('[') && line.ends_with(']') {
            continue;
        }

        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim();
            let value = value.trim();

            if key == "DisableAdboards" {
                config.disable_adboards = parse_bool(value);
            }
        }
    }

    Ok(config)
}

/// Updates just the Adboards section in StadiumInjection config
fn update_adboards_in_config(existing_content: &str, config: &AdboardsConfig) -> String {
    let mut lines: Vec<String> = Vec::new();
    let mut found_adboards_section = false;
    let mut found_disable_adboards = false;
    let mut in_adboards_section = false;

    for line in existing_content.lines() {
        let trimmed = line.trim();

        // Track section changes
        if trimmed.starts_with('[') && trimmed.ends_with(']') {
            // If we were in Adboards section and didn't find DisableAdboards, add it
            if in_adboards_section && !found_disable_adboards {
                lines.push(format!("DisableAdboards = {}", format_bool(config.disable_adboards)));
                lines.push(String::new());
                found_disable_adboards = true;
            }

            in_adboards_section = trimmed == "[Adboards]";
            if in_adboards_section {
                found_adboards_section = true;
            }
        }

        // Update DisableAdboards if we're in the right section
        if in_adboards_section && trimmed.starts_with("DisableAdboards") {
            lines.push(format!("DisableAdboards = {}", format_bool(config.disable_adboards)));
            found_disable_adboards = true;
            continue;
        }

        lines.push(line.to_string());
    }

    // If we were still in Adboards section at end of file
    if in_adboards_section && !found_disable_adboards {
        lines.push(format!("DisableAdboards = {}", format_bool(config.disable_adboards)));
    }

    // If Adboards section doesn't exist, add it
    if !found_adboards_section {
        lines.push(String::new());
        lines.push("[Adboards]".to_string());
        lines.push(String::new());
        lines.push("## If true, hide all adboards in the stadium.".to_string());
        lines.push(format!("DisableAdboards = {}", format_bool(config.disable_adboards)));
    }

    lines.join("\n")
}

/// Parse boolean from BepInEx config format
fn parse_bool(value: &str) -> bool {
    matches!(value.to_lowercase().as_str(), "true" | "1" | "yes" | "on")
}

/// Parse float from BepInEx config format
fn parse_float(value: &str) -> f32 {
    value.parse().unwrap_or(0.0)
}

/// Format boolean to BepInEx config format
fn format_bool(value: bool) -> &'static str {
    if value {
        "true"
    } else {
        "false"
    }
}
