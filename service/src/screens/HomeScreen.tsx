import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../services/api/ApiProvider';
import { type HomeFeed } from '../services/api/types';
import { colors } from '../theme/tokens';
import { ProductCard } from '../components/ProductCard';
import { BannerSlide } from '../components/BannerSlide';
import { ErrorState } from '../components/ErrorState';

export function HomeScreen() {
  const api = useApi();
  const router = useRouter();
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getHomeFeed();
      setFeed(data);
    } catch (err: any) {
      setError(err.message ?? '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (error || !feed) {
    return <ErrorState message={error ?? '데이터를 불러올 수 없습니다.'} onRetry={loadFeed} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {feed.unopenedCount > 0 && (
        <TouchableOpacity style={styles.unopenedBanner} onPress={() => {}}>
          <Text style={styles.unopenedText}>개봉하지 않은 팩이 {feed.unopenedCount}개 있어요</Text>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <BannerSlide banners={feed.banners} onPressBanner={(banner) => {
          if (banner.action.type === 'product') {
            router.push(`/products/${banner.action.productId}` as any);
          } else if (banner.action.type === 'guide') {
            // PR-C에서 구현 예정
            alert('이용 안내는 준비 중입니다.');
          }
        }} />
      </View>

      {feed.recommended.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 상품</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {feed.recommended.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => router.push(`/products/${product.id}` as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {feed.newReleases.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>신규 출시</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {feed.newReleases.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => router.push(`/products/${product.id}` as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {feed.popular.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 상품</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {feed.popular.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => router.push(`/products/${product.id}` as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {feed.artists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>아티스트</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {feed.artists.map((artist) => (
              <TouchableOpacity
                key={artist.id}
                style={styles.artistChip}
                onPress={() => router.push(`/(tabs)/products/index?artist=${artist.id}` as any)}
              >
                <Text style={styles.artistName}>{artist.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {feed.myRecentCards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 카드 미리보기</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {feed.myRecentCards.map((card) => (
              <View key={card.instanceId} style={styles.cardPreview}>
                <Image source={card.cardDef.front} style={styles.cardPreviewImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0908',
  },
  content: {
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C0908',
  },
  unopenedBanner: {
    backgroundColor: colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  unopenedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.paper,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  artistChip: {
    backgroundColor: 'rgba(246, 239, 230, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.paper,
  },
  cardPreview: {
    width: 100,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardPreviewImage: {
    width: '100%',
    height: '100%',
  },
});
