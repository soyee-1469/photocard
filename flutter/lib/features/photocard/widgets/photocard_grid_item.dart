import 'package:flutter/material.dart';

import '../models/photo_card.dart';
import '../photocard_theme.dart';
import 'placeholder_card_art.dart';
import 'rarity_badge.dart';

class PhotocardGridItem extends StatelessWidget {
  const PhotocardGridItem({
    super.key,
    required this.card,
    required this.onTap,
    this.highlighted = false,
  });

  final PhotoCard card;
  final VoidCallback onTap;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 240),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: highlighted ? PhotocardTheme.gold : Colors.transparent,
            width: 1.2,
          ),
        ),
        padding: const EdgeInsets.all(2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: PlaceholderCardArt(card: card, locked: !card.isUnlocked),
                  ),
                  if (card.isUnlocked && card.isNew)
                    const Positioned(
                      top: 8,
                      left: 8,
                      child: Text(
                        'NEW',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              card.isUnlocked ? card.artistName.toUpperCase() : 'LOCKED',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: card.isUnlocked ? PhotocardTheme.text : PhotocardTheme.muted,
                fontSize: 10,
                letterSpacing: 0.8,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 2),
            if (card.isUnlocked)
              RarityBadge(rarity: card.rarity, compact: true)
            else
              const Text(
                '???',
                style: TextStyle(color: PhotocardTheme.muted, fontSize: 10),
              ),
          ],
        ),
      ),
    );
  }
}
