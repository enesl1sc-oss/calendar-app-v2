/* ============================================================
   Calendar App — app.js   (week-view, dark Google Calendar UI)
   ============================================================ */
'use strict';

/* ---- Constants ---- */
const STORAGE_KEY = 'calendarEvents';
const CHIP_COLORS = ['--chip-0','--chip-1','--chip-2','--chip-3','--chip-4','--chip-5'];
const DAY_NAMES   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const HOUR_H = 48; // px — must match --hour-h in CSS

/* ---- State ---- */
const state = {
  weekStart:     getWeekStart(new Date()),  // Sunday of the displayed week
  events:        [],
  editingId:     null,
  miniCalYear:   new Date().getFullYear(),
  miniCalMonth:  new Date().getMonth(),
};

/* ============================================================
   Storage
   ============================================================ */
function loadEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/* ============================================================
   Date Helpers
   ============================================================ */

/** Return the Sunday that starts the week containing `date`. */
function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return array of 7 Date objects for the week starting at `weekStart`. */
function getWeekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Format a Date as YYYY-MM-DD (no timezone shift). */
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayStr() { return toDateStr(new Date()); }

function getEventsForDate(dateStr) {
  return state.events.filter(e => e.date === dateStr);
}

/**
 * Sync the mini-calendar month to the week being shown.
 * Uses Thursday (day 4) to determine which month the week belongs to.
 */
function syncMiniCalToWeek() {
  const thu = new Date(state.weekStart);
  thu.setDate(thu.getDate() + 4);
  state.miniCalYear  = thu.getFullYear();
  state.miniCalMonth = thu.getMonth();
}

/* ============================================================
   Main Render
   ============================================================ */
function renderCalendar() {
  renderWeekLabel();
  renderWeekHeader();
  renderAlldayRow();
  renderTimeGrid();
  renderCurrentTimeLine();
  renderMiniCal();
}

/* ---- Week label (header h1) ---- */
function renderWeekLabel() {
  const dates = getWeekDates(state.weekStart);
  const first = dates[0];
  const last  = dates[6];
  let label;
  if (first.getFullYear() !== last.getFullYear()) {
    label = `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()} \u2013 ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
  } else if (first.getMonth() !== last.getMonth()) {
    label = `${MONTH_NAMES[first.getMonth()]} \u2013 ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
  } else {
    label = `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`;
  }
  document.getElementById('week-label').textContent = label;
}

/* ---- Day-name / day-number header row ---- */
function renderWeekHeader() {
  const container = document.getElementById('day-headers-row');
  container.innerHTML = '';
  const today = todayStr();

  getWeekDates(state.weekStart).forEach(date => {
    const isToday = toDateStr(date) === today;
    const cell = document.createElement('div');
    cell.className = 'day-header-cell' + (isToday ? ' today' : '');

    const nameEl = document.createElement('div');
    nameEl.className = 'day-name';
    nameEl.textContent = DAY_NAMES[date.getDay()];

    const numEl = document.createElement('div');
    numEl.className = 'day-num';
    numEl.textContent = date.getDate();

    cell.appendChild(nameEl);
    cell.appendChild(numEl);
    cell.addEventListener('click', () => openModal(toDateStr(date), null));
    container.appendChild(cell);
  });
}

/* ---- All-day events row ---- */
function renderAlldayRow() {
  const container = document.getElementById('allday-cells');
  container.innerHTML = '';

  getWeekDates(state.weekStart).forEach(date => {
    const dateStr = toDateStr(date);
    const cell = document.createElement('div');
    cell.className = 'allday-cell';

    getEventsForDate(dateStr)
      .filter(ev => !ev.startTime)
      .forEach((ev, idx) => {
        const chip = document.createElement('span');
        chip.className = 'allday-event';
        chip.style.background = `var(${CHIP_COLORS[idx % CHIP_COLORS.length]})`;
        chip.textContent = ev.title;
        chip.addEventListener('click', e => { e.stopPropagation(); openModal(dateStr, ev.id); });
        cell.appendChild(chip);
      });

    cell.addEventListener('click', () => openModal(dateStr, null));
    container.appendChild(cell);
  });
}

