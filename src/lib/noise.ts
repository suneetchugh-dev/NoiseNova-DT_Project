/**
 * Noise mathematics and classification.
 *
 * The value we display is an ESTIMATE derived from microphone RMS, not a
 * calibrated sound-pressure-level reading. `dbFromRms` maps digital full-scale
 * amplitude onto a nominal 30-120 dB window using a fixed device offset plus a
 * user calibration correction. Two devices in the same room will not agree
 * until each is calibrated; the UI says so next to every reading.
 */

export const DB_FLOOR = 30;
export const DB_CEILING = 120;

export type NoiseStatus = "QUIET" | "MODERATE" | "LOUD" | "VERY LOUD";

export type Severity = "quiet" | "moderate" | "loud" | "critical";

export interface StatusMeta {
  label: NoiseStatus;
  severity: Severity;
  /** Tailwind-ready hex used by charts, meter arc and badges. */
  color: string;
  /** Short, concrete copy. No adjectives that promise accuracy. */
  copy: string;
}

export const STATUS_META: Record<NoiseStatus, StatusMeta> = {
  QUIET: {
    label: "QUIET",
    severity: "quiet",
    color: "#2DD4BF",
    copy: "Below conversational level. Suitable for reading and focused work.",
  },
  MODERATE: {
    label: "MODERATE",
    severity: "moderate",
    color: "#94A3B8",
    copy: "Normal conversation range. Non-intrusive background activity.",
  },
  LOUD: {
    label: "LOUD",
    severity: "loud",
    color: "#D9A353",
    copy: "Raised voices or sustained activity. Concentration begins to drop.",
  },
  "VERY LOUD": {
    label: "VERY LOUD",
    severity: "critical",
    color: "#F43F5E",
    copy: "Sustained exposure is uncomfortable. Reduce level or leave the area.",
  },
};

/** Fixed bands, shared by meter, chart, node list and history table. */
export function statusFromDb(db: number): NoiseStatus {
  if (db <= 40) return "QUIET";
  if (db <= 65) return "MODERATE";
  if (db <= 80) return "LOUD";
  return "VERY LOUD";
}

export function severityColor(db: number): string {
  return STATUS_META[statusFromDb(db)].color;
}

/** Root mean square of a time-domain sample block, in 0..1 full-scale units. */
export function rmsFromSamples(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const v = samples[i]!;
    sum += v * v;
  }
  return Math.sqrt(sum / samples.length);
}

/**
 * 20*log10(rms) + 90 is the mapping fixed in the project plan. A silent block
 * has no logarithm, so it is pinned to the floor instead of returning -Infinity.
 * `offset` is the per-device calibration correction in dB.
 */
export function dbFromRms(rms: number, offset = 0): number {
  if (!Number.isFinite(rms) || rms <= 1e-7) return DB_FLOOR;
  const raw = 20 * Math.log10(rms) + 90 + offset;
  return clampDb(raw);
}

export function clampDb(value: number): number {
  if (!Number.isFinite(value)) return DB_FLOOR;
  return Math.min(DB_CEILING, Math.max(DB_FLOOR, value));
}

/** Exponential smoothing so the meter reads like an instrument, not a seizure. */
export function smooth(previous: number, next: number, alpha = 0.22): number {
  return previous + (next - previous) * alpha;
}

export function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

export function peakOf(values: readonly number[]): number {
  let peak = 0;
  for (const v of values) if (v > peak) peak = v;
  return peak;
}

export interface ThresholdPreset {
  id: string;
  label: string;
  value: number;
  detail: string;
}

/** Presets fixed by the project plan. */
export const THRESHOLD_PRESETS: readonly ThresholdPreset[] = [
  { id: "library", label: "Library", value: 40, detail: "Silent study zones" },
  { id: "office", label: "Office", value: 60, detail: "Focused desk work" },
  { id: "classroom", label: "Classroom", value: 70, detail: "Instruction in progress" },
  { id: "factory", label: "Factory", value: 85, detail: "Industrial floor" },
] as const;

export const THRESHOLD_RANGE = { min: 40, max: 100 } as const;

export function formatClock(ts: number): string {
  const d = new Date(ts);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function formatShortTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const date = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${date} ${formatClock(ts)}`;
}

/** One decimal place, always — keeps the readout from jittering in width. */
export function formatDb(value: number): string {
  return value.toFixed(1);
}
