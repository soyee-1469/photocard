import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { type Banner } from '../services/api/types';

interface BannerSlideProps {
  banners: Banner[];
  onPressBanner: (banner: Banner) => void;
}

export function BannerSlide({ banners, onPressBanner }: BannerSlideProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return null;
  }

  const current = banners[currentIndex];

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPressBanner(current)}>
      {typeof current.image === 'object' && 'uri' in current.image ? (
        <View style={styles.placeholder} />
      ) : (
        <Image source={current.image} style={styles.image} resizeMode="cover" />
      )}
      {banners.length > 1 && (
        <View style={styles.indicators}>
          {banners.map((_, i) => (
            <View key={i} style={[styles.indicator, i === currentIndex && styles.indicatorActive]} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 180,
    position: 'relative',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(28, 20, 16, 0.3)',
  },
  indicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    backgroundColor: '#FFF',
    width: 20,
  },
});
