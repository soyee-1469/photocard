import 'package:flutter/material.dart';

import '../data/photocard_catalog.dart';
import '../models/artist.dart';
import '../photocard_routes.dart';
import '../photocard_theme.dart';
import '../widgets/product_card.dart';

class ArtistProductListScreen extends StatefulWidget {
  const ArtistProductListScreen({super.key, required this.artistId});

  final String artistId;

  @override
  State<ArtistProductListScreen> createState() => _ArtistProductListScreenState();
}

class _ArtistProductListScreenState extends State<ArtistProductListScreen> {
  String album = '전체';

  @override
  Widget build(BuildContext context) {
    final artist = artistById(widget.artistId);
    if (artist == null) {
      return const Scaffold(body: Center(child: Text('아티스트를 찾을 수 없습니다')));
    }
    final albums = _albums(artist);
    final visible = productsForArtist(artist.id).where((product) {
      return album == '전체' || product.albumName == album;
    }).toList();

    return Scaffold(
      backgroundColor: PhotocardTheme.bg,
      appBar: AppBar(
        title: Text(artist.name),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: albums.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final label = albums[index];
                final selected = label == album;
                return ChoiceChip(
                  label: Text(label),
                  selected: selected,
                  onSelected: (_) => setState(() => album = label),
                  labelStyle: TextStyle(
                    color: selected ? PhotocardTheme.bg : PhotocardTheme.text,
                    fontSize: 12,
                  ),
                  selectedColor: PhotocardTheme.gold,
                  backgroundColor: PhotocardTheme.surface,
                  side: const BorderSide(color: PhotocardTheme.line),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: visible.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.62,
            ),
            itemBuilder: (context, index) {
              final product = visible[index];
              return ProductCard(
                product: product,
                onTap: () => PhotocardNav.toProduct(context, product.id),
              );
            },
          ),
        ],
      ),
    );
  }

  List<String> _albums(Artist artist) {
    final names = productsForArtist(artist.id).map((product) => product.albumName).toSet().toList();
    return ['전체', ...names];
  }
}
