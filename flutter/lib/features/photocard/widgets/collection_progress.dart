import 'package:flutter/material.dart';

import '../photocard_theme.dart';

class CollectionProgress extends StatelessWidget {
  const CollectionProgress({
    super.key,
    required this.owned,
    required this.total,
  });

  final int owned;
  final int total;

  @override
  Widget build(BuildContext context) {
    final value = total == 0 ? 0.0 : owned / total;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              'COLLECTION',
              style: TextStyle(
                color: PhotocardTheme.muted,
                fontSize: 11,
                letterSpacing: 1.8,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            Text(
              '$owned / $total',
              style: const TextStyle(
                color: PhotocardTheme.text,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ClipRRect(
          borderRadius: BorderRadius.circular(99),
          child: LinearProgressIndicator(
            value: value,
            minHeight: 4,
            backgroundColor: PhotocardTheme.surfaceHigh,
            color: PhotocardTheme.gold,
          ),
        ),
      ],
    );
  }
}
