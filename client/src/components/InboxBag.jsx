// InboxBag.jsx — the Inbox, drawn as a coffee bag with a list beside it.
//
// Only the first four tasks are shown, so a long Inbox never turns into a
// wall of rows. "Show more" reveals the rest.

import { useState } from 'react'
import TaskItem from './TaskItem.jsx'

const VISIBLE = 4

export default function InboxBag({ tasks, subtitle, actionsFor, onRemove }) {
  const [expanded, setExpanded] = useState(false)

  const shown = expanded ? tasks : tasks.slice(0, VISIBLE)
  const hidden = tasks.length - VISIBLE

  return (
    <section className="inbox" aria-labelledby="inbox-heading">
      <h2 id="inbox-heading">Inbox</h2>
      <p className="section-sub">{subtitle}</p>

      <div className="inbox-body">
        <svg
          className="bag"
          width="210"
          height="290"
          viewBox="0 -40 210 290"
          aria-hidden="true"
          focusable="false"
        >
          <ellipse cx="100" cy="238" rx="84" ry="9" fill="#d3deb0" />
          {/* beans peeking out of the top, drawn before the rolled edge */}
          <ellipse cx="74" cy="40" rx="11" ry="7.5" transform="rotate(-30 74 40)" fill="#5a3b27" />
          <ellipse cx="104" cy="32" rx="11" ry="7.5" transform="rotate(20 104 32)" fill="#6b4630" />
          <ellipse cx="132" cy="42" rx="11" ry="7.5" transform="rotate(-10 132 42)" fill="#5a3b27" />
          <ellipse cx="90" cy="50" rx="11" ry="7.5" transform="rotate(35 90 50)" fill="#6b4630" />
          <ellipse cx="118" cy="52" rx="11" ry="7.5" transform="rotate(-35 118 52)" fill="#5a3b27" />
          <path d="M34 72 H166 L180 226 Q181 236 171 236 H29 Q19 236 20 226 Z" fill="#c9a574" stroke="#2a1d15" strokeWidth="2.6" strokeLinejoin="round" />
          <rect x="28" y="58" width="144" height="24" rx="10" fill="#b98f5c" stroke="#2a1d15" strokeWidth="2.6" />
          <path d="M34 96 H166" stroke="#2a1d15" strokeWidth="2" strokeDasharray="5 5" fill="none" />
          <rect x="56" y="118" width="88" height="88" rx="10" fill="#f6f1e2" stroke="#2a1d15" strokeWidth="2.4" />
          <ellipse cx="100" cy="162" rx="13" ry="19" transform="rotate(35 100 162)" fill="#5a3b27" />
          <path d="M92 176 C98 170 96 162 102 158 S108 150 110 147" fill="none" stroke="#f6f1e2" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M70 196 C66 184 76 176 88 178 C90 190 82 198 70 196Z" fill="#7ea24a" />
          <ellipse cx="190" cy="232" rx="9" ry="6" transform="rotate(-20 190 232)" fill="#5a3b27" />
        </svg>

        {tasks.length === 0 ? (
          <p className="empty">Inbox is clear. Capture anything that comes to mind.</p>
        ) : (
          <div className="inbox-list">
            <ul className="task-rows">
              {shown.map((task) => (
                // key = database id (stable and unique), never the index.
                <TaskItem
                  key={task.id}
                  task={task}
                  actions={actionsFor(task)}
                  onRemove={() => onRemove(task)}
                />
              ))}
            </ul>
            {hidden > 0 && (
              <button
                type="button"
                className="btn more"
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show fewer' : `Show ${hidden} more in Inbox`}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
