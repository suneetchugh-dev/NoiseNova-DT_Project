# PRD — Noise Nova

**IoT-Based Environmental Noise Monitoring System**
Status: implemented (v1.0) · Team: NIET, 2026 · Document owner: Saurabh Kumar

---

## 1. Executive summary

Noise complaints in libraries, classrooms, wards and offices are usually handled by a person
asking for quiet, after the fact. Commercial sound-level monitoring is expensive and closed.
Noise Nova turns devices the team already owns — an Android phone and a laptop — into
microphone edge nodes, streams their levels to a hub on the same Wi-Fi, and shows one live
dashboard with threshold alerts.

The project brief describes a sensor → ESP32 → LEDs/buzzer → backend → dashboard chain. No
hardware was available, so the chain is preserved honestly: the **phone is the edge node**
(microphone + Wi-Fi + notification = sensor + radio + buzzer), the **hub is the backend and
database**, and a real `POST /api/ingest` endpoint accepts ESP32-shaped readings so the
original hardware can be attached later without changing the software.

**Value proposition:** a working, defensible multi-node noise monitor with zero cloud
dependency, zero accounts, and a hardware upgrade path that is already implemented.

---

## 2. Users and jobs

| Persona | Device | Job | Friction the design removes |
|---|---|---|---|
| **Room operator** (librarian, teacher, warden) | Phone, installed PWA | Start monitoring, see the level, be told when it is too loud | One Start button, no login, works offline on the LAN |
| **Facilities / lab admin** | Laptop dashboard | Compare nodes, adjust thresholds, export a record | Node roster, per-node threshold presets, CSV |
| **Project examiner / reviewer** | Browser | Verify the system is real and understand its limits | Live microphone path, visible estimate label, live ESP32 endpoint |
| **Future hardware owner** | ESP32 | Post readings into the same dashboard | Documented ingest contract, no client change needed |

Journey: open the app → press **Start monitoring** → allow microphone → read the meter and
chart → pair the hub if on a phone → adjust the threshold → acknowledge/clear alerts → export
history as CSV.

---

## 3. Functional requirements

### 3.1 Capture
- Request `getUserMedia` only from a user gesture; disable echo cancellation, noise
  suppression and auto-gain so the measured signal is not silently reshaped.
- Compute RMS over a 2048-sample time-domain block; map with `20·log10(rms) + 90`, add the
  per-device calibration offset, clamp to 30–120 dB.
- Update the readout at ~12 Hz (smoothed), emit one persisted reading per second.
- Release every media track and close the `AudioContext` on stop and on unmount.
- Classify and display permission, missing-device, busy, insecure-context and unsupported
  errors with a concrete next step.

### 3.2 Display
- Circular meter with status band (QUIET ≤ 40, MODERATE ≤ 65, LOUD ≤ 80, VERY LOUD > 80).
- Four metric cards: current, session average, peak, alert count.
- 60-point live area chart with the threshold drawn as a reference line.
- Threshold control 40–100 dB, default 75, presets Library 40 / Office 60 / Classroom 70 /
  Factory 85.
- Node roster merging local and hub-known nodes, with freshness and source labels.
- History table of the current session plus everything the hub returns, with CSV export.

### 3.3 Alerts
- Fire when a reading exceeds the active threshold, at most once per node per 10 s.
- Ignore hub snapshot replay (historical readings) so reloads do not re-alert.
- In-app log capped at 50; audible chime; native notification and vibration on Android when
  permission is granted.

### 3.4 Sync
- Each device has a stable id and label; it publishes `hello`, then `reading` over WebSocket.
- Hub recomputes dB from RMS when present, assigns status itself, persists, and broadcasts.
- Dashboard reconnects with exponential backoff and a 20 s heartbeat.
- Pairing accepts `host:port` or `host:port#token`, probes `/api/health`, and persists.

### 3.5 Persistence and export
- Hub stores readings in SQLite (WAL) with indexes on time and node.
- Client keeps preferences, alerts, calibration and up to 600 readings in `localStorage`.
- CSV export quotes every field and escapes quotes so labels containing commas cannot corrupt
  the file.

### 3.6 Platforms
- Browser dashboard, installable PWA (shell cached; `/api` and `/ws` never cached).
- Android APK via Capacitor, bundled assets served from `https://localhost`.
- Single-container deployment behind Caddy.

---

## 4. Non-goals (v1)

- Calibrated SPL certification, A/C weighting, octave-band analysis, Leq/L10 metrics.
- Raw audio recording, upload, playback or speech analysis.
- User accounts, roles, per-user data isolation, paid services.
- Simulated/mock live data presented as measurement.
- Background monitoring while the Android app is not in the foreground.
- Multi-tenant internet hosting, horizontal scaling, time-series retention policies.

---

## 5. Constraints

- **Network:** demo must work with no internet. Phone → laptop over one Wi-Fi network;
  client isolation on guest networks is documented with a hotspot fallback.
- **Hardware:** no ESP32 in hand; the ingest contract is implemented and tested with `curl`.
- **Privacy:** no audio leaves the device; only numeric readings and node metadata.
- **Security:** shared-token option only; the hub is not exposed to the public internet
  without TLS and a token.
- **Performance:** dashboard interaction stays responsive on a mid-range phone; chart data is
  capped at 60 points and history at 600 local readings.
- **Accuracy:** every displayed value is labelled an estimate and carries a calibration
  control.

---

## 6. Success metrics

| Metric | Target | How verified |
|---|---|---|
| Live path is real | 1 s cadence from microphone to dashboard | Two devices, one room, watch both |
| Logic correctness | 15/15 self-checks pass | `npm run check` |
| Type and build health | Zero TypeScript errors; production bundle builds | `npm run build` |
| Alert discipline | No more than one alert per node per 10 s | Sustained tone above threshold |
| Resource hygiene | Mic indicator turns off after Stop | OS microphone indicator |
| Restart safety | Hub restart keeps stored readings | `npm run build` + restart, check history |
| Honesty | Every dB surface shows "estimated" + calibration | UI review |

---

## 7. Team and ownership

| Name | Roll no. | Role in this build |
|---|---|---|
| Saurabh Kumar | 2401331520167 | Full-stack & integration: hub, dashboard state, sync, deployment |
| Vansh Sharma | 2401331520202 | Android edge app: Capacitor shell, permissions, notifications, APK |
| Suneet Chugh | 2401331520190 | Ingest & device layer: ESP32 endpoint contract, node identity, calibration |
| Sarika Chaudhary | 2401331520166 | Documentation, testing, self-checks, report |
| Taniya Bansal | 2401331520192 | Presentation, diagrams, research, demo script |

The original brief assigns hardware and embedded roles. Because no hardware was procured,
those responsibilities were redirected to the Android edge app and the ingest/sync layer,
while keeping the ESP32 contract implemented so the hardware roles remain valid if a board is
added.
