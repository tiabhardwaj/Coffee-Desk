// FocusTimer.jsx — a timer that counts UP, so there is never a deadline to
// race against (D3).
//
// It does NOT keep its own count. The server stored when the session
// started; every second we simply recompute "now minus started_at".
// Two benefits: the timer survives a page refresh, and a background tab
// (where browsers slow timers down) cannot make it drift.

import { useEffect, useState } from 'react'
import { formatClock } from '../format.js'

export default function FocusTimer({ session, taskTitle, onStop }) {
  // `now` exists only to make React re-draw once a second.
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!session) return // no session, no ticking

    const timerId = setInterval(() => setNow(Date.now()), 1000)

    // The cleanup function runs when `session` changes or the component
    // goes away. Without it, every new session would leave one more
    // interval running forever.
    return () => clearInterval(timerId)
  }, [session])

  if (!session) return null

  const elapsed = Math.max(0, Math.floor((now - Date.parse(session.started_at)) / 1000))

  return (
    <section className="focus" aria-label="Focus session">
      <div>
        <p className="focus-label">Focusing on</p>
        <p className="focus-task">{taskTitle}</p>
      </div>
      <p className="focus-clock" role="timer">
        {formatClock(elapsed)}
      </p>
      <button type="button" className="btn btn-primary" onClick={onStop}>
        Finish session
      </button>
    </section>
  )
}
