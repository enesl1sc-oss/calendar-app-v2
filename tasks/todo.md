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
