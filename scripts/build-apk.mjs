#!/usr/bin/env node
/**
 * Assemble the debug APK with a JDK Gradle can actually load.
 *
 * Gradle 8.14 refuses anything newer than Java 24 ("Unsupported class file major
 * version 70" means Java 26). This machine's JAVA_HOME points at a NetBeans JDK,
 * so the build fails before touching the project. Instead of pinning a machine
 * path into gradle.properties, this wrapper finds a 17-24 JDK, prefers 21, and
 * runs Gradle with it.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const android = path.join(root, "android");
const win = process.platform === "win32";

if (!existsSync(android)) {
  console.error("  android/ is missing. Run `npx cap add android` first.");
  process.exit(1);
}

function majorVersion(home) {
  const bin = path.join(home, "bin", win ? "java.exe" : "java");
  if (!existsSync(bin)) return 0;
  const result = spawnSync(bin, ["-version"], { encoding: "utf8" });
  const match = `${result.stderr ?? ""}${result.stdout ?? ""}`.match(/version "(\d+)/);
  return match ? Number(match[1]) : 0;
}

const roots = win
  ? [
      "C:\\Program Files\\Eclipse Adoptium",
      "C:\\Program Files\\Java",
      path.join(os.homedir(), "AppData", "Local", "Programs", "Eclipse Adoptium"),
    ]
  : ["/usr/lib/jvm"];

const candidates = [process.env.JAVA_HOME, ...roots.flatMap((dir) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map((entry) => path.join(dir, entry));
})].filter(Boolean);

const usable = candidates
  .map((home) => ({ home, major: majorVersion(home) }))
  .filter((candidate) => candidate.major >= 17 && candidate.major <= 24)
  .sort((a, b) => Math.abs(a.major - 21) - Math.abs(b.major - 21));

if (!usable.length) {
  console.error("  No JDK 17-24 found. Install Temurin 21 and set JAVA_HOME.");
  process.exit(1);
}

console.log(`  JDK ${usable[0].major}: ${usable[0].home}`);

const run = win
  ? spawnSync("cmd", ["/c", "gradlew.bat", "assembleDebug"], {
      cwd: android,
      stdio: "inherit",
      env: { ...process.env, JAVA_HOME: usable[0].home },
    })
  : spawnSync("./gradlew", ["assembleDebug"], {
      cwd: android,
      stdio: "inherit",
      env: { ...process.env, JAVA_HOME: usable[0].home },
    });

if (run.status === 0) {
  console.log(`\n  APK: ${path.join(android, "app", "build", "outputs", "apk", "debug", "app-debug.apk")}`);
}
process.exit(run.status ?? 1);
