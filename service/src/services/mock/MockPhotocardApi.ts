import { PhotocardApi } from '../api/PhotocardApi';
import {
  type HomeFeed,
  type Product,
  type ProductDetail,
  type Wallet,
  type WalletTx,
  type Purchase,
  type OwnedCardView,
  type CardDetail,
  type Page,
  type OwnedCard,
  ApiError,
} from '../api/types';
import { StorageAdapter, loadJson, saveJson } from '../storage/StorageAdapter';
import { products } from '../../data/products';
import { artists } from '../../data/artists';
import { albums } from '../../data/albums';
import { banners } from '../../data/banners';
import { cards, getCardsByProduct, getCardById } from '../../data/cards';

interface MockDb {
  wallet: Wallet;
  purchases: Purchase[];
  ownedCards: OwnedCard[];
  walletTxs: WalletTx[];
}

const DB_KEY = 'tomatok.photocard.mockdb.v1';
const INITIAL_BALANCE = 52000;

// 테스트용 초기 보유 카드 (A6 "내 카드 미리보기" 확인용)
// Issue #8: 보유 카드 있는 경우를 기본으로 시드
const INITIAL_OWNED_CARDS: OwnedCard[] = [
  {
    instanceId: 'owned-001',
    cardDefId: 'prod-01-card-1',
    purchaseId: 'test-purchase-001',
    acquiredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    revealedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    instanceId: 'owned-002',
    cardDefId: 'prod-01-card-5',
    purchaseId: 'test-purchase-001',
    acquiredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    revealedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    instanceId: 'owned-003',
    cardDefId: 'prod-02-card-3',
    purchaseId: 'test-purchase-002',
    acquiredAt: new Date(Date.now() - 86400000).toISOString(),
    revealedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    instanceId: 'owned-004',
    cardDefId: 'prod-03-card-7',
    purchaseId: 'test-purchase-003',
    acquiredAt: new Date().toISOString(),
    revealedAt: new Date().toISOString(),
  },
];

