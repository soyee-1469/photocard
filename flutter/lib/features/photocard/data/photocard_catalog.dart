import '../models/artist.dart';
import '../models/photo_card_product.dart';

const artists = <Artist>[
  Artist(id: 'a', name: 'ARTIST A', themeColor: 0xFF3A3124, collectionCount: 4),
  Artist(id: 'b', name: 'ARTIST B', themeColor: 0xFF243044, collectionCount: 2),
  Artist(id: 'c', name: 'ARTIST C', themeColor: 0xFF3A2430, collectionCount: 3),
  Artist(id: 'd', name: 'ARTIST D', themeColor: 0xFF24362C, collectionCount: 2),
];

const products = <PhotoCardProduct>[
  PhotoCardProduct(
    id: 'summer',
    artistId: 'a',
    title: 'Random Photo Card',
    collectionName: 'SUMMER COLLECTION',
    albumName: 'ALBUM 01',
    priceTott: 10,
    totalCardCount: 20,
    rarityDistribution: {'Normal': 12, 'Rare': 5, 'Epic': 2, 'Legendary': 1},
    isNew: true,
    isPopular: true,
  ),
  PhotoCardProduct(
    id: 'special',
    artistId: 'a',
    title: 'Special Edition',
    collectionName: '2026 SPECIAL',
    albumName: 'SPECIAL',
    priceTott: 20,
    totalCardCount: 12,
    rarityDistribution: {'Normal': 6, 'Rare': 3, 'Epic': 2, 'Legendary': 1},
    isNew: true,
    isPopular: false,
  ),
  PhotoCardProduct(
    id: 'album-01',
    artistId: 'b',
    title: 'Random Photo Card',
    collectionName: 'ALBUM 01',
    albumName: 'ALBUM 01',
    priceTott: 10,
    totalCardCount: 16,
    rarityDistribution: {'Normal': 10, 'Rare': 4, 'Epic': 1, 'Legendary': 1},
    isNew: true,
    isPopular: true,
  ),
  PhotoCardProduct(
    id: 'album-02',
    artistId: 'b',
    title: 'Random Photo Card',
    collectionName: 'ALBUM 02',
    albumName: 'ALBUM 02',
    priceTott: 15,
    totalCardCount: 16,
    rarityDistribution: {'Normal': 9, 'Rare': 4, 'Epic': 2, 'Legendary': 1},
    isNew: false,
    isPopular: true,
  ),
  PhotoCardProduct(
    id: 'night',
    artistId: 'c',
    title: 'Random Photo Card',
    collectionName: 'NIGHT COLLECTION',
    albumName: 'ALBUM 01',
    priceTott: 15,
    totalCardCount: 18,
    rarityDistribution: {'Normal': 11, 'Rare': 4, 'Epic': 2, 'Legendary': 1},
    isNew: false,
    isPopular: true,
  ),
  PhotoCardProduct(
    id: 'film',
    artistId: 'd',
    title: 'Random Photo Card',
    collectionName: 'FILM CUT',
    albumName: 'SPECIAL',
    priceTott: 10,
    totalCardCount: 14,
    rarityDistribution: {'Normal': 8, 'Rare': 4, 'Epic': 1, 'Legendary': 1},
    isNew: true,
    isPopular: false,
  ),
];

Artist? artistById(String id) {
  for (final artist in artists) {
    if (artist.id == id) return artist;
  }
  return null;
}

PhotoCardProduct? productById(String id) {
  for (final product in products) {
    if (product.id == id) return product;
  }
  return null;
}

List<PhotoCardProduct> productsForArtist(String artistId) {
  return products.where((product) => product.artistId == artistId).toList();
}
