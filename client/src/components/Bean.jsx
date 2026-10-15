// Bean.jsx — a coffee bean used as a checkbox picture in the Done log.
// An empty outline means "not done"; filled matcha green means "done".
// Decoration only (aria-hidden): the surrounding text says what it is.

export default function Bean({ checked = false }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" focusable="false">
      <ellipse
        cx="15"
        cy="15"
        rx="9"
        ry="12.5"
        transform="rotate(35 15 15)"
        fill={checked ? '#7ea24a' : 'none'}
        stroke={checked ? '#3f5a2b' : '#6b4630'}
        strokeWidth="2"
      />
      <path
        d="M9.5 23.5 C14 19 12 13 16 11 S19.5 8 20.5 6.5"
        fill="none"
        stroke={checked ? '#eef2dc' : '#6b4630'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
