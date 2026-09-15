import '../models/photo_card.dart';
import '../models/photo_card_pack.dart';
import '../models/purchase_record.dart';

const specialCollection = 'SPECIAL COLLECTION 2026';

const featuredPack = PhotoCardPack(
  id: 'pack-special-2026',
  name: 'SPECIAL PHOTOCARD PACK',
  collectionName: '2026 SPECIAL COLLECTION',
  price: 10000,
  totalCardCount: 30,
  imageUrl: 'placeholder://pack',
  isOnSale: true,
);

PhotoCard _card({
  required int number,
  required String artist,
  required String name,
  required CardRarity rarity,
  int owned = 0,
  bool isNew = false,
  DateTime? acquiredAt,
}) {
  final unlocked = owned > 0;
  return PhotoCard(
    id: 'card-${number.toString().padLeft(2, '0')}',
    artistName: artist,
    cardName: name,
    collectionName: specialCollection,
    cardNumber: number,
    rarity: rarity,
    imageUrl: 'placeholder://card/$number',
    backImageUrl: 'placeholder://back',
    ownedCount: owned,
    isNew: isNew && unlocked,
    isUnlocked: unlocked,
    acquiredAt: acquiredAt,
  );
}

List<PhotoCard> buildDummyCollection() {
  const members = [
    'Aera',
    'Noa',
    'Rin',
    'Yseul',
    'Haeun',
    'Sol',
    'Mika',
    'Lia',
    'Jun',
    'Sia',
  ];
  const poses = ['Close-up', 'Stage Light', 'Film Cut'];
  const rarities = [
    CardRarity.common,
    CardRarity.rare,
    CardRarity.common,
    CardRarity.common,
    CardRarity.rare,
    CardRarity.special,
    CardRarity.common,
    CardRarity.rare,
    CardRarity.common,
    CardRarity.common,
    CardRarity.rare,
    CardRarity.special,
    CardRarity.common,
    CardRarity.common,
    CardRarity.rare,
    CardRarity.common,
    CardRarity.common,
    CardRarity.special,
    CardRarity.rare,
    CardRarity.common,
    CardRarity.common,
    CardRarity.rare,
    CardRarity.common,
    CardRarity.common,
    CardRarity.special,
    CardRarity.rare,
    CardRarity.common,
    CardRarity.common,
    CardRarity.rare,
    CardRarity.common,
  ];

  // 12 unlocked: 1,2,4,7,8,11,12,15,18,21,24,27
  const owned = <int, int>{
    1: 1,
    2: 1,
    4: 1,
    7: 2,
    8: 1,
    11: 1,
    12: 2,
    15: 1,
    18: 1,
    21: 1,
    24: 1,
    27: 1,
  };
  const newest = {7, 21};

  DateTime acquired(int number) {
    final base = DateTime(2026, 9, 15);
    return base.subtract(Duration(days: (30 - number).clamp(0, 20)));
  }

  return List.generate(30, (i) {
    final number = i + 1;
    final count = owned[number] ?? 0;
    return _card(
      number: number,
      artist: members[i % members.length],
      name: poses[i % poses.length],
      rarity: rarities[i],
      owned: count,
      isNew: newest.contains(number),
      acquiredAt: count > 0 ? acquired(number) : null,
    );
  });
}

List<PurchaseRecord> buildDummyHistory() {
  return [
    PurchaseRecord(
      id: 'buy-1',
      purchasedAt: DateTime(2026, 9, 15),
      packName: featuredPack.name,
      price: featuredPack.price,
      cardNumber: 7,
    ),
    PurchaseRecord(
      id: 'buy-2',
      purchasedAt: DateTime(2026, 9, 14),
      packName: featuredPack.name,
      price: featuredPack.price,
      cardNumber: 12,
    ),
  ];
}
