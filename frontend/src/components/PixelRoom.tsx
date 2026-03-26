import { useRef, useEffect, useCallback } from 'react';
import { CharacterManager } from '../game/CharacterManager';
import type { GameCharacter } from '../types';
import {
  TILE_SIZE, ROOM_COLS, ROOM_ROWS, ROOM_WIDTH, ROOM_HEIGHT,
  DECORATIONS, ENTRY_TILE,
} from '../game/SceneManager';
import type { Decoration } from '../game/SceneManager';
import {
  renderPixelCharacter, generateCharacterColors, SPRITE_W, SPRITE_H, TAG_COLORS,
} from '../utils/pixel';
import { useGameLoop } from '../hooks/useGameLoop';

interface PixelRoomProps {
  managerRef: React.MutableRefObject<CharacterManager>;
  onCountChange: (count: number) => void;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

const T = TILE_SIZE;

export default function PixelRoom({ managerRef, onCountChange }: PixelRoomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const time = useRef(0);
  const spriteCache = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // ── Get / create cached sprite ────────────────────
  const getSprite = useCallback((char: GameCharacter): HTMLCanvasElement => {
    const key = `${char.data.user_id}_${char.direction}_${char.state}_${char.animFrame}`;
    const cached = spriteCache.current.get(key);
    if (cached) return cached;

    // Evict old entries to prevent memory growth
    if (spriteCache.current.size > 2000) {
      const keys = [...spriteCache.current.keys()];
      for (let i = 0; i < 500; i++) spriteCache.current.delete(keys[i]);
    }

    const colors = generateCharacterColors(char.data.user_id);
    const sprite = renderPixelCharacter(
      char.data.colorPrimary,
      char.data.colorSecondary,
      colors.hairColor,
      char.data.hairStyle,
      colors.skinTone,
      char.direction,
      char.animFrame,
      char.data.accessory,
      char.state,
      char.data.tag,
    );
    spriteCache.current.set(key, sprite);
    return sprite;
  }, []);

  // ── Draw static background ────────────────────────
  const drawBackground = useCallback(() => {
    const c = document.createElement('canvas');
    c.width = ROOM_WIDTH;
    c.height = ROOM_HEIGHT;
    const ctx = c.getContext('2d')!;

    // Floor tiles - hex-tech pattern
    for (let y = 0; y < ROOM_ROWS; y++) {
      for (let x = 0; x < ROOM_COLS; x++) {
        const edge = x <= 1 || x >= ROOM_COLS - 2 || y <= 1 || y >= ROOM_ROWS - 2;
        if (edge) {
          ctx.fillStyle = '#08081a';
        } else {
          const v = ((x + y) % 2 === 0) ? 18 : 16;
          const tint = ((x * 3 + y * 7) % 5 === 0) ? 2 : 0;
          ctx.fillStyle = `rgb(${v + tint}, ${v + tint}, ${v * 2 + 8 + tint})`;
        }
        ctx.fillRect(x * T, y * T, T, T);

        if (!edge) {
          ctx.strokeStyle = 'rgba(60, 60, 120, 0.1)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x * T, y * T, T, T);
        }
      }
    }

    // Wall neon border (double line)
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#4ECDC4';
    ctx.shadowBlur = 12;
    ctx.strokeRect(T * 1.5, T * 1.5, (ROOM_COLS - 3) * T, (ROOM_ROWS - 3) * T);
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(T * 1, T * 1, (ROOM_COLS - 2) * T, (ROOM_ROWS - 2) * T);
    ctx.shadowBlur = 0;

    // Door opening
    const dx = (ENTRY_TILE.x - 1) * T;
    ctx.fillStyle = '#08081a';
    ctx.fillRect(dx, 0, T * 4, T * 2);
    // Door frame glow
    ctx.fillStyle = '#4ECDC4';
    ctx.shadowColor = '#4ECDC4';
    ctx.shadowBlur = 16;
    ctx.fillRect(dx, T * 2 - 2, T * 4, 3);
    // Arrow indicators
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(dx + T, T * 1.2, 2, 6);
    ctx.fillRect(dx + T * 3 - 2, T * 1.2, 2, 6);
    ctx.shadowBlur = 0;

    // Decorations
    for (const d of DECORATIONS) {
      drawDeco(ctx, d);
    }

    // Floor cable channels
    ctx.strokeStyle = 'rgba(40, 40, 80, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(5 * T, 16 * T); ctx.lineTo(10 * T, 16 * T);
    ctx.moveTo(5 * T, 10 * T); ctx.lineTo(10 * T, 10 * T);
    ctx.moveTo(55 * T, 10 * T); ctx.lineTo(58 * T, 10 * T);
    ctx.stroke();
    ctx.setLineDash([]);

    return c;
  }, []);

  useEffect(() => { bgRef.current = drawBackground(); }, [drawBackground]);

  // ── Decoration renderer ───────────────────────────
  function drawDeco(ctx: CanvasRenderingContext2D, d: Decoration) {
    const x = d.x * T, y = d.y * T;
    const w = d.w * T, h = d.h * T;

    switch (d.type) {
      case 'server': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#2a2a4a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // Rack unit lines
        for (let i = 1; i < d.h; i++) {
          ctx.fillStyle = '#1a1a3a';
          ctx.fillRect(x + 2, y + i * T - 1, w - 4, 2);
        }
        // LED columns
        for (let i = 0; i < d.h; i++) {
          for (let col = 0; col < 3; col++) {
            const lx = x + w - 5 - col * 6;
            ctx.fillStyle = ['#00ff88', '#ff4444', '#4488ff'][col % 3];
            ctx.fillRect(lx, y + i * T + 5, 2, 2);
          }
        }
        // Ventilation holes
        for (let i = 0; i < d.h; i++) {
          for (let j = 0; j < 3; j++) {
            ctx.fillStyle = '#0a0a20';
            ctx.fillRect(x + 3 + j * 5, y + i * T + 10, 3, 1);
          }
        }
        break;
      }
      case 'desk': {
        // Desk surface
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y + T, w, h - T);
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(x, y + T, w, 2); // desk edge
        // Desk legs
        ctx.fillStyle = '#333355';
        ctx.fillRect(x + 2, y + h, 3, 4);
        ctx.fillRect(x + w - 5, y + h, 3, 4);
        // Monitor
        ctx.fillStyle = '#111122';
        ctx.fillRect(x + 6, y - 2, w - 12, T + 4);
        // Screen content
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(x + 8, y, w - 16, T);
        // Code lines on screen
        const codeColors = ['#00ff88', '#4488ff', '#ff6b6b', '#fdcb6e', '#c084fc'];
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = codeColors[i % codeColors.length];
          const lw = 4 + Math.floor((d.x * 7 + i * 13) % 20);
          ctx.fillRect(x + 10, y + 2 + i * 3, lw, 1);
        }
        // Monitor stand
        ctx.fillStyle = '#333355';
        ctx.fillRect(x + w / 2 - 3, y + T + 2, 6, 3);
        ctx.fillRect(x + w / 2 - 6, y + T + 4, 12, 2);
        // Keyboard
        ctx.fillStyle = '#2a2a44';
        ctx.fillRect(x + 8, y + T + 8, w - 16, 5);
        for (let kx = 0; kx < 5; kx++) {
          ctx.fillStyle = '#3a3a5a';
          ctx.fillRect(x + 10 + kx * 6, y + T + 9, 4, 3);
        }
        // Mouse
        ctx.fillStyle = '#444466';
        ctx.fillRect(x + w - 10, y + T + 8, 4, 6);
        break;
      }
      case 'long_table': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(x, y, w, 2);
        // Laptops scattered
        for (let i = 0; i < 4; i++) {
          const lx = x + 8 + i * (w / 4);
          ctx.fillStyle = '#333355';
          ctx.fillRect(lx, y + 4, 12, 8);
          ctx.fillStyle = i % 2 === 0 ? '#0d47a1' : '#1b5e20';
          ctx.fillRect(lx + 1, y + 5, 10, 5);
          // Laptop base
          ctx.fillStyle = '#444466';
          ctx.fillRect(lx - 1, y + 12, 14, 3);
        }
        // Stickers / papers
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + w / 2, y + 5, 4, 4);
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + w / 2 + 8, y + 4, 4, 4);
        // Legs
        ctx.fillStyle = '#333355';
        ctx.fillRect(x + 2, y + h, 2, 4);
        ctx.fillRect(x + w - 4, y + h, 2, 4);
        break;
      }
      case 'standing_desk': {
        // Tall desk
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y + T, w, h - T);
        // Single pole
        ctx.fillStyle = '#555577';
        ctx.fillRect(x + w / 2 - 2, y + h, 4, 6);
        ctx.fillRect(x + w / 2 - 6, y + h + 5, 12, 2);
        // Dual monitors
        for (let m = 0; m < 2; m++) {
          const mx = x + 3 + m * (w / 2);
          ctx.fillStyle = '#111122';
          ctx.fillRect(mx, y - 2, w / 2 - 4, T + 2);
          ctx.fillStyle = '#0d1117';
          ctx.fillRect(mx + 2, y, w / 2 - 8, T - 2);
          ctx.fillStyle = '#00ff88';
          ctx.fillRect(mx + 3, y + 1, 6, 1);
          ctx.fillStyle = '#4488ff';
          ctx.fillRect(mx + 3, y + 3, 10, 1);
        }
        break;
      }
      case 'poster': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // Poster text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.label || '', x + w / 2, y + h / 2 + 3);
        // Decorative corner dots
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(x + 2, y + 2, 2, 2);
        ctx.fillRect(x + w - 4, y + 2, 2, 2);
        break;
      }
      case 'neon_sign': {
        // Glowing text on wall
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 14;
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.label || '', x + w / 2, y + 11);
        ctx.shadowBlur = 0;
        break;
      }
      case 'arcade': {
        // Cabinet
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#4a3d8f';
        ctx.fillRect(x, y, w, T);
        // Screen
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(x + 4, y + T + 2, w - 8, T * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(x + 6, y + T + 4, w - 12, T * 2 - 4);
        // "Game" pixels on screen
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + w / 2 - 2, y + T * 2, 4, 4);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 10, y + T * 2 + 4, 3, 3);
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(x + w - 14, y + T * 2 - 2, 3, 3);
        // Controls
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(x + w / 2 - 6, y + T * 3 + 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4ECDC4';
        ctx.beginPath();
        ctx.arc(x + w / 2 + 6, y + T * 3 + 6, 3, 0, Math.PI * 2);
        ctx.fill();
        // Joystick
        ctx.fillStyle = '#333344';
        ctx.fillRect(x + w / 2 - 1, y + T * 3 + 12, 3, 6);
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + T * 3 + 11, 3, 0, Math.PI * 2);
        ctx.fill();
        // "INSERT COIN" text area
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 8, y + h - 10, w - 16, 1);
        break;
      }
      case 'vending': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#444466';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // Window display
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(x + 3, y + 3, w - 6, h * 0.6);
        // Drink rows
        const drinkColors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#6C5CE7', '#FF6B6B', '#00FF88'];
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.fillStyle = drinkColors[(row * 3 + col) % drinkColors.length];
            ctx.fillRect(x + 5 + col * 12, y + 5 + row * 10, 8, 8);
          }
        }
        // Slot
        ctx.fillStyle = '#111111';
        ctx.fillRect(x + w / 2 - 5, y + h - 14, 10, 6);
        // LED indicator
        ctx.fillStyle = '#00FF88';
        ctx.fillRect(x + w - 6, y + h - 8, 3, 3);
        break;
      }
      case 'whiteboard': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#bbbbbb';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        // Tray
        ctx.fillStyle = '#999999';
        ctx.fillRect(x + 4, y + h - 2, w - 8, 4);
        // Markers
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x + 6, y + h - 1, 8, 2);
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(x + 16, y + h - 1, 8, 2);
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(x + 26, y + h - 1, 8, 2);
        // Drawn content
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 10); ctx.lineTo(x + w - 8, y + 10);
        ctx.moveTo(x + 8, y + 18); ctx.lineTo(x + w / 2, y + 18);
        ctx.stroke();
        // Sticky notes
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + w - 18, y + 6, 10, 10);
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + w - 18, y + 20, 10, 10);
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(x + w - 30, y + 14, 10, 10);
        // Diagram box
        ctx.strokeStyle = '#3333AA';
        ctx.strokeRect(x + 10, y + 22, 16, 12);
        ctx.strokeRect(x + 30, y + 26, 12, 8);
        ctx.beginPath();
        ctx.moveTo(x + 26, y + 28); ctx.lineTo(x + 30, y + 30);
        ctx.stroke();
        break;
      }
      case 'couch': {
        // Back
        ctx.fillStyle = '#5f3dc4';
        ctx.fillRect(x, y, w, T);
        // Seat
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y + T, w, h - T);
        // Armrests
        ctx.fillStyle = '#4c2ea0';
        ctx.fillRect(x, y, T / 2, h);
        ctx.fillRect(x + w - T / 2, y, T / 2, h);
        // Cushion seams
        ctx.strokeStyle = '#5030b0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + w / 3, y + T + 2); ctx.lineTo(x + w / 3, y + h - 2);
        ctx.moveTo(x + w * 2 / 3, y + T + 2); ctx.lineTo(x + w * 2 / 3, y + h - 2);
        ctx.stroke();
        // Pillows
        ctx.fillStyle = '#7c5ce7';
        ctx.fillRect(x + 4, y + T + 2, 10, 8);
        ctx.fillRect(x + w - 14, y + T + 2, 10, 8);
        break;
      }
      case 'bean_bag': {
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.ellipse(x + w / 2 - 4, y + h / 2 - 4, w / 4, h / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'coffee_bar': {
        // Bar counter
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#4a2e1c';
        ctx.fillRect(x, y, w, 3);
        // Espresso machine
        ctx.fillStyle = '#888888';
        ctx.fillRect(x + 4, y + 4, 14, 16);
        ctx.fillStyle = '#555555';
        ctx.fillRect(x + 6, y + 6, 10, 8);
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(x + 8, y + 16, 3, 2);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x + 13, y + 16, 3, 2);
        // Cups
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x + 24 + i * 12, y + 6, 6, 8);
          ctx.fillStyle = '#ddd';
          ctx.fillRect(x + 24 + i * 12, y + 6, 6, 2);
        }
        // Menu board above
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + w / 2 - 16, y - 12, 32, 10);
        ctx.fillStyle = '#FFD700';
        ctx.font = '5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('COFFEE', x + w / 2, y - 4);
        // Stools
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#444466';
          ctx.fillRect(x + 10 + i * 28, y + h + 2, 8, 4);
          ctx.fillRect(x + 13 + i * 28, y + h + 5, 2, 4);
        }
        break;
      }
      case 'stage': {
        // Platform
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        // Stage edge highlight
        ctx.fillStyle = '#4ECDC4';
        ctx.shadowColor = '#4ECDC4';
        ctx.shadowBlur = 8;
        ctx.fillRect(x, y, w, 2);
        ctx.shadowBlur = 0;
        // Stage lights
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = ['#FF6B6B', '#4ECDC4', '#FFD700'][i];
          ctx.beginPath();
          ctx.arc(x + w * (i + 1) / 4, y + 4, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Podium
        ctx.fillStyle = '#2a2a5a';
        ctx.fillRect(x + w / 2 - 12, y + 10, 24, h - 14);
        ctx.fillStyle = '#3a3a7a';
        ctx.fillRect(x + w / 2 - 10, y + 12, 20, 6);
        // OpenClaw logo on podium
        ctx.fillStyle = '#4ECDC4';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OC', x + w / 2, y + 17);
        // Microphone
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(x + w / 2 - 1, y + 6, 2, 5);
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        // Monitor/screen on stage
        ctx.fillStyle = '#111133';
        ctx.fillRect(x + 4, y + 12, 20, 14);
        ctx.fillStyle = '#0d47a1';
        ctx.fillRect(x + 6, y + 14, 16, 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 8, y + 16, 8, 1);
        ctx.fillRect(x + 8, y + 19, 12, 1);
        break;
      }
      case 'badge_wall': {
        ctx.fillStyle = '#111128';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = d.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // Title
        ctx.fillStyle = d.color;
        ctx.font = '5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BADGES', x + w / 2, y + 8);
        // Badges in grid
        const bc = ['#FF6B6B', '#4ECDC4', '#FFD700', '#FF44FF', '#00FF88', '#45B7D1',
                     '#6C5CE7', '#E17055', '#FDCB6E', '#00CEC9', '#E84393', '#0984E3'];
        let bi = 0;
        for (let by = 1; by < d.h; by++) {
          for (let bx = 0; bx < d.w; bx++) {
            const cx = x + bx * T + T / 2;
            const cy = y + by * T + T / 2;
            // Badge shape (hexagon-ish)
            ctx.fillStyle = bc[bi % bc.length];
            ctx.beginPath();
            ctx.moveTo(cx, cy - 5);
            ctx.lineTo(cx + 4, cy - 2);
            ctx.lineTo(cx + 4, cy + 2);
            ctx.lineTo(cx, cy + 5);
            ctx.lineTo(cx - 4, cy + 2);
            ctx.lineTo(cx - 4, cy - 2);
            ctx.closePath();
            ctx.fill();
            // Inner dot
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(cx - 1, cy - 1, 2, 2);
            bi++;
          }
        }
        break;
      }
      case 'network_rack': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        // Patch panel lines
        for (let i = 0; i < d.h * 2; i++) {
          ctx.strokeStyle = ['#4488ff', '#00ff88', '#FFD700', '#ff4444'][i % 4];
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 3, y + 4 + i * 8);
          ctx.lineTo(x + w - 3, y + 4 + i * 8);
          ctx.stroke();
          // RJ45 ports
          ctx.fillStyle = '#333355';
          ctx.fillRect(x + w - 8, y + 2 + i * 8, 5, 4);
        }
        break;
      }
      case 'robot': {
        // Robot mascot
        // Head
        ctx.fillStyle = d.color;
        ctx.fillRect(x + 4, y, w * T - 8, T);
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 6, y + 4, 4, 4);
        ctx.fillRect(x + w * T - 12, y + 4, 4, 4);
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + 7, y + 5, 2, 2);
        ctx.fillRect(x + w * T - 11, y + 5, 2, 2);
        // Antenna
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + w * T / 2 - 1, y - 6, 2, 6);
        ctx.beginPath();
        ctx.arc(x + w * T / 2, y - 7, 3, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillStyle = '#3dbdb4';
        ctx.fillRect(x + 2, y + T + 2, w * T - 4, T);
        // Chest panel
        ctx.fillStyle = '#2a9d93';
        ctx.fillRect(x + 6, y + T + 4, w * T - 12, T - 4);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 8, y + T + 6, 3, 3);
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + 14, y + T + 6, 3, 3);
        // Arms
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y + T + 4, 3, 8);
        ctx.fillRect(x + w * T - 3, y + T + 4, 3, 8);
        // Legs
        ctx.fillRect(x + 6, y + T * 2 + 3, 5, 8);
        ctx.fillRect(x + w * T - 11, y + T * 2 + 3, 5, 8);
        break;
      }
      case 'printer_3d': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // Frame rails
        ctx.fillStyle = '#aaaaaa';
        ctx.fillRect(x + 2, y + 2, 2, h - 4);
        ctx.fillRect(x + w - 4, y + 2, 2, h - 4);
        ctx.fillRect(x + 2, y + 2, w - 4, 2);
        // Build plate
        ctx.fillStyle = '#444466';
        ctx.fillRect(x + 6, y + h - 12, w - 12, 8);
        // Object being printed
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(x + w / 2 - 4, y + h - 18, 8, 6);
        ctx.fillStyle = '#3dbdb4';
        ctx.fillRect(x + w / 2 - 3, y + h - 20, 6, 2);
        // Nozzle
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + w / 2 - 1, y + h - 22, 2, 2);
        break;
      }
      case 'plant': {
        // Pot
        ctx.fillStyle = '#6d4c2a';
        ctx.fillRect(x + 4, y + T, w - 8, T - 2);
        ctx.fillStyle = '#5c3d1e';
        ctx.fillRect(x + 2, y + T, w - 4, 3);
        // Soil
        ctx.fillStyle = '#3e2a14';
        ctx.fillRect(x + 4, y + T, w - 8, 3);
        // Plant body
        ctx.fillStyle = d.color;
        ctx.fillRect(x + w / 2 - 1, y + 4, 2, T - 4); // stem
        // Leaves
        ctx.fillRect(x + 2, y, w - 4, 6);
        ctx.fillStyle = '#00a884';
        ctx.fillRect(x, y + 2, 4, 4);
        ctx.fillRect(x + w - 4, y + 2, 4, 4);
        ctx.fillRect(x + w / 2 - 4, y - 2, 8, 4);
        break;
      }
      case 'led_strip': {
        // Floor LED strip - just dots
        for (let i = 0; i < d.w; i++) {
          if (i % 3 === 0) {
            ctx.fillStyle = d.color;
            ctx.fillRect(x + i * T + T / 2 - 1, y + T / 2 - 1, 2, 2);
          }
        }
        break;
      }
      case 'drone': {
        // Small drone on display shelf
        ctx.fillStyle = '#666677';
        ctx.fillRect(x + 4, y + 4, T * d.w - 8, 6);
        // Rotors
        ctx.fillStyle = '#aaaacc';
        ctx.fillRect(x, y + 2, 6, 2);
        ctx.fillRect(x + T * d.w - 6, y + 2, 6, 2);
        // Camera
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + T * d.w / 2 - 1, y + 8, 3, 3);
        break;
      }
      case 'mini_fridge': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#bbbbcc';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // Handle
        ctx.fillStyle = '#999999';
        ctx.fillRect(x + w - 4, y + h / 3, 2, h / 3);
        // Logo sticker
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(x + 4, y + 4, 8, 8);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 6, y + 6, 4, 4);
        // Door seam
        ctx.fillStyle = '#aaaaaa';
        ctx.fillRect(x + 1, y + h * 0.4, w - 2, 1);
        break;
      }
    }
  }

  // ── Particle spawner ──────────────────────────────
  const spawnParticle = useCallback(() => {
    const colors = ['#4ECDC4', '#FF6B6B', '#45B7D1', '#FFD700', '#00FF88', '#6C5CE7'];
    particles.current.push({
      x: Math.random() * ROOM_WIDTH,
      y: ROOM_HEIGHT * 0.3 + Math.random() * ROOM_HEIGHT * 0.5,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 12 - 3,
      life: 0,
      maxLife: 3000 + Math.random() * 4000,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1 + Math.random() * 1.5,
    });
  }, []);

  // ── Main render loop ──────────────────────────────
  useGameLoop((delta) => {
    const canvas = canvasRef.current;
    const bg = bgRef.current;
    if (!canvas || !bg) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    time.current += delta;
    const t = time.current;
    const mgr = managerRef.current;
    mgr.update(delta);
    onCountChange(mgr.getCount());

    // Scale to fit
    const sx = canvas.width / ROOM_WIDTH;
    const sy = canvas.height / ROOM_HEIGHT;
    const scale = Math.min(sx, sy);
    const ox = (canvas.width - ROOM_WIDTH * scale) / 2;
    const oy = (canvas.height - ROOM_HEIGHT * scale) / 2;

    ctx.fillStyle = '#04040c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    // Background
    ctx.drawImage(bg, 0, 0);

    // ── Animated scene elements ─────────────────────
    for (const d of DECORATIONS) {
      if (d.type === 'server') {
        for (let i = 0; i < d.h; i++) {
          for (let col = 0; col < 3; col++) {
            const phase = Math.sin(t / 250 + i * 1.7 + col * 2.3 + d.y);
            if (phase > 0.2) {
              const lx = d.x * T + d.w * T - 5 - col * 6;
              ctx.fillStyle = ['#00ff88', '#ff4444', '#4488ff'][col];
              ctx.shadowColor = ['#00ff88', '#ff4444', '#4488ff'][col];
              ctx.shadowBlur = 3;
              ctx.fillRect(lx, d.y * T + i * T + 5, 2, 2);
              ctx.shadowBlur = 0;
            }
          }
        }
      }
      if (d.type === 'desk' || d.type === 'standing_desk') {
        const pulse = 0.4 + Math.sin(t / 800 + d.x) * 0.2;
        ctx.fillStyle = `rgba(0, 255, 136, ${pulse * 0.1})`;
        ctx.fillRect(d.x * T + 6, d.y * T - 4, d.w * T - 12, T + 6);
      }
      if (d.type === 'arcade') {
        // Flashing screen
        const flash = Math.sin(t / 400) > 0 ? 0.15 : 0.05;
        ctx.fillStyle = `rgba(0, 255, 136, ${flash})`;
        ctx.fillRect(d.x * T + 4, d.y * T + T + 2, d.w * T - 8, T * 2);
      }
      if (d.type === 'neon_sign') {
        // Pulsing glow
        const glow = 8 + Math.sin(t / 600) * 6;
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = glow;
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.label || '', d.x * T + d.w * T / 2, d.y * T + 11);
        ctx.shadowBlur = 0;
      }
      if (d.type === 'led_strip') {
        for (let i = 0; i < d.w; i++) {
          if (i % 3 === 0) {
            const phase = Math.sin(t / 500 + i * 0.5);
            if (phase > -0.3) {
              const hue = (t / 20 + i * 8) % 360;
              ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.4 + phase * 0.3})`;
              ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.6)`;
              ctx.shadowBlur = 4;
              ctx.fillRect(d.x * T + i * T + T / 2 - 1, d.y * T + T / 2 - 1, 3, 3);
              ctx.shadowBlur = 0;
            }
          }
        }
      }
      if (d.type === 'coffee_bar') {
        // Steam from espresso machine
        const sy1 = Math.sin(t / 300) * 2;
        const sy2 = Math.sin(t / 400 + 1) * 2;
        ctx.fillStyle = 'rgba(200, 200, 220, 0.15)';
        ctx.fillRect(d.x * T + 10, d.y * T - 4 + sy1, 2, 4);
        ctx.fillRect(d.x * T + 14, d.y * T - 6 + sy2, 2, 4);
      }
      if (d.type === 'robot') {
        // Antenna blink
        const blink = Math.sin(t / 500) > 0.5;
        if (blink) {
          ctx.fillStyle = '#FFD700';
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(d.x * T + d.w * T / 2, d.y * T - 7, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        // Eye glow
        const eyeGlow = 0.3 + Math.sin(t / 700) * 0.2;
        ctx.fillStyle = `rgba(255, 107, 107, ${eyeGlow})`;
        ctx.fillRect(d.x * T + 7, d.y * T + 5, 2, 2);
        ctx.fillRect(d.x * T + d.w * T - 11, d.y * T + 5, 2, 2);
      }
      if (d.type === 'printer_3d') {
        // Printing animation - nozzle movement
        const nx = Math.sin(t / 400) * 6;
        ctx.fillStyle = '#FF6B6B';
        ctx.shadowColor = '#FF6B6B';
        ctx.shadowBlur = 3;
        ctx.fillRect(d.x * T + d.w * T / 2 - 1 + nx, d.y * T + d.h * T - 22, 2, 2);
        ctx.shadowBlur = 0;
      }
      if (d.type === 'vending') {
        // Selection LED
        const sel = Math.floor(t / 2000) % 9;
        const row = Math.floor(sel / 3), col = sel % 3;
        ctx.strokeStyle = '#00FF88';
        ctx.lineWidth = 1;
        ctx.strokeRect(d.x * T + 4 + col * 12, d.y * T + 4 + row * 10, 10, 10);
      }
    }

    // ── Particles ────────────────────────────────────
    if (Math.random() < 0.04) spawnParticle();
    const pts = particles.current;
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      p.life += delta;
      p.x += p.vx * delta / 1000;
      p.y += p.vy * delta / 1000;
      const alpha = 1 - p.life / p.maxLife;
      if (alpha <= 0) { pts.splice(i, 1); continue; }
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // ── Characters (Y-sorted) ────────────────────────
    const chars = [...mgr.getCharacters()].sort((a, b) => a.position.y - b.position.y);
    for (const ch of chars) {
      const sprite = getSprite(ch);
      const cx = ch.position.x - SPRITE_W / 2;
      const cy = ch.position.y - SPRITE_H + 10;

      // Idle bob
      const bob = ch.state === 'idle' || ch.state === 'looking'
        ? Math.sin(ch.bobOffset) * 1.2
        : 0;

      // Highlight glow
      if (ch.highlightTimer > 0) {
        const p = Math.sin(ch.highlightTimer / 80 * Math.PI) * 0.5 + 0.5;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 14 * p;
        ctx.globalAlpha = 0.75 + p * 0.25;
      }

      // Entering fade
      if (ch.state === 'entering' && ch.nameVisible > NAME_SHOW_MS - 600) {
        ctx.globalAlpha = Math.min(1, (NAME_SHOW_MS - ch.nameVisible) / 600);
      }

      ctx.drawImage(sprite, cx, cy + bob);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // ── Always show name ──────────────────────────
      const nameY = cy + bob - 4;
      // Fresh arrivals: full name bubble, others: subtle floating name
      if (ch.nameVisible > 0) {
        const a = Math.min(1, ch.nameVisible / 600);
        drawNameBubble(ctx, ch.data.nickname, ch.position.x, nameY, a, ch.data.tag, true);
      } else {
        drawNameBubble(ctx, ch.data.nickname, ch.position.x, nameY, 0.7, ch.data.tag, false);
      }

      // Action indicators
      if (ch.state === 'waving') {
        // Wave lines
        const wavePhase = Math.sin(t / 150) * 2;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.fillRect(cx - 4 + wavePhase, cy + bob - 10, 2, 2);
        ctx.fillRect(cx - 8, cy + bob - 14 + wavePhase, 2, 2);
      }
      if (ch.state === 'typing') {
        // Typing dots
        for (let dot = 0; dot < 3; dot++) {
          const dotPhase = Math.sin(t / 200 + dot * 1.2);
          if (dotPhase > 0) {
            ctx.fillStyle = 'rgba(68, 136, 255, 0.6)';
            ctx.fillRect(
              ch.position.x + 10 + dot * 4,
              cy + bob + 16 + dotPhase * -2,
              2, 2,
            );
          }
        }
      }
      if (ch.state === 'drinking') {
        // Steam
        const s1 = Math.sin(t / 300);
        const s2 = Math.sin(t / 350 + 1);
        ctx.fillStyle = 'rgba(200, 200, 220, 0.3)';
        ctx.fillRect(ch.position.x + 14, cy + bob + 10 + s1 * 2, 1, 3);
        ctx.fillRect(ch.position.x + 17, cy + bob + 8 + s2 * 2, 1, 3);
      }
    }

    ctx.restore();
  });

  // ── Canvas resize ─────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }}
    />
  );
}

// ── Name bubble ─────────────────────────────────────
const NAME_SHOW_MS = 4000;

function drawNameBubble(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  alpha: number,
  tag?: string,
  highlight?: boolean,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const fontSize = highlight ? 8 : 7;
  ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;
  const tw = ctx.measureText(name).width;
  const pad = highlight ? 5 : 3;
  const bw = tw + pad * 2;
  const bh = highlight ? 14 : 12;
  const bx = x - bw / 2;
  const by = y - bh;

  // Background
  ctx.fillStyle = highlight
    ? 'rgba(8, 8, 24, 0.9)'
    : 'rgba(8, 8, 24, 0.6)';
  ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);

  // Border
  if (highlight) {
    const tc = tag && tag !== 'normal' ? TAG_COLORS[tag] || '#4ECDC4' : '#4ECDC4';
    ctx.strokeStyle = tc;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
    // Small tag icon
    if (tag && tag !== 'normal') {
      ctx.fillStyle = tc;
      ctx.fillRect(bx - 1, by - 1, 3, bh + 2);
    }
  }

  // Text
  ctx.fillStyle = highlight ? '#FFFFFF' : 'rgba(200, 220, 255, 0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, x, by + bh / 2);

  ctx.restore();
}
