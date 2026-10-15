// TaskItem.jsx — one task as a plain row: its title, how long you have
// focused on it, and its buttons.
//
// This component decides nothing. It receives `actions` (a list of buttons
// described as plain objects) from App.jsx and just draws them. All the
// rules about which button appears where live in one place: App.jsx.

import { formatMinutes } from '../format.js'
import TaskActions from './TaskActions.jsx'

export default function TaskItem({ task, actions, onRemove }) {
  return (
    <li className="task">
      <div className="task-main">
        <span className="task-title">{task.title}</span>
        {task.focus_seconds > 0 && (
          <span className="task-focus">{formatMinutes(task.focus_seconds)} focused</span>
        )}
      </div>
      <TaskActions task={task} actions={actions} onRemove={onRemove} />
    </li>
  )
}
