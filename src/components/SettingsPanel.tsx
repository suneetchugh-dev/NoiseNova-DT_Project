import type { CSSProperties, ReactNode } from "react";
import {
  Bell,
  BellOff,
  Cpu,
  Download,
  Github,
  Info,
  Link2,
  Mic,
  Radio,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "../lib/cn";
import { setSoundEnabled, soundEnabled } from "../lib/sound";
import type { Prefs } from "../lib/storage";
import { useInstallPrompt } from "../lib/pwa";

interface SettingsPanelProps {
  prefs: Prefs;
  onPrefs: (next: Prefs) => void;
  calibration: number;
  onCalibration: (value: number) => void;
  hubUrl: string;
  hubStatus: string;
  notificationsGranted: boolean;
  onRequestNotifications: () => void;
  onOpenPairing: () => void;
  isNative: boolean;
}

function Row({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Mic;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-white/85">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/35">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 cursor-pointer rounded-full border transition-colors duration-150",
        checked
          ? "border-[#D9A353]/50 bg-[#D9A353]/25"
          : "border-white/12 bg-white/5",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-transform duration-150",
          checked ? "translate-x-[18px] bg-[#D9A353]" : "translate-x-0.5 bg-white/45",
        )}
      />
    </button>
  );
}

export function SettingsPanel({
  prefs,
  onPrefs,
  calibration,
  onCalibration,
  hubUrl,
  hubStatus,
  notificationsGranted,
  onRequestNotifications,
  onOpenPairing,
  isNative,
}: SettingsPanelProps) {
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <section className="bezel p-4">
        <div className="flex items-center gap-2 border-b border-white/8 pb-2.5">
          <Mic className="h-3.5 w-3.5 text-white/45" strokeWidth={2} />
          <h2 className="text-[13px] font-semibold tracking-tight text-white/85">This device</h2>
        </div>

        <div className="py-3">
          <label htmlFor="node-label" className="label-mono">
            Node label
          </label>
          <input
            id="node-label"
            value={prefs.nodeLabel}
            onChange={(event) => onPrefs({ ...prefs, nodeLabel: event.target.value.slice(0, 40) })}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white/90 outline-none transition-colors placeholder:text-white/20 focus:border-[#D9A353]/50"
          />
          <p className="num mt-1.5 text-[10px] text-white/25">ID {prefs.nodeId}</p>
        </div>

        <div className="border-t border-white/6 py-3">
          <div className="flex items-baseline justify-between">
            <label htmlFor="calibration" className="label-mono">
              Calibration offset
            </label>
            <span className="num text-[12px] font-semibold text-white/75">
              {calibration > 0 ? "+" : ""}
              {calibration} dB
            </span>
          </div>
          <input
            id="calibration"
            type="range"
            className="nn-range mt-3"
            min={-20}
            max={20}
            step={1}
            value={calibration}
            onChange={(event) => onCalibration(Number(event.target.value))}
            style={
              {
                "--fill": `${((calibration + 20) / 40) * 100}%`,
                "--fill-color": "#D9A353",
              } as CSSProperties
            }
          />
          <p className="mt-2 text-[11px] leading-relaxed text-white/35">
            Two microphones in one room never agree on their own. Place a reference meter next to
            this device and shift the offset until the readings match, then leave it fixed.
          </p>
        </div>

        <div className="divide-y divide-white/6 border-t border-white/6">
          <Row
            icon={soundEnabled() ? Volume2 : VolumeX}
            title="Interface sound"
            description="Short confirmation tone on control changes and breaches."
          >
            <Toggle
              checked={prefs.soundEnabled}
              onChange={(next) => {
                setSoundEnabled(next);
                onPrefs({ ...prefs, soundEnabled: next });
              }}
              label="Interface sound"
            />
          </Row>
          <Row
            icon={notificationsGranted ? Bell : BellOff}
            title="Threshold notifications"
            description={
              notificationsGranted
                ? "System notifications are permitted on this device."
                : "Permission is required before a breach can raise a notification."
            }
          >
            <button
              type="button"
              onClick={onRequestNotifications}
              className="h-7 cursor-pointer rounded-lg border border-white/10 px-2.5 text-[10px] font-mono font-bold uppercase tracking-wide text-white/70 transition-colors hover:border-white/20 hover:text-white"
            >
              {notificationsGranted ? "Granted" : "Enable"}
            </button>
          </Row>
        </div>
      </section>

      <section className="bezel p-4">
        <div className="flex items-center gap-2 border-b border-white/8 pb-2.5">
          <Radio className="h-3.5 w-3.5 text-white/45" strokeWidth={2} />
          <h2 className="text-[13px] font-semibold tracking-tight text-white/85">Hub connection</h2>
        </div>

        <div className="py-3">
          <div className="flex items-center justify-between">
            <span className="label-mono">Endpoint</span>
            <span
              className={cn(
                "font-mono text-[10px] font-semibold uppercase tracking-[0.08em]",
                hubStatus === "live"
                  ? "text-[#2DD4BF]"
                  : hubStatus === "connecting"
                    ? "text-[#D9A353]"
                    : "text-[#F43F5E]",
              )}
            >
              {hubStatus}
            </span>
          </div>
          <p className="num mt-1.5 break-all text-[12px] text-white/75">
            {hubUrl || "not configured"}
          </p>
          <button
            type="button"
            onClick={onOpenPairing}
            className="mt-3 flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[10px] font-mono font-bold uppercase tracking-wide text-white/75 transition-colors hover:border-white/20 hover:text-white"
          >
            <Link2 className="h-3 w-3" strokeWidth={2} />
            Pair or disconnect
          </button>
        </div>

        <div className="border-t border-white/6 pt-3">
          <Row
            icon={Download}
            title="Install as app"
            description={
              isNative
                ? "Running inside the Android container. Install is not applicable."
                : installed
                  ? "Installed. Launch it from your home screen or app drawer."
                  : "Add Noise Nova to this device as a standalone app."
            }
          >
            <button
              type="button"
              onClick={promptInstall}
              disabled={!canInstall || installed || isNative}
              className="h-7 cursor-pointer rounded-lg border border-white/10 px-2.5 text-[10px] font-mono font-bold uppercase tracking-wide text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              {installed ? "Installed" : canInstall ? "Install" : "Unavailable"}
            </button>
          </Row>
        </div>
      </section>

      <section className="bezel p-4 lg:col-span-2">
        <div className="flex items-center gap-2 border-b border-white/8 pb-2.5">
          <Info className="h-3.5 w-3.5 text-white/45" strokeWidth={2} />
          <h2 className="text-[13px] font-semibold tracking-tight text-white/85">
            Measurement method
          </h2>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            {
              label: "LEVEL MODEL",
              value: "20 log10(RMS) + 90",
              detail: "Computed from 2048 time-domain samples per frame, browser DSP disabled.",
            },
            {
              label: "CLASSIFICATION",
              value: "4 fixed bands",
              detail: "Quiet to 40, moderate to 65, loud to 80, very loud above 80.",
            },
            {
              label: "TRANSPORT",
              value: "WebSocket + SQLite",
              detail: "One reading per second per node, persisted and fanned out to every viewer.",
            },
            {
              label: "ACCURACY",
              value: "Estimate, not SPL",
              detail: "Uncalibrated microphones cannot certify sound pressure. Calibrate per device.",
            },
          ].map((item) => (
            <div key={item.label} className="bezel-inset p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="label-mono">{item.label}</span>
                <span className="num text-[11px] font-semibold text-white/80">{item.value}</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-white/6 pt-3">
          <Cpu className="h-3 w-3 text-white/30" strokeWidth={2} />
          <p className="text-[10px] leading-relaxed text-white/25">
            Noise Nova · React · Vite · Web Audio · Capacitor · Node · SQLite
          </p>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-white/25">
            <Github className="h-3 w-3" strokeWidth={2} />
            sahnirmaan.live
          </span>
        </div>
      </section>
    </div>
  );
}
