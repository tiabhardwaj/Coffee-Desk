// db.js — opens the SQLite database and makes sure the tables exist.
//
// better-sqlite3 is *synchronous*: db.prepare(sql).get() returns the row
// immediately, with no promises or callbacks. That keeps the route code short
// and, importantly, makes "check the cap, then update" atomic (see app.js).

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

// SQLite has no real date type, so timestamps are stored as ISO-8601 text in
// UTC, e.g. 2026-10-14T16:46:00Z. The browser can parse that directly.
export const NOW_SQL = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

export function openDb(file = process.env.DB_PATH || './data/coffee.db') {
  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }

  const db = new Database(file);

  // SQLite only enforces foreign keys if you ask it to, per connection.
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
      -- A task lives in exactly one list. The CHECK makes the database itself
      -- reject any other value, even if the API had a bug.
      list         TEXT    NOT NULL DEFAULT 'inbox'
                   CHECK (list IN ('inbox', 'today', 'later', 'done')),
      -- The calendar day (YYYY-MM-DD) the task was put on Today. Used to
      -- move forgotten tasks to Later the next day. NULL when not on Today.
      today_date   TEXT,
      created_at   TEXT    NOT NULL DEFAULT (${NOW_SQL}),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      -- If a task is deleted, keep the focus session but forget the link.
      task_id    INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      started_at TEXT    NOT NULL DEFAULT (${NOW_SQL}),
      -- ended_at / seconds stay NULL while the session is running.
      ended_at   TEXT,
      seconds    INTEGER
    );
  `);

  return db;
}
