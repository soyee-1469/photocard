# 앱 연동 가이드

이 문서는 나중에 앱에 붙일 때를 위한 메모입니다. 이번 프로토타입은 Flutter 화면에 연결하지 않습니다.

## 재생 파일

`renders/legendary-open.mp4`

- H.264
- 360×780
- 60fps
- 4초
- 검은 배경이 포함되어 있어 투명 영상은 아닙니다.

Flutter에서는 `video_player`로 이 파일을 재생할 수 있습니다. 에셋으로 넣을 위치와 화면 연결은 앱 적용을 결정할 때 정합니다.

## 카드와 등급 바꾸기

애니메이션은 카드 그림을 모릅니다. `LegendaryOpen` props만 바꿉니다.

| prop | 의미 |
|---|---|
| `rarity` | `common` · `rare` · `epic` · `legendary`. 색, 배지, 문구는 `src/cards.ts` |
| `frontSrc` | `public/` 기준 앞면 PNG 경로 |
| `backSrc` | `public/` 기준 뒷면 PNG 경로 |
| `tearProgress` | `null`이면 0.6–1.5초 타임라인이 찢기를 재생합니다. `0`~`1`을 넘기면 그 값이 찢기 진행률이 됩니다. |

현재 기본값은 Legendary 더미입니다.

```tsx
defaultProps={{
  rarity: "legendary",
  frontSrc: "fx/card_front.png",
  backSrc: "fx/card_back.png",
  tearProgress: null,
}}
```

등급 문구와 골드 색은 `src/cards.ts`의 `rarityThemes`에만 있습니다.

## 찢기 진행률

`PackTear`는 프레임을 보지 않고 `progress`만 받습니다.

- `0`: 봉인된 팩
- `1`: 뚜껑이 떨어지고 몸통만 남음

자동 재생은 `src/timeline.ts`의 `tearProgressAt()`이 0.6초에서 1.5초 사이를 0에서 1로 바꿉니다. 이후 Flutter 드래그를 연결할 때는 이 함수 대신 드래그 비율을 `tearProgress`로 넘기면 됩니다.

타이밍 숫자는 `src/timeline.ts`에만 둡니다.

## 컴포넌트

| 파일 | 역할 |
|---|---|
| `PackShake` | 0–0.6초 흔들림 |
| `PackTear` | 찢기. 진행률만 입력 |
| `RevealCard` | 카드 상승, Y축 플립, 홀로그램 스윕 |
| `GoldBurst` | 골드 플래시, 링, 파티클 |
| `ResultPlate` | 등급 배지와 문구 |

## 미리보기와 다시 렌더

```console
cd motion/legendary-open
npm run dev
npx remotion render LegendaryOpen renders/legendary-open.mp4
```

검수용 PNG는 `renders/frames/`에 있습니다.

| 파일 | 시점 | 확인 내용 |
|---|---|---|
| `element-000.png` | 0.00초 | 봉인된 팩, 투명 배경이 검은 스테이지에 붙음 |
| `element-018.png` | 0.30초 | 좌우 흔들림 |
| `element-048.png` | 0.80초 | 첫 찢기 |
| `element-066.png` | 1.10초 | 중간 찢기 |
| `element-084.png` | 1.40초 | 뚜껑이 오른쪽으로 떨어짐 |
| `element-120.png` | 2.00초 | 카드 뒷면 |
| `element-136.png` | 2.27초 | 플립 측면 |
| `element-150.png` | 2.50초 | 카드 앞면과 홀로그램 |
| `element-186.png` | 3.10초 | 골드 파티클 |
| `element-230.png` | 3.83초 | LEGENDARY 결과 |
