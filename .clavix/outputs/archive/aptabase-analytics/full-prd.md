# Product Requirements Document: Aptabase Analytics Integration

## Problem & Goal

**Problem**: No visibility into how users interact with BassyStadiumTools - we don't know which features are used most, what errors occur, or how to prioritize improvements.

**Goal**: Add privacy-respecting analytics using Aptabase with user consent, allowing us to understand feature usage, track errors, and make data-driven decisions for future development.

## Requirements

### Must-Have Features

1. **First-run consent prompt**
   - Display on first app launch only
   - Frame positively: "Help improve this open source app"
   - Explain what's tracked: app launches, errors, feature usage
   - Two clear options: "Enable Analytics" / "No Thanks"
   - Never show again after user makes a choice

2. **Opt-in/opt-out toggle in settings**
   - Add to Configs tab or new Settings area
   - Allow users to change their mind at any time
   - Clear label explaining what analytics does

3. **Persistent preference storage**
   - Store user's choice in localStorage
   - Check preference on every app launch
   - Default to analytics OFF until user opts in

4. **Track key events**
   - App launch
   - Stadium pack installation (success/failure)
   - Custom stadiums zip installation
   - Config saves
   - Tab navigation
   - Errors (with context, no PII)

5. **Error tracking**
   - Capture unhandled errors
   - Track Tauri invoke failures
   - Include error type and context (not user data)

### Technical Requirements

- **SDK**: `tauri-plugin-aptabase` (https://github.com/aptabase/tauri-plugin-aptabase)
- **Frontend**: React hooks for tracking events
- **Storage**: localStorage for consent preference
- **Integration**: Rust backend plugin + TypeScript frontend API
- **Privacy**: No personally identifiable information collected

## Out of Scope

- Detailed user profiles or identifying information
- Analytics dashboard within the app (use Aptabase web dashboard)
- Granular per-event opt-in (all or nothing toggle)
- GDPR cookie banners (desktop app, not applicable)
- Custom analytics backend (using Aptabase SaaS)

## Additional Context

### Consent Prompt Framing

The first-run prompt should be friendly and transparent:

> **Help Improve BassyStadiumTools**
>
> We collect anonymous usage data to understand how the app is used, catch errors, and prioritize new features. No personal information is ever collected.
>
> [Enable Analytics] [No Thanks]

### Event Naming Convention

Use consistent event names:
- `app_launched`
- `stadium_pack_installed`
- `custom_stadiums_installed`
- `config_saved`
- `tab_viewed` (with tab name as property)
- `error_occurred` (with error type as property)

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-11*
