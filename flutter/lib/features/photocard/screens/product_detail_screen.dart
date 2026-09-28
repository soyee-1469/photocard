import 'package:flutter/material.dart';

import '../data/photocard_catalog.dart';
import '../photocard_routes.dart';
import '../photocard_scope.dart';
import '../photocard_theme.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({super.key, required this.productId});

  final String productId;

  @override
  Widget build(BuildContext context) {
    final product = productById(productId);
    final artist = product == null ? null : artistById(product.artistId);
    if (product == null || artist == null) {
      return const Scaffold(body: Center(child: Text('상품을 찾을 수 없습니다')));
    }
    final store = PhotocardScope.of(context);

    return Scaffold(
      backgroundColor: PhotocardTheme.bg,
      appBar: AppBar(),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 120),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Image.asset(product.imageAsset, fit: BoxFit.cover),
          ),
          const SizedBox(height: 20),
          Text(
            artist.name,
            style: const TextStyle(color: PhotocardTheme.muted, fontSize: 12, letterSpacing: 1.2),
          ),
          const SizedBox(height: 6),
          Text(
            product.collectionName,
            style: const TextStyle(color: PhotocardTheme.text, fontSize: 22, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(product.title, style: const TextStyle(color: PhotocardTheme.text, fontSize: 16)),
          const SizedBox(height: 18),
          const Text('랜덤 포토카드 1장', style: TextStyle(color: PhotocardTheme.muted, fontSize: 14)),
          const SizedBox(height: 16),
          Text('총 카드 수  ${product.totalCardCount}종', style: const TextStyle(color: PhotocardTheme.text)),
          const SizedBox(height: 12),
          const Text('등급', style: TextStyle(color: PhotocardTheme.muted, fontSize: 12)),
          const SizedBox(height: 8),
          ...product.rarityDistribution.entries.map(
            (entry) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text('${entry.key}  ${entry.value}', style: const TextStyle(color: PhotocardTheme.text)),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '${product.priceTott} TOTT',
            style: const TextStyle(color: PhotocardTheme.gold, fontSize: 22, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          ListenableBuilder(
            listenable: store,
            builder: (context, _) => Text(
              '보유 ${store.tott} TOTT',
              style: const TextStyle(color: PhotocardTheme.muted, fontSize: 13),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
          child: ListenableBuilder(
            listenable: store,
            builder: (context, _) {
              final canBuy = store.tott >= product.priceTott;
              return FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: PhotocardTheme.gold,
                  foregroundColor: PhotocardTheme.bg,
                  minimumSize: const Size.fromHeight(52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: canBuy ? () => _confirm(context, product.priceTott) : null,
                child: Text('${product.priceTott} TOTT · 1장 뽑기'),
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _confirm(BuildContext context, int price) async {
    final store = PhotocardScope.of(context);
    final product = productById(productId)!;
    final after = store.tott - price;
    final ok = await showModalBottomSheet<bool>(
      context: context,
      backgroundColor: PhotocardTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                '랜덤 포토카드 1장을 구매하시겠어요?',
                style: TextStyle(color: PhotocardTheme.text, fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 16),
              Text(product.collectionName, style: const TextStyle(color: PhotocardTheme.text)),
              const SizedBox(height: 8),
              Text('가격  $price TOTT', style: const TextStyle(color: PhotocardTheme.gold)),
              Text('보유  ${store.tott} TOTT', style: const TextStyle(color: PhotocardTheme.muted)),
              Text('구매 후  $after TOTT', style: const TextStyle(color: PhotocardTheme.muted)),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('취소'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: PhotocardTheme.gold,
                        foregroundColor: PhotocardTheme.bg,
                      ),
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text('구매하기'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
    if (ok == true && context.mounted) {
      store.spend(price);
      PhotocardNav.toOpen(context);
    }
  }
}
