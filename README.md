# Calendar App

A lightweight, single-page month-view calendar built with plain HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies.

## Features

- **Month navigation** — step forward/back through any month and year, including year boundary rollover
- **Add events** — click any day cell to open the event form pre-filled with that date
- **Edit events** — click an event chip to re-open the form with all fields populated
- **Delete events** — delete button appears in edit mode with a confirmation prompt
- **Persistent storage** — events are saved to `localStorage` and survive page refresh
- **Form validation** — title and date are required; start time must be before end time; errors shown inline (no `alert()`)
- **Responsive layout**
  - `< 600 px` — compact cells, coloured dot indicators, modal slides up as a bottom sheet
  - `≥ 600 px` — full event chips with time + title, modal centred on screen
  - `≥ 900 px` — taller cells, comfortable desktop padding
- **Accessibility** — keyboard navigation (Enter/Space on cells and chips, Escape to close modal), `aria` roles and labels, visible focus rings

## Project Structure

```
├── index.html      # App shell and modal markup
├── style.css       # All styles: grid, chips, modal, responsive breakpoints
├── app.js          # All logic: state, storage, rendering, CRUD, validation
└── tasks/
    └── todo.md     # Implementation checklist and review notes
```

## Getting Started

No installation or server required — just open `index.html` directly in any modern browser.

```
# Clone the repo
git clone https://github.com/<your-username>/calendar-app-demo.git

# Open in browser
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

## Event Data Model

Events are stored in `localStorage` under the key `calendarEvents` as a JSON array:

```json
[
  {
    "id":          "uuid-v4",
    "title":       "Team standup",
    "date":        "2026-02-20",
    "startTime":   "09:00",
    "endTime":     "09:15",
    "description": "Daily sync"
  }
]
```

## Browser Support

Works in any browser that supports ES2020+ (`crypto.randomUUID`, `localStorage`, CSS Grid, CSS custom properties) — Chrome 92+, Firefox 90+, Safari 15+, Edge 92+.

## License

MIT
