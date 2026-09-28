import { type BinderPocket, type BinderFilter } from './types';

export function applyFilter(pockets: BinderPocket[], filter: BinderFilter): BinderPocket[] {
  return pockets.filter((pocket) => {
    if (filter.artistId !== null && pocket.artistId !== filter.artistId) {
      return false;
    }
    if (filter.rarity !== null && pocket.rarity !== filter.rarity) {
      return false;
    }
    return true;
  });
}

export function getAvailableArtists(pockets: BinderPocket[]): string[] {
  const artistSet = new Set<string>();
  for (const pocket of pockets) {
    artistSet.add(pocket.artistId);
  }
  return Array.from(artistSet);
}

export function getAvailableRarities(pockets: BinderPocket[]): string[] {
  const raritySet = new Set<string>();
  for (const pocket of pockets) {
    raritySet.add(pocket.rarity);
  }
  return Array.from(raritySet);
}
