# Optimized Prompt (Clavix Enhanced)

## Project: FM26 Stadium & Audio Mod Manager

Build a **Windows-only Tauri desktop application** for managing BepInEx 6 (IL2CPP) stadium and audio mods for Football Manager 2026.

### Tech Stack
- **Backend:** Tauri + Rust (domain modules: `fm26.rs`, `stadium.rs`, `audio.rs`, `configs.rs`, `logs.rs`)
- **Frontend:** React + TypeScript + Vite + TailwindCSS + shadcn/ui (dark theme)
- **Package Manager:** pnpm
- **Dev Environment:** DevContainer (Linux) with Windows cross-compilation (`x86_64-pc-windows-gnu` via mingw-w64)
- **Testing:** UTM Windows VM on macOS

### Core Features (5 Tabs)

**1. Game Tab (Milestone 1)**
- Native file browser for FM26 root directory selection
- Persist selected path between app restarts (local storage/config)
- Detect and validate existing BepInEx installation
- "Install/Repair Stadium Pack" button:
  - Backup existing `BepInEx/` folder (timestamped, keep only most recent)
  - Extract bundled `bepinex_pack.zip` from `src-tauri/resources/` to FM26 root
- Plugin status table showing: StadiumInjection.dll, AudioInject.dll, CrowdInject.dll (installed/missing badges)

**2. Stadiums Tab**
- List `.bundle` files from `BepInEx/plugins/CustomStadium/` (file name, path, exists, last modified)
- "Open folder" button → Windows Explorer
- Editable team→stadium mappings table:
  - TeamID (numeric input)
  - BundleFile (dropdown populated from bundle list)
- **Strict validation:** Block save if duplicate team IDs or non-existent bundles referenced
- Source file: `BepInEx/plugins/StadiumInjection/team_mappings.txt`

**3. Audio Tab**
- Editable team→audio mappings table:
  - TeamKey (string, supports `*` wildcard for default)
  - FolderName (dropdown from AudioInject subfolders)
- Source file: `BepInEx/plugins/AudioInject/AudioMappings.txt`
- Audio folder inspection showing exists/missing badges for: anthem.wav, goal_home.wav, goal_away.wav
- List additional .wav/.ogg files found

**4. Configs Tab**
- Form-based INI editor for `BepInEx/config/com.bassy.fm26.stadiuminjection.cfg`:
  - `[General]`: EnableCustomStadiums (switch), ReplaceAllStadiums (switch), DefaultBundle (dropdown)
  - `[PitchDimensions]`: UseCustomPitchDimensions (switch), PitchLength (number), PitchWidth (number)
- Save/Revert buttons
- Use Rust `ini` crate for parsing

**5. Logs Tab**
- Display `BepInEx/LogOutput.log` content in ScrollArea
- Manual refresh button (no auto-polling)
- Optional substring filter

### Required Tauri Commands

```rust
// Installation
inspect_fm26_install(root_path: String) -> Result<Fm26Installation, String>
install_bepinex_pack(install: Fm26Installation) -> Result<(), String>
get_plugin_status(install: Fm26Installation) -> Vec<PluginStatus>

// Stadium
list_bundles(install: Fm26Installation) -> Result<Vec<BundleInfo>, String>
read_team_mappings(install: Fm26Installation) -> Result<Vec<TeamMapping>, String>
write_team_mappings(install: Fm26Installation, data: Vec<TeamMapping>) -> Result<(), String>

// Audio
read_audio_mappings(install: Fm26Installation) -> Result<Vec<AudioMapping>, String>
write_audio_mappings(install: Fm26Installation, data: Vec<AudioMapping>) -> Result<(), String>
inspect_audio_folder(install: Fm26Installation, folder: String) -> Result<AudioFolderStatus, String>

// Config
read_stadium_injection_config(install: Fm26Installation) -> Result<StadiumInjectionConfig, String>
write_stadium_injection_config(install: Fm26Installation, config: StadiumInjectionConfig) -> Result<(), String>

// Logs
read_log(install: Fm26Installation, max_lines: usize) -> Result<Vec<String>, String>
```

### Data Models

```rust
struct Fm26Installation {
    root_path: String,
    bep_in_ex_path: String,
    plugins_path: String,
    custom_stadium_path: String,
    audio_inject_path: String,
    config_path: String,
    log_path: String,
}

struct PluginStatus { name: String, path: String, installed: bool }
struct BundleInfo { file_name: String, full_path: String, exists: bool, modified: Option<String> }
struct TeamMapping { team_id: i32, bundle_file: String }
struct AudioMapping { team_key: String, folder_name: String }
struct AudioFolderStatus { folder_name: String, path: String, anthem_exists: bool, goal_home_exists: bool, goal_away_exists: bool, other_files: Vec<String> }
struct StadiumInjectionConfig { enable_custom_stadiums: bool, replace_all_stadiums: bool, default_bundle: String, use_custom_pitch_dimensions: bool, pitch_length: i32, pitch_width: i32 }
```

### Error Handling
- Use **inline contextual alerts** (not modals/toasts)
- All Tauri commands return `Result<T, String>` with descriptive error messages
- Validation errors displayed inline in forms, blocking save until resolved

### DevContainer Requirements
- Rust (stable) + Node.js + pnpm
- TailwindCSS + PostCSS tooling
- shadcn/ui CLI
- Clang/LLVM for Tauri dev
- mingw-w64 for Windows cross-compilation: `rustup target add x86_64-pc-windows-gnu`
- Build command: `pnpm tauri build --target x86_64-pc-windows-gnu`
- Output: `src-tauri/target/x86_64-pc-windows-gnu/release/bundle/`

### File Locations
- Bundled mod pack: `src-tauri/resources/bepinex_pack.zip` (repackaged from `BepInExStadiums.zip`)
- Team mappings: `BepInEx/plugins/StadiumInjection/team_mappings.txt`
- Audio mappings: `BepInEx/plugins/AudioInject/AudioMappings.txt`
- Plugin config: `BepInEx/config/com.bassy.fm26.stadiuminjection.cfg`
- Log file: `BepInEx/LogOutput.log`

### Implementation Order
1. **Milestone 1:** DevContainer + Tauri scaffold + Game tab (path selection, install, plugin status)
2. **Milestone 2:** Stadiums tab (bundles list, team mappings with validation)
3. **Milestone 3:** Audio tab (mappings, folder inspection)
4. **Milestone 4:** Configs tab (INI form editor)
5. **Milestone 5:** Logs tab (log viewer)

### Success Criteria
- One-click mod pack installation works correctly
- Stadium/audio mappings editable via GUI with strict validation
- Config editing via form controls (no manual INI editing needed)
- Path persists between app restarts
- Dark-themed, clean UI with shadcn/ui components
- Windows .exe builds via DevContainer cross-compilation
- Runs correctly in Windows (tested via UTM VM)

---

## Optimization Improvements Applied

1. **[STRUCTURED]** - Reorganized into clear sections: Tech Stack → Features (by tab) → Commands → Models → Error Handling → Dev Setup → Implementation Order → Success Criteria
2. **[CLARIFIED]** - Made file paths explicit (team_mappings.txt location, config file names, log path)
3. **[EXPANDED]** - Added complete Rust data model definitions and all 11 required Tauri commands with signatures
4. **[SCOPED]** - Defined 5 clear milestones with specific deliverables for incremental implementation
5. **[ACTIONABILITY]** - Added DevContainer requirements checklist and exact build commands
6. **[COMPLETENESS]** - Added file locations reference section for quick lookup during implementation

---
*Optimized by Clavix on 2025-12-11. This version is ready for implementation.*
