class PhotoCardPack {
  const PhotoCardPack({
    required this.id,
    required this.name,
    required this.collectionName,
    required this.price,
    required this.totalCardCount,
    required this.imageUrl,
    required this.isOnSale,
  });

  final String id;
  final String name;
  final String collectionName;
  final int price;
  final int totalCardCount;
  final String imageUrl;
  final bool isOnSale;
}
