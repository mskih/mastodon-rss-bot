import { parseFeed, normalizeUrl } from './rss.js';
import { getState, updateState } from './state.js';
import { CONFIG } from './config.js';

export function getItemId(item) {
  const guid = (item.guid || item.id || '').toString().trim();
  const link = normalizeUrl(item.link || '');
  if (guid) return guid;
  if (link) return link;
  const t = (item.title || '').trim();
  const d = (item.isoDate || item.pubDate || '').toString().trim();
  return `${t} | ${d}`;
}

function ensureFeedHistory(feedId) {
  const s = getState();
  if (!s.posted[feedId]) s.posted[feedId] = [];
}

function pruneHistory(feedId) {
  ensureFeedHistory(feedId);
  const s = getState();
  const cutoff = Date.now() - CONFIG.DEDUP_DAYS * 24 * 3600 * 1000;
  s.posted[feedId] = s.posted[feedId]
    .filter(entry => entry.ts >= cutoff)
    .slice(-CONFIG.MAX_HISTORY_PER_FEED);
  updateState(() => s);
}

export function isRecentlyPosted(feedId, itemId) {
  if (!itemId) return false;
  ensureFeedHistory(feedId);
  const s = getState();
  const cutoff = Date.now() - CONFIG.DEDUP_DAYS * 24 * 3600 * 1000;
  return s.posted[feedId].some(entry => entry.id === itemId && entry.ts >= cutoff);
}

export function recordPosted(feedId, itemId) {
  if (!itemId) return;
  ensureFeedHistory(feedId);
  const s = getState();
  s.posted[feedId].push({ id: itemId, ts: Date.now() });
  pruneHistory(feedId);
}

export async function chooseItem(feedUrl, feedId) {
  const feed = await parseFeed(feedUrl);
  const items = Array.isArray(feed?.items) ? feed.items : [];
  if (items.length === 0) return null;

  for (const it of items) {
    const id = getItemId(it);
    if (!isRecentlyPosted(feedId, id)) return it;
  }
  return items[0]; // keep cadence even if all seen
}
