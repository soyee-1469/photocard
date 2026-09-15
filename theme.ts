export const colors = {
  ink: '#1C1410',
  paper: '#F6EFE6',
  mist: 'rgba(246, 239, 230, 0.72)',
  gold: '#C9A06A',
  line: 'rgba(28, 20, 16, 0.12)',
};

export const frames = {
  ivory: { id: 'ivory', label: '아이보리', border: '#FFF8F0', caption: '#3A2A22' },
  noir: { id: 'noir', label: '느와르', border: '#161210', caption: '#F4E7D8' },
  rose: { id: 'rose', label: '로즈', border: '#F3D0D4', caption: '#5A2E38' },
  lilac: { id: 'lilac', label: '라일락', border: '#DDD4F0', caption: '#3A2F55' },
} as const;

export type FrameId = keyof typeof frames;

export const CARD_RATIO = 55 / 85;

export const rarities = {
  common: { id: 'common', label: '일반', glow: '#D7DCE3' },
  rare: { id: 'rare', label: '레어', glow: '#5EB1FF' },
  epic: { id: 'epic', label: '에픽', glow: '#C084FC' },
  legend: { id: 'legend', label: '레전드', glow: '#FFD166' },
} as const;

export type RarityId = keyof typeof rarities;

export function rollRarity(): RarityId {
  const roll = Math.random();
  if (roll < 0.05) {
    return 'legend';
  }
  if (roll < 0.2) {
    return 'epic';
  }
  if (roll < 0.5) {
    return 'rare';
  }
  return 'common';
}
