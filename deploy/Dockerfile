# One image: dashboard build + hub + SQLite.
#
# Node 24 is required for `node:sqlite` and native TypeScript stripping — the hub
# runs server/index.ts directly, with no transpile step of its own.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# `npm run build` typechecks, then bundles dist/ (scripts/build.mjs).
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only the production deps are needed at runtime: ws + node built-ins.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=build /app/dist ./dist
COPY server ./server
COPY src/lib/noise.ts ./src/lib/noise.ts
COPY src/lib/types.ts ./src/lib/types.ts

# SQLite lives on a mounted volume so rebuilds never drop the readings.
RUN mkdir -p /data
ENV DB_PATH=/data/noise-nova.db
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- "http://127.0.0.1:${PORT:-8787}/api/health" >/dev/null || exit 1

CMD ["node", "server/index.ts"]
