import { useRef, useEffect, useCallback, useState } from 'react';
import { CharacterManager } from '../game/CharacterManager';
import type { GameCharacter } from '../types';
import {
  TILE_SIZE, ROOM_COLS, ROOM_ROWS, ROOM_WIDTH, ROOM_HEIGHT,
  DECORATIONS, buildCollisionMap, ENTRY_TILE,
} from '../game/SceneManager';
import type { Decoration } from '../game/SceneManager';
import { renderPixelCharacter, generateCharacterColors, HAIR_COLORS, hashString } from '../utils/pixel';
import { useGameLoop } from '../hooks/useGameLoop';

interface PixelRoomProps {
  managerRef: React.MutableRefObject<CharacterManager>;
  onCountChange: (count: number) => void;
}

// Ambient particles
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

export default function PixelRoom({ managerRef, onCountChange }: PixelRoomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  // Cache character sprites
  const spriteCacheRef = useRef<Map<string, HTMLCanvasElement[]>>(new Map());

  const getSprites = useCallback((char: GameCharacter): HTMLCanvasElement[] => {
    const key = `${char.data.user_id}_${char.direction}`;
    if (spriteCacheRef.current.has(key)) {
      return spriteCacheRef.current.get(key)!;
    }
    const colors = generateCharacterColors(char.data.user_id);
    const frames: HTMLCanvasElement[] = [];
    for (let f = 0; f < 4; f++) {
      frames.push(renderPixelCharacter(
        char.data.colorPrimary,
        char.data.colorSecondary,
        colors.hairColor,
        char.data.hairStyle,
        char.direction,
        f,
        char.data.tag,
      ));
    }
    spriteCacheRef.current.set(key, frames);
    return frames;
  }, []);

  // Draw static background once
  const drawBackground = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = ROOM_WIDTH;
    canvas.height = ROOM_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    // Floor - dark grid pattern
    for (let y = 0; y < ROOM_ROWS; y++) {
      for (let x = 0; x < ROOM_COLS; x++) {
        const isEdge = x === 0 || x === ROOM_COLS - 1 || y === 0 || y === ROOM_ROWS - 1;
        if (isEdge) {
          ctx.fillStyle = '#0a0a1a';
        } else {
          const checker = (x + y) % 2 === 0;
          ctx.fillStyle = checker ? '#141428' : '#12122a';
        }
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Grid lines
        if (!isEdge) {
          ctx.strokeStyle = 'rgba(50, 50, 100, 0.15)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Walls - neon border
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#4ECDC4';
    ctx.shadowBlur = 8;
    ctx.strokeRect(TILE_SIZE * 0.5, TILE_SIZE * 0.5, (ROOM_COLS - 1) * TILE_SIZE, (ROOM_ROWS - 1) * TILE_SIZE);
    ctx.shadowBlur = 0;

    // Door
    const doorX = ENTRY_TILE.x * TILE_SIZE;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(doorX - TILE_SIZE, 0, TILE_SIZE * 4, TILE_SIZE);
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(doorX - TILE_SIZE, TILE_SIZE - 2, TILE_SIZE * 4, 2);
    ctx.shadowColor = '#4ECDC4';
    ctx.shadowBlur = 12;
    ctx.fillRect(doorX - TILE_SIZE, TILE_SIZE - 2, TILE_SIZE * 4, 2);
    ctx.shadowBlur = 0;

    // Decorations
    for (const d of DECORATIONS) {
      drawDecoration(ctx, d);
    }

    return canvas;
  }, []);

  useEffect(() => {
    bgCanvasRef.current = drawBackground();
  }, [drawBackground]);

  // Draw decorations with pixel art style
  function drawDecoration(ctx: CanvasRenderingContext2D, d: Decoration) {
    const x = d.x * TILE_SIZE;
    const y = d.y * TILE_SIZE;
    const w = d.w * TILE_SIZE;
    const h = d.h * TILE_SIZE;

    switch (d.type) {
      case 'server': {
        // Server rack - dark with blinking lights
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // Rack lines
        for (let i = 1; i < d.h; i++) {
          ctx.fillStyle = '#2d3436';
          ctx.fillRect(x + 2, y + i * TILE_SIZE - 1, w - 4, 2);
        }
        // LED lights
        for (let i = 0; i < d.h; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#00ff88' : '#ff4444';
          ctx.fillRect(x + w - 6, y + i * TILE_SIZE + 4, 3, 3);
          ctx.fillStyle = '#00ff88';
          ctx.fillRect(x + w - 12, y + i * TILE_SIZE + 4, 3, 3);
        }
        break;
      }
      case 'desk': {
        // Desk with terminal screen
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y + TILE_SIZE, w, h - TILE_SIZE);
        // Screen
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(x + 4, y, w - 8, TILE_SIZE + 4);
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 6;
        ctx.fillRect(x + 6, y + 2, w - 12, TILE_SIZE);
        ctx.shadowBlur = 0;
        // Screen text lines
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#00cc66';
          const lw = 6 + Math.random() * (w - 24);
          ctx.fillRect(x + 8, y + 4 + i * 4, lw, 2);
        }
        // Chair (pixel dot)
        ctx.fillStyle = '#636e72';
        ctx.fillRect(x + w / 2 - 4, y + h + 2, 8, 6);
        break;
      }
      case 'poster': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#ffffff33';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // Poster content - text lines
        ctx.fillStyle = '#ffffff88';
        ctx.fillRect(x + 4, y + 4, w * 0.6, 3);
        ctx.fillRect(x + 4, y + 10, w * 0.4, 2);
        ctx.fillRect(x + 4, y + 16, w * 0.5, 2);
        break;
      }
      case 'couch': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        // Back cushion
        ctx.fillStyle = '#5f3dc4';
        ctx.fillRect(x, y, w, TILE_SIZE * 0.7);
        // Armrests
        ctx.fillStyle = '#4c2ea0';
        ctx.fillRect(x, y, TILE_SIZE * 0.5, h);
        ctx.fillRect(x + w - TILE_SIZE * 0.5, y, TILE_SIZE * 0.5, h);
        break;
      }
      case 'badge_wall': {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = d.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // Badges
        const badgeColors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#FF44FF', '#00FF88', '#45B7D1'];
        let bi = 0;
        for (let by = 0; by < d.h; by++) {
          for (let bx = 0; bx < d.w; bx++) {
            ctx.fillStyle = badgeColors[bi % badgeColors.length];
            ctx.beginPath();
            ctx.arc(
              x + bx * TILE_SIZE + TILE_SIZE / 2,
              y + by * TILE_SIZE + TILE_SIZE / 2,
              4, 0, Math.PI * 2,
            );
            ctx.fill();
            bi++;
          }
        }
        break;
      }
      case 'table': {
        ctx.fillStyle = d.color;
        ctx.fillRect(x, y, w, h);
        // Coffee cups
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, y + 2, 4, 5);
        ctx.fillRect(x + w - 10, y + 3, 4, 5);
        break;
      }
      case 'plant': {
        // Pot
        ctx.fillStyle = '#b07c4f';
        ctx.fillRect(x + 4, y + TILE_SIZE, TILE_SIZE * d.w - 8, TILE_SIZE - 2);
        // Leaves
        ctx.fillStyle = d.color;
        ctx.fillRect(x + 2, y, TILE_SIZE * d.w - 4, TILE_SIZE);
        ctx.fillStyle = '#00a884';
        ctx.fillRect(x + 6, y - 4, TILE_SIZE * d.w - 12, 6);
        break;
      }
      case 'stage': {
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(x, y, w, h);
        // Stage edge
        ctx.fillStyle = '#636e72';
        ctx.fillRect(x, y, w, 3);
        // Podium
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x + w / 2 - 10, y + 6, 20, h - 10);
        // Mic
        ctx.fillStyle = '#aaaaaa';
        ctx.fillRect(x + w / 2 - 1, y + 4, 2, 6);
        ctx.fillRect(x + w / 2 - 3, y + 2, 6, 3);
        break;
      }
    }
  }

  // Spawn ambient particles
  const spawnParticle = useCallback(() => {
    const colors = ['#4ECDC4', '#FF6B6B', '#45B7D1', '#FFD700', '#00FF88'];
    particlesRef.current.push({
      x: Math.random() * ROOM_WIDTH,
      y: Math.random() * ROOM_HEIGHT,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 15 - 5,
      life: 0,
      maxLife: 2000 + Math.random() * 3000,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1 + Math.random() * 2,
    });
  }, []);

  // Main render loop
  useGameLoop((delta) => {
    const canvas = canvasRef.current;
    const bg = bgCanvasRef.current;
    if (!canvas || !bg) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += delta;
    const manager = managerRef.current;
    manager.update(delta);
    onCountChange(manager.getCount());

    // Calculate scale to fit canvas
    const scaleX = canvas.width / ROOM_WIDTH;
    const scaleY = canvas.height / ROOM_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (canvas.width - ROOM_WIDTH * scale) / 2;
    const offsetY = (canvas.height - ROOM_HEIGHT * scale) / 2;

    // Clear
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw background
    ctx.drawImage(bg, 0, 0);

    // Animated elements on background
    const t = timeRef.current;
    // Blinking server LEDs
    for (const d of DECORATIONS) {
      if (d.type === 'server') {
        for (let i = 0; i < d.h; i++) {
          const blink = Math.sin(t / 300 + i * 1.5 + d.x) > 0.3;
          if (blink) {
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 4;
            ctx.fillRect(d.x * TILE_SIZE + d.w * TILE_SIZE - 6, d.y * TILE_SIZE + i * TILE_SIZE + 4, 3, 3);
            ctx.shadowBlur = 0;
          }
        }
      }
      // Screen glow pulse
      if (d.type === 'desk') {
        const pulse = 0.5 + Math.sin(t / 1000 + d.x) * 0.3;
        ctx.fillStyle = `rgba(0, 255, 136, ${pulse * 0.15})`;
        ctx.fillRect(d.x * TILE_SIZE, d.y * TILE_SIZE - 4, d.w * TILE_SIZE, TILE_SIZE + 8);
      }
    }

    // Particles
    if (Math.random() < 0.03) spawnParticle();
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += delta;
      p.x += p.vx * delta / 1000;
      p.y += p.vy * delta / 1000;
      const alpha = 1 - p.life / p.maxLife;
      if (alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Draw characters (sorted by Y for depth)
    const chars = [...manager.getCharacters()].sort((a, b) => a.position.y - b.position.y);
    for (const char of chars) {
      const sprites = getSprites(char);
      const frame = char.state === 'idle' ? 0 : char.animFrame % sprites.length;
      const sprite = sprites[frame];

      const cx = char.position.x - 32; // sprite is 64px wide (16*4)
      const cy = char.position.y - 80; // sprite is 96px tall (24*4)

      // Highlight effect for new characters
      if (char.highlightTimer > 0) {
        const pulse = Math.sin(char.highlightTimer / 100 * Math.PI) * 0.5 + 0.5;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 12 * pulse;
        ctx.globalAlpha = 0.7 + pulse * 0.3;
      }

      // Entering fade
      if (char.state === 'entering' && char.nameVisible > NAME_SHOW_MS - 500) {
        ctx.globalAlpha = Math.min(1, (NAME_SHOW_MS - char.nameVisible) / 500);
      }

      ctx.drawImage(sprite, cx, cy);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Name bubble
      if (char.nameVisible > 0) {
        const nameAlpha = Math.min(1, char.nameVisible / 500);
        drawNameBubble(ctx, char.data.nickname, char.position.x, cy - 6, nameAlpha, char.data.tag);
      }
    }

    ctx.restore();
  });

  // Resize canvas to fill container
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
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        imageRendering: 'pixelated',
      }}
    />
  );
}

const NAME_SHOW_MS = 3000;

function drawNameBubble(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  alpha: number,
  tag?: string,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 10px "Press Start 2P", monospace';
  const metrics = ctx.measureText(name);
  const tw = metrics.width;
  const padding = 4;
  const bw = tw + padding * 2;
  const bh = 14;
  const bx = x - bw / 2;
  const by = y - bh;

  // Bubble background
  ctx.fillStyle = 'rgba(10, 10, 30, 0.85)';
  ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);

  // Border color based on tag
  const borderColors: Record<string, string> = {
    speaker: '#FFD700',
    volunteer: '#00FF88',
    vip: '#FF44FF',
    organizer: '#FF4444',
  };
  ctx.strokeStyle = borderColors[tag || ''] || '#4ECDC4';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, x, by + bh / 2);
  ctx.restore();
}
