import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

export function TestModeBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>테스트용 더미 데이터 / 실제 결제 없음</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.gold,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: 0.5,
  },
});
