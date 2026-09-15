enum CardRarity { common, rare, special }

class PhotoCard {
  PhotoCard({
    required this.id,
    required this.artistName,
    required this.cardName,
    required this.collectionName,
    required this.cardNumber,
    required this.rarity,
    required this.imageUrl,
    required this.backImageUrl,
    required this.ownedCount,
    required this.isNew,
    required this.isUnlocked,
    this.acquiredAt,
  });

  final String id;
  final String artistName;
  final String cardName;
  final String collectionName;
  final int cardNumber;
  final CardRarity rarity;
  final String imageUrl;
  final String backImageUrl;
  int ownedCount;
  bool isNew;
  bool isUnlocked;
  DateTime? acquiredAt;

  String get rarityLabel => switch (rarity) {
        CardRarity.common => 'COMMON',
        CardRarity.rare => 'RARE',
        CardRarity.special => 'SPECIAL',
      };

  bool get isDuplicate => isUnlocked && ownedCount > 1;
}
