// Run with: npm test
// These tests talk to the real HTTP API (no UI), which is the point: they
// prove the 3-task rule holds even when the frontend is bypassed (D9).

import test from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../db.js';
import { createApp } from '../app.js';

async function start() {
  const db = openDb(':memory:');
  const server = createApp(db).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  async function call(method, path, body, headers = {}) {
    const res = await fetch(base + path, {
      method,
      headers: { 'content-type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  }

  const close = () =>
    new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });

  return { db, call, close };
}

async function addTask(call, title) {
  const { body } = await call('POST', '/api/tasks', { title });
  return body;
}

test('a new task lands in the Inbox, with its title trimmed', async () => {
  const { call, close } = await start();
  const res = await call('POST', '/api/tasks', { title: '  Write README  ' });
  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'Write README');
  assert.equal(res.body.list, 'inbox');
  await close();
});

test('empty and oversized titles are rejected', async () => {
  const { call, close } = await start();
  assert.equal((await call('POST', '/api/tasks', { title: '   ' })).status, 400);
  assert.equal((await call('POST', '/api/tasks', {})).status, 400);
  assert.equal((await call('POST', '/api/tasks', { title: 'x'.repeat(201) })).status, 400);
  await close();
});

test('Today holds at most 3 tasks, enforced by the server', async () => {
  const { call, close } = await start();
  const ids = [];
  for (const t of ['a', 'b', 'c', 'd']) ids.push((await addTask(call, t)).id);

  for (const id of ids.slice(0, 3)) {
    const ok = await call('PATCH', `/api/tasks/${id}`, { list: 'today' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.list, 'today');
  }

  const refused = await call('PATCH', `/api/tasks/${ids[3]}`, { list: 'today' });
  assert.equal(refused.status, 409);
  assert.equal(refused.body.error.code, 'TODAY_FULL');

  // The refused task must not have moved.
  const all = (await call('GET', '/api/tasks')).body;
  assert.equal(all.filter((t) => t.list === 'today').length, 3);
  assert.equal(all.find((t) => t.id === ids[3]).list, 'inbox');
  await close();
});

test('finishing or deferring a task frees a slot on Today', async () => {
  const { call, close } = await start();
  const ids = [];
  for (const t of ['a', 'b', 'c', 'd']) ids.push((await addTask(call, t)).id);
  for (const id of ids.slice(0, 3)) await call('PATCH', `/api/tasks/${id}`, { list: 'today' });

  const done = await call('PATCH', `/api/tasks/${ids[0]}`, { list: 'done' });
  assert.equal(done.body.list, 'done');
  assert.ok(done.body.completed_at, 'completed_at is set when a task is done');

  assert.equal((await call('PATCH', `/api/tasks/${ids[3]}`, { list: 'today' })).status, 200);
  await close();
});

test('moving a task to the list it is already on is not blocked by the cap', async () => {
  const { call, close } = await start();
  const ids = [];
  for (const t of ['a', 'b', 'c']) ids.push((await addTask(call, t)).id);
  for (const id of ids) await call('PATCH', `/api/tasks/${id}`, { list: 'today' });

  const rename = await call('PATCH', `/api/tasks/${ids[0]}`, { title: 'renamed', list: 'today' });
  assert.equal(rename.status, 200);
  assert.equal(rename.body.title, 'renamed');
  await close();
});

test('undoing a done task clears completed_at', async () => {
  const { call, close } = await start();
  const t = await addTask(call, 'a');
  await call('PATCH', `/api/tasks/${t.id}`, { list: 'done' });
  const back = await call('PATCH', `/api/tasks/${t.id}`, { list: 'inbox' });
  assert.equal(back.body.completed_at, null);
  await close();
});

test('unknown list names and unknown ids are refused', async () => {
  const { call, close } = await start();
  const t = await addTask(call, 'a');
  assert.equal((await call('PATCH', `/api/tasks/${t.id}`, { list: 'overdue' })).status, 400);
  assert.equal((await call('PATCH', '/api/tasks/999', { list: 'later' })).status, 404);
  assert.equal((await call('DELETE', '/api/tasks/999')).status, 404);
  assert.equal((await call('PATCH', '/api/tasks/abc', { list: 'later' })).status, 400);
  await close();
});

test('rollover sends yesterday\'s Today tasks to Later, and leaves today\'s alone', async () => {
  const { call, close } = await start();
  const a = await addTask(call, 'from yesterday');
  const b = await addTask(call, 'from today');
  await call('PATCH', `/api/tasks/${a.id}`, { list: 'today' }, { 'X-Client-Date': '2026-10-13' });
  await call('PATCH', `/api/tasks/${b.id}`, { list: 'today' }, { 'X-Client-Date': '2026-10-14' });

  const res = await call('POST', '/api/rollover', undefined, { 'X-Client-Date': '2026-10-14' });
  assert.deepEqual(res.body, { moved: 1 });

  const all = (await call('GET', '/api/tasks')).body;
  assert.equal(all.find((t) => t.id === a.id).list, 'later');
  assert.equal(all.find((t) => t.id === b.id).list, 'today');
  await close();
});

test('focus sessions: start, no second session at once, stop records seconds', async () => {
  const { db, call, close } = await start();
  const t = await addTask(call, 'deep work');

  assert.deepEqual((await call('GET', '/api/sessions/active')).body, { session: null });

  const started = await call('POST', '/api/sessions', { task_id: t.id });
  assert.equal(started.status, 201);
  assert.equal(started.body.ended_at, null);

  const second = await call('POST', '/api/sessions', { task_id: t.id });
  assert.equal(second.status, 409);
  assert.equal(second.body.error.code, 'SESSION_RUNNING');

  const active = (await call('GET', '/api/sessions/active')).body.session;
  assert.equal(active.id, started.body.id);

  // Pretend the session began 90 seconds ago instead of sleeping in a test.
  const ago = new Date(Date.now() - 90_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  db.prepare('UPDATE sessions SET started_at = ? WHERE id = ?').run(ago, started.body.id);

  const stopped = await call('POST', `/api/sessions/${started.body.id}/stop`);
  assert.ok(stopped.body.ended_at);
  assert.ok(Math.abs(stopped.body.seconds - 90) <= 2, `seconds was ${stopped.body.seconds}`);

  // Stopping again changes nothing.
  const again = await call('POST', `/api/sessions/${started.body.id}/stop`);
  assert.equal(again.body.seconds, stopped.body.seconds);

  // The task now reports its total focus time.
  const task = (await call('GET', '/api/tasks')).body.find((x) => x.id === t.id);
  assert.equal(task.focus_seconds, stopped.body.seconds);
  await close();
});

test('deleting a task keeps its focus history safe (no crash, no orphan error)', async () => {
  const { call, close } = await start();
  const t = await addTask(call, 'gone soon');
  const s = (await call('POST', '/api/sessions', { task_id: t.id })).body;
  await call('POST', `/api/sessions/${s.id}/stop`);
  assert.equal((await call('DELETE', `/api/tasks/${t.id}`)).status, 204);
  assert.deepEqual((await call('GET', '/api/tasks')).body, []);
  await close();
});

test('malformed JSON gets a calm 400, not a stack trace', async () => {
  const { close } = await start();
  await close();
  const db = openDb(':memory:');
  const server = createApp(db).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/tasks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{not json',
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'BAD_REQUEST');
  server.closeAllConnections();
  server.close();
});
