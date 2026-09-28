import { type CardDef, type RarityId } from '../../../services/api/types';

export type SupplyStatus = 'active' | 'discontinued';

export interface BinderPocket {
  cardDefId: string;
  cardDef: CardDef;
  artistId: string;
  albumId: string;
  rarity: RarityId;
  count: number;
  instanceIds: string[];
  firstAcquiredAt: string;
  lastAcquiredAt: string;
  supplyStatus: SupplyStatus;
}

export interface BinderFilter {
  artistId: string | null;
  rarity: RarityId | null;
}

export interface BinderPage {
  index: number;
  slots: (BinderPocket | null)[];
}
