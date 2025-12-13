# Implementation Plan

**Project**: r2-bepinex-migration
**Generated**: 2025-12-12

## Technical Context & Standards

*Detected Stack & Patterns*
- **Framework**: Tauri 2.0 (Rust backend + Vite/React frontend)
- **Styling**: Tailwind CSS + shadcn/ui components (Radix-based)
- **State**: React useState/useEffect hooks (no global state library)
- **API**: `@tauri-apps/api/core` invoke for Rust commands
- **Rust Crates**: `zip`, `serde`, `serde_json`, `chrono`, `dirs`, `reqwest` (to add)
- **Conventions**:
  - Tabs: `src/tabs/*.tsx`
  - Hooks: `src/hooks/*.ts`
  - UI: `src/components/ui/*.tsx`
  - Rust commands: `src-tauri/src/*.rs` → registered in `lib.rs`
  - Types: `src/types.ts`
  - Toasts: `sonner`
  - File dialogs: `@tauri-apps/plugin-dialog`

---

## Phase 1: Rust Backend - HTTP Download Infrastructure

- [x] **Add reqwest dependency to Cargo.toml** (ref: Technical Requirements)
  Task ID: phase-1-backend-01
  > **Implementation**: Edit `src-tauri/Cargo.toml`
  > **Details**: Add `reqwest = { version = "0.12", features = ["stream"] }` and `futures-util = "0.3"` to dependencies. reqwest provides async HTTP client with streaming support for progress tracking.

- [x] **Create download module for R2 fetching** (ref: Download from R2)
  Task ID: phase-1-backend-02
  > **Implementation**: Create `src-tauri/src/download.rs`
  > **Details**: Create new module with:
  > - `DownloadProgress` struct: `{ downloaded: u64, total: u64, speed_bps: f64 }`
  > - `download_file_with_progress()` async fn that uses reqwest streaming
  > - Emit progress events to frontend via Tauri events (`app_handle.emit("download-progress", progress)`)
  > - Support cancellation via `CancellationToken` pattern
  > - Return `Result<PathBuf, String>` with downloaded file path

- [x] **Add download Tauri commands** (ref: Download from R2, Custom URL)
  Task ID: phase-1-backend-03
  > **Implementation**: Edit `src-tauri/src/download.rs`
  > **Details**: Add three `#[tauri::command]` functions:
  > - `download_bepinex_from_r2(app: AppHandle) -> Result<PathBuf, String>` - hardcoded R2 URL
  > - `download_bepinex_from_url(app: AppHandle, url: String) -> Result<PathBuf, String>` - custom URL
  > - `cancel_download(app: AppHandle) -> Result<(), String>` - cancel in-progress download
  > Download to temp directory, validate it's a valid zip before returning.

- [x] **Register download module in lib.rs** (ref: Technical Requirements)
  Task ID: phase-1-backend-04
  > **Implementation**: Edit `src-tauri/src/lib.rs`
  > **Details**: Add `mod download;` and register the three new commands in `tauri::Builder::default().invoke_handler(tauri::generate_handler![...])`.

---

## Phase 2: Rust Backend - Installation Logic Updates

- [ ] **Refactor install_bepinex_pack to accept zip path** (ref: Install from Local, Download from R2)
  Task ID: phase-2-backend-01
  > **Implementation**: Edit `src-tauri/src/fm26.rs`
  > **Details**: Modify `install_bepinex_pack` signature to:
  > `pub fn install_bepinex_pack(zip_path: Option<String>, app_handle: AppHandle, install: Fm26Installation) -> Result<(), String>`
  > - If `zip_path` is Some, use that file
  > - If `zip_path` is None, fall back to bundled resource (existing behavior)
  > - Keep existing backup and extraction logic

- [ ] **Add check_bepinex_installed command** (ref: Overwrite Warning)
  Task ID: phase-2-backend-02
  > **Implementation**: Edit `src-tauri/src/fm26.rs`
  > **Details**: Add new command:
  > `pub fn check_bepinex_installed(install: Fm26Installation) -> Result<BepInExStatus, String>`
  > Return struct with: `{ installed: bool, path: String, has_plugins: bool, plugin_count: u32 }`
  > Used by frontend to show warning before overwrite.

---

## Phase 3: Frontend - Download Hook

- [ ] **Create useBepInExDownload hook** (ref: Download Progress, Custom URL)
  Task ID: phase-3-frontend-01
  > **Implementation**: Create `src/hooks/useBepInExDownload.ts`
  > **Details**: Model after existing `useUpdater.ts` pattern:
  > ```typescript
  > interface DownloadState {
  >   downloading: boolean;
  >   progress: number; // 0-100
  >   speed: string; // "1.2 MB/s"
  >   error: string | null;
  >   canCancel: boolean;
  > }
  > ```
  > Export functions:
  > - `downloadFromR2()` - calls `download_bepinex_from_r2` command
  > - `downloadFromUrl(url: string)` - calls `download_bepinex_from_url`
  > - `cancelDownload()` - calls `cancel_download`
  > Listen to `download-progress` Tauri event using `listen()` from `@tauri-apps/api/event`

