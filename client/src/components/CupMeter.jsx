// CupMeter.jsx — Today's slots, drawn as small cups.
//
// A coffee-filled cup is a task on Today; a dashed cup is room for one more.
// It says the same thing as the "2 of 3" text beside it, but you can read it
// at a glance. Screen readers get one sentence from aria-label instead of
// three separate pictures.

export default function CupMeter({ count, limit }) {
  const slots = Array.from({ length: limit }, (_, index) => index < count)

  return (
    <div className="cups">
      <div className="cups-row" role="img" aria-label={`${count} of ${limit} cups full`}>
        {slots.map((full, index) => (
          // The slots never reorder (always the same limit), so the index is a
          // safe key here. For real data, like tasks, we use the id instead.
          <svg
            key={index}
            className={full ? 'cup cup-full' : 'cup'}
            viewBox="0 0 46 42"
            aria-hidden="true"
            focusable="false"
          >
            <path className="cup-body" d="M6 8 H32 V22 a12 12 0 0 1 -12 12 H18 a12 12 0 0 1 -12 -12 Z" />
            <path className="cup-handle" d="M32 12 h3 a6 6 0 0 1 0 12 h-4" />
            <path className="cup-saucer" d="M4 38 H34" />
          </svg>
        ))}
      </div>
      <span className="cups-label">
        {count} of {limit} chosen
      </span>
    </div>
  )
}
