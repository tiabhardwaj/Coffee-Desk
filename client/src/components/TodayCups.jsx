// TodayCups.jsx — the Today list, drawn as three cups on a wooden counter.
//
// One cup per task. Any slot not used yet is a dashed, empty cup, so the
// limit of three is something you can see rather than a number to read.
//
// Like TaskItem, this component decides nothing about the buttons: App.jsx
// passes `actionsFor`, and TaskActions draws them.

import { formatMinutes } from '../format.js'
import Cup from './Cup.jsx'
import TaskActions from './TaskActions.jsx'

export default function TodayCups({ tasks, limit, subtitle, focusTaskId, actionsFor, onRemove }) {
  const openSlots = Math.max(0, limit - tasks.length)

  return (
    <section className="today" aria-labelledby="today-heading">
      <h2 id="today-heading">Today</h2>
      <p className="section-sub">{subtitle}</p>

      <ul className="slots">
        {tasks.map((task) => {
          const focusing = focusTaskId === task.id
          return (
            // key = the database id, never the array index, so React keeps
            // each cup attached to the right task.
            <li key={task.id} className="slot">
              <div className="slot-art">
                <Cup steaming={focusing} />
              </div>
              <div className="shelf" />
              <div className="slot-body">
                <p className="slot-title">{task.title}</p>
                <p className="slot-meta">
                  {focusing && <span className="pulse" aria-hidden="true" />}
                  {focusing
                    ? 'Focusing now'
                    : task.focus_seconds > 0
                      ? `${formatMinutes(task.focus_seconds)} focused`
                      : ''}
                </p>
                <TaskActions task={task} actions={actionsFor(task)} onRemove={() => onRemove(task)} />
              </div>
            </li>
          )
        })}

        {Array.from({ length: openSlots }, (_, index) => (
          // These never reorder (they are only placeholders), so the index is
          // a safe key here.
          <li key={`open-${index}`} className="slot slot-open">
            <div className="slot-art">
              <Cup state="open" />
            </div>
            <div className="shelf" />
            <div className="slot-body">
              <p className="slot-title">Open cup</p>
              <p className="slot-meta">Pick something from the Inbox.</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
