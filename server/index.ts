/**
 * Noise Nova hub.
 *
 * One process owns the whole system: the built dashboard, the REST API, the
 * WebSocket fan-out and the SQLite store. That is deliberate — a single origin
 * means no CORS, no split deploy, and the same code path whether it runs on
 * localhost, a LAN address or a container on a subdomain.
 *
 * Runs directly on Node 24 via native type stripping: `node server/index.ts`.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { WebSocketServer, WebSocket } from "ws";
import { clampDb, dbFromRms, statusFromDb } from "../src/lib/noise.ts";
import type { NodeKind, Reading, SourceKind } from "../src/lib/types.ts";

try {
  process.loadEnvFile?.(".env");
} catch {
  // No .env file is a valid configuration.
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT ?? 8787);
const TOKEN = (process.env.HUB_TOKEN ?? "").trim();
const DB_PATH = path.resolve(ROOT, process.env.DB_PATH ?? "./data/noise-nova.db");
const SEED_LIMIT = 240;
const MAX_BODY_BYTES = 64 * 1024;

mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT NOT NULL,
    node_label TEXT NOT NULL,
    kind TEXT NOT NULL,
    source TEXT NOT NULL,
    ts INTEGER NOT NULL,
    db REAL NOT NULL,
    rms REAL NOT NULL,
    peak REAL NOT NULL,
    status TEXT NOT NULL,
    threshold REAL NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_readings_ts ON readings (ts DESC);
  CREATE INDEX IF NOT EXISTS idx_readings_node ON readings (node_id, ts DESC);
`);

const insertReading = db.prepare(`
  INSERT INTO readings (node_id, node_label, kind, source, ts, db, rms, peak, status, threshold)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const recentReadings = db.prepare(`SELECT * FROM readings ORDER BY ts DESC LIMIT ?`);
const latestPerNode = db.prepare(`
  SELECT r.* FROM readings r
  JOIN (SELECT node_id, MAX(ts) AS max_ts FROM readings GROUP BY node_id) m
    ON r.node_id = m.node_id AND r.ts = m.max_ts
  ORDER BY r.ts DESC
`);
const readingCount = db.prepare(`SELECT COUNT(*) AS n FROM readings`);

interface DbRow {
  node_id: string;
  node_label: string;
  kind: string;
  source: string;
  ts: number;
  db: number;
  rms: number;
  peak: number;
  status: string;
  threshold: number;
}

function rowToReading(row: DbRow): Reading {
  return {
    nodeId: row.node_id,
    nodeLabel: row.node_label,
    kind: row.kind as NodeKind,
    source: row.source as SourceKind,
    ts: Number(row.ts),
    db: Number(row.db),
    rms: Number(row.rms),
    peak: Number(row.peak),
    status: statusFromDb(Number(row.db)),
    threshold: Number(row.threshold),
  };
}

function persist(reading: Reading): void {
  insertReading.run(
    reading.nodeId,
    reading.nodeLabel,
    reading.kind,
    reading.source,
    reading.ts,
    reading.db,
    reading.rms,
    reading.peak,
    reading.status,
    reading.threshold,
  );
}

// ---------------------------------------------------------------- validation

const KINDS: readonly NodeKind[] = ["laptop", "phone", "board"];
const SOURCES: readonly SourceKind[] = ["browser-mic", "android-mic", "esp32"];

function text(value: unknown, fallback: string, max = 48): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return fallback;
  return trimmed.slice(0, max);
}

function number(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * A reading arriving from an untrusted client is rebuilt field by field. The dB
 * value is recomputed from RMS whenever RMS is present, so a client cannot post
 * an arbitrary level and have the dashboard present it as measured.
 */
function normaliseReading(input: unknown, fallback: Partial<Reading> = {}): Reading | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  const nodeId = text(raw.nodeId ?? fallback.nodeId, "");
  if (!nodeId) return null;

  const kind = KINDS.includes(raw.kind as NodeKind)
    ? (raw.kind as NodeKind)
    : (fallback.kind ?? "board");
  const source = SOURCES.includes(raw.source as SourceKind)
    ? (raw.source as SourceKind)
    : (fallback.source ?? (kind === "board" ? "esp32" : "browser-mic"));

  const rms = Math.min(1, Math.max(0, number(raw.rms, 0)));
  const reportedDb = number(raw.db, Number.NaN);
  const dbValue = rms > 0 ? dbFromRms(rms) : Number.isFinite(reportedDb) ? reportedDb : 30;
  const dbClamped = clampDb(dbValue);

  const tsRaw = number(raw.ts, Date.now());
  const ts = tsRaw > 1e12 ? tsRaw : Date.now();

  return {
    nodeId,
    nodeLabel: text(raw.nodeLabel ?? fallback.nodeLabel, nodeId, 48),
    kind,
    source,
    ts,
    db: Number(dbClamped.toFixed(1)),
    rms: Number(rms.toFixed(6)),
    peak: Number(clampDb(number(raw.peak, dbClamped)).toFixed(1)),
    status: statusFromDb(dbClamped),
    threshold: Math.min(120, Math.max(30, number(raw.threshold ?? fallback.threshold, 75))),
  };
}

