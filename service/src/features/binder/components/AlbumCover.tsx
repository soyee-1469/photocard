import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { binderTheme } from '../theme/binderTheme';
import { colors } from '../../../theme/tokens';

const cardBack = require('../../../../assets/fx/card_back.png');

export function AlbumCover() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={binderTheme.cover.background}
        style={styles.cover}
      >
        <View style={styles.border} />
        <Text style={styles.title}>내 앨범</Text>
        <View style={styles.emblem}>
          <View style={styles.emblemBg}>
            <Image source={cardBack} style={styles.emblemImage} resizeMode="contain" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 360,
    alignSelf: 'center',
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: binderTheme.cover.border,
    borderRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 32,
  },
  emblem: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemBg: {
    width: 80,
    height: 80,
    backgroundColor: binderTheme.cover.emblemBg,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 160, 106, 0.3)',
  },
  emblemImage: {
    width: 50,
    height: 50,
    opacity: 0.6,
  },
});
