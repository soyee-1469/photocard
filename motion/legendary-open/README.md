# Legendary 개봉 모션

Tomatok 포토카드 Legendary 등급 개봉의 Remotion 프로토타입입니다. Expo·Flutter 앱 소스와는 분리되어 있습니다.

- 화면: 360×780
- 길이: 4초, 60fps
- 구성: 흔들림 → 찢기 → 카드 등장 → 골드 파티클 → 결과

## 미리보기

```console
npm install
npm run dev
```

## 렌더

```console
npx remotion render LegendaryOpen renders/legendary-open.mp4
npx remotion render LegendaryOpen renders/frames --frames=0,18,48,66,84,120,136,150,186,230 --image-format=png
```

앱 재생용 MP4와 검수용 PNG는 `renders/`에 있습니다. 소스와 카드 교체 방법은 [docs/INTEGRATION.md](docs/INTEGRATION.md)를 보면 됩니다.
