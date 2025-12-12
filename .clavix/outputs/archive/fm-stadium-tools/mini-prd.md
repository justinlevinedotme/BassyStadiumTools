# Requirements: FM26 Stadium & Audio Mod Manager

*Generated from conversation on 2025-12-11*

## Objective

Build a Windows-only Tauri desktop application that provides a modern GUI for installing and managing a BepInEx 6 (IL2CPP) stadium and audio mod stack for Football Manager 2026 (FM26). The app makes it easy for users to install mod packs, manage custom stadium bundles, configure team mappings, edit plugin settings, and view logs—all without manually editing files.

## Core Requirements

### Must Have (High Priority)

- **[HIGH]** FM26 root directory selection with native file browser dialog
- **[HIGH]** Persist selected FM26 path between app restarts
- **[HIGH]** Detect existing BepInEx installation and validate structure
- **[HIGH]** Install/Repair button that extracts bundled `BepInExStadiums.zip` to FM26 root
- **[HIGH]** Backup existing BepInEx folder before install (keep only most recent backup, timestamped)
- **[HIGH]** Display plugin status table showing installed state of StadiumInjection.dll, AudioInject.dll, CrowdInject.dll
- **[HIGH]** List all `.bundle` files in CustomStadium folder with file name, path, exists flag, last modified date
- **[HIGH]** Editable team→stadium mappings table (TeamID + BundleFile dropdown)
- **[HIGH]** Strict validation: block save if duplicate team IDs or missing bundles referenced
- **[HIGH]** Editable team→audio folder mappings (supports `*` wildcard for default)
- **[HIGH]** Inspect audio folders for required files (anthem.wav, goal_home.wav, goal_away.wav)
- **[HIGH]** Form-based editing for StadiumInjection.cfg (switches for booleans, number inputs for pitch dimensions, dropdown for default bundle)
- **[HIGH]** Save/Revert buttons for config editing
- **[HIGH]** Log viewer displaying BepInEx LogOutput.log content

### Should Have (Medium Priority)

- **[MEDIUM]** "Open folder" button to launch Windows Explorer at CustomStadium directory
- **[MEDIUM]** Show exists/missing badges for audio files in folder inspection
- **[MEDIUM]** Display additional .wav/.ogg files found in audio folders
- **[MEDIUM]** Optional filter (substring match) for log viewer
- **[MEDIUM]** INI config editing for other BepInEx .cfg files (AudioInject, CrowdInject)

### Could Have (Low Priority / Inferred)

- **[LOW]** Auto-detect common FM26 install locations (Steam, Epic) before manual browse
- **[LOW]** Multiple backup retention option
- **[LOW]** Auto-refresh log viewer option

## Technical Constraints

- **Platform:** Windows-only runtime target (.exe)
- **Framework/Stack:** Tauri (Rust backend) + React + TypeScript + Vite (frontend)
- **UI Library:** TailwindCSS + shadcn/ui components
- **Theme:** Dark theme
- **Package Manager:** pnpm
- **Development Environment:** DevContainer (Linux-based) with full toolchain
- **Cross-Compilation:** Windows target via `x86_64-pc-windows-gnu` (mingw-w64)
- **Testing Environment:** UTM Windows VM on macOS (no compilation in Windows, only runtime testing)
- **Bundled Asset:** `BepInExStadiums.zip` exists in repo root, will be moved to `src-tauri/resources/`
- **INI Parsing:** Use `ini` crate for BepInEx .cfg file parsing/writing

## Data Models

```
Fm26Installation {
    root_path: String,
    bep_in_ex_path: String,
    plugins_path: String,
    custom_stadium_path: String,
    audio_inject_path: String,
    config_path: String,
    log_path: String,
}

BundleInfo {
    file_name: String,
    full_path: String,
    exists: bool,
    modified: Option<String>, // ISO 8601
}

TeamMapping {
    team_id: i32,
    bundle_file: String,
}

AudioMapping {
    team_key: String,  // "680" or "*"
    folder_name: String,
}

AudioFolderStatus {
    folder_name: String,
    path: String,
    anthem_exists: bool,
    goal_home_exists: bool,
    goal_away_exists: bool,
    other_files: Vec<String>,
}

StadiumInjectionConfig {
    enable_custom_stadiums: bool,
    replace_all_stadiums: bool,
    default_bundle: String,
    use_custom_pitch_dimensions: bool,
    pitch_length: i32,
    pitch_width: i32,
}

PluginStatus {
    name: String,
    path: String,
    installed: bool,
}
```

## Required Tauri Commands

