// app.js — the whole REST API.
//
// createApp(db) takes the database as an argument instead of importing it.
// That one choice lets the tests run the exact same app against a throwaway
// in-memory database.

import express from 'express';
import cors from 'cors';

// The rule that defines the product. Lives here, on the server (decision D9).
export const TODAY_LIMIT = 3;
const LISTS = ['inbox', 'today', 'later', 'done'];

const TODAY_FULL_MESSAGE =
  'Today already has three tasks, which is plenty. Finish one, or send one to Later, to make room.';

// An error that carries an HTTP status and a stable machine-readable code.
// The client branches on `code`; people read `message`.
class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const notFound = (what) => new ApiError(404, 'NOT_FOUND', `We could not find that ${what}.`);

// ISO timestamp without milliseconds, matching what the schema defaults produce.
const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'BAD_ID', 'That id does not look right.');
  }
  return id;
}

function cleanTitle(value) {
  const title = typeof value === 'string' ? value.trim() : '';
  if (title.length < 1 || title.length > 200) {
    throw new ApiError(400, 'BAD_TITLE', 'Give the task a title of up to 200 characters.');
  }
  return title;
}

// "What day is it for the user?" The server may be in another time zone (a
// free host usually runs on UTC), so the browser tells us its local date.
// If the header is missing or malformed we fall back to the server's date.
function clientDate(req) {
  const header = req.get('X-Client-Date') ?? '';
  return /^\d{4}-\d{2}-\d{2}$/.test(header) ? header : new Date().toISOString().slice(0, 10);
}

