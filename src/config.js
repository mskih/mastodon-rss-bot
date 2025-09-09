import 'dotenv/config';

export const CONFIG = {
  MASTODON_URL: process.env.MASTODON_URL,
  MASTODON_TOKEN: process.env.MASTODON_TOKEN,
  VISIBILITY: process.env.VISIBILITY || 'public',
  TIMEZONE: process.env.TIMEZONE || 'Europe/Madrid',
  POST_HOUR: process.env.POST_HOUR || '09',
  POST_MINUTE: process.env.POST_MINUTE || '00',

  DEDUP_DAYS: Math.max(parseInt(process.env.DEDUP_DAYS || '30', 10), 0),
  MAX_HISTORY_PER_FEED: Math.max(parseInt(process.env.MAX_HISTORY_PER_FEED || '200', 10), 25),

  KEY_FEEDS: ['A','B','C','D','E','F'].map(letter => ({
    letter,
    keyword: (process.env[`BOT_KEYWORD_${letter}`] || '').trim(),
    url: (process.env[`FEED_${letter}`] || '').trim(),
  })).filter(x => x.keyword && x.url),

  FEED_BY_DAY: { 1:'A', 2:'B', 3:'C', 4:'D', 5:'E', 6:'F', 0:null }, // Sun=0
};

if (!CONFIG.MASTODON_URL || !CONFIG.MASTODON_TOKEN) {
  console.error('Missing MASTODON_URL or MASTODON_TOKEN in .env');
  process.exit(1);
}
