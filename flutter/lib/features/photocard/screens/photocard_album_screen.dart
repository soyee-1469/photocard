import 'package:flutter/material.dart';

import '../photocard_routes.dart';
import '../photocard_scope.dart';
import '../photocard_theme.dart';
import '../state/photocard_store.dart';
import '../widgets/photocard_grid_item.dart';

class PhotocardAlbumScreen extends StatefulWidget {
  const PhotocardAlbumScreen({super.key});

  @override
  State<PhotocardAlbumScreen> createState() => _PhotocardAlbumScreenState();
}

class _PhotocardAlbumScreenState extends State<PhotocardAlbumScreen> {
  AlbumFilter filter = AlbumFilter.all;

  @override
  Widget build(BuildContext context) {
    final store = PhotocardScope.of(context);
    return ListenableBuilder(
      listenable: store,
      builder: (context, _) {
        final items = store.filtered(filter);
        return Scaffold(
          backgroundColor: PhotocardTheme.bg,
          appBar: AppBar(
            title: const Text('MY PHOTO ALBUM'),
            actions: [
              IconButton(
                onPressed: () => PhotocardNav.toHistory(context),
                icon: const Icon(Icons.receipt_long_outlined, color: PhotocardTheme.text),
                tooltip: '구매 내역',
              ),
            ],
          ),
          body: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 4, 24, 12),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    '${store.collectedCount} / ${store.totalCount} COLLECTED',
                    style: const TextStyle(
                      color: PhotocardTheme.muted,
                      fontSize: 12,
                      letterSpacing: 1.4,
                    ),
                  ),
                ),
              ),
              SizedBox(
                height: 40,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    for (final item in AlbumFilter.values)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(_label(item)),
                          selected: filter == item,
                          onSelected: (_) => setState(() => filter = item),
                          selectedColor: PhotocardTheme.white,
                          labelStyle: TextStyle(
                            color: filter == item ? PhotocardTheme.bg : PhotocardTheme.text,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                          ),
                          backgroundColor: PhotocardTheme.surface,
                          side: BorderSide.none,
                          showCheckmark: false,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: items.isEmpty
                    ? const Center(
                        child: Text(
                          '이 필터에 해당하는 카드가 없습니다.',
                          style: TextStyle(color: PhotocardTheme.muted),
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          mainAxisSpacing: 14,
                          crossAxisSpacing: 10,
                          childAspectRatio: 0.62,
                        ),
                        itemCount: items.length,
                        itemBuilder: (context, i) {
                          final card = items[i];
                          return PhotocardGridItem(
                            card: card,
                            highlighted: card.id == store.highlightedCardId,
                            onTap: () {
                              if (!card.isUnlocked) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('아직 획득하지 않은 카드입니다.'),
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                                return;
                              }
                              PhotocardNav.toDetail(context, card.id);
                            },
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _label(AlbumFilter filter) => switch (filter) {
        AlbumFilter.all => 'ALL',
        AlbumFilter.isNew => 'NEW',
        AlbumFilter.common => 'COMMON',
        AlbumFilter.rare => 'RARE',
        AlbumFilter.special => 'SPECIAL',
      };
}
