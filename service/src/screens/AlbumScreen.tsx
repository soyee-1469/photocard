import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../services/api/ApiProvider';
import { type OwnedCardView } from '../services/api/types';
import { colors, rarities } from '../theme/tokens';
import { artists } from '../data/artists';
import { albums } from '../data/albums';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';

export function AlbumScreen() {
  const api = useApi();
  const router = useRouter();
  const [ownedCards, setOwnedCards] = useState<OwnedCardView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  const loadOwnedCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listOwnedCards();
      setOwnedCards(data);
    } catch (err: any) {
      setError(err.message ?? '카드를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnedCards();
  }, []);

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
        <ErrorState message={error} onRetry={loadOwnedCards} />
      </View>
    );
  }

  if (ownedCards.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          message="아직 보유한 카드가 없습니다."
          actionText="상품 보러가기"
          onAction={() => router.push('/products')}
        />
      </View>
    );
  }

  const filteredArtists = selectedArtist
    ? artists.filter((a) => a.id === selectedArtist)
    : artists;

  const filteredAlbums = selectedArtist
    ? albums.filter((a) => a.artistId === selectedArtist)
    : albums;

  const getAlbumOwnedCards = (albumId: string) => {
    return ownedCards.filter((c) => c.cardDef.albumId === albumId);
  };

  const getCardCount = (cardDefId: string): number => {
    return ownedCards.filter((c) => c.cardDef.id === cardDefId).length;
  };

  const albumsWithCards = filteredAlbums.filter((album) => getAlbumOwnedCards(album.id).length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedArtist === null && styles.filterChipActive]}
            onPress={() => setSelectedArtist(null)}
          >
            <Text style={[styles.filterChipText, selectedArtist === null && styles.filterChipTextActive]}>전체</Text>
          </TouchableOpacity>
          {artists.map((artist) => {
            const artistAlbums = albums.filter((a) => a.artistId === artist.id);
            const hasCards = artistAlbums.some((album) => getAlbumOwnedCards(album.id).length > 0);
            if (!hasCards) return null;

            return (
              <TouchableOpacity
                key={artist.id}
                style={[styles.filterChip, selectedArtist === artist.id && styles.filterChipActive]}
                onPress={() => setSelectedArtist(artist.id)}
              >
                <Text style={[styles.filterChipText, selectedArtist === artist.id && styles.filterChipTextActive]}>
                  {artist.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll}>
        {filteredArtists.map((artist) => {
          const artistAlbumsWithCards = filteredAlbums.filter(
            (album) => album.artistId === artist.id && getAlbumOwnedCards(album.id).length > 0
          );
          if (artistAlbumsWithCards.length === 0) return null;

          return (
            <View key={artist.id}>
              <View style={styles.artistHeader}>
                <Text style={styles.artistName}>{artist.name}</Text>
              </View>
              {artistAlbumsWithCards.map((album) => {
                const albumCards = getAlbumOwnedCards(album.id);
                const uniqueCards = Array.from(
                  new Map(albumCards.map((c) => [c.cardDef.id, c.cardDef])).values()
                );

                return (
                  <View key={album.id} style={styles.albumSection}>
                    <View style={styles.albumHeader}>
                      <Text style={styles.albumTitle}>{album.title}</Text>
                      <Text style={styles.albumCount}>{albumCards.length}장</Text>
                    </View>
                    <View style={styles.cardGrid}>
                      {uniqueCards.map((card) => {
                        const count = getCardCount(card.id);
                        return (
                          <View key={card.id} style={styles.cardItem}>
                            <View style={styles.cardImageContainer}>
                              <Image source={card.front} style={styles.cardImage} resizeMode="cover" />
                              <View style={styles.cardBadge}>
                                <Text style={styles.cardBadgeText}>{rarities[card.rarity].badge}</Text>
                              </View>
                              <View style={styles.cardCount}>
                                <Text style={styles.cardCountText}>×{count}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
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
  filters: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingRight: 24,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(246, 239, 230, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.mist,
  },
  filterChipTextActive: {
    color: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  artistHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(201, 160, 106, 0.1)',
  },
  artistName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  albumSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  albumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.paper,
  },
  albumCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardItem: {
    width: 70,
  },
  cardImageContainer: {
    width: 70,
    height: 95,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(28, 20, 16, 0.3)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(12, 9, 8, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold,
  },
  cardCount: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(12, 9, 8, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.paper,
  },
});
