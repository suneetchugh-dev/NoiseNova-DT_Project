import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import { playClick } from "../lib/sound";

interface SegmentedProps<T extends string> {
  items: readonly { id: T; label: string; hint?: string }[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  ariaLabel: string;
  className?: string;
}

/**
 * Recessed-track segmented control with a shared-layout sliding pill.
 * The pill is the only moving element; labels never animate their own geometry.
 */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  layoutId,
  ariaLabel,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative flex items-center gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (active) return;
              playClick();
              onChange(item.id);
            }}
            className={cn(
              "relative flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150",
              active ? "text-[#0a0b0d]" : "text-white/55 hover:text-white/85",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-lg bg-[#edeef0] shadow-sm"
              />
            ) : null}
            <span className="relative z-10 whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
