import { useEffect, useRef } from 'react';
import { Animated, Image, PanResponder, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { CARD_RATIO, frames, rarities, type FrameId, type RarityId } from '../theme';

type PhotoCardProps = {
  imageSource?: ImageSourcePropType | null;
  imageUri?: string | null;
  frameId: FrameId;
  caption: string;
  width: number;
  interactive?: boolean;
  rarity?: RarityId;
};

export function PhotoCard({
  imageSource,
  imageUri,
  frameId,
  caption,
  width,
  interactive = true,
  rarity = 'rare',
}: PhotoCardProps) {
  const height = width / CARD_RATIO;
  const frame = frames[frameId];
  const darkFrame = frameId === 'noir';
  const rarityTone = rarities[rarity];
  const source = imageSource ?? (imageUri && imageUri !== 'sample://gradient' ? { uri: imageUri } : null);

  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const photoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    photoScale.setValue(0.92);
    Animated.spring(photoScale, {
      toValue: 1,
      friction: 7,
      tension: 86,
      useNativeDriver: true,
    }).start();
  }, [imageSource, imageUri, photoScale]);

  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => interactiveRef.current,
      onPanResponderMove: (_, g) => {
        tiltY.setValue(Math.max(-12, Math.min(12, g.dx / 8)));
        tiltX.setValue(Math.max(-10, Math.min(10, -g.dy / 10)));
      },
      onPanResponderRelease: () => {
        Animated.spring(tiltX, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
        Animated.spring(tiltY, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...pan.panHandlers}
      style={[
        styles.card,
        {
          width,
          height,
          backgroundColor: frame.border,
          boxShadow: `0 20px 40px ${rarityTone.glow}66`,
          transform: [
            { perspective: 900 },
            {
              rotateX: tiltX.interpolate({
                inputRange: [-10, 10],
                outputRange: ['-10deg', '10deg'],
              }),
            },
            {
              rotateY: tiltY.interpolate({
                inputRange: [-12, 12],
                outputRange: ['-12deg', '12deg'],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient colors={[...rarityTone.foil]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.foil} />
      <View style={[styles.photoWell, darkFrame && styles.photoWellDark]}>
        {source ? (
          <Animated.View style={[styles.fill, { transform: [{ scale: photoScale }] }]}>
            {imageUri === 'sample://gradient' ? (
              <LinearGradient
                colors={['#7A5C4A', '#C9A06A', '#3A2A22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.photo}
              />
            ) : (
              <Image source={source} style={styles.photo} resizeMode="cover" />
            )}
          </Animated.View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderMark}>◇</Text>
            <Text style={styles.placeholderText}>포토카드</Text>
          </View>
        )}
      </View>
      {caption.trim() ? (
        <View style={styles.captionBar}>
          <Text numberOfLines={1} style={[styles.caption, { color: frame.caption }]}>
            {caption.trim()}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 8,
    paddingBottom: 6,
    overflow: 'hidden',
  },
  foil: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.9,
  },
  photoWell: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#E7D9C8',
  },
  photoWellDark: {
    backgroundColor: '#2A221C',
  },
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  placeholderMark: {
    fontSize: 22,
    color: 'rgba(58, 42, 34, 0.35)',
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(58, 42, 34, 0.55)',
  },
  captionBar: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 11,
    letterSpacing: 2.4,
    fontWeight: '600',
  },
});
