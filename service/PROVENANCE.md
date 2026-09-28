# PROVENANCE 기록

이 문서는 `service/` 폴더 내부로 복사된 재사용 파일들의 원본 위치와 무결성을 추적합니다.

## 복사 시점
- 날짜: 2026-09-28
- main 브랜치 커밋: `7ff7a66`
- PR #1 브랜치 커밋: `0b7fa4e`

## 복사된 파일 목록

### 테마 토큰 및 컴포넌트 (main 브랜치에서)

| 대상 경로 | 원본 경로 | 커밋 SHA | 파일 해시 (SHA-256) | 비고 |
|---|---|---|---|---|
| `service/src/theme/tokens.ts` | `theme.ts` | `7ff7a66` | `6af9703d2150b06f8af918f6deda6a3c0eb5c80f75e4fa38c6f59424efec7715` | 원본과 동일 |
| `service/src/vendor/PhotoCard.tsx` | `components/PhotoCard.tsx` | `7ff7a66` | `b848d74df7d84532d2f99e39ea0910a2802716e9e841f455c11e2f9cacbd34c4` | 원본과 동일 |
| `service/src/vendor/EmberGlow.tsx` | `components/EmberGlow.tsx` | `7ff7a66` | `8b6bb5c5c9d31c88e1fab6c4f339fc032e2c16fab9af07e7effb317bb08ac0ee` | 원본과 동일 |
| `service/src/vendor/SparkField.tsx` | `components/SparkField.tsx` | `7ff7a66` | `4bcc1559e337e3b68d508e58801b080c1659d667a7122cad9557211bbf875085` | 원본과 동일 |

### 포토 이미지 (main 브랜치에서)

| 대상 경로 | 원본 경로 | 커밋 SHA | 파일 해시 (SHA-256) |
|---|---|---|---|
| `service/assets/photos/01.jpg` | `assets/photos/01.jpg` | `7ff7a66` | `fe324faa5788cb141efdaf1fd5f9b5534aea85004543ab66b6d57f1c135fd67a` |
| `service/assets/photos/02.jpg` | `assets/photos/02.jpg` | `7ff7a66` | `e675e221d9822cd4145381f695000ff07d1916cba06b8926bdbc4ec251adc93b` |
| `service/assets/photos/03.jpg` | `assets/photos/03.jpg` | `7ff7a66` | `f3906e344ba35d4e88d98643aaaaa64ad6fc4b8255308fcb3802e232ec986624` |
| `service/assets/photos/04.jpg` | `assets/photos/04.jpg` | `7ff7a66` | `5733f521948b17ad43238a39b0ac9d17e225395f92932c6c1320855fcec702c7` |
| `service/assets/photos/05.jpg` | `assets/photos/05.jpg` | `7ff7a66` | `64670e3befe95b7d2fb136f4a5e62b097b229f6fb96290aee4071d512e9bcbb0` |
| `service/assets/photos/06.jpg` | `assets/photos/06.jpg` | `7ff7a66` | `46b9fcc168a8e5f07b6bf7a94cbc4b90d44c003c5b8fe740553257b375f82685` |
| `service/assets/photos/07.jpg` | `assets/photos/07.jpg` | `7ff7a66` | `d67691d9b24d3ba07e6a5e825718f6b9eaf55515c9b7983163f73c8d40df1435` |

### 팩 및 이펙트 이미지 (PR #1 브랜치 `cursor/photocard-pack-animation-ab1a`에서)

| 대상 경로 | 원본 경로 | 커밋 SHA |
|---|---|---|
| `service/assets/fx/pack_closed.png` | `assets/fx/pack_closed.png` | `0b7fa4e` |
| `service/assets/fx/pack_body_torn.png` | `assets/fx/pack_body_torn.png` | `0b7fa4e` |
| `service/assets/fx/pack_top_2.png` | `assets/fx/pack_top_2.png` | `0b7fa4e` |
| `service/assets/fx/pack_top_3.png` | `assets/fx/pack_top_3.png` | `0b7fa4e` |
| `service/assets/fx/pack_top_4.png` | `assets/fx/pack_top_4.png` | `0b7fa4e` |
| `service/assets/fx/card_back.png` | `assets/fx/card_back.png` | `0b7fa4e` |
| `service/assets/fx/card_front.png` | `assets/fx/card_front.png` | `0b7fa4e` |
| `service/assets/fx/ember_burst.png` | `assets/fx/ember_burst.png` | `0b7fa4e` |
| `service/assets/fx/inner_glow.png` | `assets/fx/inner_glow.png` | `0b7fa4e` |
| `service/assets/fx/light_flash.png` | `assets/fx/light_flash.png` | `0b7fa4e` |
| `service/assets/fx/particles.png` | `assets/fx/particles.png` | `0b7fa4e` |
| `service/assets/fx/ring_effect.png` | `assets/fx/ring_effect.png` | `0b7fa4e` |
| `service/assets/fx/sparkles.png` | `assets/fx/sparkles.png` | `0b7fa4e` |
| `service/assets/fx/sparkle_trail.png` | `assets/fx/sparkle_trail.png` | `0b7fa4e` |

### 사진 에셋 (main 브랜치에서)

| 대상 경로 | 원본 경로 | 커밋 SHA |
|---|---|---|
| `service/assets/photos/01.jpg` ~ `07.jpg` | `assets/photos/01.jpg` ~ `07.jpg` | `7ff7a66` |

## 수정 사항

### vendor 컴포넌트 수정
- `PhotoCard.tsx`: `useNativeDriver: Platform.OS !== 'web'` 추가하여 웹 브라우저 경고 제거
- `EmberGlow.tsx`: `emberSource` prop으로 이미지 외부 주입 (원본은 `packFx.ts`에 의존)
- `SparkField.tsx`: 수정 없음

## 드리프트 검사

원본 파일이 변경되었는지 확인하려면:

```bash
cd /workspace/service
npm run check-provenance
```

`scripts/check-provenance.mjs` 스크립트가 원본 파일의 현재 해시를 이 문서의 기록과 비교합니다.
