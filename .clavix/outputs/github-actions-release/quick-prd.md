# GitHub Actions Release & Tauri Updater - Quick PRD

**Goal:** Automate Windows builds via GitHub Actions triggered by version tags (`v*`), with Tauri updater integration so users get notified of new versions on app launch. Version is synced across package.json, Cargo.toml, and tauri.conf.json from the tag. Build artifacts and `latest.json` (updater manifest) are uploaded to GitHub Releases.

**Core Features:** (1) Tag-triggered build workflow with optional manual dispatch, (2) Version sync job that extracts version from tag and updates all config files, (3) Windows-only build using tauri-apps/tauri-action with signing, (4) Finalize job that generates release notes and creates `latest.json` for Tauri updater, (5) Tauri updater plugin integration checking once on app launch.

**Scope Boundaries:** Windows only - no macOS/Linux. No CI/PR workflow. No version bump automation. User-initiated update install only (not silent). Secrets required: TAURI_SIGNING_PRIVATE_KEY, TAURI_KEY_PASSWORD. Updater endpoint: GitHub Release assets (`latest.json`).

---

*Generated with Clavix Planning Mode*
*Generated: 2024-12-12T00:00:00Z*
