import { Download, Table2 } from "lucide-react";
import { useState } from "react";
import { downloadCsv, readingsToCsv, timestampedName } from "../lib/csv";
import { formatDb, formatDateTime, STATUS_META, statusFromDb } from "../lib/noise";
import { SOURCE_LABEL, type Reading } from "../lib/types";
import { playClick } from "../lib/sound";
import { StatusText } from "./StatusText";

interface HistoryTableProps {
  readings: Reading[];
  limit?: number;
}

export function HistoryTable({ readings, limit = 500 }: HistoryTableProps) {
  const [expanded, setExpanded] = useState(false);
  const ordered = [...readings].sort((a, b) => b.ts - a.ts);
  const visible = expanded ? ordered : ordered.slice(0, 40);

  return (
    <div className="bezel flex min-h-0 flex-col p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Table2 className="h-3.5 w-3.5 text-white/45" strokeWidth={2} />
        <h2 className="text-[13px] font-semibold tracking-tight text-white/85">Reading history</h2>
        <span className="num ml-auto text-[11px] text-white/35">{ordered.length} rows</span>
        <button
          type="button"
          disabled={ordered.length === 0}
          onClick={() => {
            playClick();
            downloadCsv(timestampedName("noise-nova"), readingsToCsv(ordered));
          }}
          className="flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[10px] font-mono font-bold uppercase tracking-wide text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Download className="h-3 w-3" strokeWidth={2} />
          Export CSV
        </button>
      </div>

      {ordered.length === 0 ? (
        <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/8 py-10">
          <Table2 className="h-4 w-4 text-white/20" strokeWidth={1.75} />
          <p className="text-[12px] text-white/40">No readings stored yet</p>
          <p className="max-w-[280px] text-center text-[11px] leading-relaxed text-white/25">
            Every committed sample is stored in the hub database and available here for export.
          </p>
        </div>
      ) : (
        <>
          <div className="panel-scroll mt-3 min-h-0 flex-1 overflow-auto" data-lenis-prevent>
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#101114]">
                <tr className="border-b border-white/8">
                  {["#", "Timestamp", "Node", "dB", "Status", "Source"].map((head) => (
                    <th
                      key={head}
                      className="label-mono whitespace-nowrap px-2 py-2 font-semibold"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((reading, index) => {
                  const meta = STATUS_META[statusFromDb(reading.db)];
                  return (
                    <tr
                      key={`${reading.nodeId}-${reading.ts}-${index}`}
                      className="border-b border-white/4 transition-colors hover:bg-white/[0.025]"
                    >
                      <td className="num px-2 py-1.5 text-[10px] text-white/25">
                        {String(ordered.length - index).padStart(3, "0")}
                      </td>
                      <td className="num whitespace-nowrap px-2 py-1.5 text-[11px] text-white/60">
                        {formatDateTime(reading.ts)}
                      </td>
                      <td className="max-w-[130px] truncate px-2 py-1.5 text-[11px] text-white/60">
                        {reading.nodeLabel}
                      </td>
                      <td
                        className="num px-2 py-1.5 text-[12px] font-semibold"
                        style={{ color: meta.color }}
                      >
                        {formatDb(reading.db)}
                      </td>
                      <td className="px-2 py-1.5">
                        <StatusText status={statusFromDb(reading.db)} compact />
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-[10px] text-white/30">
                        {SOURCE_LABEL[reading.source] ?? reading.source}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {ordered.length > 40 ? (
            <button
              type="button"
              onClick={() => {
                playClick();
                setExpanded((prev) => !prev);
              }}
              className="mt-2 w-full cursor-pointer rounded-lg border border-white/8 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wide text-white/45 transition-colors hover:border-white/16 hover:text-white/70"
            >
              {expanded ? "Collapse to latest 40" : `Show all ${Math.min(ordered.length, limit)}`}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
