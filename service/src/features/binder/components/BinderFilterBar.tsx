import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { type BinderFilter } from '../model/types';
import { type RarityId } from '../../../services/api/types';
import { artists } from '../../../data/artists';
import { rarities, colors } from '../../../theme/tokens';

interface BinderFilterBarProps {
  filter: BinderFilter;
  availableArtists: string[];
  availableRarities: string[];
  onFilterChange: (filter: BinderFilter) => void;
  onResetFilter?: () => void;
}

export function BinderFilterBar({
  filter,
  availableArtists,
  availableRarities,
  onFilterChange,
  onResetFilter,
}: BinderFilterBarProps) {
  const handleArtistChange = (artistId: string | null) => {
    onFilterChange({ ...filter, artistId });
  };

  const handleRarityChange = (rarity: RarityId | null) => {
    onFilterChange({ ...filter, rarity });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <TouchableOpacity
          style={[styles.chip, filter.artistId === null && styles.chipActive]}
          onPress={() => handleArtistChange(null)}
        >
          <Text style={[styles.chipText, filter.artistId === null && styles.chipTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        {artists
          .filter((a) => availableArtists.includes(a.id))
          .map((artist) => (
            <TouchableOpacity
              key={artist.id}
              style={[styles.chip, filter.artistId === artist.id && styles.chipActive]}
              onPress={() => handleArtistChange(artist.id)}
            >
              <Text style={[styles.chipText, filter.artistId === artist.id && styles.chipTextActive]}>
                {artist.name}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <TouchableOpacity
          style={[styles.chip, filter.rarity === null && styles.chipActive]}
          onPress={() => handleRarityChange(null)}
        >
          <Text style={[styles.chipText, filter.rarity === null && styles.chipTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        {(Object.keys(rarities) as RarityId[])
          .filter((r) => availableRarities.includes(r))
          .map((rarity) => (
            <TouchableOpacity
              key={rarity}
              style={[styles.chip, filter.rarity === rarity && styles.chipActive]}
              onPress={() => handleRarityChange(rarity)}
            >
              <Text style={[styles.chipText, filter.rarity === rarity && styles.chipTextActive]}>
                {rarities[rarity].badge}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 8,
  },
  row: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(246, 239, 230, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mist,
  },
  chipTextActive: {
    color: colors.ink,
  },
});
