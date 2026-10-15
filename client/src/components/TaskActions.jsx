// TaskActions.jsx — the row of buttons under or beside a task.
//
// App.jsx decides WHICH buttons a task gets (it passes `actions`); this
// component only draws them, plus the quiet Remove button, which is kept
// separate from the move buttons so it is hard to hit by accident.

export default function TaskActions({ task, actions, onRemove }) {
  return (
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
      <button
        type="button"
        className="btn btn-quiet"
        onClick={onRemove}
        aria-label={`Remove: ${task.title}`}
      >
        Remove
      </button>
    </div>
  )
}
