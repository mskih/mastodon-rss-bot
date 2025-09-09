import cron from 'node-cron';
import { CONFIG } from './config.js';
import { FEED_BY_DAY, feedIdToUrl } from './feeds.js';
import { chooseItem, getItemId, recordPosted } from './dedup.js';
import { buildStatusFromItem, postStatus } from './posting.js';
import { checkMentions } from './mentions.js';

async function postDaily() {
  try {
    const dow = new Date().getDay(); // 0..6
    const feedId = FEED_BY_DAY[dow] || null;
    if (!feedId) { console.log('[Daily] Sunday – skip'); return; }
    const url = feedIdToUrl(feedId);
    if (!url) { console.warn(`[Daily] No feed URL configured for ${feedId}`); return; }

    const item = await chooseItem(url, feedId);
    if (!item) { console.warn(`[Daily] No items for feed ${feedId} (${url})`); return; }

    const status = buildStatusFromItem(item);
    if (!status) { console.warn('[Daily] Could not build status'); return; }

    await postStatus(status);
    recordPosted(feedId, getItemId(item));
    console.log(`[Daily] Posted from feed ${feedId}: ${item.link}`);
  } catch (err) {
    console.error('[Daily] Error:', err?.response?.data || err);
  }
}

function start() {
  const exp = `${CONFIG.POST_MINUTE} ${CONFIG.POST_HOUR} * * 1-6`;
  cron.schedule(exp, postDaily, { timezone: CONFIG.TIMEZONE });
  console.log(`[Init] Daily posts at ${CONFIG.POST_HOUR}:${CONFIG.POST_MINUTE} ${CONFIG.TIMEZONE} (Mon–Sat)`);

  setInterval(checkMentions, 60_000);
  console.log('[Init] Mention polling every 60s');

  checkMentions().catch(() => {});
}
start();
