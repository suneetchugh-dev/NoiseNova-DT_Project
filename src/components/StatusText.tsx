import { cn } from "../lib/cn";
import { STATUS_META, type NoiseStatus } from "../lib/noise";

interface StatusTextProps {
  status: NoiseStatus;
  className?: string;
  /** Dims the colour to a hairline dot + muted label for dense rows. */
  compact?: boolean;
}

/**
 * Status is conveyed by unbracketed monospace typography plus one 4px square —
 * never a pulsing orb, never a pill, never an emoji.
 */
export function StatusText({ status, className, compact = false }: StatusTextProps) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-[1px]"
        style={{ background: meta.color }}
      />
      <span
        className={cn(
          "font-mono font-semibold uppercase",
          compact ? "text-[10px] tracking-[0.06em]" : "text-[11px] tracking-[0.08em]",
        )}
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
    </span>
  );
}
