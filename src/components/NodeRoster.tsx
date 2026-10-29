import { Cpu, Laptop, Radio, Smartphone } from "lucide-react";
import { cn } from "../lib/cn";
import { formatDb, formatClock, STATUS_META, statusFromDb } from "../lib/noise";
import { SOURCE_LABEL, type NodeKind, type NodeSummary } from "../lib/types";
import { StatusText } from "./StatusText";

const KIND_ICON: Record<NodeKind, typeof Laptop> = {
  laptop: Laptop,
  phone: Smartphone,
  board: Cpu,
};

const KIND_LABEL: Record<NodeKind, string> = {
  laptop: "LAPTOP NODE",
  phone: "ANDROID NODE",
  board: "BOARD NODE",
};

interface NodeRosterProps {
  nodes: NodeSummary[];
  activeNodeId: string;
  onSelect: (nodeId: string) => void;
  selfNodeId: string;
}

function ago(ts: number): string {
  if (!ts) return "no samples";
  const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

export function NodeRoster({ nodes, activeNodeId, onSelect, selfNodeId }: NodeRosterProps) {
  if (nodes.length === 0) {
    return (
      <div className="bezel flex flex-col items-center justify-center gap-2 p-6">
        <Radio className="h-4 w-4 text-white/20" strokeWidth={1.75} />
        <p className="text-[12px] text-white/40">No nodes connected</p>
        <p className="max-w-[280px] text-center text-[11px] leading-relaxed text-white/25">
          Start monitoring on this device, or pair the Android node from Settings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {nodes.map((node) => {
        const Icon = KIND_ICON[node.kind] ?? Cpu;
        const active = node.nodeId === activeNodeId;
        const isSelf = node.nodeId === selfNodeId;
        const meta = STATUS_META[statusFromDb(node.db)];
        return (
          <button
            key={node.nodeId}
            type="button"
            onClick={() => onSelect(node.nodeId)}
            className={cn(
              "bezel lift cursor-pointer p-3 text-left",
              active && "border-[#D9A353]/45 shadow-[0_0_18px_rgba(217,163,83,0.07)]",
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-white/45" strokeWidth={2} />
              <span className="label-mono truncate">{KIND_LABEL[node.kind] ?? "NODE"}</span>
              {isSelf ? (
                <span className="label-mono ml-auto shrink-0 rounded border border-white/10 px-1 py-px text-[8px] text-white/45">
                  THIS DEVICE
                </span>
              ) : null}
            </div>

            <p className="mt-1.5 truncate text-[13px] font-medium text-white/85">
              {node.nodeLabel}
            </p>

            <div className="mt-2 flex items-end justify-between">
              <div className="flex items-baseline gap-1">
                <span className="num text-xl font-semibold" style={{ color: meta.color }}>
                  {node.readings > 0 ? formatDb(node.db) : "--.-"}
                </span>
                <span className="num text-[10px] text-white/30">dB</span>
              </div>
              <StatusText status={statusFromDb(node.db)} compact />
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-white/6 pt-2">
              <span className="text-[10px] text-white/28">
                {SOURCE_LABEL[node.source] ?? node.source}
              </span>
              <span className="num text-[10px] text-white/28">
                {ago(node.lastSeen) === "now" ? formatClock(node.lastSeen) : ago(node.lastSeen)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
