// Tile-based scene: collision map + decoration positions
// Room is 60x34 tiles (each tile = 16px at 1x)

export const TILE_SIZE = 16;
export const ROOM_COLS = 60;
export const ROOM_ROWS = 34;
export const ROOM_WIDTH = ROOM_COLS * TILE_SIZE;
export const ROOM_HEIGHT = ROOM_ROWS * TILE_SIZE;

// Entry point (door position in tile coords)
export const ENTRY_TILE = { x: 30, y: 1 };

// Collision map: 1 = blocked, 0 = walkable
// We define blocked areas for furniture/decorations
export interface Decoration {
  x: number; // tile x
  y: number; // tile y
  w: number; // width in tiles
  h: number; // height in tiles
  type: string;
  color: string;
}

export const DECORATIONS: Decoration[] = [
  // Server racks (left wall)
  { x: 2, y: 4, w: 3, h: 5, type: 'server', color: '#1a1a2e' },
  { x: 2, y: 11, w: 3, h: 5, type: 'server', color: '#16213e' },
  // Desks with terminals (scattered)
  { x: 12, y: 8, w: 4, h: 3, type: 'desk', color: '#2d2d44' },
  { x: 12, y: 18, w: 4, h: 3, type: 'desk', color: '#2d2d44' },
  { x: 25, y: 14, w: 4, h: 3, type: 'desk', color: '#2d2d44' },
  { x: 38, y: 8, w: 4, h: 3, type: 'desk', color: '#2d2d44' },
  { x: 38, y: 20, w: 4, h: 3, type: 'desk', color: '#2d2d44' },
  // Poster wall (top)
  { x: 10, y: 1, w: 6, h: 2, type: 'poster', color: '#4ECDC4' },
  { x: 42, y: 1, w: 6, h: 2, type: 'poster', color: '#FF6B6B' },
  // Couch / lounge area (bottom right)
  { x: 48, y: 24, w: 6, h: 3, type: 'couch', color: '#6c5ce7' },
  // Badge wall (right side)
  { x: 55, y: 4, w: 3, h: 6, type: 'badge_wall', color: '#fdcb6e' },
  // Coffee table
  { x: 48, y: 12, w: 3, h: 2, type: 'table', color: '#b07c4f' },
  // Plants
  { x: 1, y: 28, w: 2, h: 2, type: 'plant', color: '#00b894' },
  { x: 56, y: 28, w: 2, h: 2, type: 'plant', color: '#00b894' },
  // Stage / podium area
  { x: 22, y: 26, w: 8, h: 4, type: 'stage', color: '#636e72' },
];

export function buildCollisionMap(): boolean[][] {
  const map: boolean[][] = [];
  for (let y = 0; y < ROOM_ROWS; y++) {
    map[y] = [];
    for (let x = 0; x < ROOM_COLS; x++) {
      // walls
      if (x === 0 || x === ROOM_COLS - 1 || y === 0 || y === ROOM_ROWS - 1) {
        map[y][x] = true;
      } else {
        map[y][x] = false;
      }
    }
  }
  // Block decoration tiles
  for (const d of DECORATIONS) {
    if (d.type === 'poster') continue; // posters are on wall, don't block floor
    for (let dy = 0; dy < d.h; dy++) {
      for (let dx = 0; dx < d.w; dx++) {
        const tx = d.x + dx;
        const ty = d.y + dy;
        if (ty >= 0 && ty < ROOM_ROWS && tx >= 0 && tx < ROOM_COLS) {
          map[ty][tx] = true;
        }
      }
    }
  }
  return map;
}

export function getRandomWalkable(collision: boolean[][]): { x: number; y: number } {
  let attempts = 0;
  while (attempts < 200) {
    const tx = 2 + Math.floor(Math.random() * (ROOM_COLS - 4));
    const ty = 2 + Math.floor(Math.random() * (ROOM_ROWS - 4));
    if (!collision[ty][tx]) {
      return { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
    }
    attempts++;
  }
  return { x: ROOM_WIDTH / 2, y: ROOM_HEIGHT / 2 };
}

export function isWalkable(collision: boolean[][], px: number, py: number): boolean {
  const tx = Math.floor(px / TILE_SIZE);
  const ty = Math.floor(py / TILE_SIZE);
  if (tx < 0 || tx >= ROOM_COLS || ty < 0 || ty >= ROOM_ROWS) return false;
  return !collision[ty][tx];
}
