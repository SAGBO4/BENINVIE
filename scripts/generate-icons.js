const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}
const table = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  }
  table[n] = c;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([lenBuf, crcInput, crcBuf]);
}

function generatePng(width, height, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk("IHDR", ihdrData);

  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const r = isMaskable ? width : width * 0.46;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dist = Math.hypot(x - cx, y - cy);

      if (isMaskable || dist <= r) {
        // Medical cross
        const crossW = width * 0.18;
        const crossL = width * 0.52;
        const inVert = Math.abs(x - cx) <= crossW / 2 && Math.abs(y - cy) <= crossL / 2;
        const inHoriz = Math.abs(y - cy) <= crossW / 2 && Math.abs(x - cx) <= crossL / 2;

        // Red heart / dot in center for HEMORA
        const inCenterDot = Math.hypot(x - cx, y - cy) <= width * 0.08;

        if (inCenterDot) {
          raw[pxOffset] = 239;     // #ef4444 red
          raw[pxOffset + 1] = 68;
          raw[pxOffset + 2] = 68;
          raw[pxOffset + 3] = 255;
        } else if (inVert || inHoriz) {
          raw[pxOffset] = 255;     // White cross
          raw[pxOffset + 1] = 255;
          raw[pxOffset + 2] = 255;
          raw[pxOffset + 3] = 255;
        } else {
          // National Emerald Green #008751
          raw[pxOffset] = 0;
          raw[pxOffset + 1] = 135;
          raw[pxOffset + 2] = 81;
          raw[pxOffset + 3] = 255;
        }
      } else {
        // Transparent border for non-maskable circle
        raw[pxOffset] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idat = makeChunk("IDAT", compressed);
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const outDir = path.join(__dirname, "../public");
const iconsDir = path.join(outDir, "icons");

fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), generatePng(180, 180, true));
fs.writeFileSync(path.join(outDir, "icon-192.png"), generatePng(192, 192, false));
fs.writeFileSync(path.join(outDir, "icon-512.png"), generatePng(512, 512, false));
fs.writeFileSync(path.join(iconsDir, "icon-192x192.png"), generatePng(192, 192, false));
fs.writeFileSync(path.join(iconsDir, "icon-512x512.png"), generatePng(512, 512, false));
fs.writeFileSync(path.join(iconsDir, "icon-maskable.png"), generatePng(512, 512, true));

console.log("PWA Icons generated successfully in public/ and public/icons/");
