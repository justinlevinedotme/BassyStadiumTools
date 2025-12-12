# FM Stadium Tools - Implementation Tasks

*Generated from mini-prd.md on 2025-12-11*

## Overview

| Milestone | Description | Tasks |
|-----------|-------------|-------|
| 1 | DevContainer + Tauri Scaffold + Game Tab | 12 |
| 2 | Stadiums Tab | 8 |
| 3 | Audio Tab | 7 |
| 4 | Configs Tab | 5 |
| 5 | Logs Tab | 4 |
| **Total** | | **36** |

---

## Milestone 1: DevContainer + Tauri Scaffold + Game Tab

Foundation setup and the first functional tab.

### DevContainer Setup

- [x] **1.1** Create `.devcontainer/devcontainer.json` with Node.js 20, Rust stable, pnpm
- [x] **1.2** Create `.devcontainer/Dockerfile` with Tauri dependencies (webkit2gtk, libappindicator, etc.), Clang/LLVM, and mingw-w64 for Windows cross-compilation
- [x] **1.3** Add `rustup target add x86_64-pc-windows-gnu` to DevContainer post-create command
- [x] **1.4** Verify DevContainer builds and `pnpm` works inside container

### Tauri Project Scaffolding

- [x] **1.5** Initialize Tauri project with React + TypeScript + Vite template (`pnpm create tauri-app`)
- [x] **1.6** Configure TailwindCSS v3 with PostCSS
- [x] **1.7** Initialize shadcn/ui with dark theme (`pnpm dlx shadcn-ui@latest init`)
- [x] **1.8** Add shadcn/ui components: Tabs, Card, Button, Input, Alert, Table, Badge
- [x] **1.9** Move `BepInExStadiums.zip` to `src-tauri/resources/bepinex_pack.zip` and configure Tauri to bundle it
- [x] **1.10** Create basic app shell with 5-tab layout (Game, Stadiums, Audio, Configs, Logs) using shadcn Tabs

### Rust Backend - Core Types & FM26 Module

- [x] **1.11** Create `src-tauri/src/models.rs` with all data model structs (Fm26Installation, PluginStatus, BundleInfo, TeamMapping, AudioMapping, AudioFolderStatus, StadiumInjectionConfig)
- [x] **1.12** Create `src-tauri/src/fm26.rs` with `inspect_fm26_install` command - validates FM26 directory structure and returns Fm26Installation
- [x] **1.13** Implement `install_bepinex_pack` command - backup existing BepInEx (single timestamped backup), extract zip to FM26 root
- [x] **1.14** Implement `get_plugin_status` command - check existence of StadiumInjection.dll, AudioInject.dll, CrowdInject.dll
- [x] **1.15** Register all commands in `main.rs` with Tauri's invoke handler

### Frontend - Game Tab

