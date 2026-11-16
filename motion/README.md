# Photocard Motion - Remotion 영상 프로젝트

Remotion을 사용한 포토카드 팩 개봉 모션 영상 제작 프로젝트입니다.

## 설치

```bash
cd motion
npm install
```

## 실행

### 미리보기 (Remotion Studio)

```bash
npm start
# 또는
npx remotion studio
```

브라우저가 자동으로 열리며 실시간으로 타임라인을 확인하고 편집할 수 있습니다.

### 특정 프레임 스틸 이미지 추출

```bash
npx remotion still LegendaryOpen out/still-frame-90.png --frame=90
```

### 전체 영상 렌더링

```bash
npx remotion render LegendaryOpen out/legendary-open.mp4
# 또는
npm run build
```

- 해상도: 1080×1920 (세로)
- 프레임레이트: 30fps
- 길이: 약 6초 (180프레임)
- 포맷: MP4 (H.264)

## 컴포지션 수정

### 카드 이미지 변경

`src/Root.tsx`의 `defaultProps`를 수정합니다:

```tsx
defaultProps={{
  cardSrc: '/cards/your-card.jpg',  // public/cards/ 경로
  title: '커스텀 타이틀',
}}
```

또는 렌더링 시 props를 전달:

```bash
npx remotion render LegendaryOpen out/custom.mp4 \
  --props='{"cardSrc": "/cards/custom.jpg", "title": "새 타이틀"}'
```

## 타임라인 구조

- **0-30프레임**: 기대감 - 어두운 배경, 봉투 등장, 금빛 테두리
- **30-54프레임**: 레전드 예고 - 틈새로 금빛 누출, 화면 떨림
- **54-78프레임**: 찢김 - 봉투 윗부분이 순차적으로 찢김 (top_2→3→4)
- **78-108프레임**: 카드 등장 - 뒷면이 슬라이드하며 펄럭임
- **108-138프레임**: 회전 공개 - Y축 3D 회전으로 앞면 공개
- **138-150프레임**: 폭발 - 섬광, 링 충격파, 금빛 파티클
- **150-180프레임**: 마무리 - foil 광택, SSR 배지, 문구 표시

## 프로젝트 구조

```
motion/
├── public/
│   ├── fx/           # 이펙트 이미지 (봉투, 스파클, 링 등)
│   └── cards/        # 카드 앞면 이미지
├── src/
│   ├── index.ts      # Remotion 진입점
│   ├── Root.tsx      # 컴포지션 등록
│   ├── theme.ts      # 레전드 테마 상수
│   └── LegendaryOpen/
│       ├── LegendaryOpen.tsx  # 메인 타임라인
│       ├── Pack.tsx           # 봉투 찢김 애니메이션
│       ├── Card.tsx           # 카드 3D 회전
│       ├── GoldFx.tsx         # 금빛 파티클/링/섬광
│       └── Caption.tsx        # SSR 배지와 문구
└── out/              # 렌더링 결과물 (.gitignore 처리)
```

## 기술 스택

- Remotion 4.0
- React 18
- TypeScript 5

## 참고

- 모든 애니메이션은 `useCurrentFrame`, `interpolate`, `spring`으로 구현되어 렌더 결과가 항상 동일합니다.
- 파티클 위치는 `random(seed)`로 고정 시드를 사용합니다.
- 카드 비율은 루트 `theme.ts`의 `CARD_RATIO` (55/85)를 따릅니다.
