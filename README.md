# FM Stadium Tools

A Windows desktop application for managing BassyBoy's stadium mods for Football Manager 26, created by justinlevinedotme/jalco

## Features

- **One-click mod installation** - Install the complete BepInEx stadium pack with a single click
- **Stadium bundle management** - View and manage custom stadium `.bundle` files
- **Team mappings** - Configure which teams use which stadiums via a GUI
- **Audio mappings** - Configure team audio (anthems, goal sounds) without editing text files
- **Plugin configuration** - Edit BepInEx plugin settings through form controls
- **Log viewer** - View BepInEx logs for troubleshooting

## Development

This project uses a DevContainer for development. All development happens inside the container.

### Prerequisites

- Docker Desktop
- VS Code with Dev Containers extension
- (For testing) Windows VM via UTM or similar

### Getting Started

1. Clone the repository
2. Open in VS Code
3. When prompted, click "Reopen in Container" (or use Command Palette → "Dev Containers: Reopen in Container")
4. Wait for the container to build (first time may take a few minutes)

### Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm tauri dev

# Build for Windows (cross-compilation)
pnpm tauri build --target x86_64-pc-windows-gnu
```

### Build Output

The Windows `.exe` will be in:
```
src-tauri/target/x86_64-pc-windows-gnu/release/bundle/
```

### Testing in Windows VM

1. Build the Windows executable in the DevContainer
2. Copy the `.exe` from `src-tauri/target/x86_64-pc-windows-gnu/release/` to your Windows VM
3. Run and test

## Tech Stack

- **Backend**: Tauri 2.0 + Rust
- **Frontend**: React + TypeScript + Vite
- **UI**: TailwindCSS + shadcn/ui (dark theme)
- **Development**: DevContainer with Linux + mingw-w64 cross-compilation

## Project Structure

```
├── .devcontainer/          # DevContainer configuration
├── src/                    # React frontend
│   ├── components/ui/      # shadcn/ui components
│   ├── tabs/               # Tab components (Game, Stadiums, Audio, Configs, Logs)
│   └── types.ts            # Shared TypeScript types
├── src-tauri/              # Tauri/Rust backend
│   ├── src/
│   │   ├── models.rs       # Data structures
│   │   ├── fm26.rs         # FM26 installation & pack commands
│   │   └── lib.rs          # Main Tauri entry
│   └── resources/
│       └── bepinex_pack.zip  # Bundled mod pack
└── package.json
```