import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { binderTheme } from '../theme/binderTheme';

export function BinderRings() {
  return (
    <View style={styles.rings}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.ringContainer}>
          <LinearGradient
            colors={binderTheme.ring.gradient}
            style={styles.ring}
          />
          <View style={styles.hole} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rings: {
    width: 24,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  ringContainer: {
    width: 20,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ring: {
    width: 20,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(28, 20, 16, 0.15)',
  },
  hole: {
    position: 'absolute',
    width: 8,
    height: 16,
    backgroundColor: binderTheme.paper.background,
    borderRadius: 4,
  },
});
