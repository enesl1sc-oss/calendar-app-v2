/* ============================================================
   Calendar App — app.js
   Plain HTML/CSS/JS, no dependencies.
   ============================================================ */

'use strict';

/* ============================================================
   Constants
   ============================================================ */
const STORAGE_KEY  = 'calendarEvents';
const CHIP_COLORS  = ['--chip-0','--chip-1','--chip-2','--chip-3','--chip-4','--chip-5'];
const MONTH_NAMES  = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

/* ============================================================
   In-Memory State
   ============================================================ */
const state = {
  currentYear:  new Date().getFullYear(),
  currentMonth: new Date().getMonth(),   // 0-indexed
  events:       [],
  editingId:    null
};

/* ============================================================
   Storage
   ============================================================ */
function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/* ============================================================
   Date Helpers
   ============================================================ */
function getMonthName(month) {
  return MONTH_NAMES[month];
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function getEventsForDate(dateStr) {
  return state.events.filter(e => e.date === dateStr);
}

function toDateStr(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function todayStr() {
  const now = new Date();
  return toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
}

/* ============================================================
   Rendering
   ============================================================ */
function renderCalendar() {
  renderHeader();
  renderGrid();
}

function renderHeader() {
  document.getElementById('month-year-label').textContent =
    `${getMonthName(state.currentMonth)} ${state.currentYear}`;
}

function renderGrid() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const totalDays    = getDaysInMonth(state.currentYear, state.currentMonth);
  const firstDow     = getFirstDayOfWeek(state.currentYear, state.currentMonth);
  const today        = todayStr();

  // Leading empty cells
  for (let i = 0; i < firstDow; i++) {
    const blank = document.createElement('div');
    blank.className = 'day-cell empty';
    blank.setAttribute('aria-hidden', 'true');
    grid.appendChild(blank);
  }

  // Day cells
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = toDateStr(state.currentYear, state.currentMonth, d);
    grid.appendChild(renderDayCell(d, dateStr, today));
  }
}

function renderDayCell(dayNum, dateStr, today) {
  const cell = document.createElement('div');
  cell.className = 'day-cell' + (dateStr === today ? ' today' : '');
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('tabindex', '0');
  cell.setAttribute('aria-label', dateStr);

  // Day number
  const numEl = document.createElement('span');
  numEl.className = 'day-number';
  numEl.textContent = dayNum;
  cell.appendChild(numEl);

  // Chips + dots
  const events = getEventsForDate(dateStr);
  const sorted = [...events].sort((a, b) => {
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  const dotRow = document.createElement('div');
  dotRow.className = 'dot-row';

  sorted.forEach((ev, idx) => {
    const chipColor = `var(${CHIP_COLORS[idx % CHIP_COLORS.length]})`;

    // Chip (desktop)
    cell.appendChild(renderEventChip(ev, chipColor, dateStr));

    // Dot (mobile)
    const dot = document.createElement('span');
    dot.className = 'event-dot';
    dot.style.setProperty('--chip-color', chipColor);
    dotRow.appendChild(dot);
  });

  if (sorted.length) cell.appendChild(dotRow);

  // Click: open modal for new event on this date
  cell.addEventListener('click', () => openModal(dateStr, null));
  cell.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(dateStr, null);
    }
  });

  return cell;
}

function renderEventChip(ev, chipColor, dateStr) {
  const chip = document.createElement('span');
  chip.className = 'event-chip';
  chip.style.setProperty('--chip-color', chipColor);
  chip.textContent = ev.startTime ? `${ev.startTime} ${ev.title}` : ev.title;
  chip.setAttribute('role', 'button');
  chip.setAttribute('tabindex', '0');
  chip.setAttribute('aria-label', `Edit event: ${ev.title}`);

  chip.addEventListener('click', e => {
    e.stopPropagation(); // prevent day-cell click
    openModal(dateStr, ev.id);
  });
  chip.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      openModal(dateStr, ev.id);
    }
  });

  return chip;
}

/* ============================================================
   Modal — Open / Close
   ============================================================ */
