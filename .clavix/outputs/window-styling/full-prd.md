# Product Requirements Document: Window Styling Integration

## Problem & Goal

The app's default Windows titlebar (white background, plain text) clashes with the dark-themed UI, making it look visually out of place and unprofessional. The goal is to implement a Spotify-style integrated titlebar where window controls are embedded directly into the app's header area, seamlessly blending with the dark theme while preserving native Windows functionality like Snap Layout.

## Requirements

### Must-Have Features

1. **Frameless window** - Remove the default OS titlebar entirely to allow full control over the window appearance

2. **Custom window controls** - Min/max/close buttons styled to match the dark UI, positioned in the top-right corner of the app

3. **Drag region** - Make the header area (where "BassyStadiumTools" title is) draggable so users can move the window

4. **Windows Snap Layout support** - Preserve the native Windows 11 snap layout feature (hover over maximize button shows snap options)

5. **Window resizing** - Users can resize the window from all edges

### Technical Requirements

- **Plugin:** tauri-plugin-decorum for native Windows overlay titlebar
- **Framework:** Tauri 2.0 with React frontend
- **Approach:** Use decorum's `create_overlay_titlebar()` to hide native decorations and create custom window controls that overlay the app content
- **Styling:** Controls should blend with existing dark theme (blacks/grays matching current UI)

## Out of Scope

- **macOS support** - Windows-only implementation
- **Custom titlebar text/branding** - App name already displays in the existing header
- **Animations** - No hover/click animations on window controls
- **Extra titlebar UI** - No tabs, menus, or additional elements in the titlebar area
- **Linux support** - Not targeted

## Additional Context

- The app is a mod manager tool (BassyStadiumTools) for Football Manager 2026
- Current UI uses a dark theme with a background image and dark cards/panels
- The header already contains the app title and navigation tabs (Game, Stadiums, Audio, Configs, Logs)
- Window controls should appear above/alongside the existing header without disrupting the current layout

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-13*
