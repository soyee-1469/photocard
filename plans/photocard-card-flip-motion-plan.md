# 포토카드 "탭하면 뒤집히고 움직이는 카드" 구현 계획 (service/ 전용)

- 작성: 2026-10-06 (KST) · 조사 기준: PR #7 `3e81860`, PR #10 `2a9d014` (pr-10 배포본과 동일), PR #2 `75556f6`
- 근거 스크린샷: `/workspace/pc-audit/shots/`
- 변경 가능한 범위: `service/`만. 루트 Expo 앱, `flutter/`, `motion/`은 건드리지 않음. **새 이미지는 만들지 않음.**

## 0. 현재 상태 요약 (조사 결과)

| 화면 | 탭 핸들러 | 플립 | 모션 |
|---|---|---|---|
| 홈 추천/신규/인기 (팩 상품 카드) `ProductCard.tsx:19` | O (상품 상세로 이동) | X | X (기본 투명도 피드백만) |
| 홈 "내 카드 미리보기" `HomeScreen.tsx:128-136` | X | X | X |
| 상품 목록 `ProductListScreen.tsx:177` | O (상세로 이동) | X | X |
| 상품 상세 구성 카드 `ProductDetailScreen.tsx:76-85` | X | X | X |
| (PR #7) 내 앨범 `AlbumScreen.tsx:139-155` | X | X | X (PR #10에서는 라우트가 바인더로 바뀌어 사용하지 않음) |
| (PR #10) 앨범 홈 최근 4장 `RecentCardsStrip.tsx:26-40` | O (바인더+상세 딥링크) | X | X |
| (PR #10) 바인더 포켓 `Pocket.tsx:26-44` | O (`?card=` 설정) | X | 비닐 하이라이트 정적 그라디언트만 |
| (PR #10) 카드 상세 `FlipCard.tsx` | O | **O: 동작 확인함** (rotateY 0→180, 앞뒷면, backface hidden, 400ms linear timing + 투명도 크로스페이드) | 기울이기 꺼짐(`interactive={false}`), 스프링/빛 반사/떠다니는 효과 없음 |

- 쓸 수 있는 라이브러리: RN `Animated`, `PanResponder`, `expo-linear-gradient`만 있음. **reanimated, gesture-handler는 없음** → 의존성 추가 없이 `Animated`로 만든다.
- 재사용할 수 있는 코드: `src/vendor/PhotoCard.tsx`에 이미 드래그 기울이기(±10/12°, 손을 떼면 spring friction 6으로 복귀), 등급별 foil 그라디언트와 glow, 등장 시 사진 scale spring(friction 7, tension 86)이 있다. 다만 지금 어느 화면에서도 기울이기를 켜고 있지 않다.
- PR #10에서 고쳐야 할 버그 2개 (모션 작업보다 먼저):
  1. **2×2가 아니라 1열로 나옴**: `BinderScreen.tsx:210-216` 그리드 폭 280에 gap 12, `Pocket.tsx:49-58`은 폭 126에 좌우 margin 6. 포켓 2개가 2×138+12=288이라 280을 넘어서 줄바꿈된다.
  2. **상세 화면이 닫히지 않음** (Esc, 닫기 버튼, 배경 클릭 모두 실패하고 URL에 `card=`가 남음): `BinderScreen.tsx:85-89`에서 `delete params.card; router.setParams(params)`를 하는데, setParams는 기존 값에 병합하므로 card가 지워지지 않는 것으로 보임. → `router.setParams({ card: undefined })`로 바꾼다. 기존 e2e `바인더-11`은 닫혔는지 확인하지 않아서 이 버그를 놓쳤다.

## 1. 어디에 둘지 (권장안)

**PR #10 브랜치(`cursor/photocard-binder-album`)에 커밋을 이어서 올린다.** PR #7 위에 새 브랜치를 만들지 않는다.
- 이유 1: 플립에 필요한 코드(FlipCard, CardDetailOverlay, useReducedMotion, Pocket, RecentCardsStrip)가 모두 PR #10에만 있다. PR #7 위에서 하면 같은 코드를 중복하거나 나중에 충돌한다.
- 이유 2: Issue #9의 범위에 이미 "카드 플립, Esc 닫기, 공급 종료"가 들어 있다. 사용자 요청은 그 완성도를 올리는 일이다.
- 이유 3: 2×2 버그와 닫기 버그가 같은 파일(BinderScreen/Pocket)에 있어서 함께 고치는 편이 자연스럽다.
- 먼저 할 일: PR #10은 PR #7보다 6커밋 뒤처져 있다(merge-base `d52133a`, PR #7 head는 `3e81860`). 로컬에서 `git merge 3e81860`을 시험해 보니 **충돌 없이** 병합된다. 첫 커밋으로 PR #7을 병합한다.
- 커밋 순서: ① PR #7 병합 → ② 2×2 수정 → ③ 닫기 수정 → ④ 플립 스프링과 접근성 → ⑤ 기울이기, 빛 반사, 떠다니는 효과 → ⑥ 그리드와 최근 카드 눌림 피드백 → ⑦ e2e → ⑧ `build-pages.sh 10`로 pr-10 다시 배포.
- PR-B(Issue #11, 팩 개봉 연출)는 범위가 다르므로 이 작업에 넣지 않는다. 다만 ⑤에서 만든 shine/flip 훅을 PR-B가 다시 쓸 수 있게 `features/card-motion/`으로 분리한다.

## 2. 화면별 동작

| 화면 | 탭 | 플립 | 모션 |
|---|---|---|---|
| 카드 상세 (바인더, 최근 카드 딥링크) | 카드를 탭하면 앞↔뒤 | rotateY 180°, **spring**, 두 면 모두 backface hidden, 90°에서 앞뒷면을 즉시 전환(Safari 대비) | 드래그/포인터 3D 기울이기, 등급별 홀로그램 빛 반사, 대기 중 떠다니기(±4px, 3s), SSR은 열릴 때 금색 빛 한 번 지나감 |
| 바인더 포켓 | 탭하면 상세 열기 (기존 유지) | 없음 (그리드에서는 뒤집지 않음) | pressIn 시 scale 0.96 spring, 웹에서 마우스를 올리면 살짝 떠오르고 비닐 하이라이트가 움직임 |
| 앨범 홈 최근 4장 | 상세 딥링크 (기존 유지) | 없음 | 포켓과 같은 눌림 피드백 |
| 홈 "내 카드 미리보기" | **새로 추가**: 바인더 상세 딥링크 (`/album/binder?page=N&card=ID`, BinderHomeScreen 로직 재사용) | 상세에서 | 눌림 피드백 |
| 상품 상세 구성 카드 (선택, 2단계) | 미리보기 모달 | FlipCard 재사용 (보유 정보 없이) | 기울이기만 |
| 홈/목록의 팩 상품 카드 | 기존 이동 유지 | 없음 (포토카드가 아니라 팩) | 눌림 피드백만 (선택) |

### 플립 세부
- `Animated.spring(flip, { toValue, friction: 8, tension: 40 })`. PR #2의 회전 1.0s ease-out cubic보다 짧게, 약 0.5–0.6s로 한다.
- 앞면 `rotateY: flip→['0deg','180deg']`, 뒷면 `['180deg','360deg']`. 각 면에 `perspective: 1200`, `backfaceVisibility: 'hidden'`.
- 투명도는 크로스페이드 대신 계단 전환 `inputRange [0, .5, .5001, 1]`. backface를 지원하지 않는 브라우저 대비용이다.
- 뒷면 이미지는 기존 `cardDef.back` (`assets/fx/card_back.png`).
- 탭과 드래그 구분: 하나의 PanResponder로 처리한다. 손을 뗄 때 이동량이 6px 미만이고 300ms 이내면 탭으로 보고 플립, 그 외에는 기울이기만 한다.

### 모션 세부
- 기울이기: PhotoCard의 공식(dx/8 → ±12°, -dy/10 → ±10°)을 그대로 쓴다. 웹에서는 `onPointerMove`/`onMouseMove`로 마우스를 올려도 기울어지게 하고, 마우스가 나가면 spring으로 복귀한다.
- 홀로그램 빛 반사: `LinearGradient` 띠를 기울기에 연동해 translateX로 움직인다. 등급별 세기는 `tokens.rarities[*].foil`/`glow`를 쓴다. N 0 / R 0.15 / SR 0.25 / SSR 0.35. SSR에는 `assets/fx/sparkles.png` 오버레이를 낮은 투명도로 추가(기존 에셋).
- SSR 금색 빛 지나감: PR #2 `motion/src/LegendaryOpen/Card.tsx:66-160` 타이밍(약 0.67s, 투명도 0→1→1→0, 금색 3단 그라디언트)을 RN으로 옮긴다.
- 대기 중 떠다니기: `Animated.loop(sequence(timing ±4px, 1500ms, Easing.inOut(sin)))`. 사용자가 조작하는 동안에는 멈춘다.

### 웹과 터치
- 웹(마우스): 클릭으로 플립, 마우스를 올리면 기울어짐. 모바일 터치: 탭으로 플립, 드래그로 기울이기. 둘 다 PanResponder로 처리한다(RN-web 지원).
- `useNativeDriver: Platform.OS !== 'web'` 패턴은 그대로 둔다.

### 모션 줄이기 (reduced motion)
- `useReducedMotion()`을 재사용한다. 켜져 있으면 플립은 즉시 전환(지금처럼), 기울이기·떠다니기·빛 지나감은 끄고 정적인 foil만 남긴다. 눌림 scale도 끈다.

### 접근성과 키보드
- 카드: `accessibilityRole="button"`, `accessibilityLabel="카드 뒤집기 (현재 앞면/뒷면)"`, `accessibilityState`. 지금은 Enter로 플립되지만 **Space는 안 된다** → 웹에서 Space 처리를 추가한다.
- 포켓과 최근 카드: role=button과 라벨(예: "아티스트 A No.9 SR, 2장"). 현재는 role과 라벨이 없다.
- 상세: Esc, 닫기 버튼, 배경 클릭 모두로 닫힌다(버그 수정). 닫으면 같은 page로 돌아가고, 가능하면 포커스를 원래 포켓으로 돌려준다.

## 3. 파일별 변경 목록 (모두 `service/` 아래)

| 파일 | 변경 |
|---|---|
| `src/features/binder/screens/BinderScreen.tsx` | 그리드 폭/gap 수정(예: width 288 또는 gap 0으로 포켓 margin만 사용), `handleCloseDetail` → `setParams({ card: undefined })` |
| `src/features/binder/components/Pocket.tsx` | 눌림 scale spring, 웹 hover, a11y role/라벨, `testID="pocket-<cardDefId>"` |
| `src/features/binder/components/RecentCardsStrip.tsx` | 같은 눌림 피드백과 a11y |
| `src/features/binder/detail/FlipCard.tsx` | spring 플립, 계단식 투명도, 통합 PanResponder(탭/드래그), 기울이기, 빛 반사, 떠다니기, a11y, `testID="card-flip"` |
| `src/features/binder/detail/CardDetailOverlay.tsx` | 닫힐 때 포커스 복귀, 닫기 버튼 testID |
| `src/features/card-motion/useTilt.ts` (신규) | PanResponder와 포인터 기울이기 훅 (PhotoCard 로직 추출) |
| `src/features/card-motion/useFlip.ts` (신규) | 플립 상태, spring, reduced-motion 분기 |
| `src/features/card-motion/HoloShine.tsx` (신규) | 등급별 빛 반사와 SSR 빛 지나감 오버레이 (LinearGradient와 기존 sparkles.png) |
| `src/features/card-motion/usePressScale.ts` (신규) | 눌림 피드백 |
| `src/screens/HomeScreen.tsx` | "내 카드 미리보기"에 탭 → 바인더 상세 딥링크 |
| `e2e/binder.spec.ts` (+ `e2e/card-motion.spec.ts` 신규) | 아래 검수 시나리오 |
| (선택) `src/screens/ProductDetailScreen.tsx` | 구성 카드 미리보기 모달 |

- `src/vendor/PhotoCard.tsx`는 PROVENANCE 해시로 추적되는 파일이므로 **수정하지 않는다.** 로직은 훅으로 복제해서 쓴다.
- 새 이미지, 새 npm 의존성은 없다.

## 4. 재사용할 기존 에셋
- 앞면: `service/assets/photos/01–07.jpg` (`cardDef.front`). PR #2의 `legend.jpg`는 `01.jpg`와 같은 파일이다(md5 일치).
- 뒷면: `service/assets/fx/card_back.png`. PR #2의 `motion/public/fx/card_back.png`와 md5가 같다.
- 효과: `service/assets/fx/sparkles.png`, `sparkle_trail.png`, `light_flash.png`, `inner_glow.png`. 모두 PR #2와 같은 원본이다.
- 색상: `src/theme/tokens.ts`의 `rarities.*.foil/glow`, `frames`, `CARD_RATIO`.
- 모션 수치: PhotoCard의 spring(friction 6/7, tension 86), PR #2의 회전(30fps 기준 108–138f, ease-out cubic)과 빛 지나감(150–170f).

## 5. 완료 기준과 e2e (Playwright, **`force: true` 금지**, 실제 클릭/탭만)
1. 바인더 `?page=1`: 포켓 4개의 boundingBox가 서로 다른 x 2개, y 2개로 나온다(2×2).
2. 포켓 클릭 → URL에 `card=`가 있고 `card-face-front`가 보인다.
3. `card-flip` 클릭 → 700ms 뒤 `card-face-back`의 computed opacity=1, transform이 단위행렬. 150ms 시점에는 회전이 진행 중(matrix3d m11이 1과 -1 사이).
4. 다시 클릭 → 앞면으로 복귀.
5. 키보드: 카드에 focus한 뒤 Enter와 Space 각각으로 플립.
6. Esc, 닫기 버튼, 배경 클릭 각각 → URL에 `card`가 없고 상세가 사라지며 `page`는 유지된다(예: 2 / 3).
7. 드래그: mouse down → 40px 이동 → 앞면 transform의 rotateY가 0이 아님. 손을 떼면 0으로 돌아가고 **플립되지 않음**.
8. 터치 프로젝트(hasTouch): `touchscreen.tap`으로 플립.
9. `emulateMedia({ reducedMotion: 'reduce' })`: 클릭 후 50ms 안에 뒷면 opacity=1, 1초 동안 떠다니기 transform 변화 없음.
10. SSR 카드(prod-08 등) 상세: 빛 반사 레이어가 있고 등장 시 빛이 지나감. N 카드는 빛 반사 레이어 opacity 0.
11. 홈 "내 카드 미리보기" 탭 → 바인더 상세가 열림.
12. 범위 검사: `git diff --name-only <base>` 결과가 모두 `service/`. `scripts/check-binder-assets.sh` 통과(새 이미지 0), `check-provenance` 통과, `npm run typecheck && npm test` 통과.
13. 배포: `service/pr-10/version.json`의 commit이 HEAD와 같고, 배포 URL에서 1–9를 다시 실행(`BASE_URL=https://soyee-1469.github.io/photocard/service/pr-10/`). playwright.config의 BASE_PATH 기본값이 pr-7이므로 BASE_URL을 반드시 지정한다.

## 6. 규모 추정
- 버그 2개(2×2, 닫기): **S**. 3–5줄 수정이라 Cursor 에디터에서 사용자가 바로 고칠 수 있다(약 15분).
- 플립 spring, a11y, 기울이기, 빛 반사, 떠다니기, 눌림 피드백, e2e, 배포: **M**. 파일 약 10개, 400–600 LOC(테스트 포함), 반나절 정도. 에디터로도 가능하지만, PR #7 병합 → e2e → gh-pages 재배포까지 한 번에 검증하려면 **클라우드 에이전트 1회 실행**이 적합하다(PR #10 브랜치 대상, 위 커밋 순서 지정).
