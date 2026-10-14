// index.js — starts the server. Everything interesting is in app.js and db.js.

import { openDb } from './db.js';
import { createApp } from './app.js';

const db = openDb();
const app = createApp(db);
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Coffee Desk API listening on http://localhost:${port}`);
});
