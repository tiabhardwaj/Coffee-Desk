// CupMeter.jsx — Today's three slots, drawn as three cups.
//
// A full cup is a task on Today; an empty cup is room for one more. It says
// the same thing as the "2 of 3" text beside it, but you can read it at a
// glance. Screen readers get one sentence from aria-label instead of three
// separate pictures.

export default function CupMeter({ count, limit }) {
  const slots = Array.from({ length: limit }, (_, index) => index < count)

  return (
    <div className="cups" role="img" aria-label={`${count} of ${limit} cups full`}>
      {slots.map((full, index) => (
        // The slots never reorder (always the same limit), so the index is a
        // safe key here. For real data, like tasks, we use the id instead.
        <svg
          key={index}
          className={full ? 'cup cup-full' : 'cup'}
          viewBox="0 0 40 36"
          aria-hidden="true"
          focusable="false"
        >
          <path className="cup-body" d="M5 8h24v12a10 10 0 0 1-10 10h-4A10 10 0 0 1 5 20z" />
          <path className="cup-handle" d="M29 12h3a5 5 0 0 1 0 10h-4" />
          <path className="cup-saucer" d="M3 33h28" />
        </svg>
      ))}
    </div>
  )
}
