import 'package:flutter/material.dart';

import '../data/photocard_catalog.dart';
import '../models/photo_card_product.dart';
import '../photocard_routes.dart';
import '../photocard_scope.dart';
import '../photocard_theme.dart';
import '../widgets/product_card.dart';

class PhotocardHomeScreen extends StatelessWidget {
  const PhotocardHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = PhotocardScope.of(context);
    final fresh = products.where((product) => product.isNew).toList();
    final popular = products.where((product) => product.isPopular).toList();

    return Scaffold(
      backgroundColor: PhotocardTheme.bg,
      appBar: AppBar(
        title: const Text('포토카드'),
        actions: [
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('검색은 다음 단계에서 연결됩니다')),
              );
            },
            icon: const Icon(Icons.search, color: PhotocardTheme.text),
          ),
          IconButton(
            onPressed: () => PhotocardNav.toAlbum(context),
            icon: const Icon(Icons.grid_view_rounded, color: PhotocardTheme.text),
            tooltip: '마이 앨범',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Stack(
              alignment: Alignment.bottomLeft,
              children: [
                Image.asset('assets/catalog/pack.png', height: 220, width: double.infinity, fit: BoxFit.cover),
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('NEW COLLECTION', style: TextStyle(color: PhotocardTheme.gold, fontSize: 11, letterSpacing: 1.4)),
                      SizedBox(height: 4),
                      Text('2026 SPECIAL PHOTO CARD', style: TextStyle(color: PhotocardTheme.text, fontSize: 18, fontWeight: FontWeight.w700)),
                      SizedBox(height: 2),
                      Text('기간 한정 컬렉션', style: TextStyle(color: PhotocardTheme.text, fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          const _SectionTitle('아티스트'),
          const SizedBox(height: 12),
          SizedBox(
            height: 108,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: artists.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final artist = artists[index];
                return Material(
                  color: Color(artist.themeColor),
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => PhotocardNav.toArtist(context, artist.id),
                    child: SizedBox(
                      width: 140,
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(artist.name, style: const TextStyle(color: PhotocardTheme.text, fontSize: 16, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            Text('${artist.collectionCount} Collections', style: const TextStyle(color: PhotocardTheme.muted, fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 28),
          const _SectionTitle('신규 포토카드'),
          const SizedBox(height: 12),
          _ProductGrid(items: fresh),
          const SizedBox(height: 28),
          const _SectionTitle('인기 컬렉션'),
          const SizedBox(height: 12),
          _ProductGrid(items: popular),
          const SizedBox(height: 28),
          ListenableBuilder(
            listenable: store,
            builder: (context, _) => Material(
              color: PhotocardTheme.surface,
              borderRadius: BorderRadius.circular(16),
              child: InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () => PhotocardNav.toAlbum(context),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('마이 앨범', style: TextStyle(color: PhotocardTheme.text, fontSize: 16, fontWeight: FontWeight.w700)),
                            SizedBox(height: 4),
                            Text('보유한 포토카드', style: TextStyle(color: PhotocardTheme.muted, fontSize: 12)),
                          ],
                        ),
                      ),
                      Text('보유 ${store.collectedCount}장', style: const TextStyle(color: PhotocardTheme.gold)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(label, style: const TextStyle(color: PhotocardTheme.text, fontSize: 16, fontWeight: FontWeight.w700));
  }
}

class _ProductGrid extends StatelessWidget {
  const _ProductGrid({required this.items});
  final List<PhotoCardProduct> items;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.62,
      ),
      itemBuilder: (context, index) {
        final product = items[index];
        return ProductCard(
          product: product,
          onTap: () => PhotocardNav.toProduct(context, product.id),
        );
      },
    );
  }
}
