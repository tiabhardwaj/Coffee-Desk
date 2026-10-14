// AddTask.jsx — the Inbox quick-capture form.
//
// This is a "controlled input": React state (`title`) is the single source
// of truth for what the box contains. Typing calls setTitle, which re-renders
// the input with the new value.

import { useState } from 'react'

export default function AddTask({ onAdd }) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser's default full-page form submit
    const trimmed = title.trim()
    if (!trimmed || saving) return

    setSaving(true)
    const ok = await onAdd(trimmed) // parent talks to the server
    setSaving(false)
    if (ok) setTitle('') // only clear the box if it really saved
  }

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <label htmlFor="new-task">Capture a thought</label>
      <div className="add-row">
        <input
          id="new-task"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          placeholder="Add anything. You can sort it later."
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary" disabled={!title.trim() || saving}>
          Add to Inbox
        </button>
      </div>
    </form>
  )
}
