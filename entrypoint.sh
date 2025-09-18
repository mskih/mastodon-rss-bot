#!/bin/sh
set -e

# Ensure data dir exists
mkdir -p /app/data

# Fix ownership of the mounted volume (bind or named)
chown -R app:app /app/data || true

# Drop privileges and start the app
exec su-exec app:app npm start
