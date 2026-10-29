# AGENTS.md — Noise Nova

Rules for any agent working in this repository. Read `docs/DEV_SESSION_STATE.md` first; it
records what is already built and what is deliberately out of scope.

## Source of truth

- `docs/PRD.md` — scope and non-goals. If a request contradicts it, say so before coding.
- `docs/ARCHITECTURE.md` — topology, schemas, API contracts, security boundaries.
- `docs/UI_DESIGN_SYSTEM.md` — the enforced visual contract.
- `docs/PHASES.md` — build order and checkpoints.

Do not invent features that are not in the PRD. Do not add Firebase, authentication, a second
server process, or a different database without an explicit decision from the user.

## Invariants (breaking any of these is a bug)

1. **The reading is an estimate.** Any UI that shows a dB number also shows that it is
   estimated; calibration stays reachable from Settings.
2. **No raw audio leaves the device.** Only numeric readings and node metadata are persisted
   or transmitted.
3. **The server validates.** `/api/ingest` and `/ws` rebuild fields; dB is recomputed from
   `rms` when present; status is derived server-side.
4. **Capture is cleaned up.** Every `MediaStreamTrack` is stopped and the `AudioContext` is
   closed on stop *and* on unmount.
5. **No simulated live data.** Demo values must be labelled; nothing random may be presented
   as a measurement.
6. **One origin.** The hub serves `dist/`, `/api` and `/ws`. Do not split them across hosts.
7. **Static paths stay inside `dist/`.** Keep the traversal guard in `serveStatic`.
8. **PWA cache excludes `/api` and `/ws`.** A stale reading must never look live.

## Commands

```bash
npm run build      # tsc --noEmit + production bundle
npm run check      # 15 self-checks; must stay green
npm run dev        # hub + Vite
npm start          # build + hub on :8787
npm run cap:sync   # build + copy assets into android/
npm run apk:build  # debug APK
npm run firewall   # allow inbound TCP 8787 on Private networks (Windows)
```

Node 24+ is required (`node:sqlite`, native `.ts` stripping). Do not introduce a transpiler for
the server.

## Patterns to follow

- Pure logic lives in `src/lib/*` and is importable by Node (`.ts` extensions on imports).
- Components receive data and callbacks; no component opens its own microphone or socket.
- State that must survive reload goes through `src/lib/storage.ts` with a cap.
- Copy is concrete and names the fix; no "Something went wrong".
- Styling uses the tokens in `src/index.css`; colour only classifies severity.
- One integration point per concern: `useNoiseCapture` for audio, `useHub` for sync,
  `native.ts` for platform APIs.

## Git and verification

- One logical change per commit; never commit `.env`, `data/*.db`, `dist/`, `android/build/`
  or an APK.
- Before claiming completion run `npm run build` **and** `npm run check`, and for server work
  exercise `/api/health`, `/api/ingest` and `/api/readings` with `curl`.
- Report what was verified, what was not, and any limitation you introduced.

## When in doubt

Ask. A wrong assumption about the microphone graph, the dB mapping or the sync model costs
more than one question.
