import { motion } from "framer-motion";
import {
  BellRing,
  History as HistoryIcon,
  LayoutDashboard,
  Mic,
  Radio,
  Settings2,
  Square,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/cn";
import { playClick } from "../lib/sound";
import { useInstallPrompt } from "../lib/pwa";
import type { HubStatus } from "../lib/types";

export type Tab = "dashboard" | "nodes" | "history" | "settings";

export const NAV_ITEMS: readonly {
  id: Tab;
  label: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    subtitle: "Live level, threshold and alert stream",
  },
  {
    id: "nodes",
    label: "Nodes",
    icon: Radio,
    title: "Nodes",
    subtitle: "Every microphone reporting into this hub",
  },
  {
    id: "history",
    label: "History",
    icon: HistoryIcon,
    title: "History",
    subtitle: "Persisted readings, exportable to CSV",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings2,
    title: "Settings",
    subtitle: "Calibration, pairing and installation",
  },
];

const TEAM = [
  ["Saurabh Kumar", "2401331520167"],
  ["Vansh Sharma", "2401331520202"],
  ["Suneet Chugh", "2401331520190"],
  ["Sarika Chaudhary", "2401331520166"],
  ["Taniya Bansal", "2401331520192"],
] as const;

/** Five bars rising then falling: a level meter, which is what the product is. */
export function BrandMark({ size = 20 }: { size?: number }) {
  const barWidth = size * 0.12;
  const gap = size * 0.075;
  const heights = [0.34, 0.58, 0.92, 0.62, 0.4];
  const totalWidth = heights.length * barWidth + (heights.length - 1) * gap;
  const offsetX = (size - totalWidth) / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Noise Nova"
      className="shrink-0"
    >
      {heights.map((height, index) => (
        <rect
          key={index}
          x={offsetX + index * (barWidth + gap)}
          y={(size - size * height) / 2}
          width={barWidth}
          height={size * height}
          rx={barWidth / 2}
          fill={index === 2 ? "#F0F1F3" : "#D9A353"}
          opacity={index === 2 ? 1 : 0.88}
        />
      ))}
    </svg>
  );
}

function NavButton({
  item,
  active,
  layoutId,
  onSelect,
  compact = false,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  layoutId: string;
  onSelect: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150",
        active ? "text-white" : "text-white/45 hover:text-white/75",
        compact && "flex-col gap-1 px-1 py-1.5",
      )}
    >
      {active ? (
        <motion.span
          layoutId={layoutId}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className={cn(
            "absolute inset-0 -z-10 rounded-lg border border-white/8 bg-white/[0.055]",
            compact && "rounded-xl",
          )}
        />
      ) : null}
      <Icon className={cn("h-4 w-4 shrink-0", active && "text-[#D9A353]")} strokeWidth={2} />
      <span
        className={cn(
          "text-[12.5px] font-medium",
          compact && "text-[9.5px] font-mono font-semibold uppercase tracking-[0.05em]",
        )}
      >
        {item.label}
      </span>
    </button>
  );
}

