// LaterShelf.jsx — the Later list, drawn as glass jars of beans on a shelf.
//
// One jar per task for the first three; any further tasks continue as a
// plain list underneath, so the shelf never grows into a wall of jars.

import TaskActions from './TaskActions.jsx'
import TaskItem from './TaskItem.jsx'

const JARS = 3

function Jar() {
  return (
    <svg className="jar" width="110" height="122" viewBox="0 0 110 122" aria-hidden="true" focusable="false">
      <path d="M30 20 H80 V30 C96 36 100 46 100 58 V102 Q100 112 90 112 H20 Q10 112 10 102 V58 C10 46 14 36 30 30 Z" fill="#fbfcf2" />
      <path d="M10.8 66 H99.2 V102 Q99.2 111.2 90 111.2 H20 Q10.8 111.2 10.8 102 Z" fill="#5a3b27" />
      <ellipse cx="30" cy="80" rx="8" ry="5" transform="rotate(30 30 80)" fill="#7a5538" />
      <ellipse cx="54" cy="92" rx="8" ry="5" transform="rotate(-20 54 92)" fill="#7a5538" />
      <ellipse cx="76" cy="80" rx="8" ry="5" transform="rotate(15 76 80)" fill="#7a5538" />
      <ellipse cx="40" cy="104" rx="8" ry="5" transform="rotate(-30 40 104)" fill="#7a5538" />
      <ellipse cx="72" cy="102" rx="8" ry="5" transform="rotate(25 72 102)" fill="#7a5538" />
      <path d="M22 64 V100" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M30 20 H80 V30 C96 36 100 46 100 58 V102 Q100 112 90 112 H20 Q10 112 10 102 V58 C10 46 14 36 30 30 Z" fill="none" stroke="#2a1d15" strokeWidth="2.6" strokeLinejoin="round" />
      <rect x="24" y="6" width="62" height="16" rx="5" fill="#7ea24a" stroke="#2a1d15" strokeWidth="2.6" />
    </svg>
  )
}

export default function LaterShelf({ tasks, subtitle, actionsFor, onRemove }) {
  const jars = tasks.slice(0, JARS)
  const rest = tasks.slice(JARS)

  return (
    <section className="later" aria-labelledby="later-heading">
      <h2 id="later-heading">Later</h2>
      <p className="section-sub">{subtitle}</p>

      {tasks.length === 0 ? (
        <p className="empty">Nothing waiting.</p>
      ) : (
        <>
          <ul className="jars">
            {jars.map((task) => (
              // key = database id, never the index.
              <li key={task.id} className="jar-cell">
                <div className="slot-art">
                  <Jar />
                </div>
                <div className="shelf shelf-thin" />
                <div className="slot-body">
                  <p className="jar-title">{task.title}</p>
                  <TaskActions task={task} actions={actionsFor(task)} onRemove={() => onRemove(task)} />
                </div>
              </li>
            ))}
          </ul>

          {rest.length > 0 && (
            <>
              <h3 className="shelf-more">Also on the shelf</h3>
              <ul className="task-rows">
                {rest.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    actions={actionsFor(task)}
                    onRemove={() => onRemove(task)}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  )
}
