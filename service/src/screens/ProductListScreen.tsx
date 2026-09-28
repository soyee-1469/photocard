import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApi } from '../services/api/ApiProvider';
import { type Product } from '../services/api/types';
import { colors } from '../theme/tokens';
import { ProductCard } from '../components/ProductCard';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { artists } from '../data/artists';
import { albums } from '../data/albums';

export function ProductListScreen() {
  const api = useApi();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string | null>(
    typeof params.artist === 'string' ? params.artist : null
  );
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'new' | 'popular' | 'price'>('new');

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.listProducts({
        artistId: selectedArtist ?? undefined,
        albumId: selectedAlbum ?? undefined,
        query: query || undefined,
        sort: sortBy,
      });
      setProducts(result.items);
    } catch (err: any) {
      setError(err.message ?? '상품을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedArtist, selectedAlbum, sortBy]);

  const handleSearch = () => {
    loadProducts();
  };

  const filteredAlbums = selectedArtist ? albums.filter((a) => a.artistId === selectedArtist) : [];

  if (loading && products.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProducts} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="상품, 아티스트, 앨범 검색"
          placeholderTextColor={colors.mist}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

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
              <Text
                style={[styles.filterChipText, selectedArtist === artist.id && styles.filterChipTextActive]}
              >
                {artist.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredAlbums.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, selectedAlbum === null && styles.filterChipActive]}
              onPress={() => setSelectedAlbum(null)}
            >
              <Text style={[styles.filterChipText, selectedAlbum === null && styles.filterChipTextActive]}>
                모든 앨범
              </Text>
            </TouchableOpacity>
            {filteredAlbums.map((album) => (
              <TouchableOpacity
                key={album.id}
                style={[styles.filterChip, selectedAlbum === album.id && styles.filterChipActive]}
                onPress={() => setSelectedAlbum(album.id)}
              >
                <Text style={[styles.filterChipText, selectedAlbum === album.id && styles.filterChipTextActive]}>
                  {album.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'new' && styles.filterChipActive]}
            onPress={() => setSortBy('new')}
          >
            <Text style={[styles.filterChipText, sortBy === 'new' && styles.filterChipTextActive]}>신규순</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'popular' && styles.filterChipActive]}
            onPress={() => setSortBy('popular')}
          >
            <Text style={[styles.filterChipText, sortBy === 'popular' && styles.filterChipTextActive]}>인기순</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'price' && styles.filterChipActive]}
            onPress={() => setSortBy('price')}
          >
            <Text style={[styles.filterChipText, sortBy === 'price' && styles.filterChipTextActive]}>가격순</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {products.length === 0 ? (
        <EmptyState message="검색 결과가 없습니다." />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <ProductCard product={item} onPress={() => router.push(`/products/${item.id}` as any)} />
            </View>
          )}
          contentContainerStyle={styles.grid}
        />
      )}
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
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(246, 239, 230, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.paper,
  },
  searchButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  filters: {
    paddingBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingRight: 24,
    gap: 8,
    paddingVertical: 4,
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
  grid: {
    padding: 16,
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
    padding: 4,
  },
});
