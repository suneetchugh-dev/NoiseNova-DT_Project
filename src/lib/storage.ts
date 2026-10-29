import type { AlertEntry, NodeKind, Reading } from "./types.ts";

const PREFS_KEY = "nn_prefs_v1";
const ALERTS_KEY = "nn_alerts_v1";
const LOCAL_READINGS_KEY = "nn_readings_v1";
const HUB_KEY = "nn_hub_v1";
const CALIBRATION_KEY = "nn_calibration_v1";

export interface Prefs {
  nodeId: string;
  nodeLabel: string;
  kind: NodeKind;
  threshold: number;
  soundEnabled: boolean;
  pushEnabled: boolean;
  calibration: number;
}

export interface HubConfig {
  url: string;
  token: string;
}

const LOCAL_READING_CAP = 600;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private-mode failure: the app stays usable, history is ephemeral.
  }
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/** One stable identity per physical device, so two laptops never collide. */
export function ensureNodeId(): string {
  const existing = read<Partial<Prefs>>(PREFS_KEY, {});
  if (existing.nodeId) return existing.nodeId;
  const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const nodeId = `${isTouch ? "phone" : "laptop"}-${randomSuffix()}`;
  write(PREFS_KEY, { ...existing, nodeId });
  return nodeId;
}

export function defaultPrefs(): Prefs {
  const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  return {
    nodeId: ensureNodeId(),
    nodeLabel: isTouch ? "Android node" : "Laptop node",
    kind: isTouch ? "phone" : "laptop",
    threshold: 75,
    soundEnabled: true,
    pushEnabled: true,
    calibration: 0,
  };
}

export function loadPrefs(): Prefs {
  const stored = read<Partial<Prefs>>(PREFS_KEY, {});
  return { ...defaultPrefs(), ...stored, nodeId: stored.nodeId ?? ensureNodeId() };
}

export function savePrefs(prefs: Prefs): void {
  write(PREFS_KEY, prefs);
}

export function loadCalibration(): number {
  return read<number>(CALIBRATION_KEY, 0);
}

export function saveCalibration(offset: number): void {
  write(CALIBRATION_KEY, offset);
}

export function loadHubConfig(): HubConfig {
  return read<HubConfig>(HUB_KEY, { url: "", token: "" });
}

export function saveHubConfig(config: HubConfig): void {
  write(HUB_KEY, config);
}

export function clearHubConfig(): void {
  try {
    localStorage.removeItem(HUB_KEY);
  } catch {
    // ignore
  }
}

export function loadAlerts(): AlertEntry[] {
  return read<AlertEntry[]>(ALERTS_KEY, []);
}

export function saveAlerts(alerts: AlertEntry[]): void {
  write(ALERTS_KEY, alerts);
}

export function loadLocalReadings(): Reading[] {
  return read<Reading[]>(LOCAL_READINGS_KEY, []);
}

export function appendLocalReading(reading: Reading): Reading[] {
  const next = [...loadLocalReadings(), reading].slice(-LOCAL_READING_CAP);
  write(LOCAL_READINGS_KEY, next);
  return next;
}

export function clearLocalReadings(): void {
  try {
    localStorage.removeItem(LOCAL_READINGS_KEY);
  } catch {
    // ignore
  }
}