/* ---- Time grid (24 hour rows × 7 day columns) ---- */
function renderTimeGrid() {
  // Time labels
  const labelsEl = document.getElementById('time-labels');
  labelsEl.innerHTML = '';
  for (let h = 0; h < 24; h++) {
    const lbl = document.createElement('div');
    lbl.className = 'time-label';
    if (h > 0) {
      lbl.textContent = h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
    }
    labelsEl.appendChild(lbl);
  }

  // Day columns
  const colsEl = document.getElementById('day-columns');
  colsEl.innerHTML = '';
  const today = todayStr();

  getWeekDates(state.weekStart).forEach(date => {
    const dateStr = toDateStr(date);
    const col = document.createElement('div');
    col.className = 'day-col' + (dateStr === today ? ' today-col' : '');

    // 24 hour-rows with a half-hour divider
    for (let h = 0; h < 24; h++) {
      const row = document.createElement('div');
      row.className = 'hour-row';
      const half = document.createElement('div');
      half.className = 'half-line';
      row.appendChild(half);
      col.appendChild(row);
    }

    // Render timed events
    const timedEvents = getEventsForDate(dateStr).filter(ev => ev.startTime);
    timedEvents.forEach((ev, idx) => col.appendChild(buildTimeEvent(ev, idx, dateStr)));

    col.addEventListener('click', () => openModal(dateStr, null));
    colsEl.appendChild(col);
  });
}

/** Build an absolutely-positioned event chip for the time grid. */
function buildTimeEvent(ev, idx, dateStr) {
  const [sh, sm] = ev.startTime.split(':').map(Number);
  const topPx = ((sh * 60 + sm) / 60) * HOUR_H;

  let heightPx = HOUR_H; // default 1 h
  if (ev.endTime) {
    const [eh, em] = ev.endTime.split(':').map(Number);
    const durMin = (eh * 60 + em) - (sh * 60 + sm);
    heightPx = Math.max(18, (durMin / 60) * HOUR_H);
  }

  const chip = document.createElement('div');
  chip.className = 'time-event';
  chip.style.cssText = `
    background: var(${CHIP_COLORS[idx % CHIP_COLORS.length]});
    top: ${topPx}px;
    height: ${heightPx}px;
  `;

  const title = document.createElement('span');
  title.className = 'time-event-title';
  title.textContent = ev.title;
  chip.appendChild(title);

  if (heightPx >= 30) {
    const time = document.createElement('span');
    time.className = 'time-event-time';
    time.textContent = ev.startTime + (ev.endTime ? ` \u2013 ${ev.endTime}` : '');
    chip.appendChild(time);
  }

  chip.addEventListener('click', e => { e.stopPropagation(); openModal(dateStr, ev.id); });
  return chip;
}

/* ---- Current time red line ---- */
function renderCurrentTimeLine() {
  // Remove any previously rendered line
  document.querySelectorAll('.current-time-line').forEach(el => el.remove());

  const today = todayStr();
  const dates = getWeekDates(state.weekStart);
  const todayIdx = dates.findIndex(d => toDateStr(d) === today);
  if (todayIdx === -1) return; // today not visible this week

  const now = new Date();
  const topPx = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_H;

  const colsEl = document.getElementById('day-columns');
  const todayCol = colsEl.children[todayIdx];
  if (!todayCol) return;

  const line = document.createElement('div');
  line.className = 'current-time-line';
  line.style.top = `${topPx}px`;
  todayCol.appendChild(line);
}

/* ============================================================
   Mini Calendar
   ============================================================ */
function renderMiniCal() {
  const { miniCalYear: year, miniCalMonth: month } = state;
  document.getElementById('mini-month-label').textContent =
    `${MONTH_NAMES[month]} ${year}`;

  const grid = document.getElementById('mini-grid');
  grid.innerHTML = '';

  const today     = todayStr();
  const weekDates = new Set(getWeekDates(state.weekStart).map(d => toDateStr(d)));

  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays    = new Date(year, month, 0).getDate();

  // Leading (prev-month) days
  for (let i = 0; i < firstDow; i++) {
    grid.appendChild(makeMiniDay(prevDays - firstDow + i + 1, true, false, false, null));
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday  = dateStr === today;
    const isInWeek = weekDates.has(dateStr);
    const span = makeMiniDay(d, false, isToday, isInWeek, () => {
      state.weekStart = getWeekStart(new Date(year, month, d));
      syncMiniCalToWeek();
      renderCalendar();
    });
    grid.appendChild(span);
  }

  // Trailing (next-month) days
  const total     = firstDow + daysInMonth;
  const remainder = total % 7;
  if (remainder !== 0) {
    for (let d = 1; d <= 7 - remainder; d++) {
      grid.appendChild(makeMiniDay(d, true, false, false, null));
    }
  }
}

