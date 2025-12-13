# Product Requirements Document: GitHub Actions Release & Tauri Updater

## Problem & Goal

BassyStadiumTools currently has no automated build/release pipeline or update mechanism. Users must manually download new versions, and releases require manual artifact creation.

**Goal:** Implement a comprehensive GitHub Actions workflow for automated Windows builds triggered by version tags, with Tauri's built-in updater so users receive update notifications on app launch.

## Requirements

### Must-Have Features

#### 1. GitHub Actions Build Workflow (build.yml)

**Triggers:**
- Primary: Push to `v*` tags (e.g., `v1.0.0`, `v1.2.3`)
- Secondary: Manual workflow dispatch with version input for testing

**Version Sync Job:**
- Extract version from tag (strip `v` prefix)
- Validate semver format (x.y.z)
- Sync version across:
  - `package.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/tauri.conf.json`
- Upload synced files as artifact for build job

**Build Job (Windows Only):**
- Platform: `windows-latest`
- Steps:
  - Checkout code
  - Download synced version files
  - Setup pnpm, Node.js LTS, Rust stable
  - Cache Cargo registry and target
  - Install frontend dependencies
  - Build with `tauri-apps/tauri-action`
  - Sign artifacts with TAURI_SIGNING_PRIVATE_KEY
  - Create draft GitHub Release with artifacts

**Finalize Release Job:**
- Generate release notes via GitHub API
- Generate `latest.json` for Tauri updater containing:
  - `version`: Current version
  - `notes`: Release notes
  - `pub_date`: ISO timestamp
  - `platforms.windows-x86_64`:
    - `signature`: Contents of `.sig` file
    - `url`: Download URL for `.msi` or `.nsis` installer
- Upload `latest.json` to release assets
- Publish release (undraft)

#### 2. Tauri Updater Integration

**Backend (Rust):**
- Add `tauri-plugin-updater` to Cargo.toml
- Register plugin in `lib.rs`
- Add updater capability to `capabilities/default.json`

**Configuration (tauri.conf.json):**
- Configure updater endpoint pointing to GitHub Release `latest.json`
- Set `pubkey` for signature verification

**Frontend:**
- Check for updates once on app launch
- Show notification/dialog if update available
- Allow user to download and install update

### Technical Requirements

**GitHub Secrets Required:**
| Secret | Purpose |
|--------|---------|
| `TAURI_SIGNING_PRIVATE_KEY` | Sign update bundles for verification |
| `TAURI_KEY_PASSWORD` | Password for signing key (if encrypted) |
| `GITHUB_TOKEN` | Auto-provided, for release creation |

**Updater Endpoint:**
```
https://github.com/justinlevinedotme/BassyStadiumTools/releases/latest/download/latest.json
```

**Signing Key Generation:**
```bash
pnpm tauri signer generate -w ~/.tauri/BassyStadiumTools.key
```

## Out of Scope

- macOS builds
- Linux builds
- CI/PR checks workflow (separate if needed later)
- Version bump PR workflow (manual tagging for now)
- Crowdin/localization integration
- Dependabot auto-merge
- Apple code signing
- Automatic update installation (user must confirm)

## Additional Context

**Reference Implementation:** Based on [FMMLoader-26](https://github.com/justinlevinedotme/FMMLoader-26) build workflow, simplified for Windows-only with updater.json generation.

**Tauri Updater Docs:** https://v2.tauri.app/plugin/updater/

**Update Check Behavior:**
- Single check on app launch
- Non-blocking (app remains usable during check)
- User-initiated install (not silent/forced)

---

*Generated with Clavix Planning Mode*
*Generated: 2024-12-12T00:00:00Z*
