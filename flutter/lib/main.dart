import 'package:flutter/material.dart';

import 'features/photocard/photocard_scope.dart';
import 'features/photocard/photocard_theme.dart';
import 'features/photocard/screens/photocard_home_screen.dart';
import 'features/photocard/state/photocard_store.dart';

/// 토마톡 서비스 탭 → 포토카드 진입점.
///
/// ```dart
/// Navigator.of(context).push(
///   MaterialPageRoute(
///     builder: (_) => Theme(
///       data: PhotocardTheme.data(),
///       child: PhotocardScope(
///         store: PhotocardStore(),
///         child: const PhotocardHomeScreen(),
///       ),
///     ),
///   ),
/// );
/// ```
class PhotocardServiceApp extends StatelessWidget {
  PhotocardServiceApp({super.key, PhotocardStore? store}) : _store = store ?? PhotocardStore();

  final PhotocardStore _store;

  @override
  Widget build(BuildContext context) {
    return PhotocardScope(
      store: _store,
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: PhotocardTheme.data(),
        home: const PhotocardHomeScreen(),
      ),
    );
  }
}

void main() {
  runApp(PhotocardServiceApp());
}
