// generate-icons.js - Generates crisp 192x192 and 512x512 PNGs and SVG for Garay Fit OS
const fs = require('fs');
const zlib = require('zlib');

// Create PNG buffer from raw RGBA pixels
function createPng(width, height, pixelFn) {
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[i] = c;
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', deflated);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Pixel generator for Garay Fit OS Cyber-Athlete emblem
function garayFitPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const nx = (x - cx) / cx;
  const ny = (y - cy) / cy;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Deep dark cyber background (#090D16)
  let r = 9;
  let g = 13;
  let b = 22;
  let a = 255;

  // Background radial glow
  if (dist < 1.0) {
    const glow = Math.max(0, 1 - dist);
    // Orange + Cyan subtle ambient
    r += Math.floor(glow * 25);
    g += Math.floor(glow * 20);
    b += Math.floor(glow * 35);
  }

  // Rounded outer boundary / squircle
  const cornerR = 0.22;
  const absX = Math.abs(nx);
  const absY = Math.abs(ny);
  const isOutside = Math.pow(absX, 4) + Math.pow(absY, 4) > 0.95;
  if (isOutside) {
    // outer border fade
    return [0, 0, 0, 0];
  }

  // Cyber border
  const squircleDist = Math.pow(absX, 4) + Math.pow(absY, 4);
  if (squircleDist > 0.82 && squircleDist <= 0.94) {
    // Gradient border from Orange (#F97316) at top to Cyan (#06B6D4) at bottom
    const t = (ny + 1) / 2;
    r = Math.floor(249 * (1 - t) + 6 * t);
    g = Math.floor(115 * (1 - t) + 182 * t);
    b = Math.floor(22 * (1 - t) + 212 * t);
    return [r, g, b, 255];
  }

  // Central Emblem: Stylized Hexagonal "G" + Weight Plate Stack
  // Central plate stack (horizontal bars)
  const plateWidth = 0.45;
  const plates = [
    { y: -0.32, h: 0.06, active: true },
    { y: -0.22, h: 0.06, active: true },
    { y: -0.12, h: 0.06, active: true },
    { y: -0.02, h: 0.06, active: true },
    { y: 0.08, h: 0.06, active: false },
    { y: 0.18, h: 0.06, active: false }
  ];

  for (const plate of plates) {
    if (Math.abs(nx) < plateWidth && ny >= plate.y && ny <= plate.y + plate.h) {
      if (plate.active) {
        // Glowing Orange-Gold
        return [249, 115, 22, 255];
      } else {
        // Inactive dark steel plate
        return [31, 41, 55, 255];
      }
    }
  }

  // Center cable selector pin (vertical line)
  if (Math.abs(nx) < 0.025 && ny >= -0.36 && ny <= 0.26) {
    return [6, 182, 212, 255]; // Cyan cable
  }

  // Stylized "G" surrounding the weight stack
  // Outer circle/arc of G
  const arcR = Math.sqrt(nx * nx + ny * ny);
  if (arcR >= 0.52 && arcR <= 0.68) {
    // Cut out top-right angle for G opening
    const angle = Math.atan2(ny, nx); // -PI to PI
    const inOpening = (angle > -0.7 && angle < 0.2);
    if (!inOpening) {
      // Emerald Green to Cyan gradient
      const t = (nx + 1) / 2;
      return [
        Math.floor(16 * (1 - t) + 6 * t),
        Math.floor(185 * (1 - t) + 182 * t),
        Math.floor(129 * (1 - t) + 212 * t),
        255
      ];
    }
  }

  // Horizontal bar of "G"
  if (nx >= 0.05 && nx <= 0.58 && Math.abs(ny) <= 0.07) {
    return [6, 182, 212, 255];
  }
  // Vertical stem of "G" on right
  if (nx >= 0.50 && nx <= 0.68 && ny >= 0.0 && ny <= 0.40) {
    return [6, 182, 212, 255];
  }

  // Marcy MWM-4965SC indicator text dots
  if (Math.abs(ny - 0.38) < 0.03 && Math.abs(nx) < 0.25) {
    const dotIndex = Math.floor((nx + 0.25) / 0.1);
    if ((nx + 0.25) % 0.1 < 0.05) {
      return [249, 115, 22, 255]; // Orange LED dots
    }
  }

  return [r, g, b, a];
}

console.log('Generating PNG icons...');
const icon192 = createPng(192, 192, garayFitPixel);
fs.writeFileSync('icons/icon-192.png', icon192);
console.log('icons/icon-192.png written (' + icon192.length + ' bytes)');

const icon512 = createPng(512, 512, garayFitPixel);
fs.writeFileSync('icons/icon-512.png', icon512);
console.log('icons/icon-512.png written (' + icon512.length + ' bytes)');

// Also write apple-touch-icon
fs.writeFileSync('icons/apple-touch-icon.png', icon192);
console.log('icons/apple-touch-icon.png written');

// Generate SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#090D16"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
    <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background squircle -->
  <rect x="16" y="16" width="480" height="480" rx="96" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="8"/>

  <!-- Marcy Plate Stack Glow -->
  <g filter="url(#glow)">
    <!-- Active Plates (Gold/Orange) -->
    <rect x="180" y="160" width="152" height="24" rx="6" fill="#F97316"/>
    <rect x="180" y="194" width="152" height="24" rx="6" fill="#F97316"/>
    <rect x="180" y="228" width="152" height="24" rx="6" fill="#F97316"/>
    <rect x="180" y="262" width="152" height="24" rx="6" fill="#F97316"/>
    <!-- Inactive Plates (Steel Gray) -->
    <rect x="180" y="296" width="152" height="24" rx="6" fill="#1F2937" stroke="#374151" stroke-width="2"/>
    <rect x="180" y="330" width="152" height="24" rx="6" fill="#1F2937" stroke="#374151" stroke-width="2"/>
    
    <!-- Central Selector Rod & Pin -->
    <line x1="256" y1="140" x2="256" y2="370" stroke="#06B6D4" stroke-width="6" stroke-linecap="round"/>
    <circle cx="256" cy="274" r="8" fill="#FFFFFF" stroke="#06B6D4" stroke-width="3"/>
  </g>

  <!-- Cyber Athlete G Ring -->
  <path d="M 330 150 A 150 150 0 1 0 380 320 L 290 320 L 290 270 L 390 270 A 150 150 0 0 1 330 150" 
        fill="none" stroke="url(#gGrad)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>

  <!-- Pulse accents -->
  <circle cx="390" cy="270" r="10" fill="#06B6D4"/>
  <text x="256" y="420" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="#F97316" text-anchor="middle" letter-spacing="4">GARAY FIT OS</text>
  <text x="256" y="448" font-family="'JetBrains Mono', monospace" font-size="14" fill="#06B6D4" text-anchor="middle" letter-spacing="3">MARCY PRO // 150 LB</text>
</svg>`;

fs.writeFileSync('icons/icon.svg', svgIcon);
console.log('icons/icon.svg written');
