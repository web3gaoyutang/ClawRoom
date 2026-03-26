// Tile-based scene for geek-themed pixel room
// Room: 64x36 tiles, each tile = 16px

export const TILE_SIZE = 16;
export const ROOM_COLS = 64;
export const ROOM_ROWS = 36;
export const ROOM_WIDTH = ROOM_COLS * TILE_SIZE;
export const ROOM_HEIGHT = ROOM_ROWS * TILE_SIZE;

export const ENTRY_TILE = { x: 32, y: 1 };

export interface Decoration {
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  color: string;
  label?: string;
}

export const DECORATIONS: Decoration[] = [
  // ── Server racks (left wall cluster) ────────────────
  { x: 2, y: 3, w: 3, h: 6, type: 'server', color: '#0f0f2a' },
  { x: 2, y: 11, w: 3, h: 6, type: 'server', color: '#111133' },
  { x: 2, y: 19, w: 3, h: 5, type: 'server', color: '#0f0f2a' },

  // ── Workstation desks (with monitors) ───────────────
  { x: 10, y: 6, w: 5, h: 3, type: 'desk', color: '#222244' },
  { x: 10, y: 16, w: 5, h: 3, type: 'desk', color: '#222244' },
  { x: 24, y: 6, w: 5, h: 3, type: 'desk', color: '#222244' },
  { x: 40, y: 6, w: 5, h: 3, type: 'desk', color: '#222244' },
  { x: 40, y: 16, w: 5, h: 3, type: 'desk', color: '#222244' },
  { x: 50, y: 16, w: 5, h: 3, type: 'desk', color: '#222244' },

  // ── Hackathon long table (center) ──────────────────
  { x: 22, y: 14, w: 12, h: 2, type: 'long_table', color: '#2a2a4a' },

  // ── Wall posters (geek/open-source themed) ─────────
  { x: 8, y: 1, w: 5, h: 2, type: 'poster', color: '#4ECDC4', label: 'OPEN SOURCE' },
  { x: 18, y: 1, w: 4, h: 2, type: 'poster', color: '#FF6B6B', label: 'HACK!' },
  { x: 42, y: 1, w: 5, h: 2, type: 'poster', color: '#6C5CE7', label: 'BUILD' },
  { x: 52, y: 1, w: 4, h: 2, type: 'poster', color: '#FDCB6E', label: '</>' },

  // ── LED neon signs (wall-mounted) ──────────────────
  { x: 26, y: 1, w: 6, h: 1, type: 'neon_sign', color: '#FF6B6B', label: 'WELCOME' },

  // ── Arcade machine ─────────────────────────────────
  { x: 58, y: 4, w: 3, h: 5, type: 'arcade', color: '#6C5CE7' },

  // ── Vending machine ────────────────────────────────
  { x: 58, y: 11, w: 3, h: 5, type: 'vending', color: '#2d3436' },

  // ── Whiteboard ─────────────────────────────────────
  { x: 58, y: 18, w: 4, h: 4, type: 'whiteboard', color: '#e0e0e0' },

  // ── Lounge / couch area ────────────────────────────
  { x: 8, y: 26, w: 6, h: 3, type: 'couch', color: '#6c5ce7' },
  { x: 16, y: 28, w: 3, h: 2, type: 'bean_bag', color: '#e17055' },

  // ── Coffee bar ─────────────────────────────────────
  { x: 48, y: 26, w: 8, h: 3, type: 'coffee_bar', color: '#5c3d2e' },

  // ── Stage / speaker area ───────────────────────────
  { x: 24, y: 28, w: 10, h: 4, type: 'stage', color: '#1a1a3e' },

  // ── Badge / sticker wall ───────────────────────────
  { x: 58, y: 25, w: 4, h: 6, type: 'badge_wall', color: '#fdcb6e' },

  // ── Network rack / cables ──────────────────────────
  { x: 2, y: 26, w: 2, h: 4, type: 'network_rack', color: '#1a1a2e' },

  // ── Robot mascot ───────────────────────────────────
  { x: 35, y: 5, w: 2, h: 3, type: 'robot', color: '#4ECDC4' },

  // ── 3D printer ─────────────────────────────────────
  { x: 50, y: 6, w: 3, h: 3, type: 'printer_3d', color: '#636e72' },

  // ── Plants / greenery ──────────────────────────────
  { x: 1, y: 32, w: 2, h: 2, type: 'plant', color: '#00b894' },
  { x: 20, y: 26, w: 2, h: 2, type: 'plant', color: '#00b894' },
  { x: 37, y: 26, w: 2, h: 2, type: 'plant', color: '#55efc4' },
  { x: 61, y: 32, w: 2, h: 2, type: 'plant', color: '#00b894' },

  // ── Floor LED strips ───────────────────────────────
  { x: 7, y: 24, w: 50, h: 1, type: 'led_strip', color: '#4ECDC4' },

  // ── Drone on shelf ─────────────────────────────────
  { x: 35, y: 1, w: 2, h: 1, type: 'drone', color: '#95a5a6' },

  // ── Mini fridge ────────────────────────────────────
  { x: 46, y: 26, w: 2, h: 3, type: 'mini_fridge', color: '#dfe6e9' },

  // ── Standing desk with dual monitors ───────────────
  { x: 24, y: 22, w: 4, h: 3, type: 'standing_desk', color: '#2d2d44' },
];

export function buildCollisionMap(): boolean[][] {
  const map: boolean[][] = [];
  for (let y = 0; y < ROOM_ROWS; y++) {
    map[y] = [];
    for (let x = 0; x < ROOM_COLS; x++) {
      map[y][x] = (x <= 1 || x >= ROOM_COLS - 2 || y <= 1 || y >= ROOM_ROWS - 2);
    }
  }
  for (const d of DECORATIONS) {
    // Wall-mounted items don't block floor
    if (['poster', 'neon_sign', 'led_strip', 'drone'].includes(d.type)) continue;
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
  // Open the door area
  for (let dx = -1; dx <= 2; dx++) {
    map[1][ENTRY_TILE.x + dx] = false;
    map[2][ENTRY_TILE.x + dx] = false;
  }
  return map;
}

export function getRandomWalkable(collision: boolean[][]): { x: number; y: number } {
  let attempts = 0;
  while (attempts < 300) {
    const tx = 3 + Math.floor(Math.random() * (ROOM_COLS - 6));
    const ty = 3 + Math.floor(Math.random() * (ROOM_ROWS - 6));
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
