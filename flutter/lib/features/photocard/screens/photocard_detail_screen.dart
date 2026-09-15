import 'package:flutter/material.dart';

import '../photocard_scope.dart';
import '../photocard_theme.dart';
import '../widgets/cta_buttons.dart';
import '../widgets/placeholder_card_art.dart';
import '../widgets/rarity_badge.dart';

class PhotocardDetailScreen extends StatefulWidget {
  const PhotocardDetailScreen({super.key, required this.cardId});

  final String cardId;

  @override
  State<PhotocardDetailScreen> createState() => _PhotocardDetailScreenState();
}

class _PhotocardDetailScreenState extends State<PhotocardDetailScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _flip;
  bool _showBack = false;

  @override
  void initState() {
    super.initState();
    _flip = AnimationController(vsync: this, duration: const Duration(milliseconds: 420));
  }

  @override
  void dispose() {
    _flip.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    await _flip.forward();
    setState(() => _showBack = !_showBack);
    await _flip.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final store = PhotocardScope.of(context);
    final card = store.cardById(widget.cardId);
    final acquired = card.acquiredAt;
    final date = acquired == null
        ? '-'
        : '${acquired.year}.${acquired.month.toString().padLeft(2, '0')}.${acquired.day.toString().padLeft(2, '0')}';

    return Scaffold(
      backgroundColor: PhotocardTheme.bg,
      appBar: AppBar(title: const Text('PHOTO CARD')),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: GestureDetector(
                  onTap: _toggle,
                  child: AnimatedBuilder(
                    animation: _flip,
                    builder: (context, child) {
                      final squash = 1 - _flip.value;
                      return Transform(
                        alignment: Alignment.center,
                        transform: Matrix4.identity()..setEntry(3, 2, 0.001)..scale(squash.clamp(0.08, 1.0), 1.0),
                        child: AspectRatio(
                          aspectRatio: 55 / 85,
                          child: PlaceholderCardArt(card: card, showBack: _showBack),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '카드를 눌러 앞/뒤를 확인할 수 있어요',
              style: TextStyle(color: PhotocardTheme.muted, fontSize: 12),
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
            const SizedBox(height: 8),
            RarityBadge(rarity: card.rarity),
            const SizedBox(height: 8),
            Text(
              card.collectionName,
              style: const TextStyle(color: PhotocardTheme.muted, fontSize: 12, letterSpacing: 1.2),
            ),
            const SizedBox(height: 6),
            Text(
              'CARD NO. ${card.cardNumber.toString().padLeft(2, '0')} / ${store.totalCount}',
              style: const TextStyle(color: PhotocardTheme.muted, fontSize: 12, letterSpacing: 1.2),
            ),
            const SizedBox(height: 16),
            _meta('획득일', date),
            _meta('보유 수량', '${card.ownedCount}'),
            const SizedBox(height: 22),
            GhostCta(
              label: '앨범으로 돌아가기',
              onTap: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _meta(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text(label, style: const TextStyle(color: PhotocardTheme.muted, fontSize: 13)),
          const Spacer(),
          Text(value, style: const TextStyle(color: PhotocardTheme.text, fontSize: 13)),
        ],
      ),
    );
  }
}
