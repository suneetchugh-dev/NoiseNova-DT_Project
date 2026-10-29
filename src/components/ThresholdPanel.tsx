import type { CSSProperties } from "react";
import { SlidersHorizontal } from "lucide-react";
import { THRESHOLD_PRESETS, THRESHOLD_RANGE, severityColor } from "../lib/noise";
import { playClick } from "../lib/sound";
import { cn } from "../lib/cn";

interface ThresholdPanelProps {
  threshold: number;
  onChange: (value: number) => void;
}

export function ThresholdPanel({ threshold, onChange }: ThresholdPanelProps) {
  const fill = ((threshold - THRESHOLD_RANGE.min) / (THRESHOLD_RANGE.max - THRESHOLD_RANGE.min)) * 100;
  const color = severityColor(threshold);

  return (
    <div className="bezel p-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-white/45" strokeWidth={2} />
        <h2 className="text-[13px] font-semibold tracking-tight text-white/85">
          Alert threshold
        </h2>
        <span className="num ml-auto text-[13px] font-semibold" style={{ color }}>
          {threshold} dB
        </span>
      </div>

      <div className="mt-4">
        <input
          type="range"
          className="nn-range"
          min={THRESHOLD_RANGE.min}
          max={THRESHOLD_RANGE.max}
          step={1}
          value={threshold}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label="Alert threshold in decibels"
          style={
            {
              "--fill": `${fill}%`,
              "--fill-color": color,
            } as CSSProperties
          }
        />
        <div className="mt-1.5 flex justify-between">
          <span className="label-mono">{THRESHOLD_RANGE.min}</span>
          <span className="label-mono">{THRESHOLD_RANGE.max}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {THRESHOLD_PRESETS.map((preset) => {
          const active = threshold === preset.value;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                playClick();
                onChange(preset.value);
              }}
              className={cn(
                "bezel-inset cursor-pointer px-2.5 py-2 text-left transition-colors duration-150",
                active
                  ? "border-[#D9A353]/45 bg-[#D9A353]/8"
                  : "hover:border-white/12 hover:bg-white/[0.04]",
              )}
            >
              <span
                className={cn(
                  "block text-[11px] font-semibold",
                  active ? "text-[#D9A353]" : "text-white/75",
                )}
              >
                {preset.label}
              </span>
              <span className="num block text-[10px] text-white/35">{preset.value} dB</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-white/30">
        One alert per node per 10 seconds while the level stays above this line. Changing
        the threshold applies to this device immediately.
      </p>
    </div>
  );
}
