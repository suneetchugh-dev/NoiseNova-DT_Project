import { formatDateTime, statusFromDb } from "./noise.ts";
import { SOURCE_LABEL, type Reading } from "./types.ts";

const HEADER = [
  "timestamp",
  "node_id",
  "node_label",
  "source",
  "estimated_db",
  "peak_db",
  "rms",
  "status",
  "threshold_db",
] as const;

/** RFC 4180: quote every field, double internal quotes, normalise newlines. */
function escapeCell(value: unknown): string {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  return `"${text.replace(/"/g, '""')}"`;
}

export function readingsToCsv(readings: readonly Reading[]): string {
  const rows = readings.map((r) =>
    [
      new Date(r.ts).toISOString(),
      r.nodeId,
      r.nodeLabel,
      SOURCE_LABEL[r.source] ?? r.source,
      r.db.toFixed(1),
      r.peak.toFixed(1),
      r.rms.toFixed(6),
      statusFromDb(r.db),
      r.threshold.toFixed(0),
    ]
      .map(escapeCell)
      .join(","),
  );
  return [HEADER.map(escapeCell).join(","), ...rows].join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function timestampedName(prefix: string): string {
  const stamp = formatDateTime(Date.now()).replace(/[/: ]/g, "-");
  return `${prefix}-${stamp}.csv`;
}
