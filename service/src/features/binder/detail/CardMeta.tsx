import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { type BinderPocket } from '../model/types';
import { rarities, colors } from '../../../theme/tokens';
import { artists } from '../../../data/artists';
import { albums } from '../../../data/albums';
import { SupplyTag } from '../components/SupplyTag';

interface CardMetaProps {
  pocket: BinderPocket;
}

export function CardMeta({ pocket }: CardMetaProps) {
  const artist = artists.find((a) => a.id === pocket.artistId);
  const album = albums.find((a) => a.id === pocket.albumId);
  const rarityInfo = rarities[pocket.rarity];

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.rarityRow}>
        <View style={styles.rarityBadge}>
          <Text style={styles.rarityBadgeText}>{rarityInfo.badge}</Text>
        </View>
        <Text style={styles.rarityLabel}>{rarityInfo.label}</Text>
        {pocket.supplyStatus === 'discontinued' && (
          <View style={styles.supplyTagContainer}>
            <SupplyTag />
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>아티스트</Text>
        <Text style={styles.value}>{artist?.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>앨범</Text>
        <Text style={styles.value}>{album?.title}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>카드 번호</Text>
        <Text style={styles.value}>{pocket.cardDef.title}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>획득일</Text>
        <Text style={styles.value}>
          {formatDate(pocket.firstAcquiredAt)}
          {pocket.count >= 2 && ` (최근: ${formatDate(pocket.lastAcquiredAt)})`}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>보유 수량</Text>
        <Text style={styles.value}>×{pocket.count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rarityBadge: {
    backgroundColor: 'rgba(12, 9, 8, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rarityBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gold,
  },
  rarityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gold,
  },
  supplyTagContainer: {
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mist,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.paper,
  },
});
