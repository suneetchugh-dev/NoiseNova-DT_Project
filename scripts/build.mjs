#!/usr/bin/env node
/**
 * Production build wrapper.
 *
 * Vite cannot resolve module ids when the project lives under a path containing
 * "#" (it treats the character as a URL fragment). This project originally sat
 * under ".../#(Assignments)/...", which breaks `vite build` while leaving
 * `vite dev` working — a nasty failure mode to discover on submission day.
 *
 * If the path is clean this wrapper is a thin pass-through to `vite build`.
 * If it still contains "#", the project is mirrored into a temp directory,
 * built there, and `dist/` is copied back. node_modules is junctioned rather
 * than copied, and the mirror config enables `preserveSymlinks` so rollup keeps
 * the path-clean ids.
 *
 * Rename the folder and this file stops doing anything interesting.
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");

/** Spawning the CLI through node avoids .cmd shim quoting on Windows entirely. */
function build(cwd) {
  execFileSync(process.execPath, [viteBin, "build"], { cwd, stdio: "inherit" });
}

if (!root.includes("#")) {
  build(root);
  process.exit(0);
}

console.warn("");
console.warn("  This project path contains '#', which Vite cannot build from.");
console.warn("  Rename the folder (for example '#(Assignments)' -> '(Assignments)').");
console.warn("  Building from a temporary mirror in the meantime.");
console.warn("");

const mirror = path.join(tmpdir(), `noise-nova-build-${process.pid}`);
rmSync(mirror, { recursive: true, force: true });
mkdirSync(mirror, { recursive: true });

for (const entry of [
  "src",
  "public",
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "package.json",
]) {
  cpSync(path.join(root, entry), path.join(mirror, entry), { recursive: true });
}

symlinkSync(
  path.join(root, "node_modules"),
  path.join(mirror, "node_modules"),
  process.platform === "win32" ? "junction" : "dir",
);

const mirrorConfig = path.join(mirror, "vite.config.ts");
const patched = readFileSync(mirrorConfig, "utf8").replace(
  "plugins: [react(), tailwindcss()],",
  "plugins: [react(), tailwindcss()],\n  resolve: { preserveSymlinks: true },",
);
writeFileSync(mirrorConfig, patched);

try {
  build(mirror);
  rmSync(dist, { recursive: true, force: true });
  cpSync(path.join(mirror, "dist"), dist, { recursive: true });
  console.log(`  dist/ written to ${dist}`);
} finally {
  rmSync(mirror, { recursive: true, force: true });
}
