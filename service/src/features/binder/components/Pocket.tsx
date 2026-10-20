import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { type BinderPocket } from '../model/types';
import { binderTheme } from '../theme/binderTheme';
import { frames } from '../../../theme/tokens';
import { RarityBadge } from './RarityBadge';
import { CountBadge } from './CountBadge';
import { SupplyTag } from './SupplyTag';
import { VinylHighlight } from './VinylHighlight';

interface PocketProps {
  pocket: BinderPocket | null;
  onPress?: (pocket: BinderPocket) => void;
}

export function Pocket({ pocket, onPress }: PocketProps) {
  if (!pocket) {
    return (
      <View style={styles.emptyPocket} testID="pocket-empty">
        <View style={styles.pocketOverlay} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.pocket}
      onPress={() => onPress?.(pocket)}
      activeOpacity={0.7}
    >
      <View style={styles.pocketOverlay}>
        <View style={[styles.cardThumb, { borderColor: frames[pocket.cardDef.frameId].border }]}>
          <Image
            source={pocket.cardDef.front}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
        <VinylHighlight />
        <RarityBadge rarity={pocket.rarity} />
        <CountBadge count={pocket.count} />
        {pocket.supplyStatus === 'discontinued' && <SupplyTag />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pocket: {
    width: 126,
    height: 190,
    marginHorizontal: 6,
  },
  emptyPocket: {
    width: 126,
    height: 190,
    marginHorizontal: 6,
  },
  pocketOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: binderTheme.pocket.overlay,
    borderWidth: 1,
    borderColor: binderTheme.pocket.border,
    borderRadius: 4,
    borderTopWidth: 2,
    borderTopColor: binderTheme.pocket.innerTop,
    padding: 6,
    position: 'relative',
  },
  cardThumb: {
    width: 114,
    height: 176,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
});
