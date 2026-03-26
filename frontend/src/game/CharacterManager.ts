import type { GameCharacter, CharacterData, Position } from '../types';
import {
  ENTRY_TILE, TILE_SIZE, ROOM_WIDTH, ROOM_HEIGHT,
  getRandomWalkable, isWalkable, buildCollisionMap,
} from './SceneManager';

const SPEED = 40; // pixels per second
const IDLE_MIN = 2000;
const IDLE_MAX = 6000;
const NAME_SHOW_DURATION = 3000;
const HIGHLIGHT_DURATION = 1500;

export class CharacterManager {
  characters: GameCharacter[] = [];
  collision: boolean[][];

  constructor() {
    this.collision = buildCollisionMap();
  }

  addCharacter(data: CharacterData): GameCharacter {
    const entryPos: Position = {
      x: ENTRY_TILE.x * TILE_SIZE + TILE_SIZE / 2,
      y: ENTRY_TILE.y * TILE_SIZE + TILE_SIZE / 2,
    };
    const target = getRandomWalkable(this.collision);
    const char: GameCharacter = {
      data,
      position: { ...entryPos },
      target,
      state: 'entering',
      direction: target.x > entryPos.x ? 'right' : 'left',
      idleTimer: 0,
      nameVisible: NAME_SHOW_DURATION,
      highlightTimer: HIGHLIGHT_DURATION,
      animFrame: 0,
      animTimer: 0,
    };
    this.characters.push(char);
    return char;
  }

  update(delta: number) {
    for (const char of this.characters) {
      // Update animation frame
      char.animTimer += delta;
      if (char.animTimer > 200) {
        char.animTimer = 0;
        char.animFrame = (char.animFrame + 1) % 4;
      }

      // Decrease name visibility
      if (char.nameVisible > 0) {
        char.nameVisible -= delta;
      }
      if (char.highlightTimer > 0) {
        char.highlightTimer -= delta;
      }

      switch (char.state) {
        case 'entering':
        case 'walking':
          if (char.target) {
            const dx = char.target.x - char.position.x;
            const dy = char.target.y - char.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 4) {
              char.position.x = char.target.x;
              char.position.y = char.target.y;
              char.target = null;
              char.state = 'idle';
              char.idleTimer = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
            } else {
              const move = (SPEED * delta) / 1000;
              const nx = char.position.x + (dx / dist) * move;
              const ny = char.position.y + (dy / dist) * move;

              if (isWalkable(this.collision, nx, ny)) {
                char.position.x = nx;
                char.position.y = ny;
                char.direction = dx > 0 ? 'right' : 'left';
              } else {
                // Pick a new target if blocked
                char.target = getRandomWalkable(this.collision);
              }
            }
          } else {
            char.state = 'idle';
            char.idleTimer = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
          }
          break;

        case 'idle':
          char.idleTimer -= delta;
          if (char.idleTimer <= 0) {
            char.target = getRandomWalkable(this.collision);
            char.state = 'walking';
          }
          break;
      }
    }
  }

  getCharacters(): GameCharacter[] {
    return this.characters;
  }

  getCount(): number {
    return this.characters.length;
  }
}
