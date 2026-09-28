import 'package:flutter/material.dart';

import 'screens/artist_product_list_screen.dart';
import 'screens/photocard_album_screen.dart';
import 'screens/photocard_detail_screen.dart';
import 'screens/photocard_history_screen.dart';
import 'screens/photocard_open_screen.dart';
import 'screens/photocard_result_screen.dart';
import 'screens/product_detail_screen.dart';

class PhotocardNav {
  static Future<void> toArtist(BuildContext context, String artistId) {
    return Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ArtistProductListScreen(artistId: artistId)),
    );
  }

  static Future<void> toProduct(BuildContext context, String productId) {
    return Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ProductDetailScreen(productId: productId)),
    );
  }

  static Future<void> toOpen(BuildContext context) {
    return Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const PhotocardOpenScreen()),
    );
  }

  static Future<void> toResultReplace(BuildContext context) {
    return Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const PhotocardResultScreen()),
    );
  }

  static Future<void> toAlbum(BuildContext context) {
    return Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const PhotocardAlbumScreen()),
    );
  }

  static Future<void> toDetail(BuildContext context, String id) {
    return Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => PhotocardDetailScreen(cardId: id)),
    );
  }

  static Future<void> toHistory(BuildContext context) {
    return Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const PhotocardHistoryScreen()),
    );
  }
}
