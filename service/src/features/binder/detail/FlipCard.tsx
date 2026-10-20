import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Animated, Platform } from 'react-native';
import { PhotoCard } from '../../../vendor/PhotoCard';
import { type BinderPocket } from '../model/types';
import { CARD_RATIO } from '../../../theme/tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface FlipCardProps {
  pocket: BinderPocket;
  width: number;
}

export function FlipCard({ pocket, width }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;

    if (reducedMotion) {
      flipAnim.setValue(toValue);
      setIsFlipped(!isFlipped);
    } else {
      setIsFlipped(!isFlipped);
      Animated.timing(flipAnim, {
        toValue,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  };

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const height = width / CARD_RATIO;

  return (
    <TouchableOpacity
      onPress={handleFlip}
      activeOpacity={1}
      style={[styles.container, { width, height }]}
    >
      <View style={styles.perspective}>
        <Animated.View
          style={[
            styles.face,
            {
              opacity: frontOpacity,
              transform: [{ perspective: 1200 }, { rotateY: frontRotate }],
              backfaceVisibility: 'hidden',
            },
          ]}
          testID="card-face-front"
        >
          <PhotoCard
            imageSource={pocket.cardDef.front}
            frameId={pocket.cardDef.frameId}
            rarity={pocket.cardDef.rarity}
            caption={pocket.cardDef.title}
            width={width}
            interactive={false}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.face,
            styles.backFace,
            {
              opacity: backOpacity,
              transform: [{ perspective: 1200 }, { rotateY: backRotate }],
              backfaceVisibility: 'hidden',
            },
          ]}
          testID="card-face-back"
        >
          <View style={[styles.backContainer, { width, height }]}>
            <Image
              source={pocket.cardDef.back}
              style={styles.backImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  perspective: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  backFace: {
    position: 'absolute',
  },
  backContainer: {
    backgroundColor: '#1C1410',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backImage: {
    width: '100%',
    height: '100%',
  },
});
