import { type CardDef } from '../../../services/api/types';
import { type SupplyStatus } from './types';
import { products } from '../../../data/products';

export function resolveSupplyStatus(cardDef: CardDef): SupplyStatus {
  const product = products.find((p) => p.id === cardDef.productId);
  if (product && product.saleStatus === 'ended') {
    return 'discontinued';
  }
  return 'active';
}
