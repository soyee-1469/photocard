import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { CARD_RATIO, frames, type FrameId } from '../theme';

type PhotoCardProps = {
  imageUri: string | null;
  frameId: FrameId;
  caption: string;
  width: number;
  interactive?: boolean;
};

export function PhotoCard({
  imageUri,
  frameId,
  caption,
  width,
  interactive = true,
}: PhotoCardProps) {
  const height = width / CARD_RATIO;
  const frame = frames[frameId];
  const darkFrame = frameId === 'noir';

  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const photoScale = useRef(new Animated.Value(1)).current;
  const shine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shine, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shine]);

  useEffect(() => {
    photoScale.setValue(0.86);
    Animated.spring(photoScale, {
      toValue: 1,
      friction: 7,
      tension: 86,
      useNativeDriver: true,
    }).start();
  }, [imageUri, photoScale]);

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

  const shineX = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <Animated.View
      {...pan.panHandlers}
      style={[
        styles.card,
        {
          width,
          height,
          backgroundColor: frame.border,
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
      <View style={[styles.photoWell, darkFrame && styles.photoWellDark]}>
        {imageUri ? (
          <Animated.View style={[styles.fill, { transform: [{ scale: photoScale }] }]}>
            {imageUri === 'sample://gradient' ? (
              <LinearGradient
                colors={['#7A5C4A', '#C9A06A', '#3A2A22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.photo}
              />
            ) : (
              <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
            )}
          </Animated.View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderMark}>◇</Text>
            <Text style={styles.placeholderText}>드래그하면 기울어지고{'\n'}사진을 넣으면 카드가 살아나요</Text>
          </View>
        )}
        <Animated.View
          style={[
            styles.shine,
            {
              pointerEvents: 'none',
              transform: [{ translateX: shineX }, { rotate: '18deg' }],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.28)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
      <View style={styles.captionBar}>
        <Text numberOfLines={1} style={[styles.caption, { color: frame.caption }]}>
          {caption.trim() || 'PHOTOCARD'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 10,
    paddingBottom: 8,
    boxShadow: '0 18px 32px rgba(28, 20, 16, 0.38)',
    elevation: 12,
  },
  photoWell: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 6,
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
  shine: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 90,
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
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 11,
    letterSpacing: 2.4,
    fontWeight: '600',
  },
});
