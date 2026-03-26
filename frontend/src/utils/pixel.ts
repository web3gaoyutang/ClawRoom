// ── Palette ──────────────────────────────────────────────
export const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
  '#F1948A', '#AED6F1', '#A3E4D7', '#FAD7A0',
  '#C39BD3', '#7DCEA0', '#F0B27A', '#6C5CE7',
  '#00CEC9', '#E17055', '#FDCB6E', '#E84393',
];

export const HAIR_COLORS = [
  '#2C3E50', '#E74C3C', '#F39C12', '#8E44AD',
  '#1ABC9C', '#E67E22', '#95A5A6', '#D35400',
  '#5C3317', '#1B1B2F', '#C0392B', '#2980B9',
];

export const SKIN_TONES = [
  '#FFDAB9', '#F5CBA7', '#E0AC69', '#C68642', '#8D5524', '#FDEBD0',
];

export const TAG_COLORS: Record<string, string> = {
  speaker: '#FFD700',
  volunteer: '#00FF88',
  vip: '#FF44FF',
  organizer: '#FF4444',
  normal: '#FFFFFF',
};

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateCharacterColors(userId: string) {
  const h = hashString(userId);
  const h2 = hashString(userId + '_salt');
  return {
    bodyType: h % 3,
    colorPrimary: COLORS[h % COLORS.length],
    colorSecondary: COLORS[(h2) % COLORS.length],
    hairStyle: (h >> 4) % 8,
    hairColor: HAIR_COLORS[(h >> 8) % HAIR_COLORS.length],
    skinTone: SKIN_TONES[(h >> 6) % SKIN_TONES.length],
    accessory: (h >> 10) % 7, // 0-6
  };
}

// ── Sprite size: 20 wide × 28 tall (at 1px), rendered at 3x ──
const S = 3;       // pixel scale
const SW = 20;     // sprite logical width
const SH = 28;     // sprite logical height

export const SPRITE_W = SW * S;  // 60
export const SPRITE_H = SH * S;  // 84

type Ctx = CanvasRenderingContext2D;

function px(ctx: Ctx, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * S, y * S, S, S);
}

function pxRect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x * S, y * S, w * S, h * S);
}

