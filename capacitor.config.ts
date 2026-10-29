import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Bundled mode is mandatory for Noise Nova.
 *
 * The APK ships its own production build and serves it from https://localhost,
 * which is a secure context — so getUserMedia() is allowed. Pointing `server.url`
 * at a plain http:// LAN address would silently break microphone capture.
 * The app reaches the hub over WebSocket instead, which is a separate origin.
 */
const config: CapacitorConfig = {
  appId: "live.sahnirmaan.noisenova",
  appName: "Noise Nova",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
