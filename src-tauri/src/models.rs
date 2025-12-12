use serde::{Deserialize, Serialize};

/// Represents a validated FM26 installation with all relevant paths
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fm26Installation {
    pub root_path: String,
    pub bep_in_ex_path: String,
    pub plugins_path: String,
    pub custom_stadium_path: String,
    pub audio_inject_path: String,
    pub config_path: String,
    pub log_path: String,
}

/// Status of a BepInEx plugin
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginStatus {
    pub name: String,
    pub path: String,
    pub installed: bool,
}

/// Information about a stadium bundle file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BundleInfo {
    pub file_name: String,
    pub full_path: String,
    pub exists: bool,
    pub modified: Option<String>, // ISO 8601 timestamp
}

/// Team to stadium bundle mapping
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamMapping {
    pub team_id: i32,
    pub bundle_file: String,
}

/// Team to audio folder mapping
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioMapping {
    pub team_key: String, // Can be team ID like "680" or "*" for default
    pub folder_name: String,
}

/// Status of an audio folder including required files
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioFolderStatus {
    pub folder_name: String,
    pub path: String,
    pub anthem_exists: bool,
    pub goal_home_exists: bool,
    pub goal_away_exists: bool,
    pub other_files: Vec<String>,
}

/// Configuration for the StadiumInjection plugin
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StadiumInjectionConfig {
    pub enable_custom_stadiums: bool,
    pub replace_all_stadiums: bool,
    pub default_bundle: String,
    pub use_custom_pitch_dimensions: bool,
    pub pitch_length: i32,
    pub pitch_width: i32,
}

impl Default for StadiumInjectionConfig {
    fn default() -> Self {
        Self {
            enable_custom_stadiums: true,
            replace_all_stadiums: false,
            default_bundle: String::new(),
            use_custom_pitch_dimensions: false,
            pitch_length: 105,
            pitch_width: 68,
        }
    }
}

/// Configuration for the AudioInject plugin
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioInjectConfig {
    // [General]
    pub enable_audio_injection: bool,
    pub master_volume: f32,
    pub debug_mode: bool,
    // [Audio]
    pub music_volume: f32,
    pub event_volume: f32,
    pub loop_music: bool,
}

impl Default for AudioInjectConfig {
    fn default() -> Self {
        Self {
            enable_audio_injection: true,
            master_volume: 0.7,
            debug_mode: false,
            music_volume: 1.0,
            event_volume: 1.0,
            loop_music: true,
        }
    }
}

/// Configuration for the CrowdInject plugin
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrowdInjectConfig {
    // [General]
    pub enable_crowd_injection: bool,
    pub crowd_density: i32,
    pub always_full_capacity: bool,
    pub debug_mode: bool,
    // [Performance]
    pub crowd_skip_rate: i32,
    // [Rendering]
    pub use_billboards: bool,
    pub use_fm_crowd_render: bool,
    pub use_gpu_instancing: bool,
    pub use_team_colors: bool,
}

impl Default for CrowdInjectConfig {
    fn default() -> Self {
        Self {
            enable_crowd_injection: true,
            crowd_density: 100,
            always_full_capacity: false,
            debug_mode: false,
            crowd_skip_rate: 4,
            use_billboards: false,
            use_fm_crowd_render: false,
            use_gpu_instancing: false,
            use_team_colors: true,
        }
    }
}

/// Configuration for Adboards (part of StadiumInjection)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdboardsConfig {
    pub disable_adboards: bool,
}

impl Default for AdboardsConfig {
    fn default() -> Self {
        Self {
            disable_adboards: false,
        }
    }
}
