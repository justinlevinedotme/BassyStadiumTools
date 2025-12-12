# Product Requirements Document: UI Enhancements

## Problem & Goal
BassyStadiumTools needs UI polish and usability improvements to enhance the user experience. The current interface has several rough edges: icon buttons lack context, the audio feature isn't ready but shows as available, stadiums loading feels slow without feedback, sliders use non-native components, and users need guidance finding team IDs. These changes will make the app more intuitive, polished, and user-friendly.

## Requirements

### Must-Have Features

1. **Tooltips for Icon-Only Buttons**
   - Add shadcn/ui Tooltip components to all icon-only buttons throughout the app
   - Tooltips should describe the button's action clearly
   - Consistent styling with existing shadcn theme

2. **"Custom Stadiums" Install Bundle**
   - Add a new section/button in the Stadiums tab for installing custom stadium bundles
   - Allow users to install pre-packaged stadium collections

3. **Audio Tab "Coming Soon" Overlay**
   - Disable the Audio tab with a blurred/faded visual treatment
   - Add centered "Coming Soon" overlay text
   - Also disable "audio inject" config option with same treatment
   - Users should not be able to interact with disabled elements

4. **Stadiums Loading Indicator**
   - Add loading notice or overlay when stadiums are being loaded
   - Provide visual feedback during the loading delay
   - Consider skeleton loaders or spinner with text

5. **Fix CFG Folder Sliders**
   - Replace current slider implementation with shadcn/ui native Slider components
   - Ensure consistent styling with rest of application
   - Maintain existing functionality and value ranges

6. **Team Mappings FMRef Link**
   - Add instructional link to https://fmref.com/ by SortItOutSI
   - Place in Team Mappings section
   - Help text explaining users can find their team IDs there

7. **Sticky Footer with Credits**
   - Add persistent footer at bottom of application
   - Content: "Created by [Justin Levine](https://github.com/justinlevinedotme)"
   - Footer should remain visible regardless of scroll position

8. **Badge Color Updates**
   - "Saved" badge: Change to Green color
   - "Modified" or "Unsaved Changes" badge: Change to Orange/Yellow color
   - Ensure sufficient contrast for accessibility

### Technical Requirements

- React with shadcn/ui component library (Tailwind-based)
- Use existing shadcn/ui components where available (Tooltip, Slider, Badge)
- Maintain consistent styling with current application theme
- Ensure responsive behavior on different screen sizes

## Out of Scope

- Audio feature implementation (only adding "Coming Soon" overlay)
- New functionality beyond UI improvements
- Backend changes
- Performance optimizations beyond loading indicators
- Mobile-specific layouts

## Additional Context

- The app uses shadcn/ui with Tailwind CSS
- Existing component patterns should be followed
- FMRef.com is an external resource by SortItOutSI for Football Manager data
- Footer credit links to GitHub: https://github.com/justinlevinedotme

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-11T00:00:00Z*
