import 'package:flutter/material.dart';

import '../models/photo_card.dart';
import '../photocard_theme.dart';

class PlaceholderCardArt extends StatelessWidget {
  const PlaceholderCardArt({
    super.key,
    required this.card,
    this.showBack = false,
    this.locked = false,
  });

  final PhotoCard card;
  final bool showBack;
  final bool locked;

  @override
  Widget build(BuildContext context) {
    final palette = _palette(card.cardNumber);
    if (locked) {
      return DecoratedBox(
        decoration: BoxDecoration(
          color: const Color(0xFF121214),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: PhotocardTheme.line),
        ),
        child: const Center(
          child: Text(
            '?',
            style: TextStyle(
              color: Color(0x44FFFFFF),
              fontSize: 28,
              fontWeight: FontWeight.w300,
            ),
          ),
        ),
      );
    }

    if (showBack) {
      return DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1A1A1D), Color(0xFF0E0E10)],
          ),
          border: Border.all(color: PhotocardTheme.gold.withOpacity(0.35)),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'PC',
                style: TextStyle(
                  color: PhotocardTheme.gold.withOpacity(0.85),
                  fontSize: 18,
                  letterSpacing: 4,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'NO. ${card.cardNumber.toString().padLeft(2, '0')}',
                style: const TextStyle(
                  color: PhotocardTheme.muted,
                  fontSize: 10,
                  letterSpacing: 1.6,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: palette,
        ),
      ),
      child: Stack(
        children: [
          Align(
            alignment: Alignment.bottomLeft,
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Text(
                card.artistName.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  letterSpacing: 1.4,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  static List<Color> _palette(int number) {
    const sets = [
      [Color(0xFF2C2C34), Color(0xFF8A7A68)],
      [Color(0xFF1C2433), Color(0xFF6E8BA8)],
      [Color(0xFF2A1F2C), Color(0xFFB089A0)],
      [Color(0xFF1E2420), Color(0xFF7F8F78)],
      [Color(0xFF2B2218), Color(0xFFC9A06A)],
    ];
    return sets[number % sets.length];
  }
}
