import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { type Product } from '../services/api/types';
import { colors } from '../theme/tokens';
import { SaleBadge } from './SaleBadge';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={product.image} style={styles.image} resizeMode="contain" />
        <SaleBadge status={product.saleStatus} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.price}>{product.priceTott.toLocaleString()} TOTT</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: 'rgba(246, 239, 230, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 140,
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
    fontSize: 12,
    color: colors.mist,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.paper,
    marginTop: 8,
    marginHorizontal: 8,
    lineHeight: 18,
  },
  price: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gold,
    marginTop: 4,
    marginHorizontal: 8,
    marginBottom: 12,
  },
});