export function createApp(db) {
  const app = express();

  // In production set CLIENT_ORIGIN to the deployed frontend's URL.
  const origin = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true;
  app.use(cors({ origin }));
  app.use(express.json());

  // ---- SQL used by several routes is prepared once here (parsed once, reused).
  // The habit that matters most: values always go in through `?` placeholders,
  // never by joining user text into the SQL string. That is what prevents
  // SQL injection, and the one-off statements further down do the same.
  const SELECT_TASKS = `
    SELECT t.id, t.title, t.list, t.created_at, t.completed_at,
           COALESCE(SUM(s.seconds), 0) AS focus_seconds
    FROM tasks t
    LEFT JOIN sessions s ON s.task_id = t.id AND s.ended_at IS NOT NULL
  `;
  const listTasks = db.prepare(`${SELECT_TASKS} GROUP BY t.id ORDER BY t.id`);
  const getTask = db.prepare(`${SELECT_TASKS} WHERE t.id = ? GROUP BY t.id`);
  const getTaskRow = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const countToday = db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE list = 'today'");
  const getSession = db.prepare('SELECT * FROM sessions WHERE id = ?');
  const getActiveSession = db.prepare(
    'SELECT * FROM sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1',
  );

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // ---------------------------------------------------------------- tasks

  app.get('/api/tasks', (req, res) => {
    res.json(listTasks.all());
  });

  // Quick capture: every new task lands in the Inbox, nothing else to decide.
  app.post('/api/tasks', (req, res) => {
    const title = cleanTitle(req.body?.title);
    const info = db.prepare('INSERT INTO tasks (title) VALUES (?)').run(title);
    res.status(201).json(getTask.get(info.lastInsertRowid));
  });

  // One endpoint handles renaming AND moving between lists. Moving a task is
  // just changing its `list` field, which is what makes the "move" buttons
  // in the UI trivial.
  app.patch('/api/tasks/:id', (req, res) => {
    const id = parseId(req.params.id);
    const existing = getTaskRow.get(id);
    if (!existing) throw notFound('task');

    const body = req.body ?? {};
    const title = body.title === undefined ? existing.title : cleanTitle(body.title);
    let list = existing.list;
    if (body.list !== undefined) {
      if (!LISTS.includes(body.list)) {
        throw new ApiError(400, 'BAD_LIST', `List must be one of: ${LISTS.join(', ')}.`);
      }
      list = body.list;
    }

    // The cap check and the update happen inside ONE transaction, so they
    // succeed or fail together. Two things keep two quick requests from both
    // squeezing in a fourth task:
    //  1. better-sqlite3 is synchronous: Node cannot start another request
    //     between our COUNT and our UPDATE.
    //  2. `.immediate()` (below) takes SQLite's write lock at the START of the
    //     transaction, so this also holds if several server processes ever
    //     shared one database file.
    const apply = db.transaction(() => {
      let todayDate = existing.today_date;
      let completedAt = existing.completed_at;

      if (list !== existing.list) {
        if (list === 'today') {
          if (countToday.get().n >= TODAY_LIMIT) {
            throw new ApiError(409, 'TODAY_FULL', TODAY_FULL_MESSAGE);
          }
          todayDate = clientDate(req);
        } else {
          todayDate = null;
        }
        completedAt = list === 'done' ? nowIso() : null;
      }

      db.prepare(
        'UPDATE tasks SET title = ?, list = ?, today_date = ?, completed_at = ? WHERE id = ?',
      ).run(title, list, todayDate, completedAt, id);
    });
    apply.immediate();

    res.json(getTask.get(id));
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const id = parseId(req.params.id);
    const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    if (info.changes === 0) throw notFound('task');
    res.status(204).end();
  });

  // A new day, a clean Today. Anything left on Today from an earlier day goes
  // to Later. No "overdue", no red (decision D3). The client calls this when
  // the app opens.
  app.post('/api/rollover', (req, res) => {
    const info = db
      .prepare("UPDATE tasks SET list = 'later', today_date = NULL WHERE list = 'today' AND today_date < ?")
      .run(clientDate(req));
    res.json({ moved: info.changes });
  });

  // ------------------------------------------------------ focus sessions
  // The timer counts UP. The server stores when a session started; the
  // browser works out "how long so far" from that. So a page refresh or a
  // closed tab does not lose the running timer.

  app.get('/api/sessions/active', (req, res) => {
    res.json({ session: getActiveSession.get() ?? null });
  });

  app.post('/api/sessions', (req, res) => {
    const rawTaskId = req.body?.task_id;
    let taskId = null;
    if (rawTaskId !== undefined && rawTaskId !== null) {
      taskId = parseId(rawTaskId);
      if (!getTaskRow.get(taskId)) throw notFound('task');
    }
    if (getActiveSession.get()) {
      throw new ApiError(409, 'SESSION_RUNNING', 'A focus session is already running.');
    }
    const info = db.prepare('INSERT INTO sessions (task_id) VALUES (?)').run(taskId);
    res.status(201).json(getSession.get(info.lastInsertRowid));
  });

  // Stopping twice is harmless: the second call just returns the finished session.
  app.post('/api/sessions/:id/stop', (req, res) => {
    const id = parseId(req.params.id);
    const session = getSession.get(id);
    if (!session) throw notFound('session');
    if (session.ended_at) return res.json(session);

    const seconds = Math.max(0, Math.round((Date.now() - Date.parse(session.started_at)) / 1000));
    db.prepare('UPDATE sessions SET ended_at = ?, seconds = ? WHERE id = ?').run(nowIso(), seconds, id);
    res.json(getSession.get(id));
  });

  // ------------------------------------------------------ error handling

  app.use((req, res, next) => next(notFound('page')));

  // Express recognises an error handler by its four arguments.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    }
    if (err.status >= 400 && err.status < 500) {
      // For example, a request body that is not valid JSON.
      return res
        .status(err.status)
        .json({ error: { code: 'BAD_REQUEST', message: 'That request could not be read.' } });
    }
    console.error(err);
    res
      .status(500)
      .json({ error: { code: 'SERVER_ERROR', message: 'Something went wrong on our side. Please try again.' } });
  });

  return app;
}
