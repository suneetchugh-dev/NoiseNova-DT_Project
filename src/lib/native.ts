import { Capacitor } from "@capacitor/core";
import { Haptics, NotificationType, ImpactStyle } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";

const CHANNEL_ID = "noise_breach";
let channelReady = false;

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function platformName(): string {
  return Capacitor.getPlatform();
}

/**
 * Android 13+ requires the runtime notification permission, and Android 8+
 * requires an explicit channel before anything will display. Both are idempotent
 * so repeated alert bursts cannot spam duplicate channels.
 */
async function ensureChannel(): Promise<void> {
  if (channelReady) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Noise threshold breaches",
      description: "High priority alerts when a monitored space exceeds its threshold",
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: "#F43F5E",
    });
    channelReady = true;
  } catch {
    // Channel already exists — creation is additive, not fatal.
    channelReady = true;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isNative()) {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === "granted";
    } catch {
      return false;
    }
  }
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const granted = await Notification.requestPermission();
  return granted === "granted";
}

export async function notificationPermissionGranted(): Promise<boolean> {
  if (isNative()) {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === "granted";
    } catch {
      return false;
    }
  }
  return "Notification" in window && Notification.permission === "granted";
}

export async function fireBreachNotification(
  title: string,
  body: string,
): Promise<void> {
  try {
    if (isNative()) {
      await ensureChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 100_000),
            title,
            body,
            channelId: CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 80) },
            smallIcon: "ic_stat_noise",
            extra: { noiseNova: true },
          },
        ],
      });
      return;
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, tag: "noise-nova-breach" });
    }
  } catch {
    // A blocked notification must never break the monitoring loop.
  }
}

export async function hapticBreach(): Promise<void> {
  try {
    if (isNative()) {
      await Haptics.notification({ type: NotificationType.Warning });
      await Haptics.vibrate({ duration: 600 });
    } else if (navigator.vibrate) {
      navigator.vibrate([220, 90, 220]);
    }
  } catch {
    // Vibration is best-effort.
  }
}

export async function hapticTap(): Promise<void> {
  try {
    if (isNative()) await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Best-effort.
  }
}
