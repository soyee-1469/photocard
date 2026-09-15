import 'package:flutter/material.dart';

import '../photocard_scope.dart';
import '../photocard_theme.dart';
import '../widgets/cta_buttons.dart';
import '../widgets/placeholder_card_art.dart';
import '../widgets/rarity_badge.dart';
import 'photocard_album_screen.dart';

class PhotocardResultScreen extends StatelessWidget {
  const PhotocardResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = PhotocardScope.of(context);
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final card = store.lastRevealed;
        if (card == null) {
          return Scaffold(
            backgroundColor: PhotocardTheme.bg,
            appBar: AppBar(),
            body: const Center(
              child: Text('공개된 카드가 없습니다.', style: TextStyle(color: PhotocardTheme.muted)),
            ),
          );
        }

        final duplicate = card.ownedCount > 1 && !card.isNew;
        return Scaffold(
          backgroundColor: PhotocardTheme.bg,
          appBar: AppBar(title: const Text('RESULT')),
          body: Padding(
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
            child: Column(
              children: [
                RarityBadge(rarity: card.rarity),
                const SizedBox(height: 18),
                Expanded(
                  child: Center(
                    child: AspectRatio(
                      aspectRatio: 55 / 85,
                      child: PlaceholderCardArt(card: card),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  card.artistName.toUpperCase(),
                  style: const TextStyle(
                    color: PhotocardTheme.text,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'SPECIAL COLLECTION',
                  style: TextStyle(color: PhotocardTheme.muted, fontSize: 12, letterSpacing: 1.4),
                ),
                const SizedBox(height: 6),
                Text(
                  'CARD NO. ${card.cardNumber.toString().padLeft(2, '0')}',
                  style: const TextStyle(color: PhotocardTheme.muted, fontSize: 12, letterSpacing: 1.4),
                ),
                const SizedBox(height: 14),
                Text(
                  duplicate ? 'DUPLICATE  보유 ${card.ownedCount}장' : 'NEW CARD',
                  style: TextStyle(
                    color: duplicate ? PhotocardTheme.muted : PhotocardTheme.gold,
                    fontSize: 13,
                    letterSpacing: 1.6,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 24),
                PrimaryCta(
                  label: '앨범에서 보기',
                  onTap: () {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute<void>(
                        builder: (_) => const PhotocardAlbumScreen(),
                      ),
                      (route) => route.isFirst,
                    );
                  },
                ),
                const SizedBox(height: 10),
                GhostCta(
                  label: '한 번 더 뽑기',
                  onTap: () {
                    store.requestPurchaseSheet();
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
