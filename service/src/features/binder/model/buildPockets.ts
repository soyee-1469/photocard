import { type OwnedCard } from '../../../services/api/types';
import { type BinderPocket } from './types';
import { getCardById } from '../../../data/cards';
import { artists } from '../../../data/artists';
import { albums } from '../../../data/albums';
import { resolveSupplyStatus } from './supply';

export function buildPockets(ownedCards: OwnedCard[]): BinderPocket[] {
  const grouped = new Map<string, {
    instances: OwnedCard[];
  }>();

  for (const card of ownedCards) {
    const existing = grouped.get(card.cardDefId);
    if (existing) {
      existing.instances.push(card);
    } else {
      grouped.set(card.cardDefId, { instances: [card] });
    }
  }

  const pockets: BinderPocket[] = [];

  for (const [cardDefId, { instances }] of grouped.entries()) {
    const cardDef = getCardById(cardDefId);
    if (!cardDef) {
      continue;
    }

    const sortedInstances = [...instances].sort((a, b) => 
      a.acquiredAt.localeCompare(b.acquiredAt)
    );

    pockets.push({
      cardDefId,
      cardDef,
      artistId: cardDef.artistId,
      albumId: cardDef.albumId,
      rarity: cardDef.rarity,
      count: instances.length,
      instanceIds: sortedInstances.map((i) => i.instanceId),
      firstAcquiredAt: sortedInstances[0].acquiredAt,
      lastAcquiredAt: sortedInstances[sortedInstances.length - 1].acquiredAt,
      supplyStatus: resolveSupplyStatus(cardDef),
    });
  }

  const artistOrder = artists.map((a) => a.id);
  const albumMap = new Map(albums.map((a) => [a.id, a]));

  pockets.sort((a, b) => {
    const aArtistIdx = artistOrder.indexOf(a.artistId);
    const bArtistIdx = artistOrder.indexOf(b.artistId);
    if (aArtistIdx !== bArtistIdx) {
      return aArtistIdx - bArtistIdx;
    }

    const aAlbum = albumMap.get(a.albumId);
    const bAlbum = albumMap.get(b.albumId);
    if (aAlbum && bAlbum) {
      const dateCompare = aAlbum.releasedAt.localeCompare(bAlbum.releasedAt);
      if (dateCompare !== 0) {
        return dateCompare;
      }
    }

    return a.cardDef.number - b.cardDef.number;
  });

  return pockets;
}
