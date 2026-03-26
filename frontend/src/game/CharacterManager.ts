import type { GameCharacter, CharacterData, Position, CharacterState } from '../types';
import {
  ENTRY_TILE, TILE_SIZE,
  getRandomWalkable, isWalkable, buildCollisionMap,
} from './SceneManager';

const SPEED = 35;
const IDLE_MIN = 1500;
const IDLE_MAX = 4000;
const NAME_SHOW_DURATION = 4000;
const HIGHLIGHT_DURATION = 2000;

// Action durations (ms)
const ACTION_DURATIONS: Partial<Record<CharacterState, [number, number]>> = {
  waving:   [1500, 2500],
  typing:   [3000, 6000],
  drinking: [2000, 4000],
  looking:  [1500, 3000],
  sitting:  [4000, 8000],
};

const IDLE_ACTIONS: CharacterState[] = [
  'walking', 'walking', 'walking',  // most common
  'waving', 'typing', 'drinking', 'looking',
];

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
      actionTimer: 0,
      bobOffset: Math.random() * Math.PI * 2,
    };
    this.characters.push(char);
    return char;
  }

  private pickNextAction(char: GameCharacter): void {
    const action = IDLE_ACTIONS[Math.floor(Math.random() * IDLE_ACTIONS.length)];
    if (action === 'walking') {
      char.target = getRandomWalkable(this.collision);
      char.state = 'walking';
      return;
    }
    const range = ACTION_DURATIONS[action];
    if (range) {
      char.state = action;
      char.actionTimer = range[0] + Math.random() * (range[1] - range[0]);
      // Randomly flip direction during actions for variety
      if (Math.random() < 0.3) {
        char.direction = char.direction === 'left' ? 'right' : 'left';
      }
    }
  }

  update(delta: number) {
    for (const char of this.characters) {
      // Animation frame tick
      char.animTimer += delta;
      const frameRate = char.state === 'walking' || char.state === 'entering' ? 180 : 350;
      if (char.animTimer > frameRate) {
        char.animTimer = 0;
        char.animFrame = (char.animFrame + 1) % 4;
      }

      // Bobbing for idle
      char.bobOffset += delta * 0.002;

      // Decrease highlight / name timers
      if (char.nameVisible > 0) char.nameVisible -= delta;
      if (char.highlightTimer > 0) char.highlightTimer -= delta;

      switch (char.state) {
        case 'entering':
        case 'walking': {
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
                char.target = getRandomWalkable(this.collision);
              }
            }
          } else {
            char.state = 'idle';
            char.idleTimer = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
          }
          break;
        }

        case 'idle': {
          char.idleTimer -= delta;
          if (char.idleTimer <= 0) {
            this.pickNextAction(char);
          }
          break;
        }

        case 'waving':
        case 'typing':
        case 'drinking':
        case 'looking':
        case 'sitting': {
          char.actionTimer -= delta;
          if (char.actionTimer <= 0) {
            char.state = 'idle';
            char.idleTimer = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
          }
          break;
        }
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
