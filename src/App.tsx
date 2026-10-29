import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MobileDock, Sidebar, TopBar, type Tab } from "./components/Nav";
import { PairHubDialog } from "./components/PairHubDialog";
import { Dashboard } from "./pages/Dashboard";
import { HistoryPage } from "./pages/HistoryPage";
import { NodesPage } from "./pages/NodesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { resolveHub, useHub } from "./lib/hub";
import {
  appendLocalReading,
  loadAlerts,
  loadCalibration,
  loadLocalReadings,
  loadPrefs,
  saveAlerts,
  saveCalibration,
  savePrefs,
  type Prefs,
} from "./lib/storage";
import { buildNodes } from "./lib/nodes";
import { average, formatShortTime, peakOf, statusFromDb } from "./lib/noise";
import {
  fireBreachNotification,
  hapticBreach,
  notificationPermissionGranted,
  requestNotificationPermission,
} from "./lib/native";
import { playBreachChime, playClick } from "./lib/sound";
import { useNoiseCapture } from "./lib/useNoiseCapture";
import {
  ALERT_COOLDOWN_MS,
  MAX_ALERTS,
  MAX_CHART_POINTS,
  type AlertEntry,
  type Reading,
} from "./lib/types";

export default function App() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [calibration, setCalibrationState] = useState<number>(() => loadCalibration());
  const [tab, setTab] = useState<Tab>("dashboard");
  const [alerts, setAlerts] = useState<AlertEntry[]>(() => loadAlerts());
  const [localReadings, setLocalReadings] = useState<Reading[]>(() => loadLocalReadings());
  const [selectedNodeId, setSelectedNodeId] = useState<string>(prefs.nodeId);
  const [pairingOpen, setPairingOpen] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [hubRev, setHubRev] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  /**
   * The capture loop reads the offset every frame, so calibration must reach it
   * through a ref: re-running `start` on every slider move would restart the
   * microphone stream.
   */
  const offsetRef = useRef(calibration);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const hub = useHub(prefs);
  const publishRef = useRef(hub.publish);
  publishRef.current = hub.publish;

  const liveSinceRef = useRef(0);
  const seenRef = useRef(new Set<string>());
  const lastAlertRef = useRef(new Map<string, number>());

  const evaluate = useCallback((reading: Reading) => {
    const key = `${reading.nodeId}:${reading.ts}`;
    if (seenRef.current.has(key)) return;
    if (seenRef.current.size > 5000) seenRef.current.clear();
    seenRef.current.add(key);

    // Readings replayed from the hub snapshot are history, not news. Alerting on
    // them would fire a burst every time a viewer reloads the page.
    if (reading.ts < liveSinceRef.current - 3000) return;

    const { threshold, pushEnabled } = prefsRef.current;
    if (reading.db <= threshold) return;

    const previous = lastAlertRef.current.get(reading.nodeId) ?? 0;
    if (reading.ts - previous < ALERT_COOLDOWN_MS) return;
    lastAlertRef.current.set(reading.nodeId, reading.ts);

    const alert: AlertEntry = {
      id: key,
      nodeId: reading.nodeId,
      nodeLabel: reading.nodeLabel,
      ts: reading.ts,
      db: reading.db,
      threshold,
      status: reading.status,
    };
    setAlerts((previousAlerts) => {
      const next = [alert, ...previousAlerts].slice(0, MAX_ALERTS);
      saveAlerts(next);
      return next;
    });

    playBreachChime();
    void hapticBreach();
    if (pushEnabled) {
      void fireBreachNotification(
        `${reading.nodeLabel} above ${threshold} dB`,
        `Estimated ${reading.db.toFixed(1)} dB, ${reading.status.toLowerCase()}.`,
      );
    }
  }, []);

  const onReading = useCallback(
    (db: number, peak: number, rms: number) => {
      const current = prefsRef.current;
      const reading: Reading = {
        nodeId: current.nodeId,
        nodeLabel: current.nodeLabel,
        kind: current.kind,
        ts: Date.now(),
        db,
        rms,
        peak,
        status: statusFromDb(db),
        threshold: current.threshold,
        source: current.kind === "phone" ? "android-mic" : "browser-mic",
      };
      setLocalReadings(appendLocalReading(reading));
      publishRef.current(reading);
      evaluate(reading);
    },
    [evaluate],
  );

  const capture = useNoiseCapture({ offsetRef, onReading });
  const { isListening, currentDb, peakDb, error: micError, start, stop } = capture;

  useEffect(() => {
    if (hub.status === "live") liveSinceRef.current = Date.now();
  }, [hub.status]);

  useEffect(() => {
    for (const reading of hub.readings) evaluate(reading);
  }, [hub.readings, evaluate]);

  useEffect(() => {
    void notificationPermissionGranted().then(setNotificationsGranted);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(id);
  }, []);

  const updatePrefs = useCallback((next: Prefs) => {
    setPrefs(next);
    savePrefs(next);
  }, []);

  const setCalibration = useCallback(
    (value: number) => {
      const clamped = Math.max(-20, Math.min(20, Math.round(value)));
      setCalibrationState(clamped);
      saveCalibration(clamped);
      offsetRef.current = clamped;
      setPrefs((previous) => {
        const next = { ...previous, calibration: clamped };
        savePrefs(next);
        return next;
      });
    },
    [],
  );

  const toggleCapture = useCallback(() => {
    playClick();
    if (isListening) {
      stop();
      return;
    }
    setSelectedNodeId(prefsRef.current.nodeId);
    if (!notificationsGranted) {
      void requestNotificationPermission().then(setNotificationsGranted);
    }
    void start();
  }, [isListening, notificationsGranted, start, stop]);

  const requestNotifications = useCallback(() => {
    void requestNotificationPermission().then((granted) => {
      setNotificationsGranted(granted);
      if (granted) {
        void fireBreachNotification("Noise Nova", "Threshold alerts are now enabled here.");
      }
    });
  }, []);

  const onPairingChanged = useCallback(() => {
    setHubRev((value) => value + 1);
    hub.reconnect();
  }, [hub]);

  const hubUrl = useMemo(() => resolveHub().url, [hubRev]);

  /** Union of this device's persisted samples and everything the hub has seen. */
  const feed = useMemo(() => {
    const merged = new Map<string, Reading>();
    for (const reading of localReadings) merged.set(`${reading.nodeId}:${reading.ts}`, reading);
    for (const reading of hub.readings) merged.set(`${reading.nodeId}:${reading.ts}`, reading);
    return [...merged.values()].sort((a, b) => a.ts - b.ts);
  }, [localReadings, hub.readings]);

  const nodes = useMemo(() => buildNodes(feed, hub.nodes, prefs), [feed, hub.nodes, prefs]);
  const selected = useMemo(
    () => nodes.find((node) => node.nodeId === selectedNodeId) ?? nodes[0],
    [nodes, selectedNodeId],
  );

  const points = useMemo(
    () =>
      feed
        .filter((reading) => reading.nodeId === selected.nodeId)
        .slice(-MAX_CHART_POINTS)
        .map((reading) => ({
          ts: reading.ts,
          db: reading.db,
          label: formatShortTime(reading.ts),
        })),
    [feed, selected.nodeId],
  );

  const selectedIsSelf = selected.nodeId === prefs.nodeId;
  const isMeasuring = selectedIsSelf ? isListening : selected.lastSeen > now - 8000;
  const db = selectedIsSelf && isListening ? currentDb : selected.db;
  const sessionPeak = Math.max(
    peakOf(points.map((point) => point.db)),
    selectedIsSelf && isListening ? peakDb : 0,
  );

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#08090B]">
      <Sidebar tab={tab} onTab={setTab} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar
          tab={tab}
          hubStatus={hub.status}
          nodeCount={nodes.length}
          isCapturing={isListening}
          onToggle={toggleCapture}
          onOpenPairing={() => setPairingOpen(true)}
        />

        <main className="min-h-0 flex-1 overflow-hidden">
          <div
            className="panel-scroll h-full overflow-y-auto px-3 pb-24 pt-3 md:px-5 md:pb-5 md:pt-4"
            data-lenis-prevent
          >
            {tab === "dashboard" ? (
              <Dashboard
                db={db}
                isActive={isMeasuring}
                peak={sessionPeak}
                threshold={prefs.threshold}
                onThreshold={(threshold) => updatePrefs({ ...prefs, threshold })}
                nodes={nodes}
                selected={selected}
                onSelectNode={setSelectedNodeId}
                selfNodeId={prefs.nodeId}
                points={points}
                average={average(points.map((point) => point.db))}
                alerts={alerts}
                onClearAlerts={() => {
                  setAlerts([]);
                  saveAlerts([]);
                }}
                hubStatus={hub.status}
                micError={micError}
                onOpenPairing={() => setPairingOpen(true)}
              />
            ) : null}

            {tab === "nodes" ? (
              <NodesPage
                nodes={nodes}
                selectedNodeId={selected.nodeId}
                onSelect={setSelectedNodeId}
                selfNodeId={prefs.nodeId}
                hubStatus={hub.status}
                onOpenPairing={() => setPairingOpen(true)}
              />
            ) : null}

            {tab === "history" ? <HistoryPage readings={feed} /> : null}

            {tab === "settings" ? (
              <SettingsPage
                prefs={prefs}
                onPrefs={updatePrefs}
                calibration={calibration}
                onCalibration={setCalibration}
                hubUrl={hubUrl}
                hubStatus={hub.status}
                notificationsGranted={notificationsGranted}
                onRequestNotifications={requestNotifications}
                onOpenPairing={() => setPairingOpen(true)}
              />
            ) : null}
          </div>
        </main>

        <MobileDock
          tab={tab}
          onTab={setTab}
          isCapturing={isListening}
          onToggle={toggleCapture}
        />
      </div>

      <PairHubDialog
        open={pairingOpen}
        onClose={() => setPairingOpen(false)}
        onChanged={onPairingChanged}
      />
    </div>
  );
}
