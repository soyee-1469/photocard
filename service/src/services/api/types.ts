import { type ImageSourcePropType } from 'react-native';
import { type RarityId, type FrameId } from '../theme/tokens';

export type { RarityId, FrameId };

export type ImageRef = ImageSourcePropType | { uri: string } | { require: string };

export interface Artist {
  id: string;
  name: string;
  avatar: ImageRef;
}

export interface Album {
  id: string;
  artistId: string;
  title: string;
  releasedAt: string;
  cover: ImageRef;
}

export type SaleStatus = 'onSale' | 'comingSoon' | 'soldOut' | 'ended';

export interface Product {
  id: string;
  artistId: string;
  albumId: string;
  name: string;
  description: string;
  image: ImageRef;
  priceTott: number;
  cardsPerPack: 1;
  saleStatus: SaleStatus;
  saleStartAt: string;
  saleEndAt?: string;
  cardDefIds: string[];
  rarityRates: Record<RarityId, number>;
  tags: ('recommended' | 'new' | 'popular')[];
  popularity: number;
}

export interface CardDef {
  id: string;
  productId: string;
  artistId: string;
  albumId: string;
  number: number;
  title: string;
  rarity: RarityId;
  front: ImageRef;
  back: ImageRef;
  frameId: FrameId;
}

export interface OwnedCard {
  instanceId: string;
  cardDefId: string;
  purchaseId: string;
  acquiredAt: string;
  revealedAt: string | null;
}

export interface Wallet {
  balanceTott: number;
  currency: 'TOTT';
  isTest: true;
}

export interface WalletTx {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  purchaseId?: string;
  at: string;
  balanceAfter: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OpeningStatus = 'unopened' | 'opened';

export interface Purchase {
  id: string;
  idempotencyKey: string;
  productId: string;
  priceTott: number;
  status: PaymentStatus;
  failureCode?: ApiErrorCode;
  result?: {
    cardDefId: string;
    rarity: RarityId;
    ownedInstanceId: string;
    isNew: boolean;
  };
  openingStatus: OpeningStatus;
  createdAt: string;
  paidAt?: string;
  openedAt?: string;
  isTest: true;
}

export type ApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'INSUFFICIENT_BALANCE'
  | 'SOLD_OUT'
  | 'PRICE_CHANGED'
  | 'SERVER'
  | 'NOT_FOUND';

export class ApiError extends Error {
  code: ApiErrorCode;
  retryable: boolean;

  constructor(code: ApiErrorCode, message: string, retryable: boolean = false) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.name = 'ApiError';
  }
}

export interface HomeFeed {
  recommended: Product[];
  newReleases: Product[];
  popular: Product[];
  artists: Artist[];
  banners: Banner[];
  myRecentCards: OwnedCardView[];
  unopenedCount: number;
}

export interface Banner {
  id: string;
  image: ImageRef;
  title: string;
  action: { type: 'product'; productId: string } | { type: 'guide' };
}

export interface ProductDetail extends Product {
  cards: CardDef[];
}

export interface OwnedCardView {
  instanceId: string;
  cardDef: CardDef;
  acquiredAt: string;
  revealedAt: string | null;
  isNew: boolean;
}

export interface CardDetail {
  cardDef: CardDef;
  ownedCount: number;
  firstAcquiredAt: string | null;
  lastAcquiredAt: string | null;
}

export interface Page<T> {
  items: T[];
  cursor?: string;
  hasMore: boolean;
}
