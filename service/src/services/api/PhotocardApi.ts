import {
  type Artist,
  type Album,
  type Product,
  type Purchase,
  type HomeFeed,
  type ProductDetail,
  type OwnedCardView,
  type CardDetail,
  type Wallet,
  type WalletTx,
  type Page,
} from './types';

export interface PhotocardApi {
  getHomeFeed(): Promise<HomeFeed>;

  listProducts(params?: {
    artistId?: string;
    albumId?: string;
    query?: string;
    status?: string;
    sort?: 'new' | 'popular' | 'price';
    cursor?: string;
  }): Promise<Page<Product>>;

  getProduct(id: string): Promise<ProductDetail>;

  getWallet(): Promise<Wallet>;

  listWalletTx(): Promise<WalletTx[]>;

  purchase(req: {
    productId: string;
    idempotencyKey: string;
    expectedPriceTott: number;
  }): Promise<Purchase>;

  getPurchase(id: string): Promise<Purchase>;

  listPurchases(): Promise<Purchase[]>;

  listPendingOpenings(): Promise<Purchase[]>;

  markOpened(purchaseId: string): Promise<Purchase>;

  listOwnedCards(filters?: {
    artistId?: string;
    rarity?: string;
    onlyNew?: boolean;
  }): Promise<OwnedCardView[]>;

  getCardDetail(cardDefId: string): Promise<CardDetail>;
}
