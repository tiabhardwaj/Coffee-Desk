// Hero.jsx — the first thing you see: the product name, a big promise, and
// a hand-drawn green-hills morning with a cup of black coffee in front.
//
// The scene is an inline SVG drawn for this project (no image files, no
// stock assets), so it loads instantly and scales to any screen. The last
// layer of hills is the same colour as the page, so the picture melts into
// the page with no hard edge. It is decoration only, so it is hidden from
// screen readers. The steam animation is switched off in index.css for
// people who have asked their device for reduced motion.

export default function Hero() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header className="app-header">
      <svg
        className="hero-art"
        viewBox="0 0 1440 520"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="1210" cy="112" r="46" fill="#f8e6a2" />
        <circle cx="1210" cy="112" r="74" fill="#f8e6a2" opacity="0.35" />
        <ellipse cx="560" cy="126" rx="96" ry="9" fill="#ffffff" opacity="0.55" />
        <ellipse cx="640" cy="146" rx="64" ry="7" fill="#ffffff" opacity="0.45" />
        <ellipse cx="930" cy="96" rx="80" ry="8" fill="#ffffff" opacity="0.5" />
        <g transform="translate(0 50)">
          <path d="M0 250 C140 200 260 214 380 190 S620 150 760 186 S1040 230 1180 176 S1360 168 1440 190 V470 H0Z" fill="#b9cf8a" />
          <path d="M0 300 C120 262 240 270 360 248 S600 214 760 246 S1040 290 1200 244 S1360 232 1440 250 V470 H0Z" fill="#8fb061" />
          <g fill="none" stroke="#7a9d4f" strokeWidth="3" strokeLinecap="round" opacity="0.75">
            <path d="M0 318 C120 280 240 288 360 266 S600 232 760 264 S1040 308 1200 262 S1360 250 1440 268" />
            <path d="M0 334 C120 296 240 304 360 282 S600 248 760 280 S1040 324 1200 278 S1360 266 1440 284" />
            <path d="M0 350 C120 312 240 320 360 298 S600 264 760 296 S1040 340 1200 294 S1360 282 1440 300" />
          </g>
          <path d="M0 372 C160 342 300 352 460 328 S760 302 940 332 S1240 362 1440 322 V470 H0Z" fill="#5d8a3c" />
          <g fill="none" stroke="#4d7a31" strokeWidth="3" strokeLinecap="round">
            <path d="M0 390 C160 360 300 370 460 346 S760 320 940 350 S1240 380 1440 340" />
            <path d="M0 408 C160 378 300 388 460 364 S760 338 940 368 S1240 398 1440 358" />
          </g>
          {/* two small trees, kept clear of the headline and the cup */}
          <g transform="translate(500 0)">
            <path d="M214 318 C196 300 198 262 214 236 C230 262 232 300 214 318Z" fill="#2f5a2a" />
            <path d="M252 326 C240 312 242 284 252 266 C262 284 264 312 252 326Z" fill="#3b6b30" />
          </g>
          <path d="M1296 300 C1280 282 1282 246 1296 220 C1310 246 1312 282 1296 300Z" fill="#2f5a2a" />
          <path d="M1336 308 C1326 294 1328 270 1336 254 C1344 270 1346 294 1336 308Z" fill="#3b6b30" />
          {/* the page-coloured meadow that hides the bottom edge of the picture */}
          <path d="M0 410 C200 392 380 400 560 412 S900 428 1100 410 S1340 392 1440 404 V470 H0Z" fill="#eef2dc" />
        </g>

        {/* the cup of black coffee, lifted a little so it sits above the page edge */}
        <g transform="translate(0 -14)">
          <ellipse cx="1060" cy="494" rx="100" ry="11" fill="#d3deb0" />
          <ellipse cx="1060" cy="484" rx="88" ry="13" fill="#c8ad86" />
          <path d="M1124 410 h14 a20 20 0 0 1 0 40 h-18" fill="none" stroke="#f6f1e2" strokeWidth="11" strokeLinecap="round" />
          <path d="M996 402 H1124 V438 C1124 464 1104 480 1078 480 H1042 C1016 480 996 464 996 438 Z" fill="#f6f1e2" />
          <path d="M996 436 H1124" stroke="#7ea24a" strokeWidth="9" fill="none" />
          <ellipse cx="1060" cy="402" rx="64" ry="12" fill="#e6dcc2" />
          <ellipse cx="1060" cy="402" rx="56" ry="9" fill="#1a110b" />
          <path d="M1038 400 C1046 396 1060 395 1072 397" fill="none" stroke="#5a3b27" strokeWidth="2" strokeLinecap="round" />
          <path className="steam" d="M1034 386 c-9 -14 9 -24 0 -40" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          <path className="steam steam-2" d="M1060 386 c-9 -14 9 -24 0 -40" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          <path className="steam steam-3" d="M1086 386 c-9 -14 9 -24 0 -40" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* two coffee beans and two leaves on the meadow */}
        <g transform="translate(0 -30)">
          <ellipse cx="878" cy="494" rx="9" ry="13" transform="rotate(40 878 494)" fill="#5a3b27" />
          <path d="M872 502 C878 496 878 490 884 486" stroke="#eef2dc" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <ellipse cx="912" cy="504" rx="9" ry="13" transform="rotate(-25 912 504)" fill="#6b4630" />
          <path d="M916 512 C910 506 912 500 908 496" stroke="#eef2dc" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
        <path d="M1262 490 C1252 470 1272 454 1296 456 C1298 478 1282 494 1262 490Z" fill="#7ea24a" />
        <path d="M1264 488 C1272 478 1282 470 1292 462" stroke="#4d7a31" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M1312 500 C1304 484 1320 472 1338 474 C1340 492 1328 504 1312 500Z" fill="#5d8a3c" />
      </svg>

      <div className="hero-inner">
        <div className="hero-top">
          <p className="brand">
            <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" focusable="false">
              <ellipse cx="15" cy="15" rx="9" ry="12.5" transform="rotate(35 15 15)" fill="#5a3b27" />
              <path d="M9.5 23.5 C14 19 12 13 16 11 S19.5 8 20.5 6.5" fill="none" stroke="#d6e5ac" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Coffee Desk
          </p>
          <p className="hero-date">{today}</p>
        </div>

        <h1>Three for today.</h1>
        <p className="hero-tagline">Choose up to three tasks. Everything else can wait on the shelf.</p>
      </div>
    </header>
  )
}
