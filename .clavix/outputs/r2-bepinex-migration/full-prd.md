# Product Requirements Document: R2 BepInEx Migration

## Problem & Goal

**Problem:** The `bepinex_pack.zip` file (~50MB) is currently stored in the git repository, which bloats repo size, slows down git operations, and increases CI build times unnecessarily.

**Goal:** Migrate the BepInEx pack to Cloudflare R2 for runtime download, keeping the repository lean while providing flexible installation options. Users should be able to:
- Download from R2 on first use
- Optionally use a local zip file
- Optionally specify a custom hosted URL
- Receive clear warnings before overwriting existing installations

## Requirements

### Must-Have Features

1. **Download from Cloudflare R2**
   - Fetch the BepInEx pack zip from a public R2 bucket URL
   - Trigger download on first use or when pack is missing
   - Handle network errors gracefully with user-friendly messages

2. **Install from Local Zip File**
   - Allow users to select a local `.zip` file as an alternative to downloading
   - Validate the zip structure before extraction
   - Support drag-and-drop or file picker dialog

3. **Install from Custom URL**
   - Allow users to specify a different hosted URL (for custom/modded packs)
   - Validate URL format before attempting download
   - Support both HTTP and HTTPS URLs

4. **Overwrite Warning**
   - Display clear warning before installation that existing BepInEx files will be replaced
   - Require explicit user confirmation before proceeding
   - Show which directory will be affected

5. **Download Progress Indication**
   - Show real-time download progress percentage
   - Display download speed and estimated time remaining
   - Allow cancellation of in-progress downloads

### Technical Requirements

- **Platform:** Tauri 2.0 (Rust backend + React frontend)
- **HTTP Client:** Use Tauri's HTTP client or reqwest crate for downloads
- **Storage:** Cloudflare R2 public bucket (free egress)
- **Target OS:** Windows (matching current build setup)
- **File System:** Requires write permissions to FM26 game directory
- **No Backend Required:** R2 serves static files directly

### Nice-to-Have Features (Future)

1. **Version/Hash Checking**
   - Detect when the hosted pack has been updated
   - Compare local version against remote
   - Prompt user to re-download when updates available

2. **Cache Downloaded Zip**
   - Store the downloaded zip locally for faster reinstalls
   - Avoid re-downloading if user needs to reinstall

## Out of Scope

- macOS/Linux support (Windows only for v1)
- Automatic background updates (user-initiated only)
- Multiple pack management (single pack at a time)
- Pack modification/customization tools
- Backup of existing installation before overwrite

## Success Criteria

1. **Reduced Repo Size:** Remove ~50MB zip from git, repository becomes lightweight
2. **Working Downloads:** Users can successfully download and install BepInEx from R2
3. **Flexibility:** Users can alternatively use local zip or custom URL
4. **Clear UX:** Progress indication during download, clear warnings before overwrite
5. **CI Improvement:** Faster builds without bundling the large resource file

## Additional Context

- The R2 bucket URL will need to be configured (can be hardcoded initially)
- Consider showing download source in UI (R2 vs local vs custom)
- Installation extracts to user-selected FM26 game directory
- Existing BepInEx detection should check for key files/folders

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-12*
