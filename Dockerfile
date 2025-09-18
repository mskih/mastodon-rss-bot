FROM node:20-alpine
WORKDIR /app

# Base packages + CA + timezone
RUN apk add --no-cache ca-certificates tzdata && update-ca-certificates

# Copy manifests first (better cache)
COPY package.json ./
# If you have a lockfile, uncomment the next line and prefer npm ci
# COPY package-lock.json ./

# Install deps
RUN npm install --omit=dev
# If using lockfile:
# RUN npm ci --omit=dev

# Copy the app code
COPY . .

# Create data dir and ensure ownership for non-root user
RUN mkdir -p /app/data

# Non-root user
RUN addgroup -S app && adduser -S app -G app \
  && chown -R app:app /app

USER app
ENV NODE_ENV=production

# Persist only the data directory; code lives in the image
VOLUME ["/app/data"]

CMD ["npm", "start"]
