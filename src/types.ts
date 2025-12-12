// Types shared between frontend and Tauri backend

export interface Fm26Installation {
  root_path: string;
  bep_in_ex_path: string;
  plugins_path: string;
  custom_stadium_path: string;
  audio_inject_path: string;
  config_path: string;
  log_path: string;
}

export interface PluginStatus {
  name: string;
  path: string;
  installed: boolean;
}

export interface BundleInfo {
  file_name: string;
  full_path: string;
  exists: boolean;
  modified: string | null;
}

export interface TeamMapping {
  team_id: number;
  bundle_file: string;
}

export interface AudioMapping {
  team_key: string;
  folder_name: string;
}

export interface AudioFolderStatus {
  folder_name: string;
  path: string;
  anthem_exists: boolean;
  goal_home_exists: boolean;
  goal_away_exists: boolean;
  other_files: string[];
}

export interface StadiumInjectionConfig {
  enable_custom_stadiums: boolean;
  replace_all_stadiums: boolean;
  default_bundle: string;
  use_custom_pitch_dimensions: boolean;
  pitch_length: number;
  pitch_width: number;
}

export interface LogInfo {
  exists: boolean;
  size_bytes: number;
  modified: string | null;
  path: string;
}

export interface AudioInjectConfig {
  // [General]
  enable_audio_injection: boolean;
  master_volume: number; // 0.0 to 1.0
  debug_mode: boolean;
  // [Audio]
  music_volume: number; // 0.0 to 1.0
  event_volume: number; // 0.0 to 1.0
  loop_music: boolean;
}

export interface CrowdInjectConfig {
  // [General]
  enable_crowd_injection: boolean;
  crowd_density: number; // 10 to 100
  always_full_capacity: boolean;
  debug_mode: boolean;
  // [Performance]
  crowd_skip_rate: number; // 1, 2, 4, or 8
  // [Rendering]
  use_billboards: boolean;
  use_fm_crowd_render: boolean;
  use_gpu_instancing: boolean;
  use_team_colors: boolean;
}

export interface AdboardsConfig {
  disable_adboards: boolean;
}
