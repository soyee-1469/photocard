import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { binderTheme } from '../theme/binderTheme';

export function SupplyTag() {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>공급 종료</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: binderTheme.supplyTag.background,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '700',
    color: binderTheme.supplyTag.text,
  },
});
