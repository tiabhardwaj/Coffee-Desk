// DoneLog.jsx — a quiet record of what you finished, grouped by day.
// It deliberately has no streaks, scores or "days in a row" (D3). A missed
// day looks the same as any other day: it simply isn't there.

import { dayLabel, formatMinutes, localDateKey } from '../format.js'
import Bean from './Bean.jsx'

// Turn a flat list (already newest-first) into [[dayKey, tasks[]], ...].
// A Map remembers insertion order, so days stay newest-first too.
function groupByDay(tasks) {
  const groups = new Map()
  for (const task of tasks) {
    // completed_at is UTC from the server; this converts it to the user's day.
    const key = localDateKey(new Date(task.completed_at))
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(task)
  }
  return [...groups]
}

export default function DoneLog({ tasks, onUndo }) {
  const days = groupByDay(tasks)

  return (
    <section className="done-log" aria-labelledby="done-heading">
      <h2 id="done-heading">Done log</h2>

      {days.length === 0 ? (
        <p className="empty">Finished tasks will appear here. It is a record, not a score.</p>
      ) : (
        days.map(([dateKey, items]) => {
          const focusSeconds = items.reduce((sum, task) => sum + task.focus_seconds, 0)
          return (
            <div key={dateKey} className="done-day">
              <h3>
                {dayLabel(dateKey)}{' '}
                <span className="done-meta">
                  {items.length} done
                  {focusSeconds > 0 && ` · ${formatMinutes(focusSeconds)} focused`}
                </span>
              </h3>
              <ul className="task-rows">
                {items.map((task) => (
                  <li key={task.id} className="task task-done">
                    <Bean checked />
                    <div className="task-main">
                      <span className="task-title">{task.title}</span>
                      {task.focus_seconds > 0 && (
                        <span className="task-focus">{formatMinutes(task.focus_seconds)} focused</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-quiet"
                      onClick={() => onUndo(task)}
                      aria-label={`Move back to Inbox: ${task.title}`}
                    >
                      Undo
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })
      )}
    </section>
  )
}
