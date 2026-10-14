// TaskItem.jsx — one task and its buttons.
//
// This component decides nothing. It receives `actions` (a list of buttons
// described as plain objects) from App.jsx and just draws them. All the
// rules about which button appears where live in one place: App.jsx.

import { formatMinutes } from '../format.js'

export default function TaskItem({ task, actions, onRemove }) {
  return (
    <li className="task">
      <div className="task-head">
        <span className="task-title">{task.title}</span>
        {/* Kept apart from the move buttons so it is hard to hit by accident. */}
        <button
          type="button"
          className="btn btn-quiet"
          onClick={onRemove}
          aria-label={`Remove: ${task.title}`}
        >
          Remove
        </button>
      </div>
      {task.focus_seconds > 0 && (
        <span className="task-focus">{formatMinutes(task.focus_seconds)} focused</span>
      )}
      <div className="task-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="btn"
            onClick={action.onClick}
            disabled={action.disabled}
            aria-label={action.ariaLabel}
          >
            {action.label}
          </button>
        ))}
      </div>
    </li>
  )
}
