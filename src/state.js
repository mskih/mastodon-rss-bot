import fs from 'fs';
import path from 'path';

function resolveStatePath() {
  let target = process.env.STATE_FILE || '/app/data/state.json';
  try {
    const st = fs.existsSync(target) ? fs.lstatSync(target) : null;
    if (st && st.isDirectory()) target = path.join(target, 'state.json');
  } catch {}
  const dir = path.dirname(target);
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  return target;
}

const STATE_PATH = resolveStatePath();

function readFileSafe() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return null; }
}
function writeFileSafe(obj) {
  try { fs.writeFileSync(STATE_PATH, JSON.stringify(obj, null, 2)); }
  catch (e) { console.error(`[State] Failed to write ${STATE_PATH}:`, e); }
}

const defaultState = {
  lastNotificationId: null,
  posted: {},                   // per-feed dedup history
  processedNotifications: []     // which mention notifications we’ve replied to
};

let state = { ...defaultState, ...(readFileSafe() || {}) };
if (!Array.isArray(state.processedNotifications)) state.processedNotifications = [];

export function getState() { return state; }
export function saveState() { writeFileSafe(state); }
export function updateState(mutator) { mutator(state); saveState(); }

const MAX_PROCESSED_IDS = 2000;

export function hasProcessedNotification(id) {
  if (!id) return false;
  return state.processedNotifications.includes(id);
}

export function markNotificationProcessed(id) {
  if (!id) return;
  if (!state.processedNotifications.includes(id)) {
    state.processedNotifications.push(id);
    if (state.processedNotifications.length > MAX_PROCESSED_IDS) {
      state.processedNotifications = state.processedNotifications.slice(-MAX_PROCESSED_IDS);
    }
    saveState();
  }
}
