// src/state.js
import fs from 'fs';
import path from 'path';

const STATE_DIR = process.env.STATE_DIR || path.join(process.cwd(), 'data');
const STATE_PATH = path.join(STATE_DIR, 'state.json');

function ensureDir() {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  } catch (e) {
    // If this fails, writes will fail later; we log and continue so the bot still runs.
    console.error(`[State] Failed to create ${STATE_DIR}:`, e);
  }
}

function readFileSafe() {
  try {
    ensureDir();
    if (!fs.existsSync(STATE_PATH)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (e) {
    console.error(`[State] Failed to read ${STATE_PATH}:`, e);
    return null;
  }
}

function writeFileSafe(obj) {
  try {
    ensureDir();
    // Write atomically: write to temp then rename
    const tmp = STATE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
    fs.renameSync(tmp, STATE_PATH);
  } catch (e) {
    console.error(`[State] Failed to write ${STATE_PATH}:`, e);
  }
}

const defaultState = { lastNotificationId: null, posted: {} };
let state = { ...defaultState, ...(readFileSafe() || {}) };

export function getState() {
  return state;
}

export function saveState() {
  writeFileSafe(state);
}

export function updateState(mutator) {
  mutator(state);
  saveState();
}

// Some callers expect a helper to mark notifications processed
export function markNotificationProcessed(id) {
  if (!id) return;
  updateState(s => {
    s.lastNotificationId = id;
  });
}