---

## Phase 4: Frontend - Installation Dialog Component

- [ ] **Create BepInExInstallDialog component** (ref: Overwrite Warning, Install Options)
  Task ID: phase-4-frontend-01
  > **Implementation**: Create `src/components/BepInExInstallDialog.tsx`
  > **Details**: Use shadcn AlertDialog (already have `@radix-ui/react-alert-dialog`):
  > - Props: `{ open, onOpenChange, installation, onInstallComplete }`
  > - Three installation source options (radio/select):
  >   1. "Download from server" (default) - R2
  >   2. "Use local zip file" - file picker
  >   3. "Custom URL" - text input
  > - Show overwrite warning when `check_bepinex_installed` returns installed=true
  > - Progress bar during download (use `useBepInExDownload` hook)
  > - Cancel button during download
  > - Success/error states with toast notifications

- [ ] **Add types for download state** (ref: Technical Requirements)
  Task ID: phase-4-frontend-02
  > **Implementation**: Edit `src/types.ts`
  > **Details**: Add interfaces:
  > ```typescript
  > export interface BepInExStatus {
  >   installed: boolean;
  >   path: string;
  >   has_plugins: boolean;
  >   plugin_count: number;
  > }
  >
  > export interface DownloadProgress {
  >   downloaded: number;
  >   total: number;
  >   speed_bps: number;
  > }
  > ```

---

## Phase 5: Frontend - GameTab Integration

- [ ] **Update GameTab to use new install dialog** (ref: All Features)
  Task ID: phase-5-frontend-01
  > **Implementation**: Edit `src/tabs/GameTab.tsx`
  > **Details**:
  > - Import `BepInExInstallDialog`
  > - Add state: `const [showInstallDialog, setShowInstallDialog] = useState(false)`
  > - Change "Install Stadium Pack" button to open dialog instead of direct install
  > - Remove direct `handleInstall` logic (moved to dialog)
  > - Keep existing installation validation and plugin status display

- [ ] **Add progress UI components** (ref: Download Progress)
  Task ID: phase-5-frontend-02
  > **Implementation**: Run `pnpm dlx shadcn@latest add progress`
  > **Details**: Add shadcn Progress component for download progress bar. Will be used in BepInExInstallDialog.

---

## Phase 6: Configuration & Cleanup

- [ ] **Add R2 URL constant** (ref: Technical Requirements)
  Task ID: phase-6-config-01
  > **Implementation**: Create `src-tauri/src/constants.rs`
  > **Details**: Add:
  > ```rust
  > pub const BEPINEX_R2_URL: &str = "https://your-r2-bucket.r2.cloudflarestorage.com/bepinex_pack.zip";
  > ```
  > Import in download.rs. URL will need to be updated once R2 bucket is created.

- [ ] **Remove bundled zip from resources (optional)** (ref: Success Criteria)
  Task ID: phase-6-config-02
  > **Implementation**: Edit `src-tauri/tauri.conf.json` and delete `src-tauri/resources/bepinex_pack.zip`
  > **Details**: Remove `"resources": ["resources/*"]` from bundle config once R2 download is confirmed working. Keep file in repo for now as fallback. Can be done in a follow-up PR after testing.

- [ ] **Update .gitignore to exclude large zips** (ref: Success Criteria)
  Task ID: phase-6-config-03
  > **Implementation**: Edit `.gitignore`
  > **Details**: Uncomment or add: `src-tauri/resources/bepinex_pack.zip` to prevent re-adding large file.

---

## Phase 7: Testing & Validation

- [ ] **Test R2 download flow** (ref: Success Criteria)
  Task ID: phase-7-testing-01
  > **Implementation**: Manual testing
  > **Details**:
  > 1. Upload `bepinex_pack.zip` to Cloudflare R2 bucket
  > 2. Update `BEPINEX_R2_URL` constant with actual URL
  > 3. Run app, test download from R2
  > 4. Verify progress updates correctly
  > 5. Test cancellation mid-download
  > 6. Verify extraction works correctly

- [ ] **Test local zip installation** (ref: Install from Local)
  Task ID: phase-7-testing-02
  > **Implementation**: Manual testing
  > **Details**:
  > 1. Select "Use local zip file" option
  > 2. Browse to a valid bepinex_pack.zip
  > 3. Verify installation completes
  > 4. Verify overwrite warning appears when BepInEx already installed

- [ ] **Test custom URL installation** (ref: Install from Custom URL)
  Task ID: phase-7-testing-03
  > **Implementation**: Manual testing
  > **Details**:
  > 1. Select "Custom URL" option
  > 2. Enter a valid URL (can use R2 URL for testing)
  > 3. Verify download and installation works
  > 4. Test with invalid URL - verify error handling

---

*Generated by Clavix /clavix:plan*
