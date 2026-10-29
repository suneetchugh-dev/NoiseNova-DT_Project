import { useCallback, useEffect, useRef, useState } from "react";
import { dbFromRms, rmsFromSamples, smooth } from "./noise.ts";

export type MicError =
  | "denied"
  | "unavailable"
  | "in-use"
  | "insecure"
  | "unsupported"
  | "unknown";

export interface CaptureOptions {
  /** Applied to every dB computation. Changed live from the calibration control. */
  offsetRef: { current: number };
  /** Called at most once per second with a stable reading. */
  onReading: (db: number, peak: number, rms: number) => void;
}

export interface CaptureState {
  isListening: boolean;
  currentDb: number;
  peakDb: number;
  error: MicError | null;
  start: () => Promise<void>;
  stop: () => void;
}

const SAMPLE_INTERVAL_MS = 1000;
const UI_INTERVAL_MS = 80;

function classifyError(err: unknown): MicError {
  const name = err instanceof Error ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "unavailable";
  if (name === "NotReadableError" || name === "AbortError") return "in-use";
  return "unknown";
}

/**
 * Owns the microphone stream and the whole Web Audio graph.
 *
 * Every resource acquired in `start` is released in `stop` and in the unmount
 * cleanup: the rAF loop is cancelled, every MediaStreamTrack is stopped, and the
 * AudioContext is closed. Leaving any of those alive keeps the OS microphone
 * indicator lit after the user presses stop, which reads as a privacy bug.
 */
export function useNoiseCapture({ offsetRef, onReading }: CaptureOptions): CaptureState {
  const [isListening, setIsListening] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [error, setError] = useState<MicError | null>(null);

  const contextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedRef = useRef(0);
  const peakRef = useRef(0);
  const lastEmitRef = useRef(0);
  const lastUiRef = useRef(0);
  const onReadingRef = useRef(onReading);
  onReadingRef.current = onReading;

  const teardown = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    analyserRef.current = null;
    bufferRef.current = null;
    const ctx = contextRef.current;
    contextRef.current = null;
    if (ctx && ctx.state !== "closed") void ctx.close().catch(() => undefined);
  }, []);

  const stop = useCallback(() => {
    teardown();
    smoothedRef.current = 0;
    peakRef.current = 0;
    lastEmitRef.current = 0;
    lastUiRef.current = 0;
    setCurrentDb(0);
    setPeakDb(0);
    setIsListening(false);
  }, [teardown]);

  const start = useCallback(async () => {
    if (!window.isSecureContext) {
      setError("insecure");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("unsupported");
      return;
    }

    setError(null);
    teardown();

    try {
      // Measurement fidelity: browser DSP would silently reshape the signal we
      // are trying to measure, so all three processors are explicitly disabled.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });
      streamRef.current = stream;

      const ctx = new AudioContext({ latencyHint: "interactive" });
      contextRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      // Deliberately not connected to ctx.destination — monitoring the mic in
      // the speakers creates feedback and is never what the operator wants.
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));

      smoothedRef.current = 0;
      peakRef.current = 0;
      lastEmitRef.current = 0;
      lastUiRef.current = 0;
      setIsListening(true);

      const tick = () => {
        const analyserNode = analyserRef.current;
        const buffer = bufferRef.current;
        const c = contextRef.current;
        if (!analyserNode || !buffer || !c) return;

        analyserNode.getFloatTimeDomainData(buffer);
        const rms = rmsFromSamples(buffer);
        const instantaneous = dbFromRms(rms, offsetRef.current);

        smoothedRef.current =
          smoothedRef.current === 0
            ? instantaneous
            : smooth(smoothedRef.current, instantaneous);
        const nextPeak = Math.max(smoothedRef.current, peakRef.current);
        peakRef.current = nextPeak;

        const now = performance.now();
        // Repaint the readout at ~12 Hz, not once per animation frame: the value
        // is exponentially smoothed anyway and a 60 Hz state update re-renders the
        // whole dashboard for a change nobody can see.
        if (now - lastUiRef.current >= UI_INTERVAL_MS) {
          lastUiRef.current = now;
          setCurrentDb(smoothedRef.current);
          setPeakDb(nextPeak);
        }

        if (now - lastEmitRef.current >= SAMPLE_INTERVAL_MS) {
          lastEmitRef.current = now;
          onReadingRef.current(
            Number(smoothedRef.current.toFixed(1)),
            Number(nextPeak.toFixed(1)),
            Number(rms.toFixed(6)),
          );
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setError(classifyError(err));
      teardown();
      setIsListening(false);
    }
  }, [offsetRef, teardown]);

  useEffect(() => teardown, [teardown]);

  return { isListening, currentDb, peakDb, error, start, stop };
}

export const MIC_ERROR_COPY: Record<MicError, { title: string; body: string }> = {
  denied: {
    title: "Microphone permission denied",
    body: "Allow microphone access in the browser site settings (or the Android app permissions), then press Start again.",
  },
  unavailable: {
    title: "No microphone found",
    body: "No input device is available to the browser. Connect a microphone and reload.",
  },
  "in-use": {
    title: "Microphone is busy",
    body: "Another application is holding the input device. Close it and press Start again.",
  },
  insecure: {
    title: "Insecure context",
    body: "Microphone capture requires HTTPS or localhost. Open the dashboard on localhost or over TLS.",
  },
  unsupported: {
    title: "Capture unsupported",
    body: "This browser does not expose getUserMedia. Use a current Chrome, Edge or Firefox build.",
  },
  unknown: {
    title: "Microphone could not start",
    body: "The capture graph failed to initialise. Reload the page and try again.",
  },
};
