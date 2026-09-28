import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../theme/tokens';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { useOwnedPockets } from '../hooks/useOwnedPockets';
import { AlbumCover } from '../components/AlbumCover';
import { RecentCardsStrip } from '../components/RecentCardsStrip';
import { type BinderPocket } from '../model/types';
import { paginate } from '../model/paginate';

export function BinderHomeScreen() {
  const router = useRouter();
  const { pockets, loading, error, reload } = useOwnedPockets();

  const handleOpenAlbum = () => {
    router.push('/album/binder?page=1');
  };

  const handleRecentCardPress = (pocket: BinderPocket) => {
    const pages = paginate(pockets, 4);
    const pageIndex = pages.findIndex((page) =>
      page.slots.some((slot) => slot?.cardDefId === pocket.cardDefId)
    );
    if (pageIndex !== -1) {
      router.push(`/album/binder?page=${pageIndex + 1}&card=${pocket.cardDefId}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={reload} />
      </View>
    );
  }

  if (pockets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <AlbumCover />
          <View style={styles.stats}>
            <Text style={styles.statsText}>보유 카드 0장</Text>
          </View>
          <EmptyState message="아직 보유한 카드가 없습니다." />
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.goToProductsButton}
              onPress={() => router.push('/(tabs)/products')}
            >
              <Text style={styles.goToProductsText}>상품 보러가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const uniqueCardCount = pockets.length;
  const totalCardCount = pockets.reduce((sum, p) => sum + p.count, 0);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.coverSection}>
          <AlbumCover />
        </View>

        <View style={styles.stats}>
          <Text style={styles.statsText}>
            보유 카드 {totalCardCount}장 · {uniqueCardCount}종
          </Text>
        </View>

        <RecentCardsStrip pockets={pockets} onCardPress={handleRecentCardPress} />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.openButton} onPress={handleOpenAlbum}>
            <Text style={styles.openButtonText}>앨범 열기</Text>
          </TouchableOpacity>
        </View>
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
  },
  content: {
    flex: 1,
    paddingVertical: 24,
  },
  coverSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stats: {
    alignItems: 'center',
    marginTop: 12,
  },
  statsText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gold,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  openButton: {
    backgroundColor: colors.gold,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  goToProductsButton: {
    backgroundColor: 'rgba(201, 160, 106, 0.2)',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  goToProductsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gold,
  },
});
