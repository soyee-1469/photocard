import 'package:flutter/material.dart';

import '../../../open/photocard_studio.dart';
import '../photocard_routes.dart';
import '../photocard_scope.dart';

/// 기존 [PhotocardStudioPage] 오픈 애니메이션을 그대로 사용한다.
class PhotocardOpenScreen extends StatelessWidget {
  const PhotocardOpenScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = PhotocardScope.of(context);
    return PhotocardStudioPage(
      startSealed: true,
      onOpened: () {
        store.revealRandomCard();
        if (context.mounted) {
          PhotocardNav.toResultReplace(context);
        }
      },
    );
  }
}
