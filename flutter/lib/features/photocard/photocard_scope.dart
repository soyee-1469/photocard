import 'package:flutter/material.dart';

import 'state/photocard_store.dart';

class PhotocardScope extends InheritedNotifier<PhotocardStore> {
  const PhotocardScope({
    super.key,
    required PhotocardStore store,
    required super.child,
  }) : super(notifier: store);

  static PhotocardStore of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<PhotocardScope>();
    assert(scope != null, 'PhotocardScope not found');
    return scope!.notifier!;
  }
}
