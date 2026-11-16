import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { type Product } from '../services/api/types';
import { colors } from '../theme/tokens';
import { SaleBadge } from './SaleBadge';
import { artists } from '../data/artists';
import { albums } from '../data/albums';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const artist = artists.find((a) => a.id === product.artistId);
  const album = albums.find((a) => a.id === product.albumId);

  return (
    <TouchableOpacity testID={`product-card-${product.id}`} style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={product.image} style={styles.image} resizeMode="cover" />
        <SaleBadge status={product.saleStatus} />
      </View>
      <View style={styles.info}>
        <Text style={styles.artist} numberOfLines={1}>{artist?.name || ''}</Text>
        <Text style={styles.album} numberOfLines={1}>{album?.title || ''}</Text>
        <Text style={styles.price}>{product.priceTott.toLocaleString()} TOTT</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(246, 239, 230, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.7,
    backgroundColor: 'rgba(28, 20, 16, 0.3)',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: 8,
  },
  artist: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mist,
    marginBottom: 2,
  },
  album: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.paper,
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gold,
  },
});
