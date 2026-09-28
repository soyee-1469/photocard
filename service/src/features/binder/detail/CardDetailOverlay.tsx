import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, ScrollView } from 'react-native';
import { type BinderPocket } from '../model/types';
import { colors } from '../../../theme/tokens';
import { FlipCard } from './FlipCard';
import { CardMeta } from './CardMeta';

interface CardDetailOverlayProps {
  pocket: BinderPocket | null;
  onClose: () => void;
}

export function CardDetailOverlay({ pocket, onClose }: CardDetailOverlayProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!pocket) {
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardContainer}>
              <FlipCard pocket={pocket} width={260} />
            </View>

            <CardMeta pocket={pocket} />

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 360,
    maxHeight: '90%',
    backgroundColor: '#1C1410',
    borderRadius: 12,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: 24,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(201, 160, 106, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gold,
  },
});
