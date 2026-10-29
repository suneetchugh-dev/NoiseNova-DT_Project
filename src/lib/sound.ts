/**
 * Tactile audio feedback, synthesised with the Web Audio API.
 *
 * No .mp3 assets, no audio pool: two short oscillator envelopes are cheaper than
 * an HTTP request and cannot 404 at demo time. Mute state persists on the device.
 */

let context: AudioContext | null = null;
const MUTE_KEY = "nn_sound_muted";

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    try {
      context = new AudioContext({ latencyHint: "interactive" });
    } catch {
      return null;
    }
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) !== "true";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, enabled ? "false" : "true");
  } catch {
    // ignore
  }
}

function blip(frequency: number, duration: number, volume: number, type: OscillatorType) {
  const audio = ctx();
  if (!audio) return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playClick(): void {
  if (!soundEnabled()) return;
  blip(1180, 0.045, 0.055, "square");
}

export function playBreachChime(): void {
  if (!soundEnabled()) return;
  blip(720, 0.14, 0.07, "triangle");
  window.setTimeout(() => blip(540, 0.18, 0.06, "triangle"), 120);
}
