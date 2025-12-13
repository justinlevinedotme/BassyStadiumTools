# Implementation Plan

**Project**: github-actions-release
**Generated**: 2024-12-12T00:00:00Z

## Technical Context & Standards
*Detected Stack & Patterns*
- **Framework**: Tauri 2.0 + React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui (dark theme)
- **State**: React useState, localStorage for persistence
- **Backend**: Rust with modular files (`src-tauri/src/*.rs`)
- **Plugins**: `tauri-plugin-dialog`, `tauri-plugin-shell`, `tauri-plugin-store`
- **Package Manager**: pnpm 10.x
- **Conventions**: PascalCase components, kebab-case files, path aliases `@/`

---

## Phase 1: GitHub Actions Workflow Setup

- [x] **Create .github/workflows directory structure** (ref: PRD Build Workflow)
  Task ID: phase-1-setup-01
  > **Implementation**: Create `.github/workflows/` directory.
  > **Details**: `mkdir -p .github/workflows`

- [x] **Create build.yml workflow file** (ref: PRD Build Workflow)
  Task ID: phase-1-setup-02
  > **Implementation**: Create `.github/workflows/build.yml`.
  > **Details**: Define workflow with:
  > - Triggers: `push.tags: ["v*"]` and `workflow_dispatch` with `version` input
  > - Jobs: `sync-version`, `build-windows`, `finalize-release`
  > - Use `pnpm/action-setup@v4`, `actions/setup-node@v6`, `dtolnay/rust-toolchain@stable`
  > - Reference FMMLoader-26 build.yml structure but Windows-only

---

## Phase 2: Version Sync Job

- [x] **Implement version sync job in build.yml** (ref: PRD Version Sync)
  Task ID: phase-2-version-01
  > **Implementation**: Edit `.github/workflows/build.yml` - add `sync-version` job.
  > **Details**:
  > - Extract version from tag (`${GITHUB_REF_NAME#v}`) or workflow input
  > - Validate semver format with regex
  > - Update `package.json` via `pnpm version $VERSION --no-git-tag-version`
  > - Update `src-tauri/Cargo.toml` via sed (first `version = ` line only)
  > - Update `src-tauri/tauri.conf.json` via Node.js script
  > - Upload synced files as artifact for build job

---

## Phase 3: Windows Build Job

- [x] **Implement Windows build job in build.yml** (ref: PRD Build Job)
  Task ID: phase-3-build-01
  > **Implementation**: Edit `.github/workflows/build.yml` - add `build-windows` job.
  > **Details**:
  > - `runs-on: windows-latest`
  > - `needs: sync-version`
  > - Download synced version artifact
  > - Setup pnpm, Node.js LTS, Rust stable
  > - Cache Cargo registry with `actions/cache@v4`
  > - Run `pnpm install --frozen-lockfile`
  > - Use `tauri-apps/tauri-action@v0` with:
  >   - `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_KEY_PASSWORD` secrets
  >   - `tagName`, `releaseName`, `releaseDraft: true`
  > - Upload build artifacts

---

## Phase 4: Finalize Release Job

- [x] **Implement finalize-release job in build.yml** (ref: PRD Finalize Release)
  Task ID: phase-4-finalize-01
  > **Implementation**: Edit `.github/workflows/build.yml` - add `finalize-release` job.
  > **Details**:
  > - `needs: build-windows`
  > - Download Windows build artifacts
  > - Generate release notes via `gh api repos/$REPO/releases/generate-notes`
  > - Create `latest.json` with structure:
  >   ```json
  >   {
  >     "version": "x.y.z",
  >     "notes": "...",
  >     "pub_date": "ISO-8601",
  >     "platforms": {
  >       "windows-x86_64": {
  >         "signature": "<.sig file contents>",
  >         "url": "https://github.com/.../releases/download/vX.Y.Z/BassyStadiumTools_x.y.z_x64-setup.nsis.zip"
  >       }
  >     }
  >   }
  >   ```
  > - Upload `latest.json` to release via `gh release upload`
  > - Publish release (undraft) via `gh release edit --draft=false`

