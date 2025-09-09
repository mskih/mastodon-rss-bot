import RSSParser from 'rss-parser';
import he from 'he';

export const parser = new RSSParser({
  timeout: 15000,
  headers: { 'User-Agent': 'mastodon-rss-bot/1.2' },
});

export async function parseFeed(url) {
  return parser.parseURL(url);
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
