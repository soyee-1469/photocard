import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme/tokens';

interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
}

export function PageIndicator({ currentPage, totalPages }: PageIndicatorProps) {
  if (totalPages === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {currentPage} / {totalPages}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold,
  },
});
