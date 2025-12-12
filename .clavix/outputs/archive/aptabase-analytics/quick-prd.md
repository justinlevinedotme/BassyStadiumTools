# Aptabase Analytics Integration - Quick PRD

Add privacy-respecting analytics to BassyStadiumTools using Aptabase. Users see a friendly consent prompt on first launch explaining that anonymous data helps improve the open source app - tracking launches, errors, and feature usage. Choice is stored in localStorage and persisted across sessions. Users can change their preference anytime via a settings toggle.

Technical implementation uses `tauri-plugin-aptabase` for Rust backend integration and TypeScript frontend API. Track key events: app launches, stadium pack installs, custom stadium imports, config saves, tab navigation, and errors (with context, no PII). Default to analytics OFF until explicit opt-in.

Out of scope: user profiles, in-app analytics dashboard, per-event granular consent, GDPR cookie banners. This is a simple all-or-nothing toggle with transparent framing focused on helping improve an open source project.

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-11*
