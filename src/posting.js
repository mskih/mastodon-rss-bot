import { masto } from './mastoClient.js';
import { CONFIG } from './config.js';
import { normalizeUrl } from './rss.js';

export function buildStatusFromItem({ title, link }) {
  const safeTitle = (title || '').trim();
  const safeLink = normalizeUrl(link || '');
  if (!safeLink) return null;
  return `${safeTitle ? `${safeTitle}\n` : ''}${safeLink}`;
}

export function buildReplyFromItem(item, { displayName, acct }) {
  const name = (displayName && displayName.trim()) || (acct && acct.trim()) || 'there';
  const base = buildStatusFromItem(item);
  if (!base) return null;
  return `Hi ${name}! ${base}`;
}

export async function postStatus(status, { inReplyToId = null, mentionAcct = null } = {}) {
  const prefix = mentionAcct ? `@${mentionAcct} ` : '';
  const payload = {
    status: prefix + status,
    visibility: CONFIG.VISIBILITY,
  };
  if (inReplyToId) payload.inReplyToId = inReplyToId;
  return masto.v1.statuses.create(payload);
}
