const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size) {
  const width = size;
  const height = size;
  const buffer = Buffer.alloc((width * 4 + 1) * height);

  const primary = [79, 70, 229, 255]; // Indigo #4f46e5
  const accent = [16, 185, 129, 255]; // Emerald #10b981
  const bg = [255, 255, 255, 255];

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    buffer[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Dibuja esquinas de visor escáner y patrón central de QR
      const isCornerBorder =
        ((x <= Math.floor(size * 0.3) || x >= Math.floor(size * 0.7)) && (y === 1 || y === 2 || y === height - 2 || y === height - 3)) ||
        ((y <= Math.floor(size * 0.3) || y >= Math.floor(size * 0.7)) && (x === 1 || x === 2 || x === width - 2 || x === width - 3));
      
      const isQRModule =
        (x >= Math.floor(size * 0.35) && x <= Math.floor(size * 0.65) && y >= Math.floor(size * 0.35) && y <= Math.floor(size * 0.65)) ||
        (x % 3 === 0 && y % 3 === 0 && x > 2 && x < width - 3 && y > 2 && y < height - 3);

      if (isCornerBorder) {
        buffer[pxOffset] = accent[0];
        buffer[pxOffset + 1] = accent[1];
        buffer[pxOffset + 2] = accent[2];
        buffer[pxOffset + 3] = accent[3];
      } else if (isQRModule) {
        buffer[pxOffset] = primary[0];
        buffer[pxOffset + 1] = primary[1];
        buffer[pxOffset + 2] = primary[2];
        buffer[pxOffset + 3] = primary[3];
      } else {
        buffer[pxOffset] = bg[0];
        buffer[pxOffset + 1] = bg[1];
        buffer[pxOffset + 2] = bg[2];
        buffer[pxOffset + 3] = 240;
      }
    }
  }

  function crc32(buf) {
    let c;
    const table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(buffer);
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

[16, 48, 128].forEach(size => {
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, createPNG(size));
  console.log(`Generated: ${filePath}`);
});