// ------------------------------------------------------------------ presence

interface Presence {
  nodeId: string;
  nodeLabel: string;
  kind: NodeKind;
  lastSeen: number;
}

const presence = new Map<string, Presence>();

function touchPresence(reading: Reading): void {
  presence.set(reading.nodeId, {
    nodeId: reading.nodeId,
    nodeLabel: reading.nodeLabel,
    kind: reading.kind,
    lastSeen: Date.now(),
  });
}

function buildNodes() {
  const latest = (latestPerNode.all() as unknown as DbRow[]).map(rowToReading);
  const merged = new Map<
    string,
    {
      nodeId: string;
      nodeLabel: string;
      kind: NodeKind;
      lastSeen: number;
      db: number;
      status: ReturnType<typeof statusFromDb>;
      source: SourceKind;
      readings: number;
    }
  >();

  const counts = db
    .prepare(`SELECT node_id, COUNT(*) AS n FROM readings GROUP BY node_id`)
    .all() as unknown as { node_id: string; n: number }[];
  const countMap = new Map(counts.map((c) => [c.node_id, Number(c.n)]));

  for (const reading of latest) {
    merged.set(reading.nodeId, {
      nodeId: reading.nodeId,
      nodeLabel: reading.nodeLabel,
      kind: reading.kind,
      lastSeen: reading.ts,
      db: reading.db,
      status: reading.status,
      source: reading.source,
      readings: countMap.get(reading.nodeId) ?? 0,
    });
  }

  for (const p of presence.values()) {
    const existing = merged.get(p.nodeId);
    if (existing) {
      existing.nodeLabel = p.nodeLabel || existing.nodeLabel;
      existing.kind = p.kind || existing.kind;
      continue;
    }
    merged.set(p.nodeId, {
      nodeId: p.nodeId,
      nodeLabel: p.nodeLabel,
      kind: p.kind,
      lastSeen: p.lastSeen,
      db: 0,
      status: "QUIET",
      source: "browser-mic",
      readings: 0,
    });
  }

  return [...merged.values()].sort((a, b) => b.lastSeen - a.lastSeen);
}

// ------------------------------------------------------------------ transports

interface Client {
  socket: WebSocket;
  nodeId: string | null;
  lastReadingAt: number;
}

const clients = new Set<Client>();

function send(socket: WebSocket, payload: unknown): void {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}

function broadcast(payload: unknown): void {
  for (const client of clients) send(client.socket, payload);
}

function broadcastPresence(): void {
  broadcast({ type: "presence", nodes: buildNodes() });
}

function authorised(url: URL, request: IncomingMessage): boolean {
  if (!TOKEN) return true;
  const header = request.headers["x-hub-token"];
  const provided =
    url.searchParams.get("token") ?? (typeof header === "string" ? header : "");
  return provided === TOKEN;
}

