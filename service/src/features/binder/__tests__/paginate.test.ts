import { describe, it, expect } from '@jest/globals';
import { paginate, getPageCount } from '../model/paginate';
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

describe('paginate', () => {
  it('빈 배열은 빈 페이지를 반환', () => {
    const result = paginate([], 4);
    expect(result).toEqual([]);
  });

  it('1장은 1페이지, 3개 null', () => {
    const pockets = [createMockPocket('prod-01-card-1')];
    const result = paginate(pockets, 4);

    expect(result).toHaveLength(1);
    expect(result[0].index).toBe(1);
    expect(result[0].slots).toHaveLength(4);
    expect(result[0].slots[0]).toBe(pockets[0]);
    expect(result[0].slots[1]).toBeNull();
    expect(result[0].slots[2]).toBeNull();
    expect(result[0].slots[3]).toBeNull();
  });

  it('4장은 1페이지, null 없음', () => {
    const pockets = [
      createMockPocket('prod-01-card-1'),
      createMockPocket('prod-01-card-2'),
      createMockPocket('prod-01-card-3'),
      createMockPocket('prod-01-card-4'),
    ];
    const result = paginate(pockets, 4);

    expect(result).toHaveLength(1);
    expect(result[0].slots).toHaveLength(4);
    expect(result[0].slots.every((s) => s !== null)).toBe(true);
  });

  it('5장은 2페이지, 두 번째 페이지에 3개 null', () => {
    const pockets = [
      createMockPocket('prod-01-card-1'),
      createMockPocket('prod-01-card-2'),
      createMockPocket('prod-01-card-3'),
      createMockPocket('prod-01-card-4'),
      createMockPocket('prod-01-card-5'),
    ];
    const result = paginate(pockets, 4);

    expect(result).toHaveLength(2);
    expect(result[0].index).toBe(1);
    expect(result[1].index).toBe(2);
    expect(result[1].slots[0]).toBe(pockets[4]);
    expect(result[1].slots[1]).toBeNull();
    expect(result[1].slots[2]).toBeNull();
    expect(result[1].slots[3]).toBeNull();
  });

  it('10장은 3페이지', () => {
    const pockets = Array.from({ length: 10 }, (_, i) => 
      createMockPocket(`prod-01-card-${i + 1}`)
    );
    const result = paginate(pockets, 4);

    expect(result).toHaveLength(3);
    expect(result[2].slots[0]).toBe(pockets[8]);
    expect(result[2].slots[1]).toBe(pockets[9]);
    expect(result[2].slots[2]).toBeNull();
    expect(result[2].slots[3]).toBeNull();
  });
});

describe('getPageCount', () => {
  it('0장은 0페이지', () => {
    expect(getPageCount([], 4)).toBe(0);
  });

  it('1장은 1페이지', () => {
    const pockets = [createMockPocket('prod-01-card-1')];
    expect(getPageCount(pockets, 4)).toBe(1);
  });

  it('4장은 1페이지', () => {
    const pockets = Array.from({ length: 4 }, (_, i) => 
      createMockPocket(`prod-01-card-${i + 1}`)
    );
    expect(getPageCount(pockets, 4)).toBe(1);
  });

  it('5장은 2페이지', () => {
    const pockets = Array.from({ length: 5 }, (_, i) => 
      createMockPocket(`prod-01-card-${i + 1}`)
    );
    expect(getPageCount(pockets, 4)).toBe(2);
  });

  it('10장은 3페이지', () => {
    const pockets = Array.from({ length: 10 }, (_, i) => 
      createMockPocket(`prod-01-card-${i + 1}`)
    );
    expect(getPageCount(pockets, 4)).toBe(3);
  });
});
