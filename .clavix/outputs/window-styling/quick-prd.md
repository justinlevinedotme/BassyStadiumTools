# Window Styling Integration - Quick PRD

Build a Spotify-style integrated titlebar for BassyStadiumTools that replaces the jarring default Windows titlebar (white background) with custom window controls embedded directly into the app's dark-themed header. The window should be frameless with min/max/close buttons in the top-right, the header area should be draggable for window movement, and Windows Snap Layout must be preserved for native feel.

Use tauri-plugin-decorum to implement the overlay titlebar on the existing Tauri 2.0 + React app. The plugin handles hiding native decorations and creating custom controls while maintaining Windows 11 snap functionality. Window resizing from edges must remain functional.

Out of scope: macOS/Linux support, animations on controls, extra titlebar UI elements, and custom titlebar branding (app name already shows in header). Focus solely on making the window controls blend seamlessly with the existing dark UI.

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-13*
