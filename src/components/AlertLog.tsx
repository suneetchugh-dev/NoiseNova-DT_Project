import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { formatClock, STATUS_META, statusFromDb } from "../lib/noise";
import type { AlertEntry } from "../lib/types";
import { playClick } from "../lib/sound";

interface AlertLogProps {
  alerts: AlertEntry[];
  onClear: () => void;
}

export function AlertLog({ alerts, onClear }: AlertLogProps) {
  return (
    <div className="bezel flex h-full min-h-0 flex-col p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-white/45" strokeWidth={2} />
        <h2 className="text-[13px] font-semibold tracking-tight text-white/85">Alert log</h2>
        <span className="num ml-auto text-[11px] text-white/35">{alerts.length}</span>
        {alerts.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              playClick();
              onClear();
            }}
            className="cursor-pointer rounded-md p-1 text-white/35 transition-colors hover:bg-white/5 hover:text-[#F43F5E]"
            aria-label="Clear alert log"
            title="Clear alert log"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      {alerts.length === 0 ? (
        <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/8 px-4 py-6">
          <CheckCircle2 className="h-4 w-4 text-[#2DD4BF]/60" strokeWidth={1.75} />
          <p className="text-[12px] text-white/40">No threshold breaches</p>
          <p className="max-w-[240px] text-center text-[11px] leading-relaxed text-white/25">
            Alerts appear here the moment a node crosses its threshold.
          </p>
        </div>
      ) : (
        <ul className="panel-scroll mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1" data-lenis-prevent>
          {alerts.map((alert) => {
            const meta = STATUS_META[statusFromDb(alert.db)];
            return (
              <li
                key={alert.id}
                className="fade-up bezel-inset flex items-start gap-2.5 border-l-2 px-2.5 py-2"
                style={{ borderLeftColor: meta.color }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="num text-[13px] font-semibold text-white/90">
                      {alert.db.toFixed(1)} dB
                    </span>
                    <span className="num text-[10px] text-white/30">
                      over {alert.threshold} dB
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-white/45">{alert.nodeLabel}</p>
                </div>
                <span className="num shrink-0 pt-0.5 text-[10px] text-white/30">
                  {formatClock(alert.ts)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
