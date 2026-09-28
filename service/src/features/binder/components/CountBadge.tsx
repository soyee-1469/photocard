import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { binderTheme } from '../theme/binderTheme';

interface CountBadgeProps {
  count: number;
}

export function CountBadge({ count }: CountBadgeProps) {
  if (count < 2) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>×{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: binderTheme.badge.background,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(246, 239, 230, 0.95)',
  },
});
