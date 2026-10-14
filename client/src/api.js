// api.js — the ONLY file that talks to the server. Components call
// api.moveTask(...) and never write fetch() themselves.

import { localDateKey } from './format.js'

// In development this is empty, so requests go to /api/... and Vite's proxy
// forwards them. In production, set VITE_API_URL to the deployed API's URL.
const BASE = import.meta.env.VITE_API_URL ?? ''

// An error with a machine-readable `code` (e.g. "TODAY_FULL") and a calm,
// human-readable `message` that is safe to show on screen.
export class ApiError extends Error {
  constructor(message, code, status) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function request(method, path, body) {
  let res
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Tell the server what day it is for the user (see server/app.js).
        'X-Client-Date': localDateKey(),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    // fetch only throws when the network itself fails.
    throw new ApiError(
      'We could not reach the server. Nothing is lost; try again in a moment.',
      'NETWORK',
      0,
    )
  }

  if (res.status === 204) return null // success with no body (DELETE)

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(
      data?.error?.message ?? 'That did not work. Please try again.',
      data?.error?.code ?? 'UNKNOWN',
      res.status,
    )
  }
  return data
}

export const api = {
  listTasks: () => request('GET', '/tasks'),
  addTask: (title) => request('POST', '/tasks', { title }),
  moveTask: (id, list) => request('PATCH', `/tasks/${id}`, { list }),
  removeTask: (id) => request('DELETE', `/tasks/${id}`),
  rollover: () => request('POST', '/rollover'),
  activeSession: () => request('GET', '/sessions/active'),
  startSession: (taskId) => request('POST', '/sessions', { task_id: taskId }),
  stopSession: (id) => request('POST', `/sessions/${id}/stop`),
}
