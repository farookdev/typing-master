#!/usr/bin/env node
/**
 * Generates PWA icon PNGs for "Typing Master" - a kids typing practice app.
 * Creates valid PNG files using only Node.js built-ins (no dependencies).
 *
 * Design: Purple (#7C3AED) rounded-rect background with a white keyboard icon
 * and a letter "T" above it, plus sparkle accents.
 */

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// -- PNG encoding helpers --

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const combined = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([length, combined, crc]);
}

function createPNG(width, height, pixels) {
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const filterByte = Buffer.from([0]);
    const row = pixels.subarray(y * width * 4, (y + 1) * width * 4);
    rawRows.push(filterByte, row);
  }
  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// -- Drawing primitives --

function setPixel(pixels, width, height, x, y, r, g, b, a) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (y * width + x) * 4;
  if (a < 255 && pixels[idx + 3] > 0) {
    const srcA = a / 255;
    const dstA = pixels[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA > 0) {
      pixels[idx]     = Math.round((r * srcA + pixels[idx]     * dstA * (1 - srcA)) / outA);
      pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA);
      pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA);
      pixels[idx + 3] = Math.round(outA * 255);
    }
  } else {
    pixels[idx]     = r;
    pixels[idx + 1] = g;
    pixels[idx + 2] = b;
    pixels[idx + 3] = a;
  }
}

function fillRect(pixels, S, x, y, w, h, r, g, b, a) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(pixels, S, S, x + dx, y + dy, r, g, b, a);
    }
  }
}

function fillRoundedRect(pixels, S, x, y, w, h, radius, r, g, b, a) {
  // Center body
  fillRect(pixels, S, x + radius, y, w - 2 * radius, h, r, g, b, a);
  fillRect(pixels, S, x, y + radius, radius, h - 2 * radius, r, g, b, a);
  fillRect(pixels, S, x + w - radius, y + radius, radius, h - 2 * radius, r, g, b, a);

  // Corners
  const corners = [
    [x + radius, y + radius, -1, -1],
    [x + w - radius - 1, y + radius, 1, -1],
    [x + radius, y + h - radius - 1, -1, 1],
    [x + w - radius - 1, y + h - radius - 1, 1, 1],
  ];

  for (const [cx, cy, ox, oy] of corners) {
    for (let dy = 0; dy <= radius; dy++) {
      for (let dx = 0; dx <= radius; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius + 0.5) {
          const edgeDist = radius - dist;
          const aa = Math.min(1, Math.max(0, edgeDist + 0.5));
          const blendedA = Math.round(a * aa);
          const px = cx + dx * (ox > 0 ? 1 : -1) + (ox > 0 ? 1 : 0);
          const py = cy + dy * (oy > 0 ? 1 : -1) + (oy > 0 ? 1 : 0);
          setPixel(pixels, S, S, px, py, r, g, b, blendedA);
        }
      }
    }
  }
}

function fillCircle(pixels, S, cx, cy, radius, r, g, b, a) {
  for (let dy = -radius - 1; dy <= radius + 1; dy++) {
    for (let dx = -radius - 1; dx <= radius + 1; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius + 0.5) {
        const edgeDist = radius - dist;
        const aa = Math.min(1, Math.max(0, edgeDist + 0.5));
        setPixel(pixels, S, S, cx + dx, cy + dy, r, g, b, Math.round(a * aa));
      }
    }
  }
}

// -- Icon drawing --