export function Sidebar({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <aside className="hidden w-[216px] shrink-0 flex-col border-r border-white/8 bg-[#0B0C0F] md:flex">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/8 px-4">
        <BrandMark size={20} />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-none tracking-tight text-white/92">
            Noise Nova
          </p>
          <p className="label-mono mt-1 leading-none">Env. noise monitor</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={item.id === tab}
            layoutId="sidebar-active"
            onSelect={() => {
              if (item.id === tab) return;
              playClick();
              onTab(item.id);
            }}
          />
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/8 p-3">
        <div className="flex items-center gap-1.5">
          <BellRing className="h-3 w-3 text-white/30" strokeWidth={2} />
          <span className="label-mono">Team</span>
        </div>
        <ul className="mt-2 space-y-1">
          {TEAM.map(([name, roll]) => (
            <li key={roll} className="flex items-baseline justify-between gap-1.5">
              <span className="truncate text-[10.5px] text-white/55">{name}</span>
              <span className="num shrink-0 text-[8.5px] text-white/22">{roll.slice(-4)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function HubChip({
  status,
  nodeCount,
  onClick,
}: {
  status: HubStatus;
  nodeCount: number;
  onClick: () => void;
}) {
  const meta =
    status === "live"
      ? { label: "Live", color: "#2DD4BF" }
      : status === "connecting"
        ? { label: "Connecting", color: "#D9A353" }
        : { label: "Offline", color: "#F43F5E" };

  return (
    <button
      type="button"
      onClick={onClick}
      title="Hub connection"
      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/8 px-2 transition-colors hover:border-white/16"
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      <span
        className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.08em] sm:inline"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
      {nodeCount > 0 ? (
        <span className="num text-[9.5px] text-white/30">{nodeCount}n</span>
      ) : null}
    </button>
  );
}

export function TopBar({
  tab,
  hubStatus,
  nodeCount,
  isCapturing,
  onToggle,
  onOpenPairing,
}: {
  tab: Tab;
  hubStatus: HubStatus;
  nodeCount: number;
  isCapturing: boolean;
  onToggle: () => void;
  onOpenPairing: () => void;
}) {
  const active = NAV_ITEMS.find((item) => item.id === tab) ?? NAV_ITEMS[0]!;
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/8 bg-[#08090B]/80 px-3 backdrop-blur-md md:gap-3 md:px-5">
      <div className="flex items-center gap-2 md:hidden">
        <BrandMark size={17} />
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-[13px] font-semibold leading-tight tracking-tight text-white/92">
          {active.title}
        </h1>
        <p className="hidden truncate text-[10.5px] leading-tight text-white/32 md:block">
          {active.subtitle}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {canInstall && !installed ? (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="hidden h-8 cursor-pointer items-center rounded-lg border border-[#D9A353]/35 px-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#D9A353] transition-colors hover:border-[#D9A353]/60 hover:bg-[#D9A353]/8 sm:flex"
          >
            Install
          </button>
        ) : null}

        <HubChip status={hubStatus} nodeCount={nodeCount} onClick={onOpenPairing} />

        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "hidden h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors md:flex",
            isCapturing
              ? "bg-[#D9A353] text-[#0a0b0d] hover:bg-[#E4B266]"
              : "bg-[#EDEEF0] text-[#0a0b0d] hover:bg-white",
          )}
        >
          {isCapturing ? (
            <Square className="h-3 w-3" strokeWidth={2.5} />
          ) : (
            <Mic className="h-3 w-3" strokeWidth={2.5} />
          )}
          {isCapturing ? "Stop" : "Start monitoring"}
        </button>
      </div>
    </header>
  );
}

export function MobileDock({
  tab,
  onTab,
  isCapturing,
  onToggle,
}: {
  tab: Tab;
  onTab: (tab: Tab) => void;
  isCapturing: boolean;
  onToggle: () => void;
}) {
  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#0B0C0F]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {left.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={item.id === tab}
            layoutId="dock-active"
            compact
            onSelect={() => {
              if (item.id === tab) return;
              playClick();
              onTab(item.id);
            }}
          />
        ))}

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onToggle}
            aria-label={isCapturing ? "Stop monitoring" : "Start monitoring"}
            className={cn(
              "-mt-7 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-colors duration-200",
              isCapturing
                ? "bg-[#D9A353] text-[#0a0b0d] shadow-[0_0_22px_rgba(217,163,83,0.35)]"
                : "bg-[#EDEEF0] text-[#0a0b0d] shadow-[0_0_18px_rgba(237,238,240,0.18)]",
            )}
          >
            {isCapturing ? (
              <Square className="h-5 w-5" strokeWidth={2.5} />
            ) : (
              <Mic className="h-5 w-5" strokeWidth={2.25} />
            )}
          </button>
        </div>

        {right.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={item.id === tab}
            layoutId="dock-active"
            compact
            onSelect={() => {
              if (item.id === tab) return;
              playClick();
              onTab(item.id);
            }}
          />
        ))}
      </div>
    </nav>
  );
}