export class MockPhotocardApi implements PhotocardApi {
  private storage: StorageAdapter;
  private failureInjection: boolean = false;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    // URL 쿼리 파라미터로 실패 주입 활성화 (?fail=1)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      this.failureInjection = params.get('fail') === '1';
    }
  }

  setFailureInjection(enabled: boolean) {
    this.failureInjection = enabled;
  }

  private async loadDb(): Promise<MockDb> {
    if (this.failureInjection) {
      throw new ApiError('SERVER', '의도적인 오류 (테스트 모드)', false);
    }
    return await loadJson<MockDb>(this.storage, DB_KEY, {
      wallet: { balanceTott: INITIAL_BALANCE, currency: 'TOTT', isTest: true },
      purchases: [],
      ownedCards: INITIAL_OWNED_CARDS,
      walletTxs: [],
    });
  }

  private async saveDb(db: MockDb): Promise<void> {
    await saveJson(this.storage, DB_KEY, db);
  }

  async getHomeFeed(): Promise<HomeFeed> {
    await this.delay();
    const db = await this.loadDb();

    const recommended = products.filter((p) => p.tags.includes('recommended') && p.saleStatus === 'onSale').slice(0, 3);
    const newReleases = products.filter((p) => p.tags.includes('new')).slice(0, 4);
    const popular = products
      .filter((p) => p.saleStatus === 'onSale')
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 4);

    const recentCards = db.ownedCards
      .sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime())
      .slice(0, 4);

    const myRecentCards: OwnedCardView[] = recentCards.map((oc) => ({
      instanceId: oc.instanceId,
      cardDef: getCardById(oc.cardDefId)!,
      acquiredAt: oc.acquiredAt,
      revealedAt: oc.revealedAt,
      isNew: oc.revealedAt === null,
    }));

    const unopenedCount = db.purchases.filter((p) => p.status === 'paid' && p.openingStatus === 'unopened').length;

    return {
      recommended,
      newReleases,
      popular,
      artists: artists.slice(0, 4),
      banners,
      myRecentCards,
      unopenedCount,
    };
  }

  async listProducts(params?: {
    artistId?: string;
    albumId?: string;
    query?: string;
    status?: string;
    sort?: 'new' | 'popular' | 'price';
    cursor?: string;
  }): Promise<Page<Product>> {
    await this.delay();

    let filtered = [...products];

    if (params?.artistId) {
      filtered = filtered.filter((p) => p.artistId === params.artistId);
    }

    if (params?.albumId) {
      filtered = filtered.filter((p) => p.albumId === params.albumId);
    }

    if (params?.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          artists.find((a) => a.id === p.artistId)?.name.toLowerCase().includes(q) ||
          albums.find((a) => a.id === p.albumId)?.title.toLowerCase().includes(q),
      );
    }

    if (params?.status) {
      filtered = filtered.filter((p) => p.saleStatus === params.status);
    }

    if (params?.sort === 'new') {
      filtered.sort((a, b) => new Date(b.saleStartAt).getTime() - new Date(a.saleStartAt).getTime());
    } else if (params?.sort === 'popular') {
      filtered.sort((a, b) => b.popularity - a.popularity);
    } else if (params?.sort === 'price') {
      filtered.sort((a, b) => a.priceTott - b.priceTott);
    }

    return {
      items: filtered,
      hasMore: false,
    };
  }

  async getProduct(id: string): Promise<ProductDetail> {
    await this.delay();

    const product = products.find((p) => p.id === id);
    if (!product) {
      throw new ApiError('NOT_FOUND', '상품을 찾을 수 없습니다.', false);
    }

    const productCards = getCardsByProduct(id);

    return {
      ...product,
      cards: productCards,
    };
  }

  async getWallet(): Promise<Wallet> {
    await this.delay();
    const db = await this.loadDb();
    return db.wallet;
  }

  async listWalletTx(): Promise<WalletTx[]> {
    await this.delay();
    const db = await this.loadDb();
    return db.walletTxs.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }

  async purchase(req: { productId: string; idempotencyKey: string; expectedPriceTott: number }): Promise<Purchase> {
    throw new Error('Not implemented in PR-A');
  }

  async getPurchase(id: string): Promise<Purchase> {
    await this.delay();
    const db = await this.loadDb();
    const purchase = db.purchases.find((p) => p.id === id);
    if (!purchase) {
      throw new ApiError('NOT_FOUND', '구매 내역을 찾을 수 없습니다.', false);
    }
    return purchase;
  }

  async listPurchases(): Promise<Purchase[]> {
    await this.delay();
    const db = await this.loadDb();
    return db.purchases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listPendingOpenings(): Promise<Purchase[]> {
    await this.delay();
    const db = await this.loadDb();
    return db.purchases.filter((p) => p.status === 'paid' && p.openingStatus === 'unopened');
  }

  async markOpened(purchaseId: string): Promise<Purchase> {
    throw new Error('Not implemented in PR-A');
  }

  async listOwnedCards(filters?: {
    artistId?: string;
    rarity?: string;
    onlyNew?: boolean;
  }): Promise<OwnedCardView[]> {
    await this.delay();
    const db = await this.loadDb();

    let filtered = db.ownedCards;

    if (filters?.artistId) {
      filtered = filtered.filter((oc) => {
        const cardDef = getCardById(oc.cardDefId);
        return cardDef?.artistId === filters.artistId;
      });
    }

    if (filters?.rarity) {
      filtered = filtered.filter((oc) => {
        const cardDef = getCardById(oc.cardDefId);
        return cardDef?.rarity === filters.rarity;
      });
    }

    if (filters?.onlyNew) {
      filtered = filtered.filter((oc) => oc.revealedAt === null);
    }

    return filtered
      .map((oc) => ({
        instanceId: oc.instanceId,
        cardDef: getCardById(oc.cardDefId)!,
        acquiredAt: oc.acquiredAt,
        revealedAt: oc.revealedAt,
        isNew: oc.revealedAt === null,
      }))
      .filter((oc) => oc.cardDef);
  }

  async getCardDetail(cardDefId: string): Promise<CardDetail> {
    await this.delay();
    const db = await this.loadDb();
    const cardDef = getCardById(cardDefId);

    if (!cardDef) {
      throw new ApiError('NOT_FOUND', '카드를 찾을 수 없습니다.', false);
    }

    const owned = db.ownedCards.filter((oc) => oc.cardDefId === cardDefId);
    const ownedCount = owned.length;
    const firstAcquired = owned.length > 0 ? owned.sort((a, b) => new Date(a.acquiredAt).getTime() - new Date(b.acquiredAt).getTime())[0] : null;
    const lastAcquired = owned.length > 0 ? owned.sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime())[0] : null;

    return {
      cardDef,
      ownedCount,
      firstAcquiredAt: firstAcquired?.acquiredAt ?? null,
      lastAcquiredAt: lastAcquired?.acquiredAt ?? null,
    };
  }

  private async delay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
