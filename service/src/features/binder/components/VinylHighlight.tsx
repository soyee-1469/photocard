import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { binderTheme } from '../theme/binderTheme';

export function VinylHighlight() {
  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[binderTheme.vinyl.highlight, 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  gradient: {
    flex: 1,
    opacity: 0.6,
  },
});
