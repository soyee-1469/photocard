import 'package:flutter/material.dart';

import '../photocard_routes.dart';
import '../photocard_scope.dart';
import '../photocard_theme.dart';
import 'cta_buttons.dart';

Future<void> showPurchaseSheet(BuildContext context) async {
  final store = PhotocardScope.of(context);
  store.clearPurchaseError();

  await showModalBottomSheet<void>(
    context: context,
    backgroundColor: PhotocardTheme.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (sheetContext) {
      return ListenableBuilder(
        listenable: store,
        builder: (_, __) {
          final after = store.tott - store.pack.price;
          final canBuy = store.tott >= store.pack.price && !store.isPurchasing;
          return Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: PhotocardTheme.line,
                      borderRadius: BorderRadius.circular(99),
                    ),
                  ),
                ),
                const SizedBox(height: 22),
                const Text(
                  'SPECIAL PHOTOCARD PACK',
                  style: TextStyle(
                    color: PhotocardTheme.text,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  '1 RANDOM CARD',
                  style: TextStyle(color: PhotocardTheme.muted, fontSize: 13),
                ),
                const SizedBox(height: 22),
                _line('가격', '${_money(store.pack.price)} TOTT'),
                _line('현재 보유', '${_money(store.tott)} TOTT'),
                _line('구매 후', '${_money(after.clamp(0, store.tott))} TOTT'),
                if (store.purchaseError != null) ...[
                  const SizedBox(height: 14),
                  Text(
                    store.purchaseError!,
                    style: const TextStyle(color: Color(0xFFFF8A80), fontSize: 13),
                  ),
                ],
                const SizedBox(height: 24),
                PrimaryCta(
                  label: store.isPurchasing ? '구매 중…' : '구매하기',
                  enabled: canBuy,
                  onTap: () async {
                    final ok = await store.purchasePack();
                    if (!ok || !sheetContext.mounted) {
                      return;
                    }
                    Navigator.of(sheetContext).pop();
                    if (context.mounted) {
                      PhotocardNav.toOpen(context);
                    }
                  },
                ),
                const SizedBox(height: 10),
                GhostCta(
                  label: '취소',
                  onTap: () => Navigator.of(sheetContext).pop(),
                ),
              ],
            ),
          );
        },
      );
    },
  );
}

Widget _line(String label, String value) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Row(
      children: [
        Text(label, style: const TextStyle(color: PhotocardTheme.muted, fontSize: 13)),
        const Spacer(),
        Text(value, style: const TextStyle(color: PhotocardTheme.text, fontSize: 13)),
      ],
    ),
  );
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
