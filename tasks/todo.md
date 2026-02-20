# Calendar App — Todo Checklist

## Acceptance Criteria
- Month-view calendar with correct day alignment for any month/year
- Click a day cell → modal opens pre-filled with that date
- Click an event chip → modal opens pre-filled with event data
- Save creates or updates an event; delete removes it
- Events persist across page refreshes via localStorage
- Form rejects empty title and backwards times (no alert())
- Responsive: dots on mobile (<600px), chips on desktop (≥600px)
- Modal: bottom-sheet on mobile, centered card on desktop
- Keyboard: Escape closes modal, focus rings visible

---

## Checklist

- [x] 1. Create `tasks/todo.md` with full checklist + acceptance criteria
- [x] 2. Create `index.html` skeleton (all element IDs, links to CSS/JS)
- [x] 3. Create `style.css` base (reset, CSS vars, header flex layout)
- [x] 4. Implement storage layer + state init in `app.js`
- [x] 5. Implement header rendering + prev/next navigation
- [x] 6. Implement grid rendering (blank leading cells, day numbers, today/other-month classes)
- [x] 7. Wire day-cell click → open modal for new event
- [x] 8. Implement modal close behavior (close btn, Escape, backdrop)
- [x] 9. Implement save with validation (add new event path)
- [x] 10. Render event chips in day cells (sorted by startTime, cycling colors)
- [x] 11. Wire chip click → open modal for editing (stop propagation)
- [x] 12. Implement edit (update existing event on save)
- [x] 13. Implement delete
- [x] 14. Apply full responsive CSS (mobile dots, bottom-sheet modal, breakpoints)
- [x] 15. Accessibility polish (aria-labels, focus ring, tab order, keyboard)
- [x] 16. Final QA (data persistence, year boundary navigation, leap year, multi-event cells)

---

## UI Redesign — Google Calendar Dark Theme

### Goal
Redesign the visual UI to match Google Calendar's dark week-view layout (see attached image).

### Plan

- [x] A. **Dark theme CSS variables** — Replace light colors with dark palette in `style.css`
  - Background: `#1f1f1f`, surface: `#2d2d2d`, border: `#3c3c3c`, text: `#e3e3e3`
  - Today highlight: blue circle on day number
  - Keep existing event chip colors

- [x] B. **Full-page layout in `index.html`** — Restructure HTML into:
  - `#top-nav` — top bar (hamburger, logo, today btn, prev/next, week label, icons, view switcher, avatar)
  - `#sidebar` — left panel (create button, mini month calendar, calendar list sections)
  - `#calendar-main` — right area (week day headers + time grid)

- [x] C. **Top navbar CSS** — Fixed height bar across top, flex row, dark background

- [x] D. **Sidebar CSS** — Fixed-width left panel (~256px), scrollable, dark background

- [x] E. **Week view HTML structure** — Day-header row + scrollable time grid with:
  - Left time label column (GMT+3, 1 AM … 11 PM)
  - 7 day columns with hour-row cells
  - All-day event row at top of grid

- [x] F. **Week view CSS** — Grid layout for day columns, hour rows, time labels, all-day row, current-time red line indicator

- [x] G. **app.js — week view rendering** — Replaced `renderGrid()` month logic with:
  - `getWeekDates()` → array of 7 Date objects for Sun–Sat
  - `renderWeekHeader()` — day name + date number in each column header
  - `renderTimeGrid()` — 24 hour-row cells per column, event chips positioned by time
  - `prevWeek`/`nextWeek` navigate by ±7 days; syncs mini-cal month
  - "Today" button jumps to current week and scrolls to current time

- [x] H. **Mini calendar in sidebar** — Small month grid; clicking a date navigates the week view; current week days highlighted in blue; today shown as filled blue circle

- [x] I. **Current time indicator** — Red dot + horizontal line in today's column at the exact minute position; refreshes every 60 s

- [x] J. **Final QA** — All files written; week navigation, event CRUD, modal, dark theme verified

---

## Mobile Responsiveness

### Plan

- [x] R1. **HTML** — Added `#sidebar-backdrop` div (hidden by default)

- [x] R2. **CSS ≤ 768px** — Sidebar slides in as a fixed drawer; backdrop fades in; `#calendar-main` scrolls horizontally so all 7 columns stay accessible; secondary nav items hidden; smaller day numbers and week label

- [x] R3. **CSS ≤ 480px** — Smaller day names/numbers; logo text hidden; modal becomes a bottom sheet

- [x] R4. **JS** — `toggleSidebar()` / `openSidebar()` / `closeSidebar()` wired to hamburger button and backdrop click

---

## Month View Toggle

### Plan

- [x] V1. **`index.html`** — `view-selector` div → `<button id="view-toggle-btn">`; added `#month-view` with `#month-col-headers` and `#month-grid` inside `#calendar-main`

- [x] V2. **`style.css`** — Month-view styles: column headers, 7-column grid, day cells with `minmax(90px,1fr)` rows, today circle, event chips; `.month-view` class on `#calendar-main` hides week elements and shows month view; mobile overrides remove forced min-width in month view

- [x] V3. **`app.js`** — `state.view`, `state.monthYear/Month` added; `renderCalendar()` dispatches to week or month renderers and updates button label; `renderMonthLabel()`, `renderMonthView()`, `buildMonthCell()` added; `handlePrev()`/`handleNext()`/`goToToday()` handle both views; `toggleView()` switches views and syncs state; mini-cal click and in-week highlighting respect the current view

---

## Review

**All 16 checklist items completed in a single implementation pass.**

### Files created
| File | Lines | Purpose |
|---|---|---|
| `index.html` | ~80 | App shell, all IDs, modal markup, no inline JS |
| `style.css` | ~310 | CSS vars, grid layout, chips, dots, modal, 3 breakpoints |
| `app.js` | ~260 | Storage, state, rendering, CRUD, validation, keyboard nav |
| `tasks/todo.md` | — | This file |

### Key decisions
- `crypto.randomUUID()` for event IDs (no dependency needed)
- Event chips show `HH:MM title`; dots replace chips below 600 px
- Chip colours cycle through a 6-colour palette via CSS custom properties
- Modal is a bottom-sheet on mobile (`align-items: flex-end`), centred card on desktop
- Escape key and backdrop click both close the modal
- Validation errors surface in `#form-error` (no `alert()`)
- Year boundary navigation handled in `prevMonth()` / `nextMonth()`
- `today` compared via zero-time `toDateStr()` to avoid timezone drift
