# R2 BepInEx Migration - Quick PRD

The `bepinex_pack.zip` (~50MB) currently stored in git bloats the repository and slows CI builds. This feature migrates the pack to Cloudflare R2 for runtime download, reducing repo size while maintaining flexibility. Users need three installation options: download from R2 (primary), install from local zip file, or specify a custom URL for modded packs. Before any installation, users must see a clear warning that existing BepInEx files will be overwritten and confirm before proceeding. Downloads must show real-time progress with percentage, speed, and cancellation support.

Technical implementation uses Tauri 2.0 with Rust backend for HTTP downloads (reqwest or Tauri HTTP client) and React frontend for UI. Cloudflare R2 serves the pack from a public bucket with free egress. Target platform is Windows only. The app requires file system write access to the user-selected FM26 game directory. No backend API needed - R2 serves static files directly.

Out of scope: macOS/Linux support, automatic background updates, multiple pack management, pack customization tools, and automatic backup before overwrite. Future iterations may add version/hash checking to detect pack updates and local caching to avoid re-downloads on reinstall. Success is measured by: repo size reduction, working downloads from all three sources, clear progress/warning UX, and faster CI builds.

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-12*
