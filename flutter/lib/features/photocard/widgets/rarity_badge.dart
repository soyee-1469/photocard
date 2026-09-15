import 'package:flutter/material.dart';

import '../models/photo_card.dart';
import '../photocard_theme.dart';

class RarityBadge extends StatelessWidget {
  const RarityBadge({super.key, required this.rarity, this.compact = false});

  final CardRarity rarity;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final label = switch (rarity) {
      CardRarity.common => 'COMMON',
      CardRarity.rare => 'RARE',
      CardRarity.special => 'SPECIAL',
    };
    return Text(
      label,
      style: TextStyle(
        color: PhotocardTheme.rarityColor(rarity),
        fontSize: compact ? 10 : 12,
        letterSpacing: compact ? 1.6 : 2.2,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}
