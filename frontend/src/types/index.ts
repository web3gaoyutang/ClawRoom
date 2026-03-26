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
  accessory: number; // 0=none,1=backpack,2=laptop,3=phone,4=coffee,5=headphones,6=cap
}

export interface Position {
  x: number;
  y: number;
}

export type CharacterState =
  | 'entering'
  | 'walking'
  | 'idle'
  | 'sitting'
  | 'waving'
  | 'typing'    // looking at phone / laptop
  | 'drinking'
  | 'looking';  // looking around

export interface GameCharacter {
  data: CharacterData;
  position: Position;
  target: Position | null;
  state: CharacterState;
  direction: 'left' | 'right';
  idleTimer: number;
  nameVisible: number;
  highlightTimer: number;
  animFrame: number;
  animTimer: number;
  actionTimer: number;   // time spent in current action
  bobOffset: number;     // vertical bobbing for idle breathing
}
