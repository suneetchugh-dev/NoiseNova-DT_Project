import { useEffect, useState } from "react";
import { isNative } from "./native.ts";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(available: boolean) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    for (const listener of listeners) listener(true);
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    for (const listener of listeners) listener(false);
  });
}

/** Service workers are pointless inside the Capacitor container — assets are local. */
export function registerServiceWorker(): void {
  if (isNative()) return;
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures are non-fatal; the app works online without it.
    });
  });
}

export function useInstallPrompt(): {
  canInstall: boolean;
  installed: boolean;
  promptInstall: () => Promise<void>;
} {
  const [canInstall, setCanInstall] = useState(Boolean(deferredPrompt));
  const [installed, setInstalled] = useState(
    typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches,
  );

  useEffect(() => {
    const listener = (available: boolean) => setCanInstall(available);
    listeners.add(listener);
    const media = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setInstalled(media.matches);
    media.addEventListener("change", onChange);
    return () => {
      listeners.delete(listener);
      media.removeEventListener("change", onChange);
    };
  }, []);

  return {
    canInstall,
    installed,
    promptInstall: async () => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setCanInstall(false);
      }
      deferredPrompt = null;
    },
  };
}
