class PhotoCardProduct {
  const PhotoCardProduct({
    required this.id,
    required this.artistId,
    required this.title,
    required this.collectionName,
    required this.albumName,
    required this.priceTott,
    required this.totalCardCount,
    required this.rarityDistribution,
    required this.isNew,
    required this.isPopular,
    this.imageAsset = 'assets/catalog/pack.png',
  });

  final String id;
  final String artistId;
  final String title;
  final String collectionName;
  final String albumName;
  final int priceTott;
  final int totalCardCount;
  final Map<String, int> rarityDistribution;
  final bool isNew;
  final bool isPopular;
  final String imageAsset;
}