function drawIcon(size) {
  const pixels = Buffer.alloc(size * size * 4, 0);
  const S = size;
  const u = S / 512;

  // Background: purple rounded square
  const bgRadius = Math.round(90 * u);
  const margin = Math.round(12 * u);
  fillRoundedRect(pixels, S,
    margin, margin, S - 2 * margin, S - 2 * margin,
    bgRadius, 124, 58, 237, 255
  );

  // Subtle lighter inner glow on top portion
  const glowH = Math.round(160 * u);
  for (let y = margin; y < margin + glowH; y++) {
    const t = 1 - (y - margin) / glowH;
    const alpha = Math.round(40 * t);
    for (let x = margin; x < S - margin; x++) {
      const idx = (y * S + x) * 4;
      if (pixels[idx + 3] > 0) {
        setPixel(pixels, S, S, x, y, 255, 255, 255, alpha);
      }
    }
  }

  // Keyboard body: white rounded rectangle
  const kbW = Math.round(340 * u);
  const kbH = Math.round(180 * u);
  const kbX = Math.round((S - kbW) / 2);
  const kbY = Math.round(S * 0.42);
  const kbR = Math.round(24 * u);
  fillRoundedRect(pixels, S, kbX, kbY, kbW, kbH, kbR, 255, 255, 255, 230);

  // Keyboard keys
  const keyR = 124, keyG = 58, keyB = 237;
  const keyH = Math.round(28 * u);
  const keyGap = Math.round(10 * u);
  const keyRadius = Math.round(6 * u);

  // Row 1: 8 keys
  const row1Y = kbY + Math.round(20 * u);
  const row1Count = 8;
  const row1Pad = Math.round(20 * u);
  const row1KeyW = Math.round((kbW - 2 * row1Pad - (row1Count - 1) * keyGap) / row1Count);
  for (let i = 0; i < row1Count; i++) {
    fillRoundedRect(pixels, S,
      kbX + row1Pad + i * (row1KeyW + keyGap), row1Y, row1KeyW, keyH, keyRadius,
      keyR, keyG, keyB, 200
    );
  }

  // Row 2: 7 keys (offset)
  const row2Y = row1Y + keyH + keyGap;
  const row2Count = 7;
  const row2Pad = Math.round(35 * u);
  const row2KeyW = Math.round((kbW - 2 * row2Pad - (row2Count - 1) * keyGap) / row2Count);
  for (let i = 0; i < row2Count; i++) {
    fillRoundedRect(pixels, S,
      kbX + row2Pad + i * (row2KeyW + keyGap), row2Y, row2KeyW, keyH, keyRadius,
      keyR, keyG, keyB, 200
    );
  }

  // Row 3: spacebar + 2 side keys
  const row3Y = row2Y + keyH + keyGap;
  const sideKeyW = Math.round(50 * u);
  const row3Pad = Math.round(20 * u);
  const spaceBarW = kbW - 2 * row3Pad - 2 * sideKeyW - 2 * keyGap;

  fillRoundedRect(pixels, S,
    kbX + row3Pad, row3Y, sideKeyW, keyH, keyRadius,
    keyR, keyG, keyB, 200
  );
  fillRoundedRect(pixels, S,
    kbX + row3Pad + sideKeyW + keyGap, row3Y, spaceBarW, keyH, keyRadius,
    keyR, keyG, keyB, 160
  );
  fillRoundedRect(pixels, S,
    kbX + row3Pad + sideKeyW + keyGap + spaceBarW + keyGap, row3Y, sideKeyW, keyH, keyRadius,
    keyR, keyG, keyB, 200
  );

  // Letter "T" above keyboard
  const strokeW = Math.round(20 * u);
  const tTopY = Math.round(S * 0.12);
  const tWidth = Math.round(100 * u);
  const tHeight = Math.round(100 * u);
  const tCenterX = Math.round(S / 2);

  // T horizontal bar
  fillRoundedRect(pixels, S,
    tCenterX - Math.round(tWidth / 2), tTopY,
    tWidth, strokeW, Math.round(strokeW / 2),
    255, 255, 255, 255
  );
  // T vertical bar
  fillRoundedRect(pixels, S,
    tCenterX - Math.round(strokeW / 2), tTopY,
    strokeW, tHeight, Math.round(strokeW / 2),
    255, 255, 255, 255
  );

  // Sparkle accents
  fillCircle(pixels, S, Math.round(380 * u), Math.round(100 * u), Math.round(8 * u), 255, 255, 255, 200);
  fillCircle(pixels, S, Math.round(400 * u), Math.round(135 * u), Math.round(5 * u), 255, 255, 255, 160);
  fillCircle(pixels, S, Math.round(120 * u), Math.round(420 * u), Math.round(6 * u), 255, 255, 255, 180);

  return createPNG(S, S, pixels);
}

// -- Main --

const outDir = __dirname;
for (const size of [192, 512]) {
  const pngData = drawIcon(size);
  const filePath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, pngData);
  const kb = (pngData.length / 1024).toFixed(1);
  console.log(`Created ${filePath}  (${size}x${size}, ${kb} KB)`);
}
console.log('\nDone! Both PWA icons generated successfully.');
