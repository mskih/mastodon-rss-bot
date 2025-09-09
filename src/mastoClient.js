import { createRestAPIClient } from 'masto';
import { CONFIG } from './config.js';

export const masto = createRestAPIClient({
  url: CONFIG.MASTODON_URL,
  accessToken: CONFIG.MASTODON_TOKEN,
});
