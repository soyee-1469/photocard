import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApi } from '../services/api/ApiProvider';
import { type ProductDetail } from '../services/api/types';
import { colors, rarities } from '../theme/tokens';
import { SaleBadge } from '../components/SaleBadge';
import { ErrorState } from '../components/ErrorState';

export function ProductDetailScreen() {
  const api = useApi();
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProduct(productId);
      setProduct(data);
    } catch (err: any) {
      setError(err.message ?? '상품을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (error || !product) {
    return <ErrorState message={error ?? '상품을 불러올 수 없습니다.'} onRetry={loadProduct} />;
  }

  const canPurchase = product.saleStatus === 'onSale';
  const totalRate = Object.values(product.rarityRates).reduce((sum, rate) => sum + rate, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          {typeof product.image === 'object' && 'uri' in product.image ? (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>상품 이미지</Text>
            </View>
          ) : (
            <Image source={product.image} style={styles.image} resizeMode="contain" />
          )}
          <SaleBadge status={product.saleStatus} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.price}>{product.priceTott.toLocaleString()} TOTT</Text>
          <Text style={styles.composition}>1팩 = 카드 {product.cardsPerPack}장</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>구성 카드 ({product.cards.length}종)</Text>
          <View style={styles.cardGrid}>
            {product.cards.map((card, index) => (
              <View key={card.id} style={styles.cardTile}>
                <View style={styles.cardTileImage}>
                  <Text style={styles.cardTileNumber}>{card.number}</Text>
                </View>
                <Text style={styles.cardTileRarity}>{rarities[card.rarity].badge}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>등급별 획득 확률</Text>
          <View style={styles.rateTable}>
            {(Object.keys(product.rarityRates) as Array<keyof typeof product.rarityRates>).map((rarityId) => {
              const rarity = rarities[rarityId];
              const rate = product.rarityRates[rarityId];
              return (
                <View key={rarityId} style={styles.rateRow}>
                  <View style={styles.rateLeft}>
                    <Text style={styles.rateBadge}>{rarity.badge}</Text>
                    <Text style={styles.rateLabel}>{rarity.label}</Text>
                  </View>
                  <Text style={styles.rateValue}>{(rate * 100).toFixed(1)}%</Text>
                </View>
              );
            })}
            <View style={[styles.rateRow, styles.rateRowTotal]}>
              <Text style={styles.rateLabel}>합계</Text>
              <Text style={[styles.rateValue, { color: totalRate === 1 ? colors.gold : '#FF6B6B' }]}>
                {(totalRate * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.purchaseButton, !canPurchase && styles.purchaseButtonDisabled]}
          onPress={() => {
            if (canPurchase) {
              alert('구매 기능은 PR-B에서 구현됩니다.');
            }
          }}
          disabled={!canPurchase}
        >
          <Text style={styles.purchaseButtonText}>
            {canPurchase ? '구매하기' : product.saleStatus === 'comingSoon' ? '출시 예정' : '구매 불가'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0908',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C0908',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: 'rgba(28, 20, 16, 0.3)',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.mist,
  },
  info: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.paper,
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: colors.mist,
    lineHeight: 20,
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: 4,
  },
  composition: {
    fontSize: 13,
    color: colors.mist,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.paper,
    marginBottom: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTile: {
    width: 60,
    alignItems: 'center',
  },
  cardTileImage: {
    width: 60,
    height: 80,
    backgroundColor: 'rgba(246, 239, 230, 0.1)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTileNumber: {
    fontSize: 12,
    color: colors.mist,
  },
  cardTileRarity: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold,
  },
  rateTable: {
    gap: 8,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rateRowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 4,
    paddingTop: 12,
  },
  rateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rateBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gold,
    width: 32,
  },
  rateLabel: {
    fontSize: 14,
    color: colors.paper,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.paper,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.ink,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  purchaseButton: {
    backgroundColor: colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: 'rgba(201, 160, 106, 0.3)',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
});
