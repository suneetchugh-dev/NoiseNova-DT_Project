import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  label: string;
  shortcut?: string;
  placement?: "right" | "top" | "bottom";
  children: ReactNode;
}

/**
 * Portal-mounted so card overflow clipping can never cut it off. Suppressed on
 * coarse-pointer devices, where a hover tooltip turns into a sticky artefact.
 */
export function Tooltip({ label, shortcut, placement = "right", children }: TooltipProps) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const show = useCallback(() => {
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gap = 10;
    if (placement === "right") {
      setPosition({ top: rect.top + rect.height / 2, left: rect.right + gap });
    } else if (placement === "top") {
      setPosition({ top: rect.top - gap, left: rect.left + rect.width / 2 });
    } else {
      setPosition({ top: rect.bottom + gap, left: rect.left + rect.width / 2 });
    }
  }, [placement]);

  const hide = useCallback(() => setPosition(null), []);

  useEffect(() => {
    if (!position) return;
    const onScroll = () => setPosition(null);
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [position]);

  const transform =
    placement === "right"
      ? "translate(0, -50%)"
      : placement === "top"
        ? "translate(-50%, -100%)"
        : "translate(-50%, 0)";

  return (
    <>
      <span
        ref={anchorRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </span>
      {position
        ? createPortal(
            <div
              role="tooltip"
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                transform,
                zIndex: 99999,
              }}
              className="pointer-events-none flex select-none items-center gap-2 rounded-lg border border-black/20 bg-white px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-tight whitespace-nowrap text-slate-950 shadow-xl"
            >
              {label}
              {shortcut ? (
                <kbd className="rounded border border-black/20 bg-black/10 px-1 text-[8.5px] font-mono font-bold">
                  {shortcut}
                </kbd>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
