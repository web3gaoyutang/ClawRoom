// Color palette - techy / community vibe
export const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
  '#F1948A', '#AED6F1', '#A3E4D7', '#FAD7A0',
  '#C39BD3', '#7DCEA0', '#F0B27A', '#ABB2B9',
];

export const HAIR_COLORS = [
  '#2C3E50', '#E74C3C', '#F39C12', '#8E44AD',
  '#1ABC9C', '#E67E22', '#95A5A6', '#D35400',
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
  return {
    bodyType: h % 3,
    colorPrimary: COLORS[h % COLORS.length],
    colorSecondary: COLORS[(h * 7 + 3) % COLORS.length],
    hairStyle: (h >> 4) % 6,
    hairColor: HAIR_COLORS[(h >> 8) % HAIR_COLORS.length],
    accessory: (h >> 12) % 5 > 2 ? (h >> 12) % 5 : null,
  };
}

// Draw a pixel character onto a canvas and return as ImageBitmap/DataURL
export function renderPixelCharacter(
  colorPrimary: string,
  colorSecondary: string,
  hairColor: string,
  hairStyle: number,
  direction: 'left' | 'right',
  frame: number,
  tag?: string,
): HTMLCanvasElement {
  const s = 4; // pixel scale
  const w = 16 * s;
  const h = 24 * s;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const px = (x: number, y: number, color: string) => {
    const dx = direction === 'right' ? x : 15 - x;
    ctx.fillStyle = color;
    ctx.fillRect(dx * s, y * s, s, s);
  };

  const skin = '#FFDAB9';
  const shoe = '#4A4A4A';
  const eyeColor = '#2C3E50';

  // Hair (top)
  const drawHair = () => {
    const c = hairColor;
    if (hairStyle === 0) {
      // short
      for (let x = 5; x <= 10; x++) px(x, 2, c);
      for (let x = 4; x <= 11; x++) px(x, 3, c);
      px(4, 4, c); px(5, 4, c); px(10, 4, c); px(11, 4, c);
    } else if (hairStyle === 1) {
      // spiky
      for (let x = 5; x <= 10; x++) px(x, 2, c);
      for (let x = 4; x <= 11; x++) px(x, 3, c);
      px(5, 1, c); px(7, 0, c); px(9, 1, c); px(11, 2, c);
    } else if (hairStyle === 2) {
      // long
      for (let x = 5; x <= 10; x++) px(x, 2, c);
      for (let x = 4; x <= 11; x++) px(x, 3, c);
      px(4, 4, c); px(4, 5, c); px(4, 6, c); px(4, 7, c);
      px(11, 4, c); px(11, 5, c); px(11, 6, c); px(11, 7, c);
    } else if (hairStyle === 3) {
      // mohawk
      for (let x = 6; x <= 9; x++) { px(x, 0, c); px(x, 1, c); }
      for (let x = 5; x <= 10; x++) px(x, 2, c);
      for (let x = 4; x <= 11; x++) px(x, 3, c);
    } else if (hairStyle === 4) {
      // cap
      for (let x = 4; x <= 12; x++) px(x, 2, colorSecondary);
      for (let x = 3; x <= 12; x++) px(x, 3, colorSecondary);
    } else {
      // bald with headband
      for (let x = 4; x <= 11; x++) px(x, 3, colorSecondary);
    }
  };

  // Head
  const drawHead = () => {
    for (let x = 5; x <= 10; x++) {
      for (let y = 4; y <= 8; y++) px(x, y, skin);
    }
    // eyes
    px(6, 6, eyeColor);
    px(9, 6, eyeColor);
    // mouth
    px(7, 8, '#E74C3C');
    px(8, 8, '#E74C3C');
  };

  // Body
  const drawBody = (f: number) => {
    // torso
    for (let x = 5; x <= 10; x++) {
      for (let y = 9; y <= 14; y++) px(x, y, colorPrimary);
    }
    // arms
    const armOffset = f % 2 === 0 ? 0 : 1;
    for (let y = 10; y <= 13; y++) {
      px(4, y + (y % 2 === 0 ? armOffset : 0), skin);
      px(11, y + (y % 2 === 0 ? -armOffset : 0), skin);
    }
    // belt/detail
    for (let x = 5; x <= 10; x++) px(x, 14, colorSecondary);
  };

  // Legs
  const drawLegs = (f: number) => {
    const walk = f % 4;
    const leftOff = walk < 2 ? 0 : 1;
    const rightOff = walk < 2 ? 1 : 0;

    // left leg
    for (let y = 15; y <= 19; y++) px(6, y + leftOff, colorPrimary === '#2C3E50' ? '#1A252F' : '#2C3E50');
    for (let y = 15; y <= 19; y++) px(7, y + leftOff, colorPrimary === '#2C3E50' ? '#1A252F' : '#2C3E50');
    // right leg
    for (let y = 15; y <= 19; y++) px(9, y + rightOff, colorPrimary === '#2C3E50' ? '#1A252F' : '#2C3E50');
    for (let y = 15; y <= 19; y++) px(10, y + rightOff, colorPrimary === '#2C3E50' ? '#1A252F' : '#2C3E50');

    // shoes
    px(5, 20 + leftOff, shoe); px(6, 20 + leftOff, shoe); px(7, 20 + leftOff, shoe);
    px(9, 20 + rightOff, shoe); px(10, 20 + rightOff, shoe); px(11, 20 + rightOff, shoe);
  };

  drawHair();
  drawHead();
  drawBody(frame);
  drawLegs(frame);

  // Tag badge
  if (tag && tag !== 'normal') {
    const badgeColor = TAG_COLORS[tag] || '#FFFFFF';
    px(12, 4, badgeColor);
    px(13, 4, badgeColor);
    px(12, 5, badgeColor);
    px(13, 5, badgeColor);
  }

  return canvas;
}
