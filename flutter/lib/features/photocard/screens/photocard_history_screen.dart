import 'package:flutter/material.dart';

import '../photocard_scope.dart';
import '../photocard_theme.dart';

class PhotocardHistoryScreen extends StatelessWidget {
  const PhotocardHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = PhotocardScope.of(context);
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final items = store.history;
        return Scaffold(
          backgroundColor: PhotocardTheme.bg,
          appBar: AppBar(title: const Text('HISTORY')),
          body: items.isEmpty
              ? const Center(
                  child: Text(
                    '아직 구매 내역이 없습니다.',
                    style: TextStyle(color: PhotocardTheme.muted),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const Divider(color: PhotocardTheme.line, height: 28),
                  itemBuilder: (context, i) {
                    final item = items[i];
                    final date =
                        '${item.purchasedAt.year}.${item.purchasedAt.month.toString().padLeft(2, '0')}.${item.purchasedAt.day.toString().padLeft(2, '0')}';
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(date, style: const TextStyle(color: PhotocardTheme.muted, fontSize: 12)),
                        const SizedBox(height: 8),
                        Text(
                          item.packName,
                          style: const TextStyle(
                            color: PhotocardTheme.text,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${_money(item.price)} TOTT',
                          style: const TextStyle(color: PhotocardTheme.muted, fontSize: 13),
                        ),
                        if (item.cardNumber != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            '획득: CARD #${item.cardNumber.toString().padLeft(2, '0')}',
                            style: const TextStyle(color: PhotocardTheme.gold, fontSize: 13),
                          ),
                        ],
                      ],
                    );
                  },
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
