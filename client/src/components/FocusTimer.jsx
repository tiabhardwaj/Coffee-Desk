// FocusTimer.jsx — a timer that counts UP, so there is never a deadline to
// race against (D3).
//
// It does NOT keep its own count. The server stored when the session
// started; every second we simply recompute "now minus started_at".
// Two benefits: the timer survives a page refresh, and a background tab
// (where browsers slow timers down) cannot make it drift.
//
// The ring is a clock hand, not a countdown: it never "runs out". Each
// minute an arc grows clockwise from the top until the ring is full; then it
// empties at once and starts growing clockwise again. It never plays
// backwards.

import { useEffect, useState } from 'react'
import { formatClock } from '../format.js'

const RING_LENGTH = 2 * Math.PI * 49 // circumference of the ring (radius 49)

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

  // How much of the ring is filled: the CSS transition below glides it to
  // where it will be one second from now, so the arc matches the real time
  // and reaches a full ring exactly as the minute ends.
  const minutes = Math.floor(elapsed / 60)
  const filled = ((elapsed % 60) + 1) / 60 // 1/60 up to 1

  return (
    <section className="focus" aria-label="Focus session">
      <svg className="focus-ring" width="116" height="116" viewBox="0 0 116 116" aria-hidden="true" focusable="false">
        <circle cx="58" cy="58" r="49" fill="none" stroke="#4a3426" strokeWidth="9" />
        {/* key={minutes} makes React draw a brand-new circle each minute, so
            the ring empties instantly instead of animating backwards. */}
        <circle
          key={minutes}
          className="focus-sweep"
          cx="58"
          cy="58"
          r="49"
          fill="none"
          stroke="#b5d173"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled * RING_LENGTH} ${RING_LENGTH}`}
          transform="rotate(-90 58 58)"
        />
      </svg>
      <div className="focus-text">
        <p className="focus-label">
          <span className="pulse" aria-hidden="true" />
          Focusing on
        </p>
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
