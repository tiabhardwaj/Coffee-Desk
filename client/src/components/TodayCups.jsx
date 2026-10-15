// TodayCups.jsx — the Today list, drawn as three cups on a wooden counter.
//
// One cup per task. Any slot not used yet is a dashed, empty cup, so the
// limit of three is something you can see rather than a number to read.
//
// "Done" is special: instead of removing the task at once, the cup drains
// and a bean drops (index.css) and only then do we ask the server to move
// the task. The task then appears in the Done log below.

import { useEffect, useRef, useState } from 'react'
import { formatMinutes } from '../format.js'
import Cup from './Cup.jsx'
import TaskActions from './TaskActions.jsx'

// How long the Done animation plays before the move happens (milliseconds).
const LEAVE_MS = 1700

export default function TodayCups({ tasks, limit, subtitle, focusTaskId, actionsFor, onRemove }) {
  // The id of the task whose "Done" animation is playing, or null.
  const [leavingId, setLeavingId] = useState(null)
  const timer = useRef(null)

  // If this component goes away mid-animation, stop the pending timer.
  useEffect(() => () => clearTimeout(timer.current), [])

  function runAction(task, action) {
    // Only actions flagged `celebrate` by App.jsx get the animation.
    if (!action.celebrate) {
      action.onClick()
      return
    }
    setLeavingId(task.id)
    // People who ask their device for less motion skip the wait entirely.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    timer.current = setTimeout(
      () => {
        setLeavingId(null)
        action.onClick()
      },
      reduce ? 0 : LEAVE_MS,
    )
  }

  const openSlots = Math.max(0, limit - tasks.length)

  return (
    <section className="today" aria-labelledby="today-heading">
      <h2 id="today-heading">Today</h2>
      <p className="section-sub">{subtitle}</p>

      <ul className="slots">
        {tasks.map((task) => {
          const leaving = leavingId === task.id
          const focusing = focusTaskId === task.id
          // Wrap each action so Done can wait for its animation.
          const actions = actionsFor(task).map((action) => ({
            ...action,
            disabled: action.disabled || leavingId !== null,
            onClick: () => runAction(task, action),
          }))
          return (
            // key = the database id, never the array index, so React keeps
            // each cup (and its animation) attached to the right task.
            <li key={task.id} className={leaving ? 'slot slot-leaving' : 'slot'}>
              <div className="slot-art">
                <Cup state={leaving ? 'leaving' : 'full'} steaming={focusing} />
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
                <TaskActions task={task} actions={actions} onRemove={() => onRemove(task)} />
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
