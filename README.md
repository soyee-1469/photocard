# 포토카드

디자이너 확인용 움직임 프리뷰입니다. 저장/로그인은 없고, 기울기·등장·프레임 전환만 보면 됩니다.

## 움직임 보기

```bash
npm install
npm start
```

### 애니메이션 시퀀스 (개선됨 ✨)

1. **화려한 스파클 효과** - 봉투를 뽑을 때 스파클 파티클이 터져나옵니다
2. **봉투 찢기** - 팩 윗면이 찢어집니다
3. **샤라락 슬라이드** - 카드가 미세한 펄럭임(rotate + shift)과 함께 올라옵니다
4. **Y축 원근법 플립** - 3D 회전으로 카드가 한 바퀴 돕니다 (기존 평면 플립 개선)
5. **앞면 공개** - 랜덤 포토카드가 드러납니다

희귀도에 따라 주변 빛 색이 바뀝니다 (일반/레어/에픽/레전드)

### 최근 업데이트 (2026-09-22)

- ✅ `rotateY` 원근법 플립 (기존 `scaleX` 대체 → 더 자연스러운 3D)
- ✅ 카드 슬라이드 시 "샤라락" 펄럭임 효과 추가
- ✅ `SparkField`를 봉투 오픈 타임라인에 통합

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
