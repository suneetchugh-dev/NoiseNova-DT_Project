import type { NoiseStatus } from "./noise";

export interface Reading {
  nodeId: string;
  nodeLabel: string;
  kind: NodeKind;
  /** Epoch milliseconds. */
  ts: number;
  /** Estimated dB, 30-120. */
  db: number;
  rms: number;
  /** Instantaneous peak dB observed inside the reporting window. */
  peak: number;
  status: NoiseStatus;
  threshold: number;
  /** Where the number came from. Never "sensor" unless a real ESP32 posted it. */
  source: SourceKind;
}

export type NodeKind = "laptop" | "phone" | "board";
export type SourceKind = "browser-mic" | "android-mic" | "esp32";

export const SOURCE_LABEL: Record<SourceKind, string> = {
  "browser-mic": "Browser microphone",
  "android-mic": "Android microphone",
  esp32: "ESP32 board",
};

export interface NodeSummary {
  nodeId: string;
  nodeLabel: string;
  kind: NodeKind;
  lastSeen: number;
  db: number;
  status: NoiseStatus;
  source: SourceKind;
  readings: number;
}

export interface AlertEntry {
  id: string;
  nodeId: string;
  nodeLabel: string;
  ts: number;
  db: number;
  threshold: number;
  status: NoiseStatus;
}

export type HubStatus = "connecting" | "live" | "offline";

export interface SnapshotMessage {
  type: "snapshot";
  nodes: NodeSummary[];
  readings: Reading[];
  serverTime: number;
}

export interface ReadingMessage {
  type: "reading";
  reading: Reading;
}

export interface PresenceMessage {
  type: "presence";
  nodes: NodeSummary[];
}

export type ServerMessage = SnapshotMessage | ReadingMessage | PresenceMessage;

export interface ClientReadingMessage {
  type: "reading";
  reading: Reading;
}

export const MAX_CHART_POINTS = 60;
export const MAX_ALERTS = 50;
export const ALERT_COOLDOWN_MS = 10_000;
