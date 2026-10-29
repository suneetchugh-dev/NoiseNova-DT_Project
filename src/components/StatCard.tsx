import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  detail: string;
  accent?: string;
  className?: string;
}

/** One metric, one value, one line of context. Nothing else earns the space. */
export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  detail,
  accent,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bezel lift p-4", className)}>
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} style={{ color: accent ?? "#8A8F98" }} />
        <span className="label-mono">{label}</span>
      </div>
      <div className="mt-2.5 flex items-baseline gap-1">
        <span className="num text-2xl font-semibold tracking-tight text-white/92">{value}</span>
        {unit ? (
          <span className="num text-[11px] font-medium text-white/35">{unit}</span>
        ) : null}
      </div>
      <p className="mt-1 truncate text-[11px] leading-snug text-white/35" title={detail}>
        {detail}
      </p>
    </div>
  );
}
