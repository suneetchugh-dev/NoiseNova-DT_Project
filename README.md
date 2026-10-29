# Noise Nova

Environmental noise monitoring across microphone edge nodes — a hub, a dashboard, a PWA and
an Android edge app. Built as a college IoT project where the phone **is** the sensor: no
microphone is simulated, no reading is invented, and the ESP32 ingestion path is real and
documented for the day the hardware arrives.

> The displayed level is an **estimate** derived from microphone RMS (`20·log10(rms) + 90`
> plus a per-device calibration offset). It is not a calibrated SPL measurement. Every screen
> that shows a number labels it as an estimate.

---

## What is in the box

| Piece | Path | What it does |
|---|---|---|
| Hub | `server/index.ts` | One Node process: serves `dist/`, REST API, WebSocket fan-out, SQLite store |
| Dashboard | `src/` | Live meter, 60-point chart, alert log, node roster, session history, CSV export |
| PWA | `public/manifest.webmanifest`, `public/sw.js` | Installable app shell; live readings are never cached |
| Android app | `android/` (Capacitor 8) | Bundled WebView app with mic capture, local notifications and haptics |
| Deploy | `deploy/` | Single-container Docker image, compose + Caddy TLS for EC2/Lightsail/Azure |
| Checks | `scripts/selfcheck.mjs` | 15 assertions over RMS, dB mapping, status bands, CSV, node merge |

## Requirements

- **Node 24+** — the hub uses `node:sqlite` and runs TypeScript natively, no build step.
- Chrome/Edge/Firefox for the dashboard (microphone requires HTTPS or `localhost`).
- Optional: Android Studio + JDK 21 for the APK.

## Run it

```bash
npm install
npm run build        # typecheck + bundle dist/
npm start            # hub on http://localhost:8787
```

Development (Vite HMR + hub together):

```bash
npm run dev          # dashboard http://localhost:5173, hub http://localhost:8787
```

The hub prints every LAN address it can be reached on, plus the exact pairing string:

```
  pair phone   192.168.1.42:8787
```

Open that address on the phone (PWA) or type it into the app's **Pair hub** screen.

### Phones cannot reach the laptop?

1. Both devices on the **same** Wi-Fi. Guest networks isolate clients and will silently fail.
2. Allow the port once: `npm run firewall` (adds an inbound TCP 8787 rule for Private networks).
3. Fallback that always works at a demo: enable the laptop's mobile hotspot and join it.

## Verify it works

```bash
npm run check        # 15 logic assertions, no framework
curl http://localhost:8787/api/health
curl -X POST "http://localhost:8787/api/ingest?nodeId=esp32-a&rms=0.05"
curl "http://localhost:8787/api/readings?limit=5"
```

A reading posted through `/api/ingest` appears on the dashboard as an **ESP32 board** node
within a second. That is the hardware path, live, without hardware.

## Android app

```bash
npm run cap:sync     # build + copy web assets into the native project
npm run apk:build    # assembleDebug -> android/app/build/outputs/apk/debug/app-debug.apk
npm run apk:open     # open the project in Android Studio
```

The APK serves its own bundled UI from `https://localhost` (a secure context, so
`getUserMedia` is allowed) and talks to the hub over `ws://<lan-ip>:8787`. The hub address is
not compiled in — pair once, it is remembered.

On Android 13+ the app asks for notification permission on the first Start. Threshold
breaches produce a high-importance notification with vibration; the log stays in-app.

## Honest limitations

- **Estimated dB.** Consumer microphones are not sound-level meters. Two devices in the same
  room can differ by 15–25 dB until each is calibrated (`Settings → Calibration`).
- **Foreground monitoring on Android.** Android pauses WebView microphone capture when the app
  is backgrounded. A foreground service is out of scope.
- **No authentication.** The hub is designed for a trusted LAN. Set `HUB_TOKEN` in `.env` to
  require a shared token on ingest and socket connections; the pairing string then becomes
  `192.168.1.42:8787#token`.
- **No raw audio is ever stored or transmitted.** Only numbers leave the device.

## Configuration

Copy `.env.example` to `.env`:

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `8787` | Hub port, bound to `0.0.0.0` |
| `HUB_TOKEN` | empty | Shared token for ingest + WebSocket |
| `DB_PATH` | `./data/noise-nova.db` | SQLite file |
| `VITE_HUB_URL` | empty | Baked-in hub address for the APK build |

## Deploy

```bash
cd deploy
SITE_ADDRESS=noisenova.example.com docker compose up -d --build
```

`deploy/DEPLOY_AWS.md` covers the EC2 (or Lightsail/Azure VM) walkthrough, Cloudflare DNS
caveats and the token setup. The LAN demo and the deployed instance run the exact same image.

## Documentation

- `docs/PRD.md` — problem, users, requirements, non-goals
- `docs/ARCHITECTURE.md` — topology, schemas, API contracts, security boundaries
- `docs/PHASES.md` — build order, checkpoints, current status
- `docs/UI_DESIGN_SYSTEM.md` — the visual contract actually implemented
- `docs/DEV_SESSION_STATE.md` — what is done, what is next
- `AGENTS.md` — rules for any agent working in this repo
- `docs/reference/` — the source design system and agent rules this project follows

## Repository

<https://github.com/suneetchugh-dev/NoiseNova-DT_Project>

```bash
git clone https://github.com/suneetchugh-dev/NoiseNova-DT_Project.git
```
