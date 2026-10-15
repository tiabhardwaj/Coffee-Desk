# Coffee Desk

A low-pressure task tool. Three things today; everything else can wait.

Most to-do apps pile on pressure through long lists, red "overdue" labels and streak counters. Coffee Desk removes each of those on purpose:

* **Today holds at most 3 tasks.** The limit is enforced by the server, not just the interface.
* **No "overdue", no red.** Tasks left on Today overnight move to Later, with a gentle note.
* **Inbox** for quick capture, so you never have to decide where a thought goes while writing it down.
* **A focus timer that counts up**, so there is no countdown to race.
* **A Done log instead of streaks.** A record, not a score.

Live demo: https://coffee-desk-virid.vercel.app/

## Tech

|Part|Choice|Why|
|-|-|-|
|Frontend|React + Vite|An interface made of lists that change maps well onto components and state|
|Backend|Node + Express|One language end to end, and nothing hidden|
|Database|SQLite (better-sqlite3)|Real SQL against a real schema with zero setup|
|API|REST with JSON|Standard, easy to test and explain|

The reasoning behind every choice is in [DECISIONS.md](DECISIONS.md). A file-by-file explanation is in [WALKTHROUGH.md](WALKTHROUGH.md).

## Run it locally

Requires Node.js 20 or newer.

```bash
# terminal 1: API on http://localhost:3001
cd server
npm install
npm run dev

# terminal 2: app on http://localhost:5173
cd client
npm install
npm run dev
```

Run the API tests with `cd server \\\\\\\&\\\\\\\& npm test`.

## API

|Method|Path|Purpose|
|-|-|-|
|GET|`/api/tasks`|All tasks, each with its total focused seconds|
|POST|`/api/tasks`|Add a task to the Inbox. Body: `{ "title": "..." }`|
|PATCH|`/api/tasks/:id`|Rename and/or move. Body: `{ "title"?, "list"? }` where `list` is `inbox`, `today`, `later` or `done`. Returns `409 TODAY\\\\\\\_FULL` if Today already has 3 tasks|
|DELETE|`/api/tasks/:id`|Remove a task|
|POST|`/api/rollover`|Move tasks left on Today from an earlier day to Later|
|GET|`/api/sessions/active`|The running focus session, or `null`|
|POST|`/api/sessions`|Start a focus session. Body: `{ "task\\\\\\\_id"? }`. `409` if one is running|
|POST|`/api/sessions/:id/stop`|Stop a session and record its length|

Errors always look like `{ "error": { "code": "TODAY\\\\\\\_FULL", "message": "..." } }`.

## Deploying

1. **API (for example Render).** Root directory `server`, build command `npm install`, start command `npm start`. Set `CLIENT\\\\\\\_ORIGIN` to the frontend's URL, with no trailing slash.
2. **Frontend (for example Vercel).** Root directory `client`. Set `VITE\\\\\\\_API\\\\\\\_URL` to the API's URL, with no trailing slash, before building; changing it later needs a redeploy.
3. Check `https://<your-api>/api/health` returns `{"ok":true}`.

Free API tiers usually sleep when idle, so the first request after a pause can be slow.

## Configuration and secrets

The app has no secrets today: no API keys and no passwords. What it does have is configuration, and that is read from environment variables, never written into the code:

|Variable|Used by|Purpose|
|-|-|-|
|`PORT`|server|Port the API listens on (default 3001)|
|`DB\\\\\\\_PATH`|server|Where the SQLite file is stored|
|`CLIENT\\\\\\\_ORIGIN`|server|The frontend's URL, which the API's CORS rules allow|
|`VITE\\\\\\\_API\\\\\\\_URL`|client|The API's URL, read when the frontend is built|

`server/.env.example` and `client/.env.example` list these variables with placeholder values, and they are committed. Real `.env` files are listed in `.gitignore` and are never committed. So is `server/data/`, which holds the SQLite database and therefore the user's own tasks. If a real secret is ever added (for example with login, see Limitations), it would live in an ignored `.env` locally and in the host's dashboard in production.

## Limitations (known and deliberate)

* **No accounts.** It is a single-user app, scoped out to keep the core solid. Upgrade path: hashed passwords with sessions or JWT, a `users` table, and a per-user cap.
* **Free hosting may reset the SQLite file** on a restart, so demo data can disappear. Upgrade path: hosted PostgreSQL.
* **"Today" follows the browser's date.** The server may run in a different time zone, so the browser sends its own local date with each request. Stored per-user time zones would be the next step.
* **The new-day rollover runs when the app is opened**, not on a schedule.

