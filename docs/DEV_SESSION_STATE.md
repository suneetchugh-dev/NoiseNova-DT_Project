# Development Session State

Living memory for this repo. Update after every meaningful batch of work.

## Where this project lives

`C:\Users\krish\OneDrive\Desktop\(DT-IOT-Project)\Codebase`

It was originally under `...\(College-All)\#(Assignments)\...`. Vite cannot build from a path
containing `#`, so the project was moved to the Desktop. `scripts/build.mjs` still contains the
temp-mirror fallback for that case; on the current path it is a thin pass-through.

## Current status (2026-10-29)

| Area | State |
|---|---|
| Typecheck + production build | Passing (`npm run build`) |
| Logic self-checks | 15/15 passing (`npm run check`) |
| Hub REST + WS + SQLite | Running and verified with `curl` |
| Dashboard, history, nodes, settings | Implemented |
| PWA manifest, icons, service worker | Implemented |
| Capacitor config | Implemented; `android/` platform added |
| Android debug APK | Built at `android/app/build/outputs/apk/debug/app-debug.apk` (4.2 MB) |
| Deploy artefacts | Dockerfile, compose, Caddyfile, AWS guide, firewall script |
| Docs | PRD, architecture, phases, design system, this file |
| Repository | https://github.com/suneetchugh-dev/NoiseNova-DT_Project |

## Decisions already made (do not re-litigate without the user)

- **The phone is the edge node.** No ESP32 hardware exists; `/api/ingest` is the real,
  documented path for one later.
- **One hub process** serves web + REST + WS + SQLite. No Firebase, no auth, no cloud
  dependency for the demo.
- **The dB value is an estimate.** Calibration offset per device, labelled everywhere.
- **No raw audio** is stored or transmitted.
- **Monochrome + amber design.** No cyan/purple gradient, no emoji, no glass cards.
- **Deploy target:** one container on EC2 (Azure VM is a drop-in), Caddy for TLS, Cloudflare
  for DNS only. Domain plan: `noisenova.sahnirmaan.live`.
- **HUB_TOKEN is optional**, off by default, documented as the shared-network hardening step.

## Verified commands

```bash
npm run build      # tsc --noEmit && node scripts/build.mjs
npm run check      # 15 assertions over noise, csv, nodes
npm start          # build + hub on :8787
curl http://localhost:8787/api/health
curl -X POST "http://localhost:8787/api/ingest?nodeId=esp32-a&rms=0.05"
```

## Environment facts

- Node 24.14 (native TypeScript stripping + `node:sqlite` are required).
- Java 21 + Android SDK present at `%LOCALAPPDATA%\Android\Sdk`.
- Unused npm scripts must point at real files — `scripts/allow-firewall.ps1` now exists to
  back `npm run firewall`.

## Next steps

1. **Build the debug APK** (`npm run apk:build`) and install it on a phone. Check mic
   permission, pairing to the laptop IP, and a threshold notification.
2. **Run the two-device demo** on one Wi-Fi: laptop + phone, both in the roster.
3. **Optional hardware:** flash an ESP32 to POST `/api/ingest?nodeId=esp32-a&rms=…` and watch
   it appear as a board node.
4. **Optional deploy:** `cd deploy && docker compose up -d --build` on a VM; set
   `SITE_ADDRESS` and `HUB_TOKEN`; point Cloudflare DNS-only at the VM.
5. **Report/PPT:** capture screenshots of the dashboard, roster, alert log, history and the
   APK; use `docs/PRD.md` §6 metrics as the evaluation table.

## Known limitations to state in the viva

- Estimated dB, not calibrated SPL; two devices need separate calibration.
- Android captures only in the foreground (WebView pauses when backgrounded).
- LAN transport is plain HTTP/WS; TLS only when deployed behind Caddy.
- Optional shared token is the only authentication; the hub is not multi-tenant.
