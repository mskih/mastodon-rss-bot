# BOT setup
## Inital mastodon bot account setup
On your Mastodon instance (via VPN):
Log in → Preferences → Development → New application.
Name: mastodon-rss-bot (anything).
Scopes (tick these):
      read:notifications
      write:statuses
      (optional but safe) read:accounts
Save → copy Your access token (not the client key/secret).

## File Structure
mastodon-rss-bot/
├─ .env
├─ package.json
├─ Dockerfile
├─ docker-compose.yml
├─ state.json                 # created at runtime (kept on host via volume)
└─ src/
   ├─ config.js
   ├─ state.js
   ├─ mastoClient.js
   ├─ rss.js
   ├─ feeds.js
   ├─ dedup.js
   ├─ posting.js
   ├─ mentions.js
   └─ index.js

## From the project root
npm ci          # installs exact deps from package.json
npm start       # runs src/index.js

You should see logs like:

[Init] Daily posts at 09:00 Europe/Madrid (Mon–Sat)
[Init] Mention polling every 60s

## Launch the docker compose.
sudo docker-compose up -d --build
sudo docker-compose logs -f

## Test bot feed mention
Feed A — Khan Academy Blog
    @yourbot khanLearning Can you share something from Khan Academy?
Feed B — Science Featured
    @yourbot science What’s new in the science world today?
Feed C — Geography Realm
    @yourbot geography I’d love to learn something about geography.
Feed D — Universe Today (Astronomy)
    @yourbot astronomy Any cool astronomy updates?
Feed E — History Today
    @yourbot history Give me a bit of history knowledge please.
Feed F — Damn Delicious (Recipes)
    @yourbot recipe Share a tasty recipe with me!
