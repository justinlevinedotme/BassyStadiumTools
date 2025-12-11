# Original Prompt (Extracted from Conversation)

Build a Windows-only desktop application using Tauri for managing BepInEx 6 stadium and audio mods for Football Manager 2026. The app should provide a modern GUI that makes it easy for users to install the full BepInEx mod pack, manage custom stadium bundles, configure team to stadium mappings, configure team to audio mappings, edit plugin settings, and view BepInEx logs.

The frontend should use React with TypeScript, Vite, TailwindCSS, and shadcn/ui components with a dark theme. The backend uses Rust with domain modules for FM26, stadium, audio, configs, and logs functionality. Development happens in a DevContainer with Linux tooling, and Windows executables are built via cross-compilation using mingw-w64, then tested in a UTM Windows VM.

For the Game tab, users select their FM26 root directory which persists between sessions. The app detects if BepInEx exists and shows plugin status. An Install/Repair button extracts the bundled BepInExStadiums.zip, backing up any existing BepInEx folder first but keeping only the most recent backup. The Stadiums tab lists bundle files and provides an editable team mappings table with strict validation that blocks saves if there are duplicate team IDs or missing bundles. The Audio tab handles audio folder mappings with wildcard support and folder inspection for required audio files. The Configs tab provides form-based INI editing for the StadiumInjection config with switches, number inputs, and dropdowns. The Logs tab shows the BepInEx log with manual refresh only.

Error handling should use inline contextual alerts. The first implementation milestone focuses on the Game tab with FM26 path selection, pack installation, and plugin status display. Subsequent milestones add Stadiums, Audio, Configs, and Logs tabs incrementally.

---
*Extracted by Clavix on 2025-12-11. See optimized-prompt.md for enhanced version.*
