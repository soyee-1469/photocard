# 바인더 기능

Issue #9 바인더 콘셉트 구현. 보유 카드만 표시하는 앨범 및 카드 상세 기능.

## 구조

- `model/`: 순수 함수 데이터 로직
- `theme/`: 바인더 전용 테마
- `hooks/`: React hooks (API, 모션)
- `components/`: UI 컴포넌트 (표지, 포켓, 필터 등)
- `detail/`: 카드 상세 오버레이
- `screens/`: 메인 화면 (홈, 바인더)

## 주요 기능

- 14장 시드 데이터, 3페이지 (4칸/페이지)
- 아티스트·등급 필터 (AND)
- 카드 플립, 공급 종료 태그
- 모션 줄이기 지원
- URL 파라미터 기반 상태 관리

## 테스트

```bash
npm test  # 단위 테스트 42개
npx playwright test e2e/binder.spec.ts  # e2e 11개
```
