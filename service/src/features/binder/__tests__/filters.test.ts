import { describe, it, expect } from '@jest/globals';
import { applyFilter, getAvailableArtists, getAvailableRarities } from '../model/filters';
import { type BinderPocket } from '../model/types';
import { getCardById } from '../../../data/cards';

function createMockPocket(cardDefId: string): BinderPocket {
  const cardDef = getCardById(cardDefId);
  if (!cardDef) {
    throw new Error(`Card not found: ${cardDefId}`);
  }
  return {
    cardDefId,
    cardDef,
    artistId: cardDef.artistId,
    albumId: cardDef.albumId,
    rarity: cardDef.rarity,
    count: 1,
    instanceIds: ['inst-1'],
    firstAcquiredAt: '2026-09-20T10:00:00Z',
    lastAcquiredAt: '2026-09-20T10:00:00Z',
    supplyStatus: 'active',
  };
}

describe('applyFilter', () => {
  const pockets = [
    createMockPocket('prod-01-card-1'),
    createMockPocket('prod-01-card-10'),
    createMockPocket('prod-02-card-9'),
    createMockPocket('prod-03-card-7'),
  ];

  it('필터 없으면 모두 반환', () => {
    const result = applyFilter(pockets, { artistId: null, rarity: null });
    expect(result).toHaveLength(4);
  });

  it('아티스트 필터 적용', () => {
    const result = applyFilter(pockets, { artistId: 'artist-a', rarity: null });
    expect(result).toHaveLength(3);
    expect(result.every((p) => p.artistId === 'artist-a')).toBe(true);
  });

  it('등급 필터 적용', () => {
    const result = applyFilter(pockets, { artistId: null, rarity: 'legend' });
    expect(result).toHaveLength(1);
    expect(result[0].cardDefId).toBe('prod-01-card-10');
  });

  it('아티스트와 등급 AND 필터', () => {
    const result = applyFilter(pockets, { artistId: 'artist-a', rarity: 'legend' });
    expect(result).toHaveLength(1);
    expect(result[0].cardDefId).toBe('prod-01-card-10');
  });

  it('조건에 맞는 카드가 없으면 빈 배열', () => {
    const result = applyFilter(pockets, { artistId: 'artist-b', rarity: 'legend' });
    expect(result).toHaveLength(0);
  });
});

describe('getAvailableArtists', () => {
  it('보유한 아티스트만 반환', () => {
    const pockets = [
      createMockPocket('prod-01-card-1'),
      createMockPocket('prod-01-card-2'),
      createMockPocket('prod-03-card-7'),
    ];
    const result = getAvailableArtists(pockets);
    expect(result).toContain('artist-a');
    expect(result).toContain('artist-b');
    expect(result).not.toContain('artist-c');
    expect(result).not.toContain('artist-d');
  });
});

describe('getAvailableRarities', () => {
  it('보유한 등급만 반환', () => {
    const pockets = [
      createMockPocket('prod-01-card-1'),
      createMockPocket('prod-01-card-9'),
      createMockPocket('prod-01-card-10'),
    ];
    const result = getAvailableRarities(pockets);
    expect(result).toContain('common');
    expect(result).toContain('epic');
    expect(result).toContain('legend');
    expect(result).not.toContain('rare');
  });
});
