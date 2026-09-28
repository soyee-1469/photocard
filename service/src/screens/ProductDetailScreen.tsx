import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApi } from '../services/api/ApiProvider';
import { type ProductDetail, type RarityId } from '../services/api/types';
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상품 상세</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.image} resizeMode="contain" />
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
            {product.cards.map((card) => (
              <View key={card.id} style={styles.cardTile}>
                <View style={styles.cardTileImageContainer}>
                  <Image source={card.front} style={styles.cardTileImage} resizeMode="cover" />
                  <View style={styles.cardTileBadge}>
                    <Text style={styles.cardTileBadgeText}>{rarities[card.rarity].badge}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>등급별 획득 확률</Text>
          <View style={styles.rateTable}>
            {(Object.keys(product.rarityRates) as RarityId[]).map((rarityId) => {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    backgroundColor: '#1C1410',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(246, 239, 230, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: colors.paper,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.paper,
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
    width: 70,
    marginBottom: 8,
  },
  cardTileImageContainer: {
    width: 70,
    height: 95,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  cardTileImage: {
    width: '100%',
    height: '100%',
  },
  cardTileBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(12, 9, 8, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardTileBadgeText: {
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
