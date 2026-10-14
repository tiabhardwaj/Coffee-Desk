// tasksReducer.js — every way the list of tasks can change, in one place.
//
// A reducer is a pure function: (currentState, action) => newState.
// It never edits the old state; it returns a fresh copy. React compares old
// and new to decide what to redraw. With useReducer, the question "how can
// tasks change?" has one answer: read this file.

export const initialState = { tasks: [], loaded: false }

export function tasksReducer(state, action) {
  switch (action.type) {
    case 'loaded':
      // Replace everything with what the server says (source of truth).
      return { tasks: action.tasks, loaded: true }
    case 'added':
      return { ...state, tasks: [...state.tasks, action.task] }
    case 'replaced':
      // Swap in the server's updated copy of one task.
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.task.id ? action.task : t)),
      }
    case 'removed':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}
