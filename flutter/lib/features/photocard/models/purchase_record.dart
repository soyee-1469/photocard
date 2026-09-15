class PurchaseRecord {
  const PurchaseRecord({
    required this.id,
    required this.purchasedAt,
    required this.packName,
    required this.price,
    this.cardNumber,
  });

  final String id;
  final DateTime purchasedAt;
  final String packName;
  final int price;
  final int? cardNumber;
}
