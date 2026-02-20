# Calendar App — Revert to Original Design

## Goal
Restore the original light-themed monthly calendar UI (commit e8aafe1).
Use the Google Calendar screenshot only as minor inspiration (not a copy).

## Plan

- [x] 1. Restore `index.html` to the original (simple header + grid + modal, no sidebar)
- [x] 2. Restore `style.css` to the original (light theme, blue primary header, card layout)
- [x] 3. Restore `app.js` to the original (month-only view, clean event chips, keyboard support)
- [x] 4. Minor polish touches inspired by Google Calendar:
       - Added a "Today" pill button to the header (HTML + CSS)
       - Grouped prev/next arrows in `.nav-arrows` flex container
       - Wired `goToToday()` function in app.js

## Review
- Restored all three files to commit e8aafe1 via `git checkout e8aafe1 -- ...`
- The design is the original: light white card, solid blue header, month grid, event chips
- Only addition: a "Today" pill button in the header that jumps back to the current month
- No other changes — sidebar, week-view, dark theme, and time grid are all gone