### Installation & Detection
- `inspect_fm26_install(root_path: String) -> Result<Fm26Installation, String>`
- `install_bepinex_pack(install: Fm26Installation) -> Result<(), String>`
- `get_plugin_status(install: Fm26Installation) -> Vec<PluginStatus>`

### Stadium
- `list_bundles(install: Fm26Installation) -> Result<Vec<BundleInfo>, String>`
- `read_team_mappings(install: Fm26Installation) -> Result<Vec<TeamMapping>, String>`
- `write_team_mappings(install: Fm26Installation, data: Vec<TeamMapping>) -> Result<(), String>`

### Audio
- `read_audio_mappings(install: Fm26Installation) -> Result<Vec<AudioMapping>, String>`
- `write_audio_mappings(install: Fm26Installation, data: Vec<AudioMapping>) -> Result<(), String>`
- `inspect_audio_folder(install: Fm26Installation, folder: String) -> Result<AudioFolderStatus, String>`

### Configs
- `read_stadium_injection_config(install: Fm26Installation) -> Result<StadiumInjectionConfig, String>`
- `write_stadium_injection_config(install: Fm26Installation, config: StadiumInjectionConfig) -> Result<(), String>`

### Logs
- `read_log(install: Fm26Installation, max_lines: usize) -> Result<Vec<String>, String>`

## User Context

**Target Users:** FM26 players who want to use custom stadium and audio mods but may not be technically savvy with manual mod installation

**Primary Use Case:** One-click installation of BepInEx mod pack and GUI-based management of stadium/audio mappings without editing text files manually

**User Flow:**
1. Launch app → Select FM26 install directory
2. Click "Install/Repair" to deploy mod pack
3. View plugin status to confirm installation
4. Navigate to Stadiums tab to manage bundles and mappings
5. Navigate to Audio tab to configure audio mappings
6. Use Configs tab to adjust plugin settings
7. Check Logs tab if troubleshooting needed

## UI Structure

**Tab Layout:**
1. **Game** - FM26 path selection, pack install, plugin status
2. **Stadiums** - Bundle list, team mappings table
3. **Audio** - Audio mappings, folder inspection
4. **Configs** - StadiumInjection config form
5. **Logs** - Log viewer with manual refresh

## Edge Cases & Considerations

- **[HIGH]** Handle case where FM26 directory doesn't exist or is invalid
- **[HIGH]** Handle corrupted or malformed team_mappings.txt gracefully
- **[HIGH]** Handle missing BepInEx folder (first-time install)
- **[MEDIUM]** Handle read-only file system permissions
- **[MEDIUM]** Handle very large log files (implement max_lines limit)
- **[LOW]** Handle non-ASCII characters in file paths

## Implicit Requirements

*Inferred from conversation context - please verify:*

- **[Error Handling]** Use inline contextual alerts for errors (not modals or toasts)
- **[Validation]** Strict validation - block saves until all errors are fixed
- **[Persistence]** App settings (FM26 path) stored locally between sessions
- **[Backup]** Single backup retention - only keep most recent backup
- **[Refresh]** Log viewer uses manual refresh only (no auto-polling)

## Success Criteria

How we know this is complete and working:

- ✓ User can install BepInEx mod pack with one click
- ✓ User can manage stadium bundles and team→stadium mappings via GUI
- ✓ User can manage audio mappings via GUI
- ✓ User can edit StadiumInjection plugin config via form
- ✓ App validates all changes before saving (blocks invalid saves)
- ✓ App persists FM26 path between restarts
- ✓ Clean, dark-themed UI using shadcn/ui components
- ✓ Windows .exe builds successfully via cross-compilation in DevContainer
- ✓ App runs correctly in UTM Windows VM

## Implementation Approach

**Incremental build - Milestone 1 (Game Tab):**
1. DevContainer setup with full toolchain
2. Tauri project scaffolding with React + Vite + TailwindCSS + shadcn/ui
3. FM26 path selection and persistence
4. BepInEx pack installation command
5. Plugin status display

**Subsequent milestones:**
- Milestone 2: Stadiums tab (bundles + mappings)
- Milestone 3: Audio tab (mappings + folder inspection)
- Milestone 4: Configs tab (INI editing)
- Milestone 5: Logs tab (log viewer)

## Next Steps

1. Review this PRD for accuracy and completeness
2. If anything is missing or unclear, continue the conversation
3. When ready, use `/clavix:plan` to generate implementation tasks
4. Or use the optimized prompt directly for implementation

---
*This PRD was generated by Clavix from conversational requirements gathering.*
