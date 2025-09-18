FROM node:20-alpine
WORKDIR /app

# Base packages + CA + timezone + su-exec (to drop privileges)
RUN apk add --no-cache ca-certificates tzdata su-exec && update-ca-certificates

# Copy manifests first (better cache)
COPY package.json ./
# If you have a lockfile, prefer ci (uncomment next line and swap the npm line)
# COPY package-lock.json ./

# Install deps
RUN npm install --omit=dev
# If using lockfile:
# RUN npm ci --omit=dev

# Copy the app code
COPY . .

# Create runtime data dir
RUN mkdir -p /app/data

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Ensure app owns its code dir (harmless if already owned)
RUN chown -R app:app /app

# Use an entrypoint that fixes /app/data perms then drops to 'app'
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Stay root for the chown step in entrypoint
USER root
ENV NODE_ENV=production

VOLUME ["/app/data"]

ENTRYPOINT ["/app/entrypoint.sh"]
