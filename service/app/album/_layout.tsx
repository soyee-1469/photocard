import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/tokens';

export default function AlbumLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.ink,
        },
        headerTintColor: colors.paper,
        headerTitle: '내 앨범',
      }}
    />
  );
}
