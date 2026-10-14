// TaskList.jsx — one titled column (Today, Inbox or Later).
//
// The same component is used three times with different props. That is the
// point of components: write once, reuse with different data.

import TaskItem from './TaskItem.jsx'

export default function TaskList({
  id,
  title,
  subtitle,
  tasks,
  emptyText,
  actionsFor,
  onRemove,
  featured = false,
}) {
  return (
    // aria-labelledby names this region after its heading for screen readers.
    <section
      className={featured ? 'column column-featured' : 'column'}
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`}>{title}</h2>
      <p className="column-sub">{subtitle}</p>

      {tasks.length === 0 ? (
        <p className="empty">{emptyText}</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            // `key` lets React tell items apart between renders, so when one
            // task moves out of the list, React removes just that one
            // element instead of re-drawing (or mixing up) the others. It
            // must be stable and unique, so we use the database id, never
            // the array index.
            <TaskItem
              key={task.id}
              task={task}
              actions={actionsFor(task)}
              onRemove={() => onRemove(task)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
