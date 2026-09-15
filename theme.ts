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
  common: {
    id: 'common',
    label: '일반',
    badge: 'N',
    line: '일상 속 한 장',
    glow: '#F3F6FB',
    foil: ['#F4F1EA', '#C9C2B3'] as const,
    sparks: 8,
  },
  rare: {
    id: 'rare',
    label: '레어',
    badge: 'R',
    line: '눈이 머무는 순간',
    glow: '#6EC4FF',
    foil: ['#9ED8FF', '#2F6DFF'] as const,
    sparks: 14,
  },
  epic: {
    id: 'epic',
    label: '에픽',
    badge: 'SR',
    line: '쉽게 손에 넣지 못할 장',
    glow: '#E2A8FF',
    foil: ['#F0C6FF', '#7A2BFF'] as const,
    sparks: 20,
  },
  legend: {
    id: 'legend',
    label: '레전드',
    badge: 'SSR',
    line: '소장하고 싶은 한 장',
    glow: '#FFD978',
    foil: ['#FFE7A3', '#C4841A'] as const,
    sparks: 28,
  },
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
