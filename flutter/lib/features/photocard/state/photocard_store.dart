import 'dart:math' as math;

import 'package:flutter/foundation.dart';

import '../data/photocard_dummy_data.dart';
import '../models/photo_card.dart';
import '../models/photo_card_pack.dart';
import '../models/purchase_record.dart';

enum AlbumFilter { all, isNew, common, rare, special }

class PhotocardStore extends ChangeNotifier {
  PhotocardStore()
      : cards = buildDummyCollection(),
        history = buildDummyHistory(),
        pack = featuredPack,
        tott = 52000;

  final PhotoCardPack pack;
  final List<PhotoCard> cards;
  final List<PurchaseRecord> history;

  int tott;
  int unopenedPacks = 0;
  bool isPurchasing = false;
  bool isOpening = false;
  String? purchaseError;
  String? highlightedCardId;
  String? lastRevealedId;
  bool openPurchaseSheet = false;

  int get collectedCount => cards.where((c) => c.isUnlocked).length;
  int get totalCount => cards.length;

  PhotoCard? get lastRevealed {
    final id = lastRevealedId;
    if (id == null) {
      return null;
    }
    for (final card in cards) {
      if (card.id == id) {
        return card;
      }
    }
    return null;
  }

  List<PhotoCard> get recentOwned {
    final owned = cards.where((c) => c.isUnlocked).toList()
      ..sort((a, b) => (b.acquiredAt ?? DateTime(2000)).compareTo(a.acquiredAt ?? DateTime(2000)));
    return owned.take(4).toList();
  }

  List<PhotoCard> filtered(AlbumFilter filter) {
    return cards.where((card) {
      return switch (filter) {
        AlbumFilter.all => true,
        AlbumFilter.isNew => card.isNew,
        AlbumFilter.common => card.rarity == CardRarity.common,
        AlbumFilter.rare => card.rarity == CardRarity.rare,
        AlbumFilter.special => card.rarity == CardRarity.special,
      };
    }).toList();
  }

  PhotoCard cardById(String id) => cards.firstWhere((c) => c.id == id);

  Future<bool> purchasePack() async {
    purchaseError = null;
    isPurchasing = true;
    notifyListeners();
    await Future<void>.delayed(const Duration(milliseconds: 480));

    if (tott < pack.price) {
      isPurchasing = false;
      purchaseError = '잔액이 부족합니다.';
      notifyListeners();
      return false;
    }

    tott -= pack.price;
    unopenedPacks += 1;
    isPurchasing = false;
    notifyListeners();
    return true;
  }

  PhotoCard revealRandomCard() {
    final roll = math.Random().nextDouble();
    final target = roll < 0.12
        ? CardRarity.special
        : roll < 0.42
            ? CardRarity.rare
            : CardRarity.common;
    final pool = cards.where((c) => c.rarity == target).toList();
    final picked = pool[math.Random().nextInt(pool.length)];
    final now = DateTime.now();
    final wasOwned = picked.isUnlocked;

    picked.isUnlocked = true;
    picked.ownedCount += 1;
    picked.acquiredAt = now;
    picked.isNew = !wasOwned;
    lastRevealedId = picked.id;
    highlightedCardId = picked.id;
    unopenedPacks = math.max(0, unopenedPacks - 1);

    history.insert(
      0,
      PurchaseRecord(
        id: 'buy-${now.millisecondsSinceEpoch}',
        purchasedAt: now,
        packName: pack.name,
        price: pack.price,
        cardNumber: picked.cardNumber,
      ),
    );
    notifyListeners();
    return picked;
  }

  void clearNewFlag(String id) {
    final card = cardById(id);
    card.isNew = false;
    notifyListeners();
  }

  void requestPurchaseSheet() {
    openPurchaseSheet = true;
    notifyListeners();
  }

  void consumePurchaseSheet() {
    openPurchaseSheet = false;
  }

  void clearPurchaseError() {
    purchaseError = null;
    notifyListeners();
  }
}
