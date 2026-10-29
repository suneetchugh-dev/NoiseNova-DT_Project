import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";
import { formatDb, formatShortTime, statusFromDb, STATUS_META } from "../lib/noise";

export interface ChartPoint {
  ts: number;
  db: number;
  label: string;
}

interface LiveChartProps {
  points: ChartPoint[];
  threshold: number;
  nodeLabel: string;
  color: string;
}

interface TooltipPayloadItem {
  payload: ChartPoint;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  const meta = STATUS_META[statusFromDb(point.db)];
  return (
    <div className="rounded-lg border border-white/12 bg-[#0B0C0F] px-2.5 py-2 shadow-xl">
      <p className="num text-[10px] uppercase tracking-[0.08em] text-white/40">
        {formatShortTime(point.ts)}
      </p>
      <p className="num mt-0.5 text-sm font-semibold text-white/90">{formatDb(point.db)} dB</p>
      <p className="mt-0.5 text-[10px] font-mono uppercase tracking-[0.06em]" style={{ color: meta.color }}>
        {meta.label}
      </p>
    </div>
  );
}

export function LiveChart({ points, threshold, nodeLabel, color }: LiveChartProps) {
  const hasData = points.length > 1;

  return (
    <div className="bezel flex h-full min-h-0 flex-col p-4">
      <div className="flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-white/45" strokeWidth={2} />
        <h2 className="text-[13px] font-semibold tracking-tight text-white/85">
          Level timeline
        </h2>
        <span className="label-mono ml-auto normal-case tracking-normal text-white/30">
          last 60 samples · 1 per second
        </span>
      </div>

      <div className="relative mt-3 min-h-[168px] flex-1">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="levelFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#5B6069", fontSize: 9, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={48}
              />
              <YAxis
                domain={[30, 120]}
                ticks={[30, 50, 70, 90, 110]}
                tick={{ fill: "#5B6069", fontSize: 9, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.16)", strokeWidth: 1 }}
              />
              <ReferenceLine
                y={threshold}
                stroke="#D9A353"
                strokeDasharray="4 4"
                strokeOpacity={0.55}
                label={{
                  value: `${threshold}`,
                  position: "insideTopRight",
                  fill: "#D9A353",
                  fontSize: 9,
                  fontFamily: "JetBrains Mono",
                }}
              />
              <Area
                type="monotone"
                dataKey="db"
                stroke={color}
                strokeWidth={1.6}
                fill="url(#levelFill)"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 2.5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/8">
            <Activity className="h-4 w-4 text-white/20" strokeWidth={1.75} />
            <p className="text-[12px] text-white/40">No samples yet</p>
            <p className="max-w-[260px] text-center text-[11px] leading-relaxed text-white/25">
              Start monitoring on {nodeLabel} to plot its level. One point is committed per
              second.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
