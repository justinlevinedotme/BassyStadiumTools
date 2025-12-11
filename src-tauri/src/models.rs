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
