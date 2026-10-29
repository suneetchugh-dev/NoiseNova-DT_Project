# UI Design System — Noise Nova

The product is a measuring instrument, not a landing page. The interface is monochrome
obsidian with one amber accent; colour appears only when it classifies a noise level. No
gradients, no neon, no emoji, no pulsing dots, no glassmorphism.

The full source system this follows is in `docs/reference/GRAPHACKS_UI_DESIGN_SYSTEM.md` and
`docs/reference/GRAPHACKS_AGENTS.md`. This file records the subset that is actually enforced
in the code.

## 1. Tokens

Defined in `src/index.css` under `@theme` and `:root`.

| Token | Value | Use |
|---|---|---|
| `--color-void` | `#08090B` | App background |
| `--color-obsidian` | `#0B0C0F` | Sidebar / top bar |
| `--color-surface` | `#101114` | Cards |
| `--color-raised` | `#16181C` | Inputs, inset rows |
| `--color-hairline` | `#FFFFFF14` | 1px borders |
| `--color-ink` | `#EDEEF0` | Primary text |
| `--color-ink-muted` | `#8A8F98` | Secondary text |
| `--color-ink-faint` | `#5B6069` | Labels, units |
| `--color-brand` | `#D9A353` | Single accent: active nav, focus, threshold |
| `--color-quiet` | `#2DD4BF` | Status |
| `--color-moderate` | `#94A3B8` | Status |
| `--color-loud` | `#D9A353` | Status |
| `--color-critical` | `#F43F5E` | Status + destructive |

Severity colour is functional. It is never used for decoration, and never the only signal —
every coloured element also carries a text label.

## 2. Typography

- **Inter** for UI, **JetBrains Mono** (`.num`) for every number, timestamp and node id.
- Numbers never jump width: `formatDb` always emits one decimal.
- Body 13–14 px, labels 11 px uppercase with `letter-spacing: 0.08em`, page title 20–24 px.
- No display font, no all-caps headlines, no gradient text.

## 3. Surfaces and motion

- **Double bezel:** `.bezel` (1px hairline, 14 px radius) wrapping `.bezel-inset` (1px inner
  hairline, 10 px radius). Border width never changes on hover; opacity does.
- Hover lift is `translateY(-2px)`, 400 ms `cubic-bezier(0.25, 1, 0.5, 1)`. No scale.
- Micro-interactions 100–180 ms; layout transitions use Framer Motion `layoutId` for the
  sliding nav pill (`spring`, stiffness 420, damping 34).
- The meter arc is redrawn from the smoothed sample each frame; no CSS transition on the arc.
- Ambient motion only where it communicates state: a live capture indicator and a breathing
  hero glyph. Nothing loops in the background.

## 4. Layout

- `h-[100dvh]` shell with `min-h-0` flex children; only the panel area scrolls
  (`.panel-scroll`). The page itself never scrolls on desktop.
- Sidebar ≥ md, bottom dock < md. The Start/Stop control is reachable on both.
- 12-column grid for the dashboard; meter 5 columns, controls 7; chart full width below.
- Safe-area padding on mobile (`viewport-fit=cover`).

## 5. Components

| Component | Contract |
|---|---|
| `LiveMeter` | Arc + big value + status + threshold marker + estimate disclaimer |
| `StatCard` | icon, label, value, unit, one-line detail; no sparkline noise |
| `LiveChart` | 60 points, threshold reference line, custom dark tooltip |
| `ThresholdPanel` | slider 40–100, presets, current value in mono |
| `AlertLog` | newest first, 50 cap, clear action, empty state |
| `NodeRoster` | freshness dot, source label, reading count, selected state |
| `HistoryTable` | sticky header, mono timestamps, CSV export |
| `Segmented` | Framer Motion sliding pill, keyboard operable |
| `Tooltip` | portal-rendered, never clipped by `overflow` |
| `Modal` | portal, focus trap, Escape closes, backdrop blur |
| `SettingsPanel` | identity, calibration, notifications, sound, pairing, data |

## 6. Copy and honesty rules

- The word **estimated** appears next to any dB figure presented as a measurement, and the
  settings screen explains calibration in one sentence.
- Never claim calibrated SPL, never say "sensor" for a microphone reading.
- Empty states say what to do next, not that something failed.
- Errors name the cause and the fix ("Microphone permission denied — allow access in site
  settings, then press Start"), never "Something went wrong".
- Buttons are verbs: Start monitoring, Stop, Pair hub, Export CSV.

## 7. Accessibility

- Visible `:focus-visible` ring in brand amber, 2 px, offset 2 px.
- The meter exposes `role="meter"` semantics with `aria-valuenow`; status is text, not colour.
- Hit targets ≥ 40 px on touch; the dock toggle ≥ 56 px.
- Contrast: ink `#EDEEF0` on `#08090B` and muted `#8A8F98` both pass AA at their sizes.
- `prefers-reduced-motion` is honoured by Framer Motion and the CSS transitions.

## 8. Anti-patterns (rejected in review)

Gradient hero text · cyan/purple cyberpunk · glass blur cards · emoji status icons · pulsing
"live" dots · more than one accent hue · animated counters · chart gridlines darker than the
data · full-page scroll on desktop · toast spam · fake room cards presented as live sensors.
