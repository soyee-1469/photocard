import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { type BinderPocket } from '../model/types';
import { rarities, CARD_RATIO } from '../../../theme/tokens';
import { binderTheme } from '../theme/binderTheme';

interface RecentCardsStripProps {
  pockets: BinderPocket[];
  onCardPress?: (pocket: BinderPocket) => void;
}

export function RecentCardsStrip({ pockets, onCardPress }: RecentCardsStripProps) {
  const recentPockets = [...pockets]
    .sort((a, b) => b.lastAcquiredAt.localeCompare(a.lastAcquiredAt))
    .slice(0, 4);

  if (recentPockets.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>최근 획득</Text>
      <View style={styles.row}>
        {recentPockets.map((pocket, index) => (
          <TouchableOpacity
            key={`${pocket.cardDefId}-${index}`}
            style={styles.card}
            onPress={() => onCardPress?.(pocket)}
            activeOpacity={0.7}
          >
            <Image
              source={pocket.cardDef.front}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rarities[pocket.rarity].badge}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const CARD_WIDTH = 64;
const CARD_HEIGHT = CARD_WIDTH / CARD_RATIO;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(246, 239, 230, 0.9)',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(28, 20, 16, 0.3)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    backgroundColor: binderTheme.badge.background,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: binderTheme.badge.text,
  },
});
