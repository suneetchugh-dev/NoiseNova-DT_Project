import { AlertTriangle, Gauge, TrendingUp, Waves } from "lucide-react";
import { AlertLog } from "../components/AlertLog";
import { LiveChart, type ChartPoint } from "../components/LiveChart";
import { LiveMeter } from "../components/LiveMeter";
import { NodeRoster } from "../components/NodeRoster";
import { StatCard } from "../components/StatCard";
import { ThresholdPanel } from "../components/ThresholdPanel";
import { formatDb, STATUS_META, statusFromDb } from "../lib/noise";
import type { AlertEntry, HubStatus, NodeSummary } from "../lib/types";
import { MIC_ERROR_COPY, type MicError } from "../lib/useNoiseCapture";

interface DashboardProps {
  db: number;
  isActive: boolean;
  peak: number;
  threshold: number;
  onThreshold: (value: number) => void;
  nodes: NodeSummary[];
  selected: NodeSummary;
  onSelectNode: (nodeId: string) => void;
  selfNodeId: string;
  points: ChartPoint[];
  average: number;
  alerts: AlertEntry[];
  onClearAlerts: () => void;
  hubStatus: HubStatus;
  micError: MicError | null;
  onOpenPairing: () => void;
}

export function Dashboard({
  db,
  isActive,
  peak,
  threshold,
  onThreshold,
  nodes,
  selected,
  onSelectNode,
  selfNodeId,
  points,
  average,
  alerts,
  onClearAlerts,
  hubStatus,
  micError,
  onOpenPairing,
}: DashboardProps) {
  const status = statusFromDb(db);
  const meta = STATUS_META[status];

  return (
    <div className="flex flex-col gap-3">
      {micError ? (
        <div className="bezel fade-up flex items-start gap-3 border-[#F43F5E]/30 bg-[#F43F5E]/[0.06] p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F43F5E]" strokeWidth={2} />
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-[#F43F5E]">
              {MIC_ERROR_COPY[micError].title}
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/55">
              {MIC_ERROR_COPY[micError].body}
            </p>
          </div>
        </div>
      ) : null}

      {hubStatus === "offline" && isActive ? (
        <div className="bezel fade-up flex items-center gap-3 border-[#D9A353]/25 bg-[#D9A353]/[0.05] p-3">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#D9A353]" strokeWidth={2} />
          <p className="text-[11.5px] leading-relaxed text-white/55">
            This device is measuring locally. Pair the hub to sync readings and see other nodes.
          </p>
          <button
            type="button"
            onClick={onOpenPairing}
            className="ml-auto shrink-0 cursor-pointer rounded-lg border border-[#D9A353]/35 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#D9A353] transition-colors hover:bg-[#D9A353]/10"
          >
            Pair
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          icon={Gauge}
          label="Current level"
          value={isActive ? formatDb(db) : "--.-"}
          unit="dB"
          detail={isActive ? meta.label : "Not measuring"}
          accent={isActive ? meta.color : "#5B6069"}
        />
        <StatCard
          icon={Waves}
          label="Average"
          value={points.length > 0 ? formatDb(average) : "--.-"}
          unit="dB"
          detail={`${points.length} sample${points.length === 1 ? "" : "s"} in view`}
        />
        <StatCard
          icon={TrendingUp}
          label="Peak"
          value={peak > 0 ? formatDb(peak) : "--.-"}
          unit="dB"
          detail={peak > 0 ? `Since ${selected.nodeLabel} started` : "No peak recorded"}
        />
        <StatCard
          icon={AlertTriangle}
          label="Alerts"
          value={String(alerts.length)}
          detail={alerts.length === 0 ? "No breaches" : `Last at ${alerts[0]!.threshold} dB line`}
          accent={alerts.length > 0 ? "#F43F5E" : undefined}
        />
      </div>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-12">
        <section className="bezel order-1 p-4 lg:order-none lg:col-span-4">
          <LiveMeter
            db={db}
            isActive={isActive}
            threshold={threshold}
            peak={peak}
            nodeLabel={`${selected.nodeLabel} · ${selected.nodeId}`}
            estimated
          />
        </section>

        <section className="order-3 lg:order-none lg:col-span-4">
          <ThresholdPanel threshold={threshold} onChange={onThreshold} />
        </section>

        <section className="order-4 min-h-[280px] lg:order-none lg:col-span-4">
          <AlertLog alerts={alerts} onClear={onClearAlerts} />
        </section>

        <section className="order-2 h-[230px] lg:order-none lg:col-span-12 lg:h-[240px]">
          <LiveChart
            points={points}
            threshold={threshold}
            nodeLabel={selected.nodeLabel}
            color={meta.color}
          />
        </section>

        <section className="order-5 lg:order-none lg:col-span-12">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-[13px] font-semibold tracking-tight text-white/85">Nodes</h2>
            <span className="num text-[11px] text-white/30">{nodes.length}</span>
            <button
              type="button"
              onClick={onOpenPairing}
              className="ml-auto cursor-pointer rounded-lg border border-white/8 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-white/55 transition-colors hover:border-white/18 hover:text-white/85"
            >
              Pair hub
            </button>
          </div>
          <NodeRoster
            nodes={nodes}
            activeNodeId={selected.nodeId}
            onSelect={onSelectNode}
            selfNodeId={selfNodeId}
          />
        </section>
      </div>
    </div>
  );
}
