import 'package:flutter/material.dart';

import '../photocard_routes.dart';
import '../photocard_scope.dart';
import '../photocard_theme.dart';
import '../widgets/collection_progress.dart';
import '../widgets/cta_buttons.dart';
import '../widgets/photocard_pack_card.dart';
import '../widgets/placeholder_card_art.dart';
import '../widgets/purchase_sheet.dart';

class PhotocardHomeScreen extends StatefulWidget {
  const PhotocardHomeScreen({super.key});

  @override
  State<PhotocardHomeScreen> createState() => _PhotocardHomeScreenState();
}

class _PhotocardHomeScreenState extends State<PhotocardHomeScreen> {
  @override
  Widget build(BuildContext context) {
    final store = PhotocardScope.of(context);
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        if (store.openPurchaseSheet) {
          store.consumePurchaseSheet();
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              showPurchaseSheet(context);
            }
          });
        }
        final recent = store.recentOwned;
        return Scaffold(
          backgroundColor: PhotocardTheme.bg,
          appBar: AppBar(
            title: const Text('PHOTO CARD'),
            actions: [
              IconButton(
                onPressed: () => PhotocardNav.toAlbum(context),
                icon: const Icon(Icons.grid_view_rounded, color: PhotocardTheme.text),
                tooltip: 'MY PHOTO ALBUM',
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
            children: [
              const Center(child: SizedBox(width: 220, child: PhotocardPackCard())),
              const SizedBox(height: 20),
              const Center(
                child: Text(
                  '1 RANDOM PHOTOCARD',
                  style: TextStyle(
                    color: PhotocardTheme.muted,
                    fontSize: 12,
                    letterSpacing: 1.6,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  '${_money(store.pack.price)} TOTT',
                  style: const TextStyle(
                    color: PhotocardTheme.text,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 18),
              PrimaryCta(
                label: '카드팩 구매하기',
                onTap: () => showPurchaseSheet(context),
              ),
              const SizedBox(height: 28),
              CollectionProgress(owned: store.collectedCount, total: store.totalCount),
              const SizedBox(height: 28),
              const Text(
                'RECENT',
                style: TextStyle(
                  color: PhotocardTheme.muted,
                  fontSize: 11,
                  letterSpacing: 1.8,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 148,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: 4,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (context, i) {
                    if (i >= recent.length) {
                      return SizedBox(
                        width: 96,
                        child: PlaceholderCardArt(
                          card: store.cards.first,
                          locked: true,
                        ),
                      );
                    }
                    final card = recent[i];
                    return SizedBox(
                      width: 96,
                      child: PlaceholderCardArt(card: card),
                    );
                  },
                ),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  const Text(
                    'MY PHOTO ALBUM',
                    style: TextStyle(
                      color: PhotocardTheme.text,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '보유 ${store.collectedCount}장',
                    style: const TextStyle(color: PhotocardTheme.muted, fontSize: 12),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              GhostCta(
                label: '내 포토앨범 보기',
                onTap: () => PhotocardNav.toAlbum(context),
              ),
            ],
          ),
        );
      },
    );
  }
}

String _money(int value) {
  final s = value.toString();
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    final remaining = s.length - i - 1;
    buf.write(s[i]);
    if (remaining > 0 && remaining % 3 == 0) {
      buf.write(',');
    }
  }
  return buf.toString();
}
