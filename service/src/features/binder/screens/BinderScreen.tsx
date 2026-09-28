import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../../theme/tokens';
import { binderTheme } from '../theme/binderTheme';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { useOwnedPockets } from '../hooks/useOwnedPockets';
import { BinderRings } from '../components/BinderRings';
import { Pocket } from '../components/Pocket';
import { BinderFilterBar } from '../components/BinderFilterBar';
import { PageIndicator } from '../components/PageIndicator';
import { PagerArrows } from '../components/PagerArrows';
import { CardDetailOverlay } from '../detail/CardDetailOverlay';
import { type BinderPage, type BinderPocket } from '../model/types';
import { paginate } from '../model/paginate';
import { applyFilter, getAvailableArtists, getAvailableRarities } from '../model/filters';
import { parseParams, filterChanged } from '../model/params';

export function BinderScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { pockets, loading, error, reload } = useOwnedPockets();

  const [filteredPockets, setFilteredPockets] = useState<BinderPocket[]>([]);
  const [pages, setPages] = useState<BinderPage[]>([]);

  const parsedParams = parseParams(
    searchParams as Record<string, string | undefined>,
    pages.length
  );

  const currentPage = parsedParams.page;
  const currentFilter = parsedParams.filter;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        router.setParams({ page: (currentPage - 1).toString() });
      } else if (e.key === 'ArrowRight' && currentPage < pages.length) {
        router.setParams({ page: (currentPage + 1).toString() });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, router]);

  useEffect(() => {
    const filtered = applyFilter(pockets, currentFilter);
    setFilteredPockets(filtered);
    const newPages = paginate(filtered, 4);
    setPages(newPages);

    if (newPages.length > 0 && currentPage > newPages.length) {
      router.setParams({ page: '1' });
    }
  }, [pockets, currentFilter.artistId, currentFilter.rarity]);

  const handlePageChange = (page: number) => {
    router.setParams({ page: page.toString() });
  };

  const handleFilterChange = (newFilter: typeof currentFilter) => {
    if (filterChanged(currentFilter, newFilter)) {
      router.setParams({
        artist: newFilter.artistId || undefined,
        rarity: newFilter.rarity || undefined,
        page: '1',
      });
    } else {
      router.setParams({
        artist: newFilter.artistId || undefined,
        rarity: newFilter.rarity || undefined,
      });
    }
  };

  const handlePocketPress = (pocket: BinderPocket) => {
    router.setParams({ card: pocket.cardDefId });
  };

  const handleCloseDetail = () => {
    const params = { ...searchParams };
    delete params.card;
    router.setParams(params);
  };

  const selectedPocket = parsedParams.cardDefId
    ? filteredPockets.find((p) => p.cardDefId === parsedParams.cardDefId) || null
    : null;

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
        <EmptyState message="아직 보유한 카드가 없습니다." />
      </View>
    );
  }

  const availableArtists = getAvailableArtists(pockets);
  const availableRarities = getAvailableRarities(pockets);

  if (filteredPockets.length === 0) {
    return (
      <View style={styles.container}>
        <BinderFilterBar
          filter={currentFilter}
          availableArtists={availableArtists}
          availableRarities={availableRarities}
          onFilterChange={handleFilterChange}
        />
        <View style={styles.centered}>
          <EmptyState message="조건에 맞는 카드가 없어요" />
        </View>
      </View>
    );
  }

  const currentPageData = pages[currentPage - 1] || pages[0];

  return (
    <View style={styles.container}>
      <BinderFilterBar
        filter={currentFilter}
        availableArtists={availableArtists}
        availableRarities={availableRarities}
        onFilterChange={handleFilterChange}
      />

      <View style={styles.binderContainer}>
        <BinderRings />

        <View style={styles.paper}>
          <View style={styles.pageContainer}>
            <View style={styles.pocketsGrid}>
              {currentPageData?.slots.map((pocket, index) => (
                <Pocket
                  key={pocket?.cardDefId || `empty-${index}`}
                  pocket={pocket}
                  onPress={handlePocketPress}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      <PageIndicator currentPage={currentPage} totalPages={pages.length} />
      <PagerArrows
        currentPage={currentPage}
        totalPages={pages.length}
        onPageChange={handlePageChange}
      />

      <CardDetailOverlay pocket={selectedPocket} onClose={handleCloseDetail} />
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
  binderContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  paper: {
    flex: 1,
    backgroundColor: binderTheme.paper.background,
    borderLeftWidth: 1,
    borderLeftColor: binderTheme.paper.edge,
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pocketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 280,
    gap: 12,
  },
});
