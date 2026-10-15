// Cup.jsx — one cup on the Today counter, drawn as inline SVG.
//
// Two looks, chosen by `state`:
//   'full'  a cup of black coffee (a task is in this slot)
//   'open'  a dashed outline: a free slot
//
// `steaming` adds three wisps of steam, used while you are focusing on that
// task. The whole picture is decoration, so it is hidden from screen readers;
// the task title and buttons carry the meaning.

export default function Cup({ state = 'full', steaming = false }) {
  if (state === 'open') {
    return (
      <svg className="mug" width="190" height="158" viewBox="0 0 190 158" aria-hidden="true" focusable="false">
        <g transform="translate(0 28)" className="mug-dashed">
          <path d="M146 56 h12 a17 17 0 0 1 0 34 h-14" />
          <path d="M36 40 H156 V84 C156 114 134 130 106 130 H86 C58 130 36 114 36 84 Z" />
          <ellipse cx="96" cy="40" rx="60" ry="11" />
        </g>
      </svg>
    )
  }

  return (
    <svg className="mug" width="190" height="158" viewBox="0 0 190 158" aria-hidden="true" focusable="false">
      <g transform="translate(0 28)">
        {/* handle: a dark outline stroke with a cream stroke on top */}
        <path d="M146 56 h12 a17 17 0 0 1 0 34 h-14" fill="none" stroke="#2a1d15" strokeWidth="14" strokeLinecap="round" />
        <path d="M146 56 h12 a17 17 0 0 1 0 34 h-14" fill="none" stroke="#f6f1e2" strokeWidth="9" strokeLinecap="round" />
        {/* body, matcha band, then the outline over both */}
        <path d="M36 40 H156 V84 C156 114 134 130 106 130 H86 C58 130 36 114 36 84 Z" fill="#f6f1e2" />
        <path d="M36 70 H156" stroke="#7ea24a" strokeWidth="9" fill="none" />
        <path d="M36 40 H156 V84 C156 114 134 130 106 130 H86 C58 130 36 114 36 84 Z" fill="none" stroke="#2a1d15" strokeWidth="2.6" strokeLinejoin="round" />
        <ellipse cx="96" cy="40" rx="60" ry="11" fill="#e6dcc2" stroke="#2a1d15" strokeWidth="2.6" />
        {/* the black coffee */}
        <ellipse cx="96" cy="40" rx="51" ry="7.5" fill="#1a110b" />
        <path d="M70 39 C80 35 96 34 112 36" fill="none" stroke="#5a3b27" strokeWidth="2" strokeLinecap="round" />
      </g>
      {steaming && (
        <>
          <path className="steam" d="M78 46 c-8 -12 8 -20 0 -34" fill="none" stroke="#8aa56a" strokeWidth="4.5" strokeLinecap="round" />
          <path className="steam steam-2" d="M96 46 c-8 -12 8 -20 0 -34" fill="none" stroke="#8aa56a" strokeWidth="4.5" strokeLinecap="round" />
          <path className="steam steam-3" d="M114 46 c-8 -12 8 -20 0 -34" fill="none" stroke="#8aa56a" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
