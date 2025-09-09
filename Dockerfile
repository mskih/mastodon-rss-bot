FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata && update-ca-certificates

# Copy manifests first for better layer cache
COPY package.json ./
# If you have a lockfile (recommended), copy it and prefer npm ci
# COPY package-lock.json ./
# RUN npm ci --omit=dev
RUN npm install --omit=dev

# Copy the rest
COPY . .

ENV NODE_ENV=production

# Non-root
RUN addgroup -S app && adduser -S app -G app
USER app

# Start via package.json "start" script
CMD ["npm", "start"]