function makeMiniDay(num, isOther, isToday, isInWeek, onClick) {
  const span = document.createElement('span');
  let cls = 'mini-day';
  if (isOther)  cls += ' other-month';
  if (isToday)  cls += ' today';
  else if (isInWeek) cls += ' in-week';
  span.className = cls;
  span.textContent = num;
  if (onClick) span.addEventListener('click', onClick);
  return span;
}

/* ============================================================
   Modal — Open / Close
   ============================================================ */
function openModal(dateStr, eventId) {
  const overlay   = document.getElementById('modal-overlay');
  const titleEl   = document.getElementById('modal-title');
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
    const ev = state.events.find(e => e.id === eventId);
    if (!ev) return;
    titleEl.textContent = 'Edit Event';
    fTitle.value        = ev.title;
    fDate.value         = ev.date;
    fStart.value        = ev.startTime   || '';
    fEnd.value          = ev.endTime     || '';
    fDesc.value         = ev.description || '';
    deleteBtn.hidden    = false;
  } else {
    titleEl.textContent = 'Add Event';
    fTitle.value        = '';
    fDate.value         = dateStr;
    fStart.value        = '';
    fEnd.value          = '';
    fDesc.value         = '';
    deleteBtn.hidden    = true;
  }

  overlay.hidden = false;
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

  if (!title) { errEl.textContent = 'Title is required'; fTitle.focus(); return; }
  if (!date)  { errEl.textContent = 'Date is required';  fDate.focus();  return; }
  if (startTime && endTime && startTime >= endTime) {
    errEl.textContent = 'Start time must be before end time';
    fStart.focus();
    return;
  }
  errEl.textContent = '';

  if (state.editingId) {
    const idx = state.events.findIndex(e => e.id === state.editingId);
    if (idx !== -1) {
      state.events[idx] = { ...state.events[idx], title, date, startTime, endTime, description };
    }
  } else {
    state.events.push({ id: crypto.randomUUID(), title, date, startTime, endTime, description });
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
   Week Navigation
   ============================================================ */
function prevWeek() {
  state.weekStart = new Date(state.weekStart);
  state.weekStart.setDate(state.weekStart.getDate() - 7);
  syncMiniCalToWeek();
  renderCalendar();
}

function nextWeek() {
  state.weekStart = new Date(state.weekStart);
  state.weekStart.setDate(state.weekStart.getDate() + 7);
  syncMiniCalToWeek();
  renderCalendar();
}

function goToToday() {
  state.weekStart = getWeekStart(new Date());
  syncMiniCalToWeek();
  renderCalendar();
  scrollToCurrentTime();
}

/** Mini-calendar month navigation */
function miniPrev() {
  if (state.miniCalMonth === 0) { state.miniCalMonth = 11; state.miniCalYear--; }
  else { state.miniCalMonth--; }
  renderMiniCal();
}

function miniNext() {
  if (state.miniCalMonth === 11) { state.miniCalMonth = 0; state.miniCalYear++; }
  else { state.miniCalMonth++; }
  renderMiniCal();
}

/** Scroll the time grid so current time is near the top of the viewport. */
function scrollToCurrentTime() {
  const now    = new Date();
  const topPx  = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_H;
  const wrap   = document.getElementById('time-grid-wrap');
  if (wrap) wrap.scrollTop = Math.max(0, topPx - 120);
}

/* ============================================================
   Init
   ============================================================ */
function init() {
  state.events = loadEvents();

  // Week navigation
  document.getElementById('prev-btn').addEventListener('click', prevWeek);
  document.getElementById('next-btn').addEventListener('click', nextWeek);
  document.getElementById('today-btn').addEventListener('click', goToToday);

  // Mini calendar navigation
  document.getElementById('mini-prev-btn').addEventListener('click', miniPrev);
  document.getElementById('mini-next-btn').addEventListener('click', miniNext);

  // Create button opens modal for today
  document.getElementById('create-btn').addEventListener('click', () => openModal(todayStr(), null));

  // Modal actions
  document.getElementById('save-btn').addEventListener('click', handleSave);
  document.getElementById('modal-form').addEventListener('submit', handleSave);
  document.getElementById('cancel-btn').addEventListener('click', closeModal);
  document.getElementById('close-btn').addEventListener('click', closeModal);
  document.getElementById('delete-btn').addEventListener('click', handleDelete);

  // Close on backdrop click
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('modal-overlay').hidden) closeModal();
  });

  renderCalendar();
  scrollToCurrentTime();

  // Refresh current-time line every minute
  setInterval(() => {
    renderCurrentTimeLine();
  }, 60_000);
}

document.addEventListener('DOMContentLoaded', init);