function json(response: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, x-hub-token",
    "access-control-allow-methods": "GET, POST, OPTIONS",
  });
  response.end(payload);
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("payload too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

async function serveStatic(pathname: string, response: ServerResponse): Promise<void> {
  const decoded = decodeURIComponent(pathname);
  const candidate = path.resolve(DIST, `.${decoded === "/" ? "/index.html" : decoded}`);
  const insideDist = candidate === DIST || candidate.startsWith(DIST + path.sep);

  let file = insideDist ? candidate : path.join(DIST, "index.html");
  try {
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
      "cache-control": file.endsWith("index.html")
        ? "no-cache"
        : "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    });
    response.end(body);
  } catch {
    // SPA fallback: an unknown path is a client route, not a 404.
    file = path.join(DIST, "index.html");
    try {
      const body = await readFile(file);
      response.writeHead(200, { "content-type": MIME[".html"] });
      response.end(body);
    } catch {
      response.writeHead(503, { "content-type": "text/plain; charset=utf-8" });
      response.end(
        "Dashboard build not found. Run `npm run build` before starting the hub.",
      );
    }
  }
}

// ----------------------------------------------------------------------- http

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "OPTIONS") {
    json(response, 204, {});
    return;
  }

  if (url.pathname === "/api/health") {
    if (!authorised(url, request)) {
      json(response, 401, { ok: false, error: "invalid token" });
      return;
    }
    const nodes = buildNodes();
    const count = readingCount.get() as unknown as { n: number };
    json(response, 200, {
      ok: true,
      service: "noise-nova-hub",
      nodes: nodes.length,
      readings: Number(count.n),
      uptimeSeconds: Math.round(process.uptime()),
    });
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    if (!authorised(url, request)) {
      json(response, 401, { ok: false, error: "invalid token" });
      return;
    }
  }

  if (url.pathname === "/api/nodes") {
    json(response, 200, { nodes: buildNodes() });
    return;
  }

  if (url.pathname === "/api/readings") {
    const limit = Math.min(2000, Math.max(1, Number(url.searchParams.get("limit") ?? "200")));
    const rows = recentReadings.all(limit) as unknown as DbRow[];
    json(response, 200, { readings: rows.map(rowToReading).reverse() });
    return;
  }

  if (url.pathname === "/api/ingest") {
    if (request.method !== "POST") {
      json(response, 405, { ok: false, error: "POST only" });
      return;
    }
    let payload: Record<string, unknown> = {};
    try {
      const raw = await readBody(request);
      if (raw.trim()) payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      json(response, 400, { ok: false, error: "malformed JSON body" });
      return;
    }
    // Query parameters are accepted so a constrained board can post without a
    // JSON encoder: /api/ingest?nodeId=esp32-a&rms=0.031
    for (const [key, value] of url.searchParams) {
      if (!(key in payload)) payload[key] = value;
    }
    const reading = normaliseReading(payload, {
      kind: "board",
      source: "esp32",
      nodeLabel: "ESP32 board",
    });
    if (!reading) {
      json(response, 400, { ok: false, error: "nodeId is required" });
      return;
    }
    persist(reading);
    touchPresence(reading);
    broadcast({ type: "reading", reading });
    broadcastPresence();
    json(response, 202, { ok: true, reading });
    return;
  }

  if (url.pathname === "/ws") {
    // WebSocket upgrade is handled below; a plain GET here is a mistake.
    json(response, 400, { ok: false, error: "expected WebSocket upgrade" });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    json(response, 405, { ok: false, error: "method not allowed" });
    return;
  }

  await serveStatic(url.pathname, response);
});

// ------------------------------------------------------------------ websocket

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (url.pathname !== "/ws" || !authorised(url, request)) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, request));
});

wss.on("connection", (socket: WebSocket) => {
  const client: Client = { socket, nodeId: null, lastReadingAt: 0 };
  clients.add(client);

  send(socket, {
    type: "snapshot",
    nodes: buildNodes(),
    readings: (recentReadings.all(SEED_LIMIT) as unknown as DbRow[])
      .map(rowToReading)
      .reverse(),
    serverTime: Date.now(),
  });

  socket.on("message", (raw) => {
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(raw.toString()) as Record<string, unknown>;
    } catch {
      return;
    }

    if (message.type === "ping") {
      send(socket, { type: "pong" });
      return;
    }

    if (message.type === "hello" && message.node && typeof message.node === "object") {
      const node = message.node as Record<string, unknown>;
      const nodeId = text(node.nodeId, "");
      if (!nodeId) return;
      client.nodeId = nodeId;
      presence.set(nodeId, {
        nodeId,
        nodeLabel: text(node.nodeLabel, nodeId),
        kind: KINDS.includes(node.kind as NodeKind) ? (node.kind as NodeKind) : "laptop",
        lastSeen: Date.now(),
      });
      broadcastPresence();
      return;
    }

    if (message.type === "reading") {
      const now = Date.now();
      // Hard ceiling of two readings per second per socket. A misbehaving client
      // cannot flood the database or starve other viewers.
      if (now - client.lastReadingAt < 450) return;
      client.lastReadingAt = now;

      const reading = normaliseReading(message.reading, {
        nodeId: client.nodeId ?? undefined,
        kind: "laptop",
        source: "browser-mic",
      });
      if (!reading) return;
      persist(reading);
      touchPresence(reading);
      broadcast({ type: "reading", reading });
    }
  });

  socket.on("close", () => {
    clients.delete(client);
  });

  socket.on("error", () => {
    clients.delete(client);
  });
});

// ----------------------------------------------------------------------- boot

function lanAddresses(): string[] {
  const found: string[] = [];
  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) found.push(entry.address);
    }
  }
  return found;
}

server.listen(PORT, "0.0.0.0", () => {
  const total = readingCount.get() as unknown as { n: number };
  const line = "─".repeat(58);
  console.log(line);
  console.log("  NOISE NOVA HUB");
  console.log(line);
  console.log(`  local        http://localhost:${PORT}`);
  for (const address of lanAddresses()) {
    console.log(`  network      http://${address}:${PORT}`);
  }
  console.log(`  database     ${DB_PATH}`);
  console.log(`  readings     ${Number(total.n)}`);
  console.log(`  token        ${TOKEN ? "required" : "open (local network only)"}`);
  console.log(line);
  for (const address of lanAddresses()) {
    console.log(`  pair phone   ${address}:${PORT}${TOKEN ? `#${TOKEN}` : ""}`);
  }
  console.log(line);
});

function shutdown(): void {
  console.log("\n  closing hub…");
  for (const client of clients) client.socket.close();
  wss.close();
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
