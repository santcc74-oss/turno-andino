/* Genera icons/icon-180.png, icon-192.png e icon-512.png sin librerías (dibuja el mismo diseño que icons/icon.svg).
   Uso: node tools/make-icons.js */
const fs = require("fs"), path = require("path"), zlib = require("zlib");

const NAVY = [15, 27, 45], BRASS = [224, 172, 82];

function bez(p0, p1, p2, p3, n) {
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]]);
  }
  return pts;
}
const shield = [[256, 150], [340, 184], [340, 246]]
  .concat(bez([340, 246], [340, 302], [304, 344], [256, 362], 24))
  .concat(bez([256, 362], [208, 344], [172, 302], [172, 246], 24))
  .concat([[172, 184]]);
function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function segDist(x, y, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
}
function inRoundRect(x, y, r) {
  const cx = Math.max(r, Math.min(512 - r, x)), cy = Math.max(r, Math.min(512 - r, y));
  return Math.hypot(x - cx, y - cy) <= r;
}

/* Color en un punto del lienzo de 512; null = transparente. */
function sample(x, y, rounded) {
  if (rounded && !inRoundRect(x, y, 112)) return null;
  const d = Math.hypot(x - 256, y - 256);
  if (Math.abs(d - 178) <= 8) return BRASS;
  if (Math.abs(d - 150) <= 2.5) {
    const ang = Math.atan2(y - 256, x - 256), s = ((ang < 0 ? ang + 2 * Math.PI : ang) * 150) % 24;
    if (s < 12) return BRASS;
  }
  if (inPoly(x, y, shield)) {
    if (segDist(x, y, [220, 262], [246, 288]) <= 10 || segDist(x, y, [246, 288], [296, 232]) <= 10) return NAVY;
    return BRASS;
  }
  return NAVY;
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function render(size, rounded) {
  const SS = 4, scale = 512 / size, raw = Buffer.alloc(size * (size * 4 + 1));
  for (let py = 0; py < size; py++) {
    raw[py * (size * 4 + 1)] = 0;
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const c = sample((px + (sx + 0.5) / SS) * scale, (py + (sy + 0.5) / SS) * scale, rounded);
        if (c) { r += c[0]; g += c[1]; b += c[2]; a += 1; }
      }
      const o = py * (size * 4 + 1) + 1 + px * 4, n = SS * SS;
      raw[o] = a ? Math.round(r / a) : 0; raw[o + 1] = a ? Math.round(g / a) : 0; raw[o + 2] = a ? Math.round(b / a) : 0; raw[o + 3] = Math.round((a / n) * 255);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const out = path.join(__dirname, "..", "icons");
/* iPhone recorta las esquinas por su cuenta: el de 180 va cuadrado y opaco. */
fs.writeFileSync(path.join(out, "icon-180.png"), render(180, false));
fs.writeFileSync(path.join(out, "icon-192.png"), render(192, true));
fs.writeFileSync(path.join(out, "icon-512.png"), render(512, true));
console.log("Íconos generados en", out);
