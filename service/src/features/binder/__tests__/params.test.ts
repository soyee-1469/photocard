import { describe, it, expect } from '@jest/globals';
import { parseParams, filterChanged } from '../model/params';

describe('parseParams', () => {
  it('기본값은 page 1, 필터 없음', () => {
    const result = parseParams({}, 3);
    expect(result.page).toBe(1);
    expect(result.filter.artistId).toBeNull();
    expect(result.filter.rarity).toBeNull();
    expect(result.cardDefId).toBeNull();
  });

  it('page를 파싱', () => {
    const result = parseParams({ page: '2' }, 3);
    expect(result.page).toBe(2);
  });

  it('page가 1보다 작으면 1로 보정', () => {
    const result = parseParams({ page: '0' }, 3);
    expect(result.page).toBe(1);

    const result2 = parseParams({ page: '-1' }, 3);
    expect(result2.page).toBe(1);
  });

  it('page가 pageCount보다 크면 pageCount로 보정', () => {
    const result = parseParams({ page: '5' }, 3);
    expect(result.page).toBe(3);
  });

  it('잘못된 page는 1로', () => {
    const result = parseParams({ page: 'abc' }, 3);
    expect(result.page).toBe(1);
  });

  it('유효한 artist를 파싱', () => {
    const result = parseParams({ artist: 'artist-a' }, 3);
    expect(result.filter.artistId).toBe('artist-a');
  });

  it('유효하지 않은 artist는 무시', () => {
    const result = parseParams({ artist: 'invalid' }, 3);
    expect(result.filter.artistId).toBeNull();
  });

  it('유효한 rarity를 파싱', () => {
    const result = parseParams({ rarity: 'legend' }, 3);
    expect(result.filter.rarity).toBe('legend');
  });

  it('유효하지 않은 rarity는 무시', () => {
    const result = parseParams({ rarity: 'invalid' }, 3);
    expect(result.filter.rarity).toBeNull();
  });

  it('card를 파싱', () => {
    const result = parseParams({ card: 'prod-01-card-1' }, 3);
    expect(result.cardDefId).toBe('prod-01-card-1');
  });

  it('모든 파라미터를 함께 파싱', () => {
    const result = parseParams(
      { page: '2', artist: 'artist-a', rarity: 'legend', card: 'prod-01-card-10' },
      3
    );
    expect(result.page).toBe(2);
    expect(result.filter.artistId).toBe('artist-a');
    expect(result.filter.rarity).toBe('legend');
    expect(result.cardDefId).toBe('prod-01-card-10');
  });
});

describe('filterChanged', () => {
  it('필터가 같으면 false', () => {
    const result = filterChanged(
      { artistId: 'artist-a', rarity: 'legend' },
      { artistId: 'artist-a', rarity: 'legend' }
    );
    expect(result).toBe(false);
  });

  it('artistId가 다르면 true', () => {
    const result = filterChanged(
      { artistId: 'artist-a', rarity: null },
      { artistId: 'artist-b', rarity: null }
    );
    expect(result).toBe(true);
  });

  it('rarity가 다르면 true', () => {
    const result = filterChanged(
      { artistId: null, rarity: 'legend' },
      { artistId: null, rarity: 'epic' }
    );
    expect(result).toBe(true);
  });

  it('둘 다 다르면 true', () => {
    const result = filterChanged(
      { artistId: 'artist-a', rarity: 'legend' },
      { artistId: 'artist-b', rarity: 'epic' }
    );
    expect(result).toBe(true);
  });
});
