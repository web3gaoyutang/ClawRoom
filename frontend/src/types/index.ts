export interface CheckIn {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url?: string;
  tag?: 'speaker' | 'volunteer' | 'vip' | 'organizer' | 'normal';
  checked_in_at: string;
}

export interface CharacterData {
  id: string;
  user_id: string;
  nickname: string;
  tag?: string;
  bodyType: number;
  colorPrimary: string;
  colorSecondary: string;
  hairStyle: number;
  accessory: number | null;
}

export interface Position {
  x: number;
  y: number;
}

export type CharacterState = 'entering' | 'walking' | 'idle';

export interface GameCharacter {
  data: CharacterData;
  position: Position;
  target: Position | null;
  state: CharacterState;
  direction: 'left' | 'right';
  idleTimer: number;
  nameVisible: number; // remaining ms to show name
  highlightTimer: number;
  animFrame: number;
  animTimer: number;
}