---

## Phase 5: Tauri Updater Backend Integration

- [x] **Add tauri-plugin-updater to Cargo.toml** (ref: PRD Tauri Updater)
  Task ID: phase-5-updater-01
  > **Implementation**: Edit `src-tauri/Cargo.toml`.
  > **Details**: Add `tauri-plugin-updater = "2"` to `[dependencies]`

- [x] **Register updater plugin in lib.rs** (ref: PRD Tauri Updater)
  Task ID: phase-5-updater-02
  > **Implementation**: Edit `src-tauri/src/lib.rs`.
  > **Details**: Add `.plugin(tauri_plugin_updater::Builder::new().build())` after other plugins

- [x] **Add updater capability to default.json** (ref: PRD Tauri Updater)
  Task ID: phase-5-updater-03
  > **Implementation**: Edit `src-tauri/capabilities/default.json`.
  > **Details**: Add `"updater:default"` to permissions array

- [x] **Configure updater in tauri.conf.json** (ref: PRD Tauri Updater)
  Task ID: phase-5-updater-04
  > **Implementation**: Edit `src-tauri/tauri.conf.json`.
  > **Details**: Add `plugins.updater` configuration:
  > ```json
  > "plugins": {
  >   "updater": {
  >     "endpoints": [
  >       "https://github.com/justinlevinedotme/BassyStadiumTools/releases/latest/download/latest.json"
  >     ],
  >     "pubkey": "PUBKEY_HERE"
  >   }
  > }
  > ```
  > Note: `pubkey` will be generated when signing key is created

---

## Phase 6: Frontend Update Check

- [x] **Install @tauri-apps/plugin-updater npm package** (ref: PRD Tauri Updater)
  Task ID: phase-6-frontend-01
  > **Implementation**: Run `pnpm add @tauri-apps/plugin-updater`.
  > **Details**: Adds frontend bindings for updater plugin

- [x] **Create useUpdater hook** (ref: PRD Tauri Updater)
  Task ID: phase-6-frontend-02
  > **Implementation**: Create `src/hooks/useUpdater.ts`.
  > **Details**:
  > ```typescript
  > import { check } from "@tauri-apps/plugin-updater";
  > // Export async function to check for updates
  > // Return update info if available, null otherwise
  > ```

- [x] **Add update check on app launch** (ref: PRD Tauri Updater)
  Task ID: phase-6-frontend-03
  > **Implementation**: Edit `src/App.tsx` or create `src/components/UpdateChecker.tsx`.
  > **Details**:
  > - Use `useEffect` to check for updates on mount (once)
  > - If update available, show toast notification via `sonner`
  > - Include "Download & Install" button that calls `update.downloadAndInstall()`
  > - Non-blocking: app remains usable during check

---

## Phase 7: Documentation & Secrets Setup

- [x] **Document required GitHub secrets** (ref: PRD Technical Requirements)
  Task ID: phase-7-docs-01
  > **Implementation**: Update `README.md` with secrets setup section.
  > **Details**: Document:
  > - `TAURI_SIGNING_PRIVATE_KEY` - Generated via `pnpm tauri signer generate`
  > - `TAURI_KEY_PASSWORD` - Password used when generating key
  > - How to add secrets in GitHub repo settings

- [x] **Add signing key generation instructions** (ref: PRD Technical Requirements)
  Task ID: phase-7-docs-02
  > **Implementation**: Create or update development setup docs.
  > **Details**:
  > ```bash
  > pnpm tauri signer generate -w ~/.tauri/BassyStadiumTools.key
  > ```
  > - Store private key as `TAURI_SIGNING_PRIVATE_KEY` secret
  > - Store password as `TAURI_KEY_PASSWORD` secret
  > - Add public key to `tauri.conf.json` updater.pubkey

---

*Generated by Clavix /clavix:plan*
