import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { type SaleStatus } from '../services/api/types';
import { colors } from '../theme/tokens';

interface SaleBadgeProps {
  status: SaleStatus;
}

export function SaleBadge({ status }: SaleBadgeProps) {
  if (status === 'onSale') {
    return null;
  }

  const labels: Record<Exclude<SaleStatus, 'onSale'>, string> = {
    comingSoon: '출시 예정',
    soldOut: '품절',
    ended: '판매 종료',
  };

  const colors_map: Record<Exclude<SaleStatus, 'onSale'>, string> = {
    comingSoon: '#6EC4FF',
    soldOut: '#E2A8FF',
    ended: '#888',
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors_map[status] }]}>
      <Text style={styles.label}>{labels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
});
