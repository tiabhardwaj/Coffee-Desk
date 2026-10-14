// Hero.jsx — the first thing you see: the product name, its one-line idea,
// and a small illustration of a coffee cup on a desk at sunrise.
//
// The artwork is an inline SVG drawn by hand for this project (no image files,
// no stock assets), so it loads instantly and scales to any screen. It is
// decoration only, so it is hidden from screen readers with aria-hidden.
// The steam animation is switched off in index.css for people who have asked
// their device for reduced motion.

export default function Hero() {
  return (
    <header className="app-header">
      <div className="hero">
        <div className="hero-copy">
          <h1>Coffee Desk</h1>
          <p className="hero-tagline">Three things today. Everything else can wait.</p>
        </div>

        <svg
          className="hero-art"
          viewBox="0 0 360 260"
          aria-hidden="true"
          focusable="false"
        >
          {/* sky, with the sun rising behind the cup like a halo */}
          <rect width="360" height="260" fill="#d7dcf7" />
          <circle cx="186" cy="122" r="86" fill="#fbe0bd" opacity="0.55" />
          <circle cx="186" cy="122" r="62" fill="#f7c58a" />

          {/* two layers of hills */}
          <path
            d="M0 178 C50 138 110 146 170 170 S300 144 360 164 V260 H0 Z"
            fill="#b9c3ec"
          />
          <path
            d="M0 204 C70 176 140 192 210 202 S320 186 360 196 V260 H0 Z"
            fill="#8f9bd8"
          />

          {/* the desk */}
          <rect x="0" y="214" width="360" height="46" fill="#343a6b" />
          <rect x="0" y="214" width="360" height="4" fill="#4a5190" />

          {/* notebook and pencil, left */}
          <rect x="44" y="200" width="68" height="14" rx="3" fill="#e4e6f8" />
          <rect x="44" y="196" width="68" height="6" rx="3" fill="#fbead2" />
          <rect x="70" y="190" width="40" height="3.5" rx="1.75" fill="#c98a3b" transform="rotate(-8 70 190)" />

          {/* plant, right */}
          <path d="M300 214 C284 194 286 172 300 158 C314 172 316 194 300 214 Z" fill="#2b6f66" />
          <path d="M300 214 C282 208 274 192 276 180 C292 184 302 198 300 214 Z" fill="#3a8a7e" />
          <path d="M300 214 C318 208 326 192 324 180 C308 184 298 198 300 214 Z" fill="#3a8a7e" />
          <path d="M286 212 h28 l-3 16 h-22 z" fill="#c98a3b" />

          {/* saucer, cup, coffee */}
          <ellipse cx="186" cy="222" rx="56" ry="8" fill="#e9d9c3" />
          <path
            d="M148 164 H224 V198 a24 24 0 0 1 -24 24 H172 a24 24 0 0 1 -24 -24 Z"
            fill="#fff8ee"
          />
          <path
            d="M224 176 h9 a14 14 0 0 1 0 28 h-10"
            fill="none"
            stroke="#fff8ee"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="148" y="186" width="76" height="9" fill="#2b6f66" />
          <ellipse cx="186" cy="164" rx="38" ry="8" fill="#8a5a2b" />
          <ellipse cx="186" cy="163" rx="30" ry="5" fill="#a8743c" />

          {/* steam: three wisps that drift up and fade */}
          <path className="steam steam-1" d="M168 150 c-9 -14 9 -24 0 -40" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          <path className="steam steam-2" d="M186 150 c-9 -14 9 -24 0 -40" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          <path className="steam steam-3" d="M204 150 c-9 -14 9 -24 0 -40" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
    </header>
  )
}
