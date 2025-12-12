# UI Enhancements - Quick PRD

BassyStadiumTools needs a batch of UI polish improvements to enhance usability. The app currently lacks tooltips on icon buttons, has an unfinished audio feature visible to users, shows no loading feedback for stadiums, uses non-native sliders, and is missing helpful navigation for team ID lookups. These 8 targeted improvements will make the interface more intuitive and polished.

The app is built with React and shadcn/ui (Tailwind-based). All new components should use existing shadcn primitives: Tooltip for icon buttons, Slider for cfg folder controls, and Badge with updated colors (green for "Saved", orange/yellow for "Modified/Unsaved"). The audio tab and audio inject config need a blurred/faded "Coming Soon" overlay preventing interaction. Stadiums tab needs a loading indicator and a new "Custom Stadiums" install bundle section. Team Mappings section needs a link to fmref.com for team ID lookups.

Out of scope: actual audio feature implementation, backend changes, mobile-specific layouts, and performance work beyond loading indicators. Add a sticky footer crediting "Created by [Justin Levine](https://github.com/justinlevinedotme)" visible at all times.

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-11T00:00:00Z*