function darker(hex: string, amount = 30): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
  const b = Math.max(0, (num & 0xFF) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function lighter(hex: string, amount = 40): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
  const b = Math.min(255, (num & 0xFF) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// ── Hair styles ──────────────────────────────────────────
function drawHair(ctx: Ctx, style: number, c: string, sec: string, dir: 'left' | 'right') {
  const d = dir === 'right' ? 1 : -1;
  const mx = (x: number) => dir === 'right' ? x : SW - 1 - x;

  switch (style) {
    case 0: // short neat
      for (let x = 6; x <= 13; x++) px(ctx, mx(x), 2, c);
      for (let x = 5; x <= 14; x++) px(ctx, mx(x), 3, c);
      for (let x = 5; x <= 14; x++) px(ctx, mx(x), 4, c);
      px(ctx, mx(5), 5, c); px(ctx, mx(6), 5, c);
      px(ctx, mx(13), 5, c); px(ctx, mx(14), 5, c);
      break;
    case 1: // spiky punk
      for (let x = 6; x <= 13; x++) px(ctx, mx(x), 3, c);
      for (let x = 5; x <= 14; x++) px(ctx, mx(x), 4, c);
      px(ctx, mx(6), 1, c); px(ctx, mx(6), 2, c);
      px(ctx, mx(8), 0, c); px(ctx, mx(8), 1, c); px(ctx, mx(8), 2, c);
      px(ctx, mx(10), 0, c); px(ctx, mx(10), 1, c); px(ctx, mx(10), 2, c);
      px(ctx, mx(12), 1, c); px(ctx, mx(12), 2, c);
      px(ctx, mx(14), 2, c); px(ctx, mx(14), 3, c);
      break;
    case 2: // long flowing
      for (let x = 6; x <= 13; x++) px(ctx, mx(x), 3, c);
      for (let x = 5; x <= 14; x++) px(ctx, mx(x), 4, c);
      px(ctx, mx(5), 5, c); px(ctx, mx(5), 6, c); px(ctx, mx(5), 7, c);
      px(ctx, mx(5), 8, c); px(ctx, mx(5), 9, c); px(ctx, mx(4), 9, c);
      px(ctx, mx(14), 5, c); px(ctx, mx(14), 6, c); px(ctx, mx(14), 7, c);
      px(ctx, mx(14), 8, c); px(ctx, mx(14), 9, c); px(ctx, mx(15), 9, c);
      break;
    case 3: // mohawk
      for (let x = 8; x <= 11; x++) {
        px(ctx, mx(x), 0, c); px(ctx, mx(x), 1, c); px(ctx, mx(x), 2, c);
      }
      for (let x = 6; x <= 13; x++) px(ctx, mx(x), 3, c);
      for (let x = 5; x <= 14; x++) px(ctx, mx(x), 4, c);
      break;
    case 4: // beanie/cap
      for (let x = 5; x <= 14; x++) px(ctx, mx(x), 2, sec);
      for (let x = 4; x <= 15; x++) px(ctx, mx(x), 3, sec);
      for (let x = 4; x <= 15; x++) px(ctx, mx(x), 4, darker(sec));
      // brim
      for (let x = 4; x <= 16; x++) px(ctx, mx(x), 5, darker(sec, 50));
      break;
    case 5: // afro
      for (let x = 5; x <= 14; x++) px(ctx, mx(x), 1, c);
      for (let x = 4; x <= 15; x++) { px(ctx, mx(x), 2, c); px(ctx, mx(x), 3, c); }
      for (let x = 4; x <= 15; x++) px(ctx, mx(x), 4, c);
      px(ctx, mx(4), 5, c); px(ctx, mx(4), 6, c);
      px(ctx, mx(15), 5, c); px(ctx, mx(15), 6, c);
      break;
    case 6: // side part
      for (let x = 6; x <= 13; x++) px(ctx, mx(x), 3, c);
      for (let x = 5; x <= 14; x++) px(ctx, mx(x), 4, c);
      px(ctx, mx(5), 5, c); px(ctx, mx(6), 5, c); px(ctx, mx(7), 5, c);
      px(ctx, mx(5), 6, c);
      // highlight streak
      px(ctx, mx(8), 3, lighter(c, 60));
      px(ctx, mx(9), 3, lighter(c, 60));
      break;
    case 7: // hoodie up
      for (let x = 4; x <= 15; x++) px(ctx, mx(x), 2, sec);
      for (let x = 3; x <= 16; x++) px(ctx, mx(x), 3, sec);
      for (let x = 4; x <= 15; x++) px(ctx, mx(x), 4, sec);
      px(ctx, mx(4), 5, sec); px(ctx, mx(15), 5, sec);
      px(ctx, mx(4), 6, sec); px(ctx, mx(15), 6, sec);
      break;
  }
}

// ── Head ──────────────────────────────────────────
function drawHead(ctx: Ctx, skin: string, dir: 'left' | 'right') {
  const mx = (x: number) => dir === 'right' ? x : SW - 1 - x;
  const skinD = darker(skin, 20);

  // Face 6x5 centered
  for (let x = 6; x <= 13; x++) {
    for (let y = 5; y <= 9; y++) {
      px(ctx, mx(x), y, skin);
    }
  }
  // Ears
  px(ctx, mx(5), 6, skin); px(ctx, mx(5), 7, skin);
  px(ctx, mx(14), 6, skin); px(ctx, mx(14), 7, skin);

  // Eyes - expressive
  px(ctx, mx(7), 7, '#FFFFFF'); px(ctx, mx(8), 7, '#FFFFFF');
  px(ctx, mx(8), 7, '#1a1a2e');  // pupil
  px(ctx, mx(11), 7, '#FFFFFF'); px(ctx, mx(12), 7, '#FFFFFF');
  px(ctx, mx(11), 7, '#1a1a2e'); // pupil
  // Eye shine
  px(ctx, mx(8), 6, 'rgba(255,255,255,0.4)');
  px(ctx, mx(11), 6, 'rgba(255,255,255,0.4)');

  // Nose
  px(ctx, mx(10), 8, skinD);

  // Mouth
  px(ctx, mx(8), 9, '#D35D6E'); px(ctx, mx(9), 9, '#D35D6E'); px(ctx, mx(10), 9, '#D35D6E');
  px(ctx, mx(11), 9, '#D35D6E');
}

// ── Body + Arms ──────────────────────────────────
function drawBody(
  ctx: Ctx, frame: number, primary: string, secondary: string,
  skin: string, dir: 'left' | 'right', state: string, accessory: number,
) {
  const mx = (x: number) => dir === 'right' ? x : SW - 1 - x;
  const priD = darker(primary);

  // Neck
  px(ctx, mx(9), 10, skin); px(ctx, mx(10), 10, skin);

  // Torso (wider, with detail)
  for (let x = 6; x <= 13; x++) {
    for (let y = 11; y <= 16; y++) {
      px(ctx, mx(x), y, primary);
    }
  }
  // Collar / neckline
  px(ctx, mx(8), 11, priD); px(ctx, mx(9), 11, priD);
  px(ctx, mx(10), 11, priD); px(ctx, mx(11), 11, priD);
  // Shirt detail - pocket or logo
  px(ctx, mx(7), 13, secondary); px(ctx, mx(8), 13, secondary);
  px(ctx, mx(7), 14, secondary); px(ctx, mx(8), 14, secondary);
  // Belt
  for (let x = 6; x <= 13; x++) px(ctx, mx(x), 16, darker(primary, 50));
  px(ctx, mx(9), 16, '#C0C0C0'); // belt buckle

  // Arms with swing animation
  const isWalking = state === 'walking' || state === 'entering';
  const isWaving = state === 'waving';
  const isTyping = state === 'typing';
  const isDrinking = state === 'drinking';
  const swing = isWalking ? Math.sin(frame * Math.PI / 2) * 2 : 0;

  // Left arm
  const ly = isWaving ? -2 : Math.round(swing);
  for (let i = 0; i < 5; i++) {
    px(ctx, mx(5), 11 + i + ly, i < 3 ? primary : skin);
  }
  if (isWaving) {
    // Wave hand up
    px(ctx, mx(4), 9 + ly, skin);
    px(ctx, mx(5), 9 + ly, skin);
  }

  // Right arm
  const ry = isTyping || isDrinking ? -1 : Math.round(-swing);
  for (let i = 0; i < 5; i++) {
    px(ctx, mx(14), 11 + i + ry, i < 3 ? primary : skin);
  }

  // Held items
  if (isDrinking) {
    // Coffee cup in right hand
    px(ctx, mx(15), 13, '#FFFFFF');
    px(ctx, mx(15), 14, '#8B4513');
    px(ctx, mx(16), 13, '#FFFFFF');
    px(ctx, mx(16), 14, '#8B4513');
    // Steam
    px(ctx, mx(15), 12, 'rgba(200,200,200,0.5)');
  }
  if (isTyping) {
    // Phone / small device in hand
    px(ctx, mx(15), 13, '#333344');
    px(ctx, mx(15), 14, '#333344');
    px(ctx, mx(16), 13, '#4488FF');
    px(ctx, mx(16), 14, '#333344');
  }

  // Accessory: backpack (drawn behind)
  if (accessory === 1) {
    const bx = dir === 'right' ? 3 : SW - 4;
    pxRect(ctx, bx, 12, 2, 5, secondary);
    pxRect(ctx, bx, 12, 2, 1, darker(secondary));
    px(ctx, bx, 14, darker(secondary, 40));
  }
}

// ── Legs + Shoes ──────────────────────────────────
function drawLegs(
  ctx: Ctx, frame: number, primary: string, dir: 'left' | 'right',
  state: string,
) {
  const mx = (x: number) => dir === 'right' ? x : SW - 1 - x;
  const pants = darker(primary, 60);
  const pantsD = darker(pants, 20);
  const shoe = '#2d2d3d';
  const shoeH = '#3d3d55';

  const isWalking = state === 'walking' || state === 'entering';
  const isSitting = state === 'sitting';

  if (isSitting) {
    // Legs forward (sitting)
    for (let x = 6; x <= 8; x++) { px(ctx, mx(x), 17, pants); px(ctx, mx(x), 18, pants); }
    for (let x = 11; x <= 13; x++) { px(ctx, mx(x), 17, pants); px(ctx, mx(x), 18, pants); }
    // shoes
    px(ctx, mx(6), 19, shoe); px(ctx, mx(7), 19, shoe); px(ctx, mx(8), 19, shoeH);
    px(ctx, mx(11), 19, shoe); px(ctx, mx(12), 19, shoe); px(ctx, mx(13), 19, shoeH);
    return;
  }

  const walk = isWalking ? frame % 4 : 0;
  const lOff = walk < 2 ? 0 : 1;
  const rOff = walk < 2 ? 1 : 0;

  // Left leg
  for (let y = 17; y <= 21; y++) {
    px(ctx, mx(7), y + lOff, pants);
    px(ctx, mx(8), y + lOff, pantsD);
  }
  // Right leg
  for (let y = 17; y <= 21; y++) {
    px(ctx, mx(11), y + rOff, pants);
    px(ctx, mx(12), y + rOff, pantsD);
  }

  // Shoes with detail
  px(ctx, mx(6), 22 + lOff, shoe);
  px(ctx, mx(7), 22 + lOff, shoe);
  px(ctx, mx(8), 22 + lOff, shoeH);
  px(ctx, mx(9), 22 + lOff, shoeH);

  px(ctx, mx(10), 22 + rOff, shoe);
  px(ctx, mx(11), 22 + rOff, shoe);
  px(ctx, mx(12), 22 + rOff, shoeH);
  px(ctx, mx(13), 22 + rOff, shoeH);
  // Shoe sole line
  px(ctx, mx(6), 23 + lOff, '#1a1a1a');
  px(ctx, mx(7), 23 + lOff, '#1a1a1a');
  px(ctx, mx(10), 23 + rOff, '#1a1a1a');
  px(ctx, mx(11), 23 + rOff, '#1a1a1a');
}

// ── Accessories (overlay) ────────────────────────
function drawAccessoryOverlay(
  ctx: Ctx, accessory: number, secondary: string, dir: 'left' | 'right',
  _frame: number,
) {
  const mx = (x: number) => dir === 'right' ? x : SW - 1 - x;

  switch (accessory) {
    case 2: {
      // Laptop bag strap
      const sx = dir === 'right' ? 5 : SW - 6;
      for (let y = 11; y <= 15; y++) px(ctx, sx, y, darker(secondary, 30));
      break;
    }
    case 3: {
      // Lanyard / badge
      px(ctx, mx(9), 11, '#FFD700');
      px(ctx, mx(10), 11, '#FFD700');
      px(ctx, mx(9), 12, '#FFD700');
      px(ctx, mx(10), 12, '#FFD700');
      // Badge
      pxRect(ctx, mx(8), 13, 1, 2, '#FFFFFF');
      pxRect(ctx, mx(9), 13, 2, 2, '#4488FF');
      pxRect(ctx, mx(11), 13, 1, 2, '#FFFFFF');
      break;
    }
    case 4: {
      // Coffee (permanent - small pin)
      px(ctx, mx(12), 12, '#8B4513');
      px(ctx, mx(13), 12, '#FFFFFF');
      break;
    }
    case 5: {
      // Headphones
      px(ctx, mx(5), 4, '#444466');
      px(ctx, mx(5), 5, '#444466');
      px(ctx, mx(5), 6, '#555577');
      px(ctx, mx(14), 4, '#444466');
      px(ctx, mx(14), 5, '#444466');
      px(ctx, mx(14), 6, '#555577');
      // Band on top
      for (let x = 6; x <= 13; x++) px(ctx, mx(x), 2, '#444466');
      break;
    }
    case 6: {
      // Sunglasses
      pxRect(ctx, mx(7), 7, 2, 1, '#111111');
      pxRect(ctx, mx(10), 7, 2, 1, '#111111');
      px(ctx, mx(9), 7, '#333333'); // bridge
      // Reflection
      px(ctx, mx(7), 7, '#334466');
      px(ctx, mx(10), 7, '#334466');
      break;
    }
  }
}

// ── Tag badge ────────────────────────────────────
function drawTagBadge(ctx: Ctx, tag: string, dir: 'left' | 'right') {
  if (!tag || tag === 'normal') return;
  const mx = (x: number) => dir === 'right' ? x : SW - 1 - x;
  const c = TAG_COLORS[tag] || '#FFFFFF';
  // Star badge
  px(ctx, mx(15), 4, c);
  px(ctx, mx(14), 5, c); px(ctx, mx(15), 5, c); px(ctx, mx(16), 5, c);
  px(ctx, mx(15), 6, c);
}

// ── Shadow ───────────────────────────────────────
function drawShadow(ctx: Ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(SW * S / 2, 25 * S, 5 * S, 1.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ── Main render function ─────────────────────────
export function renderPixelCharacter(
  colorPrimary: string,
  colorSecondary: string,
  hairColor: string,
  hairStyle: number,
  skinTone: string,
  direction: 'left' | 'right',
  frame: number,
  accessory: number,
  state: string,
  tag?: string,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_W;
  canvas.height = SPRITE_H;
  const ctx = canvas.getContext('2d')!;

  drawShadow(ctx);
  // Draw backpack behind body if applicable
  if (accessory === 1) {
    drawBody(ctx, frame, colorPrimary, colorSecondary, skinTone, direction, state, accessory);
  }
  drawHair(ctx, hairStyle, hairColor, colorSecondary, direction);
  drawHead(ctx, skinTone, direction);
  if (accessory !== 1) {
    drawBody(ctx, frame, colorPrimary, colorSecondary, skinTone, direction, state, accessory);
  }
  drawLegs(ctx, frame, colorPrimary, direction, state);
  drawAccessoryOverlay(ctx, accessory, colorSecondary, direction, frame);
  drawTagBadge(ctx, tag || '', direction);

  return canvas;
}
