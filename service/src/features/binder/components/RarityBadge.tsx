import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rarities } from '../../../theme/tokens';
import { binderTheme } from '../theme/binderTheme';

interface RarityBadgeProps {
  rarity: keyof typeof rarities;
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{rarities[rarity].badge}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
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
