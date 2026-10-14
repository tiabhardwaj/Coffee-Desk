// Notice.jsx — the single place messages appear. Soft blue, never red (D3).
//
// The outer div is ALWAYS rendered and marked aria-live="polite". Screen
// readers watch such a region and read out new content when it appears,
// without interrupting what the user is doing. (A live region that is added
// to the page at the same moment as its text is often not announced, which
// is why the wrapper stays in the page permanently.)

export default function Notice({ message, onDismiss }) {
  return (
    <div className="notice-region" aria-live="polite">
      {message && (
        <div className="notice">
          <p>{message}</p>
          <button type="button" className="btn btn-quiet" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
