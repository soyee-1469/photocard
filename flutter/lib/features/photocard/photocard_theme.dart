import 'package:flutter/material.dart';

import 'models/photo_card.dart';

class PhotocardTheme {
  static const bg = Color(0xFF0B0B0C);
  static const surface = Color(0xFF161618);
  static const surfaceHigh = Color(0xFF1E1E21);
  static const line = Color(0x22FFFFFF);
  static const text = Color(0xFFF5F5F7);
  static const muted = Color(0xFF8E8E93);
  static const gold = Color(0xFFC9A06A);
  static const white = Color(0xFFFFFFFF);

  static Color rarityColor(CardRarity rarity) => switch (rarity) {
        CardRarity.common => const Color(0xFFD7DCE3),
        CardRarity.rare => const Color(0xFF8EC8FF),
        CardRarity.special => const Color(0xFFE2C28A),
      };

  static ThemeData data() {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.dark(
        primary: gold,
        surface: surface,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bg,
        elevation: 0,
        centerTitle: false,
        foregroundColor: text,
        titleTextStyle: TextStyle(
          color: text,
          fontSize: 16,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.6,
        ),
      ),
      dividerColor: line,
    );
  }
}
