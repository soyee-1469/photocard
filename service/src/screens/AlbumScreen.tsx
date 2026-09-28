import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useApi } from '../services/api/ApiProvider';
import { type OwnedCardView, type CardDef } from '../services/api/types';
import { colors, rarities } from '../theme/tokens';
import { artists } from '../data/artists';
import { albums } from '../data/albums';
import { cards as allCards } from '../data/cards';
import { ErrorState } from '../components/ErrorState';

export function AlbumScreen() {
  const api = useApi();
  const [ownedCards, setOwnedCards] = useState<OwnedCardView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadOwnedCards} />;
  }

  const filteredArtists = selectedArtist
    ? artists.filter((a) => a.id === selectedArtist)
    : artists;

  const filteredAlbums = selectedArtist
    ? albums.filter((a) => a.artistId === selectedArtist)
    : albums;

  const getOwnedCount = (cardDefId: string): number => {
    return ownedCards.filter((c) => c.cardDef.id === cardDefId).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedArtist === null && styles.filterChipActive]}
            onPress={() => {
              setSelectedArtist(null);
              setSelectedAlbum(null);
            }}
          >
            <Text style={[styles.filterChipText, selectedArtist === null && styles.filterChipTextActive]}>전체</Text>
          </TouchableOpacity>
          {artists.map((artist) => (
            <TouchableOpacity
              key={artist.id}
              style={[styles.filterChip, selectedArtist === artist.id && styles.filterChipActive]}
              onPress={() => {
                setSelectedArtist(artist.id);
                setSelectedAlbum(null);
              }}
            >
              <Text style={[styles.filterChipText, selectedArtist === artist.id && styles.filterChipTextActive]}>
                {artist.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll}>
        {filteredAlbums.map((album) => {
          const albumCards = allCards.filter((c) => c.albumId === album.id);
          if (albumCards.length === 0) return null;

          const ownedCount = albumCards.filter((c) => getOwnedCount(c.id) > 0).length;

          return (
            <View key={album.id} style={styles.albumSection}>
              <View style={styles.albumHeader}>
                <Text style={styles.albumTitle}>{album.title}</Text>
                <Text style={styles.albumProgress}>
                  {ownedCount} / {albumCards.length}
                </Text>
              </View>
              <View style={styles.cardGrid}>
                {albumCards.map((card) => {
                  const owned = getOwnedCount(card.id);
                  return (
                    <View key={card.id} style={styles.cardItem}>
                      <View style={styles.cardImageContainer}>
                        {owned > 0 ? (
                          <>
                            <Image source={card.front} style={styles.cardImage} resizeMode="cover" />
                            <View style={styles.cardBadge}>
                              <Text style={styles.cardBadgeText}>{rarities[card.rarity].badge}</Text>
                            </View>
                            {owned > 1 && (
                              <View style={styles.cardCount}>
                                <Text style={styles.cardCountText}>×{owned}</Text>
                              </View>
                            )}
                          </>
                        ) : (
                          <>
                            <Image source={card.front} style={[styles.cardImage, styles.cardImageLocked]} resizeMode="cover" />
                            <View style={styles.cardLockOverlay}>
                              <Text style={styles.cardLockIcon}>🔒</Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
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
  albumProgress: {
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
  cardImageLocked: {
    opacity: 0.3,
  },
  cardLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 9, 8, 0.6)',
  },
  cardLockIcon: {
    fontSize: 20,
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
