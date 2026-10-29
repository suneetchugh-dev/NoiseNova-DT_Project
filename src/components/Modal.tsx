import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { playClick } from "../lib/sound";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fade-up relative w-full max-w-md rounded-t-2xl border border-white/10 bg-[#101114] shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-white/90">{title}</h2>
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            aria-label="Close"
            className="cursor-pointer rounded-lg p-1.5 text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <div className="panel-scroll max-h-[60vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-white/8 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