function openModal(dateStr, eventId) {
  const overlay   = document.getElementById('modal-overlay');
  const title     = document.getElementById('modal-title');
  const fTitle    = document.getElementById('f-title');
  const fDate     = document.getElementById('f-date');
  const fStart    = document.getElementById('f-start');
  const fEnd      = document.getElementById('f-end');
  const fDesc     = document.getElementById('f-desc');
  const deleteBtn = document.getElementById('delete-btn');
  const errEl     = document.getElementById('form-error');

  errEl.textContent = '';
  state.editingId   = eventId;

  if (eventId) {
    // Edit mode
    const ev = state.events.find(e => e.id === eventId);
    if (!ev) return;
    title.textContent     = 'Edit Event';
    fTitle.value          = ev.title;
    fDate.value           = ev.date;
    fStart.value          = ev.startTime  || '';
    fEnd.value            = ev.endTime    || '';
    fDesc.value           = ev.description || '';
    deleteBtn.hidden      = false;
  } else {
    // New event mode
    title.textContent = 'Add Event';
    fTitle.value      = '';
    fDate.value       = dateStr;
    fStart.value      = '';
    fEnd.value        = '';
    fDesc.value       = '';
    deleteBtn.hidden  = true;
  }

  overlay.hidden = false;
  // Focus title field after paint
  requestAnimationFrame(() => fTitle.focus());
}

function closeModal() {
  document.getElementById('modal-overlay').hidden = true;
  state.editingId = null;
}

/* ============================================================
   Modal — Save / Delete
   ============================================================ */
function handleSave(e) {
  e.preventDefault();

  const fTitle  = document.getElementById('f-title');
  const fDate   = document.getElementById('f-date');
  const fStart  = document.getElementById('f-start');
  const fEnd    = document.getElementById('f-end');
  const fDesc   = document.getElementById('f-desc');
  const errEl   = document.getElementById('form-error');

  const title       = fTitle.value.trim();
  const date        = fDate.value;
  const startTime   = fStart.value;
  const endTime     = fEnd.value;
  const description = fDesc.value.trim();

  // Validation
  if (!title) {
    errEl.textContent = 'Title is required';
    fTitle.focus();
    return;
  }
  if (!date) {
    errEl.textContent = 'Date is required';
    fDate.focus();
    return;
  }
  if (startTime && endTime && startTime >= endTime) {
    errEl.textContent = 'Start time must be before end time';
    fStart.focus();
    return;
  }

  errEl.textContent = '';

  if (state.editingId) {
    // Update existing
    const idx = state.events.findIndex(e => e.id === state.editingId);
    if (idx !== -1) {
      state.events[idx] = { ...state.events[idx], title, date, startTime, endTime, description };
    }
  } else {
    // Create new
    state.events.push({
      id:          crypto.randomUUID(),
      title,
      date,
      startTime,
      endTime,
      description
    });
  }

  saveEvents(state.events);
  renderCalendar();
  closeModal();
}

function handleDelete() {
  const ev = state.events.find(e => e.id === state.editingId);
  if (!ev) return;
  if (!confirm(`Delete "${ev.title}"?`)) return;

  state.events = state.events.filter(e => e.id !== state.editingId);
  saveEvents(state.events);
  renderCalendar();
  closeModal();
}

/* ============================================================
   Navigation
   ============================================================ */
function prevMonth() {
  if (state.currentMonth === 0) {
    state.currentMonth = 11;
    state.currentYear--;
  } else {
    state.currentMonth--;
  }
  renderCalendar();
}

function nextMonth() {
  if (state.currentMonth === 11) {
    state.currentMonth = 0;
    state.currentYear++;
  } else {
    state.currentMonth++;
  }
  renderCalendar();
}

function goToToday() {
  const now = new Date();
  state.currentYear  = now.getFullYear();
  state.currentMonth = now.getMonth();
  renderCalendar();
}

/* ============================================================
   Init — Wire Listeners + Boot
   ============================================================ */
function init() {
  state.events = loadEvents();

  // Navigation
  document.getElementById('prev-btn').addEventListener('click', prevMonth);
  document.getElementById('next-btn').addEventListener('click', nextMonth);
  document.getElementById('today-btn').addEventListener('click', goToToday);

  // Modal buttons
  document.getElementById('save-btn').addEventListener('click', handleSave);
  document.getElementById('modal-form').addEventListener('submit', handleSave);
  document.getElementById('cancel-btn').addEventListener('click', closeModal);
  document.getElementById('close-btn').addEventListener('click', closeModal);
  document.getElementById('delete-btn').addEventListener('click', handleDelete);

  // Close on overlay backdrop click (not modal-box)
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('modal-overlay').hidden) {
      closeModal();
    }
  });

  renderCalendar();
}

document.addEventListener('DOMContentLoaded', init);
