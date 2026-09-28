import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { PhotoCard } from '../../../vendor/PhotoCard';
import { type BinderPocket } from '../model/types';
import { CARD_RATIO } from '../../../theme/tokens';

interface FlipCardProps {
  pocket: BinderPocket;
  width: number;
}

export function FlipCard({ pocket, width }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const height = width / CARD_RATIO;

  return (
    <TouchableOpacity
      onPress={handleFlip}
      activeOpacity={1}
      style={[styles.container, { width, height }]}
    >
      {!isFlipped ? (
        <View style={styles.face} testID="card-face-front">
          <PhotoCard
            imageSource={pocket.cardDef.front}
            frameId={pocket.cardDef.frameId}
            rarity={pocket.cardDef.rarity}
            caption={pocket.cardDef.title}
            width={width}
            interactive={false}
          />
        </View>
      ) : (
        <View style={styles.face} testID="card-face-back">
          <View style={[styles.backContainer, { width, height }]}>
            <Image
              source={pocket.cardDef.back}
              style={styles.backImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  face: {
    width: '100%',
    height: '100%',
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
