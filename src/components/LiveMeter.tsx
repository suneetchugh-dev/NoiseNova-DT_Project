import { useEffect, useState } from "react";
import { formatDb, STATUS_META, statusFromDb, DB_FLOOR, DB_CEILING } from "../lib/noise";

interface LiveMeterProps {
  db: number;
  isActive: boolean;
  threshold: number;
  peak: number;
  nodeLabel: string;
  estimated: boolean;
}

const SWEEP = 250; // degrees of arc
const START = 145; // starting angle
const SIZE = 260;
const RADIUS = 104;
const CENTER = SIZE / 2;

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

function arcPath(fromDeg: number, toDeg: number, radius: number) {
  const start = polar(fromDeg, radius);
  const end = polar(toDeg, radius);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
}

/**
 * Circular level meter.
 *
 * The arc is redrawn from the smoothed sample value, so it already moves like an
 * instrument without a CSS transition on top. The numeric value is rendered
 * un-animated so it is always the true current sample.
 */
export function LiveMeter({
  db,
  isActive,
  threshold,
  peak,
  nodeLabel,
  estimated,
}: LiveMeterProps) {
  const [displayed, setDisplayed] = useState(db);

  useEffect(() => {
    if (!isActive) return;
    const id = window.requestAnimationFrame(() => setDisplayed(db));
    return () => window.cancelAnimationFrame(id);
  }, [db, isActive]);

  const value = isActive ? displayed : 0;
  const ratio = Math.min(1, Math.max(0, (value - DB_FLOOR) / (DB_CEILING - DB_FLOOR)));
  const status = statusFromDb(isActive ? db : DB_FLOOR);
  const meta = STATUS_META[status];
  const thresholdDeg = START + ((threshold - DB_FLOOR) / (DB_CEILING - DB_FLOOR)) * SWEEP;
  const tick = polar(thresholdDeg, RADIUS - 14);
  const tickOuter = polar(thresholdDeg, RADIUS + 10);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={
            isActive
              ? `Estimated level ${formatDb(db)} decibels, ${meta.label}`
              : "Meter idle, monitoring stopped"
          }
        >
          <defs>
            <linearGradient id="meterFade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={meta.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={meta.color} stopOpacity="0.55" />
            </linearGradient>
          </defs>

          <path
            d={arcPath(START, START + SWEEP, RADIUS)}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={9}
            strokeLinecap="round"
          />

          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const angle = START + step * SWEEP;
            const inner = polar(angle, RADIUS - 20);
            const outer = polar(angle, RADIUS - 12);
            return (
              <line
                key={step}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255,255,255,0.16)"
                strokeWidth={1}
              />
            );
          })}

          <path
            d={arcPath(START, START + SWEEP * ratio, RADIUS)}
            fill="none"
            stroke="url(#meterFade)"
            strokeWidth={9}
            strokeLinecap="round"
            style={{
              filter: isActive ? `drop-shadow(0 0 10px ${meta.color}33)` : "none",
            }}
          />

          <line
            x1={tick.x}
            y1={tick.y}
            x2={tickOuter.x}
            y2={tickOuter.y}
            stroke="rgba(237,238,240,0.55)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="label-mono mb-1">{estimated ? "Estimated level" : "Level"}</span>
          <div className="flex items-baseline gap-1">
            <span
              className="num text-[46px] font-bold leading-none tracking-tight"
              style={{ color: isActive ? "#EDEEF0" : "#3F444C" }}
            >
              {isActive ? formatDb(db) : "--.-"}
            </span>
            <span className="num text-sm font-medium text-white/35">dB</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-[1px]"
              style={{ background: isActive ? meta.color : "#3F444C" }}
            />
            <span
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: isActive ? meta.color : "#5B6069" }}
            >
              {isActive ? meta.label : "STANDBY"}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-1 max-w-[300px] text-center text-[12px] leading-relaxed text-white/45">
        {isActive ? meta.copy : "Start monitoring to capture a live estimate from this device."}
      </p>

      <div className="mt-4 grid w-full max-w-[320px] grid-cols-2 gap-2">
        <div className="bezel-inset px-3 py-2">
          <span className="label-mono">Session peak</span>
          <p className="num mt-1 text-sm font-semibold text-white/85">
            {isActive && peak > 0 ? `${formatDb(peak)} dB` : "—"}
          </p>
        </div>
        <div className="bezel-inset px-3 py-2">
          <span className="label-mono">Alert threshold</span>
          <p className="num mt-1 text-sm font-semibold text-white/85">{threshold} dB</p>
        </div>
      </div>

      <p className="num mt-3 text-[10px] uppercase tracking-[0.1em] text-white/25">
        {nodeLabel}
      </p>
    </div>
  );
}
