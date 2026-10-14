// format.js — small pure functions for turning numbers and dates into text.
// "Pure" means: same input, same output, no side effects. Easy to reason about.

const pad = (n) => String(n).padStart(2, '0')

// A local calendar day as "YYYY-MM-DD" (the user's own time zone).
export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Timer display: 05:07, or 1:05:07 once past an hour.
export function formatClock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// Friendly duration for the Done log: "25 min", "1 h 5 min".
export function formatMinutes(totalSeconds) {
  const minutes = Math.round(totalSeconds / 60)
  if (totalSeconds > 0 && minutes === 0) return 'under a minute'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${h} h ${rest} min` : `${h} h`
}

// Label for a day group in the Done log: Today, Yesterday, or "Mon, 13 Oct".
export function dayLabel(dateKey) {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (dateKey === localDateKey(today)) return 'Today'
  if (dateKey === localDateKey(yesterday)) return 'Yesterday'
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
