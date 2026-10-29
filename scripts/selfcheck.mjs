#!/usr/bin/env node
/**
 * Self-check for the pure logic that the whole product hangs on.
 *
 * Runs on Node's native type stripping against the real source files — no test
 * framework, no fixtures, no build step. `npm run check`.
 */
import assert from "node:assert/strict";
import {
  average,
  dbFromRms,
  formatDb,
  peakOf,
  rmsFromSamples,
  statusFromDb,
  clampDb,
  DB_CEILING,
  DB_FLOOR,
} from "../src/lib/noise.ts";
import { readingsToCsv } from "../src/lib/csv.ts";
import { buildNodes } from "../src/lib/nodes.ts";

let checks = 0;
function check(name, fn) {
  try {
    fn();
    checks += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    console.error(`  FAIL ${name}`);
    console.error(`       ${error.message}`);
    process.exitCode = 1;
  }
}

const close = (actual, expected, tolerance = 1e-6) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected} ± ${tolerance}, got ${actual}`,
  );

console.log("noise");

check("rms of a full-scale square wave is 1", () => {
  close(rmsFromSamples(new Float32Array([1, -1, 1, -1])), 1);
});

check("rms of a half-scale square wave is 0.5", () => {
  close(rmsFromSamples(new Float32Array([0.5, -0.5, 0.5, -0.5])), 0.5);
});

check("rms of an empty block is 0, not NaN", () => {
  assert.equal(rmsFromSamples(new Float32Array(0)), 0);
});

check("silence clamps to the floor instead of -Infinity", () => {
  assert.equal(dbFromRms(0), DB_FLOOR);
  assert.ok(Number.isFinite(dbFromRms(0)));
});

check("full-scale rms maps to 90 dB", () => {
  close(dbFromRms(1), 90, 1e-9);
});

check("calibration offset is applied and still clamped", () => {
  close(dbFromRms(1, 5), 95, 1e-9);
  assert.equal(dbFromRms(1, 200), DB_CEILING);
  assert.equal(dbFromRms(0.00001, -200), DB_FLOOR);
});

check("clampDb rejects NaN and out-of-range input", () => {
  assert.equal(clampDb(Number.NaN), DB_FLOOR);
  assert.equal(clampDb(10), DB_FLOOR);
  assert.equal(clampDb(500), DB_CEILING);
});

check("status bands are inclusive at the top of each band", () => {
  assert.equal(statusFromDb(30), "QUIET");
  assert.equal(statusFromDb(40), "QUIET");
  assert.equal(statusFromDb(40.1), "MODERATE");
  assert.equal(statusFromDb(65), "MODERATE");
  assert.equal(statusFromDb(65.1), "LOUD");
  assert.equal(statusFromDb(80), "LOUD");
  assert.equal(statusFromDb(80.1), "VERY LOUD");
});

check("formatDb always renders one decimal", () => {
  assert.equal(formatDb(3), "3.0");
  assert.equal(formatDb(83.456), "83.5");
});

check("average and peak of an empty set are 0", () => {
  assert.equal(average([]), 0);
  assert.equal(peakOf([]), 0);
  assert.equal(average([2, 4]), 3);
  assert.equal(peakOf([2, 9, 4]), 9);
});

console.log("csv");

const sampleReading = {
  nodeId: 'phone-"01"',
  nodeLabel: "Room, \"quiet\"\nzone",
  kind: "phone",
  ts: Date.UTC(2026, 0, 2, 3, 4, 5),
  db: 67.25,
  rms: 0.012345,
  peak: 71.5,
  status: "LOUD",
  threshold: 65,
  source: "android-mic",
};

check("every cell is quoted and internal quotes are doubled", () => {
  const csv = readingsToCsv([sampleReading]);
  const [, row] = csv.split("\r\n");
  assert.ok(row.includes('"phone-""01"""'), row);
  assert.ok(row.includes('"Room, ""quiet"" zone"'), "newlines are flattened");
  assert.ok(row.endsWith('"LOUD","65"'), row);
});

check("header is stable", () => {
  assert.equal(
    readingsToCsv([]).split("\r\n")[0],
    [
      '"timestamp"',
      '"node_id"',
      '"node_label"',
      '"source"',
      '"estimated_db"',
      '"peak_db"',
      '"rms"',
      '"status"',
      '"threshold_db"',
    ].join(","),
  );
});

console.log("nodes");

const self = { nodeId: "laptop-self", nodeLabel: "Laptop node", kind: "laptop" };
const reading = (overrides) => ({
  ...sampleReading,
  nodeId: "phone-1",
  nodeLabel: "Phone",
  kind: "phone",
  ...overrides,
});

check("the local device is always present and sorted first", () => {
  const nodes = buildNodes([], [], self);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].nodeId, self.nodeId);
  assert.equal(nodes[0].readings, 0);
});

check("feed readings beat stale presence, presence fills the gaps", () => {
  const nodes = buildNodes(
    [
      reading({ ts: 1000, db: 50 }),
      reading({ ts: 2000, db: 70 }),
    ],
    [
      {
        nodeId: "phone-1",
        nodeLabel: "Phone",
        kind: "phone",
        lastSeen: 500,
        db: 40,
        status: "QUIET",
        source: "android-mic",
        readings: 9,
      },
      {
        nodeId: "board-1",
        nodeLabel: "ESP32",
        kind: "board",
        lastSeen: 900,
        db: 55,
        status: "MODERATE",
        source: "esp32",
        readings: 4,
      },
    ],
    self,
  );

  const phone = nodes.find((node) => node.nodeId === "phone-1");
  assert.equal(phone.db, 70, "latest feed reading wins");
  assert.equal(phone.lastSeen, 2000);
  assert.equal(phone.readings, 9, "the hub's larger stored total is kept");

  const board = nodes.find((node) => node.nodeId === "board-1");
  assert.equal(board.db, 55, "presence-only nodes are kept");
  assert.equal(board.source, "esp32");
});

check("a newer presence entry is not overwritten by older feed data", () => {
  const nodes = buildNodes(
    [reading({ ts: 1000, db: 50 })],
    [
      {
        nodeId: "phone-1",
        nodeLabel: "Phone",
        kind: "phone",
        lastSeen: 5000,
        db: 88,
        status: "VERY LOUD",
        source: "android-mic",
        readings: 3,
      },
    ],
    self,
  );
  assert.equal(nodes.find((node) => node.nodeId === "phone-1").db, 88);
});

console.log("");
if (process.exitCode) {
  console.error(`${checks} checks passed, some failed.`);
} else {
  console.log(`${checks} checks passed.`);
}
