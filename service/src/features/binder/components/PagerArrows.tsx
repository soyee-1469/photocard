import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme/tokens';

interface PagerArrowsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PagerArrows({ currentPage, totalPages, onPageChange }: PagerArrowsProps) {
  if (totalPages === 0) {
    return null;
  }

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canPrev && styles.buttonDisabled]}
        onPress={() => canPrev && onPageChange(currentPage - 1)}
        disabled={!canPrev}
      >
        <Text style={[styles.buttonText, !canPrev && styles.buttonTextDisabled]}>‹</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, !canNext && styles.buttonDisabled]}
        onPress={() => canNext && onPageChange(currentPage + 1)}
        disabled={!canNext}
      >
        <Text style={[styles.buttonText, !canNext && styles.buttonTextDisabled]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(201, 160, 106, 0.2)',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gold,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
});
