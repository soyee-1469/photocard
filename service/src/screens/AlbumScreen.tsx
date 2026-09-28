import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/tokens';

export function AlbumScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>내 앨범 화면은 PR-C에서 구현됩니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C0908',
    paddingHorizontal: 32,
  },
  text: {
    fontSize: 15,
    color: colors.mist,
    textAlign: 'center',
    lineHeight: 22,
  },
});
