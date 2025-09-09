import { masto } from './mastoClient.js';
import { FEEDS } from './feeds.js';
import { stripHtmlToText } from './rss.js';
import { chooseItem, getItemId, recordPosted } from './dedup.js';
import { buildReplyFromItem, postStatus } from './posting.js';
import {
  getState, updateState,
  hasProcessedNotification, markNotificationProcessed
} from './state.js';

export async function checkMentions() {
  try {
    const s = getState();
    const params = { types: ['mention'], limit: 20 };
    if (s.lastNotificationId) params.since_id = s.lastNotificationId;

    const notes = await masto.v1.notifications.list(params);
    if (!notes?.length) return;

    let maxId = s.lastNotificationId;

    for (const n of notes) {
      if (hasProcessedNotification(n.id)) continue;

      if (n.id && (!maxId || BigInt(n.id) > BigInt(maxId))) maxId = n.id;

      const text = stripHtmlToText(n.status?.content || '');
      const acct = n.account?.acct || '';
      const displayName = n.account?.displayName || n.account?.username || acct;

      const lower = text.toLowerCase();
      const match = Object.entries(FEEDS).find(([kw]) => lower.includes(kw));

      // Mark as processed even if no keyword, so we don't loop on it
      if (!match) { markNotificationProcessed(n.id); continue; }

      const [, meta] = match; // { id, key, url }

      const item = await chooseItem(meta.url, meta.id);
      if (!item) { markNotificationProcessed(n.id); continue; }

      const status = buildReplyFromItem(item, { displayName, acct });
      if (!status) { markNotificationProcessed(n.id); continue; }

      await postStatus(status, { inReplyToId: n.status?.id, mentionAcct: acct });
      recordPosted(meta.id, getItemId(item));
      markNotificationProcessed(n.id);

      // Optional: also dismiss on server (needs write:notifications)
      // try { await masto.v1.notifications.dismiss(n.id); } catch {}
      console.log(`[Mentions] Replied to @${acct} with ${meta.id}: ${item.link}`);
    }

    if (maxId && maxId !== s.lastNotificationId) {
      updateState(state => { state.lastNotificationId = maxId; });
    }
  } catch (err) {
    console.error('[Mentions] Error:', err?.response?.data || err);
  }
}
