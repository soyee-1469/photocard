import React from 'react';
import { ProductDetailScreen } from '../../src/screens/ProductDetailScreen';
import { products } from '../../src/data/products';

export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductDetailPage() {
  return <ProductDetailScreen />;
}