- [x] **1.16** Create GameTab component with FM26 path selection card (Input + Browse button using Tauri's dialog API)
- [x] **1.17** Implement path persistence using Tauri's store plugin or localStorage
- [x] **1.18** Create BepInEx status card showing install state and "Install/Repair Stadium Pack" button
- [x] **1.19** Create PluginStatus table component with installed/missing Badge indicators
- [x] **1.20** Wire up all Tauri command invocations with error handling (inline Alert components)
- [x] **1.21** Test Game tab end-to-end: select path → install pack → verify plugins show as installed

### Milestone 1 Verification

- [x] **1.22** Verify `pnpm tauri dev` runs successfully in DevContainer
- [x] **1.23** Verify `pnpm tauri build --target x86_64-pc-windows-gnu` produces Windows .exe
- [x] **1.24** Test .exe in UTM Windows VM - path selection, install, plugin status all work

---

## Milestone 2: Stadiums Tab

Bundle management and team→stadium mappings with validation.

### Rust Backend - Stadium Module

- [x] **2.1** Create `src-tauri/src/stadium.rs` with `list_bundles` command - scan CustomStadium folder for .bundle files, return BundleInfo vec
- [x] **2.2** Implement `read_team_mappings` command - parse team_mappings.txt into Vec<TeamMapping>
- [x] **2.3** Implement `write_team_mappings` command - serialize Vec<TeamMapping> back to team_mappings.txt format
- [x] **2.4** Add validation in write_team_mappings: reject duplicate team_ids, reject bundle_files that don't exist

### Frontend - Stadiums Tab

- [x] **2.5** Create StadiumsTab component with two-card layout (Bundles list, Team Mappings)
- [x] **2.6** Create BundlesList component - table showing file_name, exists badge, modified date, "Open Folder" button (uses Tauri shell.open)
- [x] **2.7** Create TeamMappingsEditor component - editable table with TeamID (number input), BundleFile (Select dropdown populated from bundles)
- [x] **2.8** Implement strict validation UI - show inline errors for duplicates/missing bundles, disable Save button until valid

---

## Milestone 3: Audio Tab

Audio mappings and folder inspection.

### Rust Backend - Audio Module

- [x] **3.1** Create `src-tauri/src/audio.rs` with `read_audio_mappings` command - parse AudioMappings.txt
- [x] **3.2** Implement `write_audio_mappings` command - serialize mappings back to file
- [x] **3.3** Implement `list_audio_folders` command - return list of subdirectory names in AudioInject folder
- [x] **3.4** Implement `inspect_audio_folder` command - check for anthem.wav, goal_home.wav, goal_away.wav, list other audio files

### Frontend - Audio Tab

- [x] **3.5** Create AudioTab component with two-card layout (Audio Mappings, Folder Inspector)
- [x] **3.6** Create AudioMappingsEditor component - editable table with TeamKey (string input, allow *), FolderName (Select dropdown from audio folders)
- [x] **3.7** Create AudioFolderInspector component - shows selected folder's required files with exists/missing badges, lists other .wav/.ogg files

---

## Milestone 4: Configs Tab

INI-based configuration editing.

### Rust Backend - Configs Module

- [x] **4.1** Add `ini` crate to Cargo.toml dependencies
- [x] **4.2** Create `src-tauri/src/configs.rs` with `read_stadium_injection_config` command - parse .cfg file into StadiumInjectionConfig struct
- [x] **4.3** Implement `write_stadium_injection_config` command - serialize struct back to INI format preserving comments where possible
- [x] **4.4** Implement AudioInject config read/write commands
- [x] **4.5** Implement CrowdInject config read/write commands
- [x] **4.6** Implement Adboards config read/write commands

### Frontend - Configs Tab

- [x] **4.7** Create ConfigsTab component with StadiumInjection config card
- [x] **4.8** Create StadiumInjectionConfigForm component with: Switch for EnableCustomStadiums, Switch for ReplaceAllStadiums, Select for DefaultBundle (populated from bundles), Switch for UseCustomPitchDimensions, NumberInput for PitchLength, NumberInput for PitchWidth, Save/Revert buttons
- [x] **4.9** Create AudioInjectConfigForm with volume sliders and toggles
- [x] **4.10** Create CrowdInjectConfigForm with density, skip rate, rendering options
- [x] **4.11** Create AdboardsConfigForm with disable toggle

---

## Milestone 5: Logs Tab

Log viewer with manual refresh.

### Rust Backend - Logs Module

- [x] **5.1** Create `src-tauri/src/logs.rs` with `read_log` command - read LogOutput.log with max_lines limit, return Vec<String>

### Frontend - Logs Tab

- [x] **5.2** Create LogsTab component with log viewer card
- [x] **5.3** Create LogViewer component - ScrollArea displaying log lines, Refresh button, optional filter Input for substring matching
- [x] **5.4** Implement client-side filtering (substring match on displayed lines)
- [x] **5.5** Implement auto-refresh with configurable interval (1s, 2s, 3s, 5s, 10s)

---

## Bonus Features (LOW Priority - Completed)

- [x] **6.1** Auto-detect FM26 installation paths (Steam, Epic, custom Steam libraries)
- [x] **6.2** Auto-refresh log viewer with configurable interval

---

## Final Verification

- [x] **7.1** Full end-to-end test: Install pack → Configure stadiums → Configure audio → Edit config → Check logs
- [x] **7.2** Build final Windows .exe and test in UTM VM
- [x] **7.3** All PRD requirements (HIGH, MEDIUM, LOW) implemented

---

## Notes

- All Tauri commands return `Result<T, String>` with descriptive error messages
- Frontend uses inline Alert components for error display (not modals/toasts)
- Validation is strict: block saves until all errors resolved
- Single backup retention: `BepInEx_backup_YYYYMMDD_HHMMSS/` (delete previous on new backup)
- Dark theme throughout using shadcn/ui defaults

---
*Task breakdown generated by Clavix from fm-stadium-tools PRD*
*Updated 2025-12-11: All tasks completed*
