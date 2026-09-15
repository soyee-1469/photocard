import 'package:flutter/material.dart';

import '../photocard_theme.dart';

class PhotocardPackCard extends StatelessWidget {
  const PhotocardPackCard({super.key});

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 0.72,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          gradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF2A2A30), Color(0xFF101012)],
          ),
          border: Border.all(color: PhotocardTheme.gold.withOpacity(0.4)),
        ),
        child: const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 28),
          child: Column(
            children: [
              Text(
                'SPECIAL PHOTOCARD',
                style: TextStyle(
                  color: PhotocardTheme.gold,
                  fontSize: 11,
                  letterSpacing: 2.4,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Spacer(),
              Text(
                '2026',
                style: TextStyle(
                  color: PhotocardTheme.text,
                  fontSize: 42,
                  fontWeight: FontWeight.w300,
                  letterSpacing: 6,
                ),
              ),
              SizedBox(height: 6),
              Text(
                'SPECIAL COLLECTION',
                style: TextStyle(
                  color: PhotocardTheme.text,
                  fontSize: 13,
                  letterSpacing: 2,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Spacer(),
              Text(
                '1 RANDOM PHOTOCARD',
                style: TextStyle(
                  color: PhotocardTheme.muted,
                  fontSize: 11,
                  letterSpacing: 1.4,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
