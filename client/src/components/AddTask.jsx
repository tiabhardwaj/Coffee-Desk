// AddTask.jsx — the Inbox quick-capture form, a pill that floats over the
// bottom of the hero picture.
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
      {/* Visually hidden, but still read aloud by screen readers. */}
      <label htmlFor="new-task" className="sr-only">
        Capture a thought
      </label>
      <input
        id="new-task"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={200}
        placeholder="What is on your mind?"
        autoComplete="off"
      />
      <button type="submit" className="btn btn-primary" disabled={!title.trim() || saving}>
        Add to Inbox
      </button>
    </form>
  )
}
