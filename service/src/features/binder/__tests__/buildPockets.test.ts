import { describe, it, expect } from '@jest/globals';
import { buildPockets } from '../model/buildPockets';
import { type OwnedCard } from '../../../services/api/types';

describe('buildPockets', () => {
  it('빈 배열은 빈 포켓 배열을 반환', () => {
    const result = buildPockets([]);
    expect(result).toEqual([]);
  });

  it('같은 cardDefId를 가진 카드들을 하나의 포켓으로 묶음', () => {
    const ownedCards: OwnedCard[] = [
      {
        instanceId: 'inst-1',
        cardDefId: 'prod-01-card-1',
        purchaseId: 'pur-1',
        acquiredAt: '2026-09-20T10:00:00Z',
        revealedAt: '2026-09-20T10:00:00Z',
      },
      {
        instanceId: 'inst-2',
        cardDefId: 'prod-01-card-1',
        purchaseId: 'pur-2',
        acquiredAt: '2026-09-21T10:00:00Z',
        revealedAt: '2026-09-21T10:00:00Z',
      },
      {
        instanceId: 'inst-3',
        cardDefId: 'prod-01-card-1',
        purchaseId: 'pur-3',
        acquiredAt: '2026-09-19T10:00:00Z',
        revealedAt: '2026-09-19T10:00:00Z',
      },
    ];

    const result = buildPockets(ownedCards);

    expect(result).toHaveLength(1);
    expect(result[0].cardDefId).toBe('prod-01-card-1');
    expect(result[0].count).toBe(3);
    expect(result[0].firstAcquiredAt).toBe('2026-09-19T10:00:00Z');
    expect(result[0].lastAcquiredAt).toBe('2026-09-21T10:00:00Z');
  });

  it('prod-08 카드는 공급 종료 상태', () => {
    const ownedCards: OwnedCard[] = [
      {
        instanceId: 'inst-1',
        cardDefId: 'prod-08-card-13',
        purchaseId: 'pur-1',
        acquiredAt: '2026-09-20T10:00:00Z',
        revealedAt: '2026-09-20T10:00:00Z',
      },
    ];

    const result = buildPockets(ownedCards);

    expect(result).toHaveLength(1);
    expect(result[0].supplyStatus).toBe('discontinued');
  });

  it('prod-01 카드는 활성 상태', () => {
    const ownedCards: OwnedCard[] = [
      {
        instanceId: 'inst-1',
        cardDefId: 'prod-01-card-1',
        purchaseId: 'pur-1',
        acquiredAt: '2026-09-20T10:00:00Z',
        revealedAt: '2026-09-20T10:00:00Z',
      },
    ];

    const result = buildPockets(ownedCards);

    expect(result).toHaveLength(1);
    expect(result[0].supplyStatus).toBe('active');
  });

  it('아티스트 → 앨범 → 카드 번호 순으로 정렬', () => {
    const ownedCards: OwnedCard[] = [
      {
        instanceId: 'inst-1',
        cardDefId: 'prod-03-card-7',
        purchaseId: 'pur-1',
        acquiredAt: '2026-09-20T10:00:00Z',
        revealedAt: '2026-09-20T10:00:00Z',
      },
      {
        instanceId: 'inst-2',
        cardDefId: 'prod-01-card-5',
        purchaseId: 'pur-2',
        acquiredAt: '2026-09-20T10:00:00Z',
        revealedAt: '2026-09-20T10:00:00Z',
      },
      {
        instanceId: 'inst-3',
        cardDefId: 'prod-01-card-1',
        purchaseId: 'pur-3',
        acquiredAt: '2026-09-20T10:00:00Z',
        revealedAt: '2026-09-20T10:00:00Z',
      },
      {
        instanceId: 'inst-4',
        cardDefId: 'prod-02-card-3',
        purchaseId: 'pur-4',
        acquiredAt: '2026-09-20T10:00:00Z',
        revealedAt: '2026-09-20T10:00:00Z',
      },
    ];

    const result = buildPockets(ownedCards);

    expect(result.map((p) => p.cardDefId)).toEqual([
      'prod-02-card-3',
      'prod-01-card-1',
      'prod-01-card-5',
      'prod-03-card-7',
    ]);
  });
});
