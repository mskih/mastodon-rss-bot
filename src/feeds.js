import { CONFIG } from './config.js';

function toHttps(u) {
  if (!u) return u;
  return u.replace(/^http:\/\//i, 'https://');
}

export const FEEDS = (() => {
  const map = {};
  for (const { letter, keyword, url } of CONFIG.KEY_FEEDS) {
    if (!keyword || !url) continue;
    map[keyword.toLowerCase()] = { id: letter, key: keyword, url: toHttps(url) };
  }
  return map;
})();

export function feedIdToUrl(id) {
  const entry = Object.entries(FEEDS).find(([, v]) => v.id === id);
  return entry ? entry[1].url : null;
}

export const FEED_BY_DAY = CONFIG.FEED_BY_DAY;
