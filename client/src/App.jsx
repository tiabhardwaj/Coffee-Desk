// App.jsx — the "brain" of the frontend. It owns the state, talks to the
// server through api.js, and decides which buttons each task gets.
// Every other component is just drawing what it is handed.

import { useCallback, useEffect, useReducer, useState } from 'react'
import { api } from './api.js'
import { formatMinutes } from './format.js'
import { initialState, tasksReducer } from './tasksReducer.js'
import AddTask from './components/AddTask.jsx'
import DoneLog from './components/DoneLog.jsx'
import FocusTimer from './components/FocusTimer.jsx'
import Notice from './components/Notice.jsx'
import TaskList from './components/TaskList.jsx'

// Only used to grey out buttons and word hints. The server enforces the real
// limit (decision D9), so changing this number alone would not unlock anything.
const TODAY_LIMIT = 3

export default function App() {
  const [state, dispatch] = useReducer(tasksReducer, initialState) // the tasks
  const [session, setSession] = useState(null) // the running focus session, or null
  const [notice, setNotice] = useState(null) // the one calm message on screen
  const [loadFailed, setLoadFailed] = useState(false)

  // ------------------------------------------------------------ loading

  // On open: (1) move yesterday's Today tasks to Later, (2) fetch tasks and
  // any running focus session. Order matters: rollover first, so the list we
  // fetch is already tidy.
  const load = useCallback(async () => {
    try {
      const { moved } = await api.rollover()
      const [tasks, active] = await Promise.all([api.listTasks(), api.activeSession()])
      dispatch({ type: 'loaded', tasks })
      setSession(active.session)
      setLoadFailed(false)
      if (moved > 0) {
        const what = moved === 1 ? 'A task' : `${moved} tasks`
        setNotice(`${what} from an earlier day moved to Later. No rush.`)
      }
    } catch (err) {
      setNotice(err.message)
      setLoadFailed(true)
    }
  }, [])

  // useEffect with [] runs once, after the first draw. In development,
  // React's StrictMode deliberately runs it twice to expose bugs; that is
  // safe here because loading is idempotent (doing it twice == doing it once).
  useEffect(() => {
    // load() only sets state after its first `await`, never synchronously,
    // so the lint rule below is a false alarm for this standard fetch pattern.
    // eslint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  // Re-sync with the server after something unexpected (for example the
  // server said "Today is full" because another tab changed things).
  async function refreshTasks() {
    try {
      dispatch({ type: 'loaded', tasks: await api.listTasks() })
    } catch {
      // The notice already on screen explains the problem.
    }
  }

  // ------------------------------------------------------------ actions
  // Pattern for each: ask the server first; only when it says yes, update the
  // screen. The server is the source of truth, so the screen can never show
  // something the server refused.

  async function addTask(title) {
    setNotice(null)
    try {
      const task = await api.addTask(title)
      dispatch({ type: 'added', task })
      return true
    } catch (err) {
      setNotice(err.message)
      return false
    }
  }

  async function moveTask(task, list) {
    setNotice(null)
    try {
      // Finishing a task also ends its focus session, if one is running.
      if (list === 'done' && session?.task_id === task.id) await stopFocus()
      const updated = await api.moveTask(task.id, list)
      dispatch({ type: 'replaced', task: updated })
    } catch (err) {
      setNotice(err.message) // e.g. the calm "Today already has three tasks" text
      refreshTasks()
    }
  }

  async function removeTask(task) {
    if (!window.confirm(`Remove "${task.title}"? This cannot be undone.`)) return
    setNotice(null)
    try {
      if (session?.task_id === task.id) await stopFocus()
      await api.removeTask(task.id)
      dispatch({ type: 'removed', id: task.id })
    } catch (err) {
      setNotice(err.message)
      refreshTasks()
    }
  }

  async function startFocus(task) {
    setNotice(null)
    try {
      setSession(await api.startSession(task.id))
    } catch (err) {
      setNotice(err.message)
    }
  }

  async function stopFocus() {
    if (!session) return
    try {
      const finished = await api.stopSession(session.id)
      setSession(null)
      await refreshTasks() // so each task's "focused" total includes this session
      setNotice(`Session finished: ${formatMinutes(finished.seconds)} of focus. Well done.`)
    } catch (err) {
      setNotice(err.message)
    }
  }

  // ------------------------------------------------- derived (not stored)
  // These are recomputed from state.tasks on every render. We never store
  // them separately, so they can never get out of sync with the tasks.

  const inList = (list) => state.tasks.filter((task) => task.list === list)
  const today = inList('today')
  const later = inList('later')
  const inbox = inList('inbox').reverse() // newest first
  const done = inList('done').sort(
    (a, b) => b.completed_at.localeCompare(a.completed_at) || b.id - a.id,
  )

  const todayFull = today.length >= TODAY_LIMIT
  const todaySubtitle = todayFull
    ? 'Full. Finish one, or send one to Later.'
    : `${today.length} of ${TODAY_LIMIT} · room for ${TODAY_LIMIT - today.length} more`

  const focusTitle =
    state.tasks.find((task) => task.id === session?.task_id)?.title ?? 'a focus session'

  // Which buttons does a task get? This one function holds all the rules.
  function actionsFor(task) {
    const move = (list, label, spoken) => ({
      label,
      ariaLabel: `${spoken}: ${task.title}`,
      onClick: () => moveTask(task, list),
    })
    // Greyed out when Today is full. The server would refuse anyway (D9).
    const toToday = { ...move('today', 'Today', 'Move to Today'), disabled: todayFull }

    switch (task.list) {
      case 'inbox':
        return [toToday, move('later', 'Later', 'Move to Later')]
      case 'today':
        return [
          move('done', 'Done', 'Mark as done'),
          {
            label: 'Focus',
            ariaLabel: `Start a focus session: ${task.title}`,
            onClick: () => startFocus(task),
            disabled: session !== null, // one focus session at a time
          },
          move('later', 'Later', 'Move to Later'),
        ]
      default: // 'later'
        return [toToday, move('inbox', 'Inbox', 'Move back to Inbox')]
    }
  }

  // ------------------------------------------------------------- screen

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to your tasks
      </a>

      <header className="app-header">
        <h1>Coffee Desk</h1>
        <p>Three things today. Everything else can wait.</p>
      </header>

      <main id="main" className="app-main">
        <Notice message={notice} onDismiss={() => setNotice(null)} />

        {!state.loaded ? (
          <p className="empty">
            {loadFailed ? (
              <button type="button" className="btn" onClick={load}>
                Try again
              </button>
            ) : (
              'Loading your tasks…'
            )}
          </p>
        ) : (
          <>
            <FocusTimer session={session} taskTitle={focusTitle} onStop={stopFocus} />

            <AddTask onAdd={addTask} />

            <div className="columns">
              <TaskList
                id="today"
                title="Today"
                subtitle={todaySubtitle}
                tasks={today}
                emptyText="Nothing here yet. Choose up to three from your Inbox."
                actionsFor={actionsFor}
                onRemove={removeTask}
                featured
              />
              <TaskList
                id="inbox"
                title="Inbox"
                subtitle="Capture first, decide later."
                tasks={inbox}
                emptyText="Inbox is clear. Capture anything that comes to mind."
                actionsFor={actionsFor}
                onRemove={removeTask}
              />
              <TaskList
                id="later"
                title="Later"
                subtitle="Safe to forget for now."
                tasks={later}
                emptyText="Nothing waiting."
                actionsFor={actionsFor}
                onRemove={removeTask}
              />
            </div>

            <DoneLog tasks={done} onUndo={(task) => moveTask(task, 'inbox')} />
          </>
        )}
      </main>

      <footer className="app-footer">
        Saved on the server. This demo may reset its data after a restart.
      </footer>
    </>
  )
}
