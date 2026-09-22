# 포토카드 팩 오픈 애니메이션 가이드

## 개요

이 문서는 `PackCinematic` 컴포넌트의 애니메이션 타임라인과 커스터마이징 방법을 설명합니다.

## 애니메이션 타임라인

총 시간: **4,200ms** (`CINEMATIC_MS`)

```
0ms ────────────────────────────────────────────────────────────────────────────> 4,200ms
     │         │         │         │         │         │         │
     shake     TEAR      LAUNCH    PEAK      RISE      LAND      FLIP      END
     0-430ms   450ms     1,750ms   2,120ms   2,220ms   2,720ms   3,080ms
```

### 1. 초기 흔들림 (0~430ms)
- `shake`: 0° → 0.7° → -0.6° → 0.35° → 0°
- 봉투가 미세하게 흔들림

### 2. 봉투 찢기 (TEAR: 450ms)
- `closedOpacity`: 1 → 0 (완전한 봉투 사라짐)
- `tornOpacity`: 0 → 1 (찢어진 봉투 등장)
- `topOpen`: 0° → 180° (윗덮개가 뒤로 젖혀짐)
- `sparkActive`: 0 → 1 (스파클 효과 시작)
- `emberOp`: 0 → 1 (광채 효과 최대)

### 3. 카드 슬라이드 발사 (LAUNCH~PEAK: 1,750~2,120ms)
- `sleeveY`: 0 → -250 (슬리브가 위로 빠르게 상승)
- `sleeveOp`: 1 → 0.4 → 0 (슬리브 페이드아웃)
- `emberOp`: 1 → 0.15 (광채 약화)

### 4. 카드 상승 + 펄럭임 (RISE~LAND: 2,220~2,720ms) ⭐ 신규
- `cardOp`: 0 → 1 (카드 등장)
- `cardY`: 260 → 0 (카드가 아래에서 위로)
- `cardScale`: 0.92 → 1 (크기 확대)
- **`cardRotate`**: 0° → -2.5° → 1.8° → -1.2° → 0.6° → 0° (샤라락 펄럭임)
- **`cardShift`**: 0 → -6 → 4 → -2 → 1 → 0 (좌우 미세 진동)

### 5. 카드 플립 (FLIP: 3,080~3,510ms) ⭐ 개선
- **`flipRotateY`**: 180° → 540° (Y축 기준 한 바퀴 회전)
  - 시작: 180° (뒷면이 카메라를 향함)
  - 종료: 540° (앞면이 카메라를 향함, 360° 완전 회전)
- `backOp`: 1 → 0 (뒷면 페이드아웃)
- `frontOp`: 0 → 1 (앞면 페이드인)

### 6. 정지 (3,510~4,200ms)
- 모든 값 유지
- 카드 앞면 완전 공개

## 주요 개선사항

### 기존 vs 신규

| 항목 | 기존 | 신규 |
|------|------|------|
| 플립 방식 | `scaleX` (평면 압축) | `rotateY` (3D 회전) |
| 펄럭임 효과 | 없음 | `rotate` + `translateX` 진동 |
| 스파클 | 별도 컴포넌트 | 타임라인 통합 |
| 3D 깊이 | 없음 | `perspective: 1200` |
| 뒷면 처리 | opacity로만 | `backfaceVisibility: hidden` |

### `rotateY` vs `scaleX` 비교

```typescript
// 기존 (평면적)
transform: [{ scaleX: flipScaleX }]
// 1 → 0.08 → 1 (좌우로 눌려 보임)

// 신규 (입체적)
transform: [{ perspective: 1200 }, { rotateY: flipRotateY }]
// 180° → 540° (실제로 회전하는 것처럼 보임)
```

## 커스터마이징

### 타이밍 조정

`components/PackCinematic.tsx`의 상수를 변경:

```typescript
const TEAR = 450;    // 봉투 찢기 시작 (빠르게 하려면 감소)
const LAUNCH = 1750; // 카드 발사 (천천히 하려면 증가)
const PEAK = 2120;   // 슬리브 최고점
const RISE = 2220;   // 카드 등장
const LAND = 2720;   // 카드 착지
const FLIP = 3080;   // 플립 시작
```

### 펄럭임 강도 조정

```typescript
const cardRotate = clock.interpolate({
  inputRange: [0, RISE, RISE + 80, RISE + 160, LAND, LAND + 40, LAND + 80, END],
  // 각도를 크게 하면 더 흔들림
  outputRange: ['0deg', '0deg', '-2.5deg', '1.8deg', '-1.2deg', '0.6deg', '0deg', '0deg'],
  //                             ^^^^^^^^   ^^^^^^^   ^^^^^^^^   ^^^^^^
  //                             이 값들을 조정
});

const cardShift = clock.interpolate({
  inputRange: [0, RISE, RISE + 80, RISE + 160, LAND, LAND + 40, LAND + 80, END],
  // px 값을 크게 하면 더 크게 움직임
  outputRange: [0, 0, -6, 4, -2, 1, 0, 0],
  //                   ^^  ^  ^^  ^
  //                   이 값들을 조정
});
```

### 스파클 개수/색상 변경

```typescript
<SparkField active={true} color={tone.glow} count={18} />
//                                                  ^^
//                                                  개수 조정 (기본 18개)
```

색상은 `theme.ts`의 `rarities` 설정을 따릅니다:

```typescript
export const rarities = {
  common: { glow: '#B8C5D0', /* ... */ },
  rare: { glow: '#E8B872', /* ... */ },
  epic: { glow: '#D4A5E8', /* ... */ },
  legend: { glow: '#FFD89C', /* ... */ },
};
```

### 플립 회전 수 변경

```typescript
const flipRotateY = clock.interpolate({
  inputRange: [0, FLIP, FLIP + 430, END],
  outputRange: ['180deg', '180deg', '540deg', '540deg'],
  //                                 ^^^^^^^^
  //                                 더 많이 돌려면 720deg, 900deg 등
});
```

## 성능 최적화 팁

1. **useNativeDriver 제한**
   - `rotateY` 문자열 값 때문에 `useNativeDriver: false` 필수
   - 성능이 중요하면 숫자 기반 interpolation 사용 고려

2. **레이어 순서**
   - `zIndex`로 렌더링 순서 명확히 함
   - `elevation` (Android)도 함께 설정

3. **이미지 최적화**
   - `assets/fx/` 이미지들을 WebP로 변환하면 용량 감소
   - `resizeMode="contain"` 유지

4. **불필요한 리렌더 방지**
   - `Animated.Value`는 `useRef`로 감싸기
   - `useMemo`, `useCallback` 활용

## 문제 해결

### 플립이 거울상으로 보임
→ `faceFront` 스타일에 `transform: [{ rotateY: '180deg' }]` 추가 확인

### 카드가 너무 빨리/느리게 움직임
→ `CINEMATIC_MS` 값 조정 (기본 4200ms)

### 스파클이 안 보임
→ `sparkSlot` 스타일의 `zIndex: 15` 확인

### 3D 효과가 약함
→ `perspective` 값 낮추기 (1200 → 800)

## 참고 자료

- [React Native Animated API](https://reactnative.dev/docs/animated)
- [Expo 57 Docs](https://docs.expo.dev/versions/v57.0.0/)
- [CSS Transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
