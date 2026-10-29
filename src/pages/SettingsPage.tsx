import { SettingsPanel } from "../components/SettingsPanel";
import { isNative } from "../lib/native";
import type { Prefs } from "../lib/storage";
import type { HubStatus } from "../lib/types";

interface SettingsPageProps {
  prefs: Prefs;
  onPrefs: (next: Prefs) => void;
  calibration: number;
  onCalibration: (value: number) => void;
  hubUrl: string;
  hubStatus: HubStatus;
  notificationsGranted: boolean;
  onRequestNotifications: () => void;
  onOpenPairing: () => void;
}

export function SettingsPage(props: SettingsPageProps) {
  return <SettingsPanel {...props} isNative={isNative()} />;
}
