/**
 * Dependency-free PWA icon generator.
 *
 * Chrome's install criteria reject a manifest whose only icon is an SVG with
 * `sizes: "any"`, so the icons are rasterised here from a tiny software renderer
 * and encoded as real PNGs with zlib. Re-run with: node scripts/make-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve(import.meta.dirname, "..", "public", "icons");
mkdirSync(OUT, { recursive: true });

const BG = [0x08, 0x09, 0x0b, 255];
const ACCENT = [0xd9, 0xa3, 0x53, 255];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Coverage of a rounded rect at a single pixel, 4x4 supersampled. */
function roundedCoverage(px, py, size, radius) {
  let hits = 0;
  for (let sy = 0; sy < 4; sy += 1) {
    for (let sx = 0; sx < 4; sx += 1) {
      const x = px + (sx + 0.5) / 4;
      const y = py + (sy + 0.5) / 4;
      const cx = Math.min(Math.max(x, radius), size - radius);
      const cy = Math.min(Math.max(y, radius), size - radius);
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) hits += 1;
    }
  }
  return hits / 16;
}

/**
 * The mark: five vertical bars of increasing then decreasing height — a level
 * meter read left to right, which is exactly what the product measures.
 */
function render(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const radius = maskable ? 0 : size * 0.22;
  const safe = maskable ? 0.72 : 0.86;
  const barHeights = [0.3, 0.52, 0.76, 0.54, 0.34];
  const barWidth = (size * safe) / 11;
  const gap = barWidth * 0.62;
  const totalWidth = barHeights.length * barWidth + (barHeights.length - 1) * gap;
  const startX = (size - totalWidth) / 2;
  const midY = size / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const bgAlpha = maskable ? 1 : roundedCoverage(x, y, size, radius);
      let [r, g, b, a] = BG;

      for (let i = 0; i < barHeights.length; i += 1) {
        const bx = startX + i * (barWidth + gap);
        const height = size * safe * barHeights[i];
        const top = midY - height / 2;
        const bottom = midY + height / 2;
        const inside =
          x + 0.5 >= bx && x + 0.5 <= bx + barWidth && y + 0.5 >= top && y + 0.5 <= bottom;
        if (inside) {
          [r, g, b] = ACCENT;
          break;
        }
      }

      const offset = (y * size + x) * 4;
      rgba[offset] = r;
      rgba[offset + 1] = g;
      rgba[offset + 2] = b;
      rgba[offset + 3] = Math.round(a * bgAlpha);
    }
  }
  return encodePng(size, size, rgba);
}

const targets = [
  { name: "icon-192.png", size: 192, maskable: false },
  { name: "icon-512.png", size: 512, maskable: false },
  { name: "icon-maskable-512.png", size: 512, maskable: true },
  { name: "apple-touch-icon.png", size: 180, maskable: true },
];

for (const target of targets) {
  const buffer = render(target.size, { maskable: target.maskable });
  writeFileSync(path.join(OUT, target.name), buffer);
  console.log(`  ${target.name.padEnd(26)} ${target.size}x${target.size}  ${buffer.length} bytes`);
}

// Legacy launcher icons for API 24-25. Modern Android uses the adaptive vector
// in res/drawable/ic_launcher_foreground.xml, so these only cover old devices.
const ANDROID = path.resolve(import.meta.dirname, "..", "android", "app", "src", "main", "res");
if (existsSync(ANDROID)) {
  for (const [density, size] of Object.entries({
    mdpi: 48,
    hdpi: 72,
    xhdpi: 96,
    xxhdpi: 144,
    xxxhdpi: 192,
  })) {
    const dir = path.join(ANDROID, `mipmap-${density}`);
    mkdirSync(dir, { recursive: true });
    const icon = render(size);
    writeFileSync(path.join(dir, "ic_launcher.png"), icon);
    writeFileSync(path.join(dir, "ic_launcher_round.png"), icon);
  }
  console.log("  android legacy launcher icons updated");
}
