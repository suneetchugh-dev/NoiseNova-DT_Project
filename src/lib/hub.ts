import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ClientReadingMessage,
  HubStatus,
  NodeSummary,
  Reading,
  ServerMessage,
} from "./types.ts";
import { loadHubConfig, loadPrefs, type Prefs } from "./storage.ts";

/** `192.168.1.42:8787` or `https://host#token` both become a usable base URL. */
export function normaliseHubUrl(input: string): { url: string; token: string } {
  let raw = input.trim();
  let token = "";
  const hash = raw.indexOf("#");
  if (hash >= 0) {
    token = raw.slice(hash + 1).trim();
    raw = raw.slice(0, hash).trim();
  }
  if (!raw) return { url: "", token };
  if (!/^https?:\/\//i.test(raw)) raw = `http://${raw}`;
  raw = raw.replace(/\/+$/, "");
  try {
    const parsed = new URL(raw);
    return { url: parsed.origin, token };
  } catch {
    return { url: "", token };
  }
}

export function toSocketUrl(base: string, token: string): string {
  const ws = base.replace(/^http/i, "ws");
  return token ? `${ws}/ws?token=${encodeURIComponent(token)}` : `${ws}/ws`;
}

/**
 * Resolution order: explicit pairing, then build-time env, then same-origin when
 * the hub is serving this page, then localhost for the Vite dev server.
 */
export function resolveHub(): { url: string; token: string } {
  const stored = loadHubConfig();
  if (stored.url) return stored;

  const env = import.meta.env.VITE_HUB_URL ?? "";
  if (env) return normaliseHubUrl(env);

  const { protocol, hostname, port, origin } = window.location;
  const isDevServer = port === "5173" || port === "4173";
  if (!isDevServer && /^https?:$/.test(protocol)) {
    return { url: origin, token: "" };
  }
  if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
    return { url: `${protocol}//${hostname}${port ? `:${port}` : ""}`, token: "" };
  }
  return { url: "http://localhost:8787", token: "" };
}

export interface HubApi {
  status: HubStatus;
  nodes: NodeSummary[];
  readings: Reading[];
  error: string | null;
  publish: (reading: Reading) => void;
  reconnect: () => void;
}

const SEED_LIMIT = 240;

export function useHub(prefs: Prefs, enabled = true): HubApi {
  const [status, setStatus] = useState<HubStatus>("connecting");
  const [nodes, setNodes] = useState<NodeSummary[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const closedByUsRef = useRef(false);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const connect = useCallback(() => {
    const { url, token } = resolveHub();
    if (!url) {
      setStatus("offline");
      setError("No hub address configured.");
      return;
    }

    closedByUsRef.current = false;
    setStatus((s) => (s === "live" ? s : "connecting"));

    let socket: WebSocket;
    try {
      socket = new WebSocket(toSocketUrl(url, token));
    } catch {
      setStatus("offline");
      setError("Hub address is not a valid WebSocket URL.");
      return;
    }
    socketRef.current = socket;

    socket.onopen = () => {
      retryRef.current = 0;
      setStatus("live");
      setError(null);
      const p = prefsRef.current;
      socket.send(
        JSON.stringify({
          type: "hello",
          node: {
            nodeId: p.nodeId,
            nodeLabel: p.nodeLabel,
            kind: p.kind,
          },
        }),
      );
      if (heartbeatRef.current !== null) window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = window.setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 20_000);
    };

    socket.onmessage = (event) => {
      let message: ServerMessage | { type: "pong" };
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (message.type === "snapshot") {
        setNodes(message.nodes);
        setReadings(message.readings.slice(-SEED_LIMIT));
      } else if (message.type === "reading") {
        setReadings((prev) => [...prev, message.reading].slice(-SEED_LIMIT));
      } else if (message.type === "presence") {
        setNodes(message.nodes);
      }
    };

    socket.onerror = () => {
      setError("Could not reach the hub.");
    };

    socket.onclose = () => {
      if (heartbeatRef.current !== null) {
        window.clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      if (closedByUsRef.current) return;
      setStatus("offline");
      retryRef.current += 1;
      const delay = Math.min(10_000, 800 * 2 ** Math.min(retryRef.current, 4));
      retryTimerRef.current = window.setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      closedByUsRef.current = true;
      if (retryTimerRef.current !== null) window.clearTimeout(retryTimerRef.current);
      if (heartbeatRef.current !== null) window.clearInterval(heartbeatRef.current);
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket && socket.readyState <= WebSocket.OPEN) socket.close();
    };
  }, [connect, enabled]);

  const publish = useCallback((reading: Reading) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const message: ClientReadingMessage = { type: "reading", reading };
    socket.send(JSON.stringify(message));
  }, []);

  const reconnect = useCallback(() => {
    closedByUsRef.current = true;
    const socket = socketRef.current;
    if (socket) socket.close();
    window.setTimeout(() => {
      retryRef.current = 0;
      connect();
    }, 120);
  }, [connect]);

  return { status, nodes, readings, error, publish, reconnect };
}

export interface HubHealth {
  ok: boolean;
  host: string;
  nodes: number;
  readings: number;
}

export async function probeHub(url: string, token: string): Promise<HubHealth> {
  const target = token
    ? `${url}/api/health?token=${encodeURIComponent(token)}`
    : `${url}/api/health`;
  const response = await fetch(target, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Hub responded ${response.status}`);
  const body = (await response.json()) as { nodes?: number; readings?: number };
  return {
    ok: true,
    host: url,
    nodes: body.nodes ?? 0,
    readings: body.readings ?? 0,
  };
}

/** Used by the node screen to know its own label without re-reading storage. */
export function currentPrefs(): Prefs {
  return loadPrefs();
}
