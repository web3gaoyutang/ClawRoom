import type { CharacterData, CheckIn } from '../types';
import { generateCharacterColors } from './pixel';

const FIRST_NAMES = [
  'Alice', 'Bob', 'Cleo', 'Dev', 'Eve', 'Fay', 'Gus', 'Hana',
  'Ivan', 'Jade', 'Kai', 'Luna', 'Max', 'Nina', 'Oscar', 'Pip',
  'Quinn', 'Ray', 'Sky', 'Tao', 'Uma', 'Vex', 'Wren', 'Xia',
  'Yuri', 'Zoe', '小明', '小红', '大壮', '阿花', '老王', '小李',
  '张三', '李四', '王五', '赵六', '码农', '极客', '开源侠', '黑客',
  'Rust爱好者', 'Go大神', 'Python王', 'JS忍者', 'Linux达人',
  'Cloud', 'Pixel', 'Byte', 'Nova', 'Cyber', 'Neo', 'Atom',
];

const TAGS: Array<CheckIn['tag']> = [
  'normal', 'normal', 'normal', 'normal', 'normal',
  'normal', 'normal', 'speaker', 'volunteer', 'vip',
];

let counter = 0;

export function generateMockCheckin(): { checkin: CheckIn; character: CharacterData } {
  const userId = `user_${Date.now()}_${counter++}`;
  const nickname = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const tag = TAGS[Math.floor(Math.random() * TAGS.length)];
  const colors = generateCharacterColors(userId);

  const checkin: CheckIn = {
    id: `checkin_${userId}`,
    user_id: userId,
    nickname,
    tag,
    checked_in_at: new Date().toISOString(),
  };

  const character: CharacterData = {
    id: `char_${userId}`,
    user_id: userId,
    nickname,
    tag,
    bodyType: colors.bodyType,
    colorPrimary: colors.colorPrimary,
    colorSecondary: colors.colorSecondary,
    hairStyle: colors.hairStyle,
    accessory: colors.accessory,
  };

  return { checkin, character };
}
