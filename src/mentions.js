import { masto } from './mastoClient.js';
import { FEEDS } from './feeds.js';
import { stripHtmlToText } from './rss.js';
import { chooseItem, getItemId, recordPosted } from './dedup.js';
import { buildStatusFromItem, postStatus } from './posting.js';
import { getState, markNotificationProcessed } from './state.js';

export async function checkMentions() {
  try {
    const s = getState();
    const params = { types: ['mention'], limit: 20 };
    if (s.lastNotificationId) params.since_id = s.lastNotificationId;

    const notes = await masto.v1.notifications.list(params);
    if (!notes?.length) return;

    let maxId = s.lastNotificationId;

    for (const n of notes) {
      // track highest notification id we saw this poll
      if (n.id && (!maxId || BigInt(n.id) > BigInt(maxId))) {
        maxId = n.id;
      }

      const text = stripHtmlToText(n.status?.content || '');
      const acct = n.account?.acct || '';

      // find first matching keyword in the mention text
      const lower = text.toLowerCase();
      const match = Object.entries(FEEDS).find(([kw]) => lower.includes(kw));
      if (!match) {
        console.log(`[Mentions] No keyword in: "${text}"`);
        continue;
      }

      const [, meta] = match; // { id, key, url }
      const item = await chooseItem(meta.url, meta.id);
      if (!item) {
        console.warn(`[Mentions] No items for keyword ${meta.key} (${meta.url})`);
        continue;
      }

      const status = buildStatusFromItem(item);
      if (!status) continue;

      await postStatus(status, { inReplyToId: n.status?.id, mentionAcct: acct });
      recordPosted(meta.id, getItemId(item));
      console.log(`[Mentions] Replied to @${acct} with ${meta.id}: ${item.link}`);
    }

    // persist the highest processed notification id so we don't re-reply on restart
    if (maxId && maxId !== s.lastNotificationId) {
      markNotificationProcessed(maxId);
    }
  } catch (err) {
    console.error('[Mentions] Error:', err?.response?.data || err);
  }
}
