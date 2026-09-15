# 포토카드

디자이너 확인용 움직임 프리뷰입니다. 저장/로그인은 없고, 기울기·등장·프레임 전환만 보면 됩니다.

## 움직임 보기

```bash
npm start
```

- **포토카드 뽑기:** 봉인된 팩이 등장합니다
- **오픈하기:** 위가 찢어지고 카드가 나와 한 바퀴 돕니다
- 희귀도에 따라 주변 빛 색이 바뀝니다 (일반/레어/에픽/레전드)

## 기존 Flutter 앱에 붙이기

서비스 탭에서 포토카드 홈으로 진입:

```dart
Navigator.of(context).push(
  MaterialPageRoute(
    builder: (_) => PhotocardScope(
      store: PhotocardStore(),
      child: const PhotocardHomeScreen(),
    ),
  ),
);
```

오픈 애니메이션만 따로 열려면 기존 [`flutter/photocard_studio.dart`](flutter/photocard_studio.dart) 를 그대로 사용하면 됩니다. 애니메이션 코드는 수정하지 않았습니다.

더미 서비스 전체 플로우:

```bash
cd flutter
flutter run
```
