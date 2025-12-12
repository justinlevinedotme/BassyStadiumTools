# Implementation Plan

**Project**: ui-enhancements
**Generated**: 2025-12-11T00:00:00Z

## Technical Context & Standards
*Detected Stack & Patterns*
- **Framework**: React 18 + Vite + Tauri 2.0 (Desktop app)
- **Styling**: Tailwind CSS + shadcn/ui (default style, slate base)
- **State**: Local component state (useState/useEffect)
- **Components**: `src/components/ui/` for primitives, `src/tabs/` for tab views
- **Icons**: lucide-react
- **Conventions**: PascalCase components, kebab-case files in ui/, path aliases `@/`

---

## Phase 1: Add Missing shadcn/ui Components

- [x] **Add shadcn/ui Tooltip component** (ref: PRD Feature 1)
  Task ID: phase-1-setup-01
  > **Implementation**: Run `npx shadcn@latest add tooltip` to create `src/components/ui/tooltip.tsx`
  > **Details**: This will also add `@radix-ui/react-tooltip` dependency. Verify component exports: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`.

- [x] **Add shadcn/ui Slider component** (ref: PRD Feature 5)
  Task ID: phase-1-setup-02
  > **Implementation**: Run `npx shadcn@latest add slider` to create `src/components/ui/slider.tsx`
  > **Details**: This will add `@radix-ui/react-slider` dependency. Component takes `value`, `onValueChange`, `min`, `max`, `step` props.

---

## Phase 2: Wrap App with TooltipProvider

- [x] **Add TooltipProvider to App root** (ref: PRD Feature 1)
  Task ID: phase-2-tooltips-01
  > **Implementation**: Edit `src/App.tsx`
  > **Details**: Import `TooltipProvider` from `@/components/ui/tooltip`. Wrap the entire return JSX with `<TooltipProvider>`. This enables tooltips app-wide.

---

## Phase 3: Add Tooltips to Icon-Only Buttons

- [x] **Add tooltips to GameTab icon buttons** (ref: PRD Feature 1)
  Task ID: phase-3-tooltips-01
  > **Implementation**: Edit `src/tabs/GameTab.tsx`
  > **Details**: Wrap icon-only buttons (Search/auto-detect at line ~221, RefreshCw at line ~232) with `<Tooltip><TooltipTrigger asChild>...</TooltipTrigger><TooltipContent>Description</TooltipContent></Tooltip>`. Buttons: "Auto-detect FM26", "Refresh".

- [x] **Add tooltips to StadiumsTab icon buttons** (ref: PRD Feature 1)
  Task ID: phase-3-tooltips-02
  > **Implementation**: Edit `src/tabs/StadiumsTab.tsx`
  > **Details**: Wrap RefreshCw button (line ~205-206) with tooltip. Also Trash2 delete buttons (line ~311-317) - tooltip: "Remove mapping".

- [x] **Add tooltips to ConfigsTab icon buttons** (ref: PRD Feature 1)
  Task ID: phase-3-tooltips-03
  > **Implementation**: Edit `src/tabs/ConfigsTab.tsx`
  > **Details**: Wrap RefreshCw button (line ~221-224) with tooltip: "Refresh configs".

- [x] **Add tooltips to AudioTab icon buttons** (ref: PRD Feature 1)
  Task ID: phase-3-tooltips-04
  > **Implementation**: Edit `src/tabs/AudioTab.tsx`
  > **Details**: Wrap RefreshCw button (line ~271-273) and Trash2 buttons (line ~226-231) with tooltips.

- [x] **Add tooltips to LogsTab icon buttons** (ref: PRD Feature 1)
  Task ID: phase-3-tooltips-05
  > **Implementation**: Edit `src/tabs/LogsTab.tsx`
  > **Details**: Check for any icon-only buttons and wrap with tooltips as needed.

---

## Phase 4: Custom Stadiums Install Bundle

- [x] **Add "Custom Stadiums" install section to StadiumsTab** (ref: PRD Feature 2)
  Task ID: phase-4-stadiums-01
  > **Implementation**: Edit `src/tabs/StadiumsTab.tsx`
  > **Details**: Add a new Card component after the "Stadium Bundles" card (around line 243). Include a button to install custom stadium bundle zip files. Reuse the existing `handleInstallCustomStadiums` pattern from GameTab or create similar invoke call. Use `FileArchive` icon from lucide-react.

---

## Phase 5: Audio Tab "Coming Soon" Overlay

- [x] **Create ComingSoonOverlay component** (ref: PRD Feature 3)
  Task ID: phase-5-audio-01
  > **Implementation**: Create `src/components/ComingSoonOverlay.tsx`
  > **Details**: Create a reusable overlay component with props `children` and optional `message`. Style: `position: relative` wrapper, inner content gets `opacity-30 blur-sm pointer-events-none`, overlay div with `absolute inset-0 flex items-center justify-center` and "Coming Soon" Badge or text.

- [x] **Wrap AudioTab content with ComingSoonOverlay** (ref: PRD Feature 3)
  Task ID: phase-5-audio-02
  > **Implementation**: Edit `src/tabs/AudioTab.tsx`
  > **Details**: Import ComingSoonOverlay. Wrap the main content (lines 156-349, the div after installation check) with `<ComingSoonOverlay>`. Keep the "No Installation Selected" alert outside the overlay so it still shows.

- [x] **Wrap Audio Inject config card with ComingSoonOverlay** (ref: PRD Feature 3)
  Task ID: phase-5-audio-03
  > **Implementation**: Edit `src/tabs/ConfigsTab.tsx`
  > **Details**: Import ComingSoonOverlay. Wrap only the "Audio Inject" Card (lines 237-348) with `<ComingSoonOverlay>`. Other config cards remain interactive.

---

## Phase 6: Stadiums Loading Indicator

- [x] **Add loading state UI to StadiumsTab** (ref: PRD Feature 4)
  Task ID: phase-6-loading-01
  > **Implementation**: Edit `src/tabs/StadiumsTab.tsx`
  > **Details**: When `isLoading` is true, show a loading overlay or skeleton over the bundles table. Add a div with `flex items-center justify-center gap-2` containing `<RefreshCw className="animate-spin" />` and "Loading stadiums..." text. Show instead of or overlaid on the Table when loading.

---

## Phase 7: Replace Input Range Sliders with shadcn Slider

- [x] **Replace volume sliders in ConfigsTab with shadcn Slider** (ref: PRD Feature 5)
  Task ID: phase-7-sliders-01
  > **Implementation**: Edit `src/tabs/ConfigsTab.tsx`
  > **Details**: Import `Slider` from `@/components/ui/slider`. Replace all `<Input type="range" ... />` elements (lines ~274-286, ~291-305, ~316-326, ~387-400) with `<Slider value={[value]} onValueChange={([v]) => update(v)} min={min} max={max} step={step} />`. Note: Slider uses array for value. Update the master_volume, music_volume, event_volume, crowd_density sliders.

---

## Phase 8: Team Mappings FMRef Link

- [x] **Add FMRef.com instructional link to StadiumsTab** (ref: PRD Feature 6)
  Task ID: phase-8-fmref-01
  > **Implementation**: Edit `src/tabs/StadiumsTab.tsx`
  > **Details**: In the Team Mappings Card (around line 248-257), add a paragraph or link after the CardDescription: `<p className="text-sm text-muted-foreground mt-2">Need team IDs? Find them at <a href="https://fmref.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">fmref.com</a> by SortItOutSI.</p>`. Use `open` from `@tauri-apps/plugin-shell` for external links in Tauri, or use anchor tag with target="_blank".

---

## Phase 9: Sticky Footer with Credits

- [x] **Add sticky footer to App.tsx** (ref: PRD Feature 7)
  Task ID: phase-9-footer-01
  > **Implementation**: Edit `src/App.tsx`
  > **Details**: Add a footer element after the Tabs component but inside the main container. Use `fixed bottom-0 left-0 right-0` or make the app layout flex with `min-h-screen flex flex-col` and footer with `mt-auto`. Content: "Created by [Justin Levine](https://github.com/justinlevinedotme)". Style: `text-sm text-muted-foreground py-2 px-6 border-t bg-background`. Use anchor tag or Tauri shell open for the link.

---

## Phase 10: Badge Color Updates

- [x] **Update Badge usage for Saved/Modified states** (ref: PRD Feature 8)
  Task ID: phase-10-badges-01
  > **Implementation**: Edit `src/tabs/StadiumsTab.tsx`, `src/tabs/ConfigsTab.tsx`, `src/tabs/AudioTab.tsx`
  > **Details**: Badge component already has `success` (green) and `warning` (yellow/orange) variants. Change all instances of `variant={hasChanges ? "secondary" : "outline"}` to `variant={hasChanges ? "warning" : "success"}`. Search for Badge usage showing "Saved"/"Modified"/"Unsaved Changes" states and update variants accordingly:
  > - "Saved" → `variant="success"`
  > - "Modified" / "Unsaved Changes" → `variant="warning"`

---

*Generated by Clavix /clavix:plan*
