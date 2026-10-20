import { type RarityId } from '../../../services/api/types';
import { type BinderFilter } from './types';
import { artists } from '../../../data/artists';
import { rarities } from '../../../theme/tokens';

export interface BinderParams {
  page: number;
  filter: BinderFilter;
  cardDefId: string | null;
}

export function parseParams(searchParams: Record<string, string | undefined>, pageCount: number): BinderParams {
  const pageStr = searchParams.page;
  let page = 1;
  if (pageStr) {
    const parsed = parseInt(pageStr, 10);
    if (!isNaN(parsed)) {
      page = Math.max(1, Math.min(parsed, pageCount > 0 ? pageCount : 1));
    }
  }

  const artistId = searchParams.artist || null;
  const validArtistId = artistId && artists.some((a) => a.id === artistId) ? artistId : null;

  const rarity = searchParams.rarity as RarityId | undefined;
  const validRarity = rarity && rarity in rarities ? rarity : null;

  const cardDefId = searchParams.card || null;

  return {
    page,
    filter: {
      artistId: validArtistId,
      rarity: validRarity,
    },
    cardDefId,
  };
}

export function filterChanged(oldFilter: BinderFilter, newFilter: BinderFilter): boolean {
  return oldFilter.artistId !== newFilter.artistId || oldFilter.rarity !== newFilter.rarity;
}
