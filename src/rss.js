// src/rss.js
import RSSParser from 'rss-parser';
import he from 'he';

const DEFAULT_UA =
  process.env.RSS_USER_AGENT ||
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 MastodonRSSBot/1.2';

// Custom fetch with browser-like headers
async function browserlikeFetch(url, options = {}) {
  const headers = {
    'User-Agent': DEFAULT_UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers, redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res;
}

export const parser = new RSSParser({
  fetch: browserlikeFetch,
});

export async function parseFeed(url) {
  try {
    return await parser.parseURL(url);
  } catch (e) {
    throw new Error(`[RSS] ${e.message || e} :: ${url}`);
  }
}

export function stripHtmlToText(html) {
  const noTags = (html || '').replace(/<[^>]+>/g, ' ');
  return he.decode(noTags).replace(/\s+/g, ' ').trim();
}

export function normalizeUrl(u = '') {
  try {
    const url = new URL(u);
    url.hash = '';
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_name'].forEach(p => url.searchParams.delete(p));
    return url.toString();
  } catch {
    return (u || '').trim();
  }
}
