# 포토카드 Flutter 이식 참고 문서

> 2026-10-27 기준. `service/app/`(고객 앱 목업)을 Flutter로 옮기는 개발자를 위한 코드 해설이다.
> 기획 의도는 [photocard-dev-handoff.md](photocard-dev-handoff.md), 화면설계서 대조는 [photocard-spec-audit-2026-10-26.md](photocard-spec-audit-2026-10-26.md), DB 설계는 [photocard-db-plan.md](photocard-db-plan.md)를 본다. 이 문서는 그 셋이 다루지 않는 "코드에 박힌 규칙과 수치"를 모았다.

## 0. 먼저 알아 둘 것

- 목업은 **프레임워크 없는 단일 파일 SPA**다. `app.js` 한 파일(약 6,900줄)에 상태 객체 `state`, 화면 함수(문자열 템플릿), 이벤트 핸들러가 다 들어 있다. `render()`가 `state.screen`을 보고 화면 HTML을 통째로 다시 그린다.
- **서버가 없다.** 상품·공지·배송 정책은 관리자 페이지(`service/register/`)가 브라우저 `localStorage`에 쓴 것을 앱이 읽는다. 지갑·시세·주문·보유 카드도 전부 로컬이다. Flutter에서는 이 저장소들을 API로 바꾸는 것이 첫 일이다. 저장소 키별 대체 대상은 7장에 있다.
- 실제 앱 화면은 `service/app/index.html` 하나다. 로컬에서 보려면 저장소 루트에서 `python3 -m http.server 8080` 뒤 `http://127.0.0.1:8080/service/app/`. 배포본은 Vercel이며 루트가 앱으로 리다이렉트된다.
- 온보딩을 다시 보려면 주소 뒤에 `?onboarding`을 붙인다.

## 1. 코드 구조 (app.js 안에서 찾는 법)

| 영역 | 찾을 키워드 | 내용 |
| --- | --- | --- |
| 상태 | `const state = {` | 화면·탭·시트·지갑·뽑기 진행 등 모든 상태. 키 목록은 3장 |
| 화면 함수 | `function home(`, `detail(`, `album(`, `cardDeck(`, `cardSpread(`, `result(`, `wallet(`, `exchangeForm(`, `exchangeDone(`, `receivePage(`, `fillForm(`, `faqPage(`, `termsPage(`, `guide(`, `splash(` | 각 화면 HTML을 돌려준다 |
| 라우터 | `function render()` 안의 `state.screen === "..."` 분기 | 화면 이름 목록은 2장 |
| 클릭 핸들러 | `app.addEventListener("click"` 아래 `event.target.closest("[data-...]")` 묶음 | `data-*` 속성 이름이 곧 액션 이름 |
| 입력 핸들러 | `app.addEventListener("input"` | `data-field` 값이 `state` 키와 같다 |
| 제스처 | `armOpenCut()`, `armDeck()`, `armSpread()`, `armGuide()`, `armResult()` | 화면이 그려진 뒤 한 번만 바인딩 |
| 상수 | 대문자 `const` (`OPEN_CUT`, `DECK_FAN`, `SPREAD_GRID`, `PACK_FACE` 등) | 수치는 5장 |

주석에 "슬라이드 n"이 적혀 있으면 화면설계서 Ver.01의 장 번호다.

## 2. 화면 목록과 진입

`state.screen` 값과 역할. 괄호는 어디서 들어오는지.

| screen | 화면 | 진입 |
| --- | --- | --- |
| `home` | 홈: 가수 프로필 레일(전체 버튼이 맨 왼쪽) → 배너 → NEW 선반 → 이용 방법 안내 배너 → 관리자 중간 배너 | 시작 |
| `artists` | 전체 아티스트 | 프로필 레일 "전체" |
| `artist` | 가수별 상품 | 프로필 |
| `detail` | 상품 상세 + 결제 시트(`state.sheet` = 1 또는 5) | 타일 |
| `open` | 뽑기 흐름. `state.openPhase`가 `deck` → `pack`(찢기) → `spread`(5장 펼침) → `card` | 결제 완료 |
| `result` | 결과 (5장은 캐러셀) | 개봉 완료 |
| `album` | 보유 카드 | 드로어, 결과 헤더 버튼 |
| `card` | 보유 카드 한 장 크게 보기 | 보유 카드 |
| `wished`, `purchases`, `notice`, `faq`, `terms`, `events`, `settings`, `guide` | 드로어 메뉴 | 드로어 |
| `wallet`, `wallet-manage`, `exchange-form`, `exchange-done`, `exchange-history`, `fill`, `receive` | 토마톡 지갑 목업(밝은 테마) | 결제 시트, 드로어 |
| `ship`, `track`, `admin`, `inquiry` | Ver.02 보류 또는 숨김. 진입점 없음 | - |

### 첫 실행 흐름 (`state.boot`)

`splash` → `push`(푸시 허용 팝업) → `marketing`(마케팅 수신 팝업) → `consent`(동의 결과 안내) → `guide`(이용 가이드 4장, 끝까지 넘겨야 시작하기 활성) → `reward`(첫 완주 1,000 TP 보상 시트) → `done`.
완료 기록은 `photocard-onboard-v1`에 `{ done, guideSeenAt, guideRewardAt }`로 남는다. 보상은 `guideRewardAt`이 없을 때 한 번만 준다. 금액 `GUIDE_REWARD_TP = 1000`은 기획 미확정 임시값.

## 3. 상태 키 요약

자주 쓰는 것만. 전체 목록은 `const state = {` 주석 참고.

| 묶음 | 키 | 뜻 |
| --- | --- | --- |
| 탐색 | `screen`, `tab`, `productId`, `sheet`, `menuOpen` | 현재 화면, 열린 결제 시트 장수(1/5) |
| 뽑기 | `reveal`(뽑힌 카드 배열), `revealIndex`(지금 여는 순번), `openPhase`, `openCut`(`idle`/`cutting`/`completed`), `spreadDone`(펼침 전에 이미 찢어 연 장수) | 5장 뽑기는 `reveal.length === 5` |
| 지갑 | `walletConnected`, `walletReturn`(교환 뒤 돌아갈 `{productId, sheet}`), `fillReturn`, `tp`, `balance`(선택 지갑 TOTT), `wallets[]`, `walletId`, `exchanges[]`, `fills[]` | TP는 계정 공통, TOTT는 지갑별 |
| 교환 입력 | `exMode`(`tott`/`tp`), `exTott`, `exTp`, `exDone`(완료 화면 데이터), `fillSol` | 입력 중에는 전체 render 없이 해당 노드만 갱신 |
| 보유 | `owned[]`, `wished[]`, `albumArtist`, `albumQuery` | |
| 온보딩 | `boot`, `guidePage`, `guideSeen` | |

## 4. 화면별 규칙 (코드에만 있는 것)

### 홈·목록
- 타일은 가수 · 상품명 · 가격만. "n종 중 랜덤 1장" 줄은 타일에서 뺐고 상세·결제 시트에만 남는다.
- 가격 보조 표기: 넓은 자리는 `≈ ₩2,500 · $1.79`, 좁은 타일은 한 통화만(한국어면 ₩, 아니면 $). `priceSub()` / `priceSubOne()`.
- 품절·입고예정·판매중지는 `saleWord()`가 돌려주는 배지. 품절은 타일 흐리게.

### 결제 시트 (`sheet()` 안)
상태가 네 가지다. 위에서부터 먼저 맞는 것.
1. 지갑 미연결 → "지갑 연결이 필요해요" + 지갑 연결하기 / 닫기. 연결하면 같은 시트가 아래 상태로 다시 그려진다.
2. TP 부족 + TOTT 0 → 부족한 TP 줄(빨강, 보조 표기 포함) + "지갑에 TOTT가 없어요. TOTT를 받은 뒤 TP로 교환해요." + **TOTT 받기** + 비활성 결제하기.
3. TP 부족 + TOTT 있음 → "토마톡 지갑에서 TOTT를 TP로 교환해요." + **TP 교환하기** + 비활성 결제하기.
4. 결제 가능 → 안내 두 줄("뽑은 카드는 보유 카드에 보관됩니다." / "동일 카드가 중복으로 뽑힐 수 있습니다." 관리자에서 상품별로 바꿀 수 있음) + 결제하기.

교환·받기로 나갈 때 `walletReturn = {productId, sheet}`를 남기고, 돌아오면 같은 시트를 다시 연다.

### 뽑기 덱 (`cardDeck()`, `armDeck()`)
- 포장 5개 부채꼴. 10개 이상이면 원형(`DECK_RING_COUNT`, `DECK_RING_RADIUS`)이지만 현재 기획은 5개 고정.
- 안내: 1장은 "한 장을 선택하세요", 5장은 "포장을 골라 열어보세요" + 둘째 줄 "5장 중 첫 번째 카드입니다."(순서말 `DECK_ORDINALS`). 안내는 헤더에서 64px 아래.
- 이미 연 카드는 안내 아래 작은 줄로 쌓인다(`.deck-opened`).
- 하단 버튼: **섞기**(아이콘+글자, 좁게) / **바로 오픈하기**. 5장은 "5장 바로 오픈하기", 몇 장 연 뒤면 "남은 n장 바로 오픈하기". 건너뛰기(SKIP)는 바로 오픈하기와 겹쳐서 뺐고, 전부 생략은 헤더 ←.
- 포장을 고르면 가운데로 떠올라 한 바퀴 돌고(`deck-take`, `deck-spin` 1초) 찢기 화면으로.

### 찢기 (`cardPack()`, `armOpenCut()`)
- 포인터로 포장 앞면 안에서 드래그. 10px 넘게 움직인 순간 방향을 정한다.
  - 가로·세로 축에서 22.5° 이내면 가로/세로, 넘으면 **대각선**(`tearIsDiagonal`).
  - 가장자리 28% 안에서 시작하면 끝에서 끝까지 찢는 띠(`!is-mid`), 안쪽에서 시작하면 손끝에서 자라는 띠(`is-mid`, `--tear-span`).
  - 띠는 `tears/over-1..4.png`(985×259) 네 단계. 이동 거리 / 포장 폭 비율로 단계가 올라간다(`dragFrame`).
- 손을 떼면 72px(`OPEN_CUT.minDistance`) 미만이면 원복, 이상이면 자동으로 끝까지 찢고 조각 5개(`tears/pieces/*.png`)가 흩어지며 카드가 떠오른다. 타이밍은 `OPEN_CUT`(5장).
- 불꽃(`tear-spark`)은 띠 위에 무작위로 뿌리고 드래그 각도로 돌린다.
- 카드가 뜨면 드래그로 앞뒤 회전, OK → 다음 포장(5장) 또는 결과.
- 햅틱: `navigator.vibrate` 가능하면 light. Flutter는 `HapticFeedback.lightImpact`.

### 5장 펼침 (`cardSpread()`, `armSpread()`)
- 덱에서 바로 오픈하기를 누르면 포장 5개가 회전을 풀며 2-1-2 자리(`SPREAD_GRID`)로 0.6초 이동 → 펼침 화면이 같은 자리에서 이어받는다.
- 펼침 화면: 포장 덮개가 0.5초 동안 밝아지며 커지다 사라지고(`SPREAD_POP_AT`) 카드 뒷면이 남는다 → 0.8초 뒤(`SPREAD_FLIP_AT`) **다섯 장이 한꺼번에** 0.7초 뒤집힌다 → 프리즘 광택 → OK.
- 이미 찢어서 연 카드(`spreadDone`장)는 덱에서 포장이 사라지고, 펼침 화면에서는 포장 없이 앞면으로 바로 선다.
- 카드 뒷면은 상품 카드의 `back` 이미지, 없으면 어두운 빈 면.
- 주의: 뒤집기 요소에 opacity를 걸면 3D가 평면화돼 앞면이 비친다. 페이드는 면(face)에 걸어야 한다.

### 결과 (`result()`)
- 헤더: ← (상세로) · "Photocard Open" · 오른쪽 **보유 카드** 버튼(아이콘+글자).
- 카드 → 점 표시 → "1 / 5" → 가수 → 앨범 번호 → 희귀도 → "보유 카드에서 확인 가능해요".
- 버튼 위계: 주(빨강) "5장 한 번 더 뽑기" 또는 "한 번 더 뽑기"(방금 뽑은 장수 그대로) → 2열 회색 "1장 뽑기 구매"(반대 장수) · "다른 상품 보기"(홈) → 글자 링크 "닫기"(상세).
- 5장은 좌우 스와이프 캐러셀. 스와이프하면 이름·등급·순번이 바뀐다.

### 보유 카드 (`album()`)
- 가수 칩 + 검색(가수·앨범·멤버·카드 번호). 같은 카드는 한 장으로 묶고 장수 배지.
- 비어 있으면 아이콘 + "보유 카드가 없습니다. 포토카드를 구매해보세요." + **상품 보러 가기**(홈).
- 이미지는 워터마크(`TOMATOK` + 보유 카드 ID 반복)를 캔버스로 입히고 원본 URL을 DOM에 두지 않는다(`guard` 클래스, `data-protect`). 드래그·우클릭·길게 누르기 저장 차단. Flutter에서는 서버에서 워터마크를 입히거나 `RepaintBoundary` 위에 겹쳐 그리고 스크린샷 방지(`FLAG_SECURE` 등)를 고려.

### 지갑 (밝은 테마, `wallet()` 외)
- 지갑 카드: 주소·복사·QR·익스플로러, TOTT 잔액(KRW/USD 토글), TP 포인트 박스(라벨 + 숫자 + 동그란 TP 마크 + 교환하기), 보내기 / 받기 / 채우기 / 거래보기.
- **교환**(`exchange-form`): TOTT 기준·TP 기준 토글. "최대"는 라벨 줄 오른쪽 글자 링크. 비율 버튼 없음. TOTT 0이면 입력 카드 위에 "TOTT가 없어요" + TOTT 받기. 교환 예상은 받을 TP·교환 후 TP 두 줄만.
- **교환 완료**(`exchange-done`): 받은 TP·보유 TP·사용한 TOTT·남은 TOTT, 적용 환율·지갑·시각, "교환된 TP는 다시 TOTT로 바꿀 수 없어요", 결제로 돌아가기(또는 지갑으로) + 거래 내역 보기.
- **받기**(`receive`): 지갑 주소·복사·QR 자리(실제 QR 생성은 미구현), 네트워크 주의 3줄, 결제로 돌아가기, 글자 링크 "SOL이 있다면 TOTT로 채우기".
- **채우기**(`fill`): SOL → TOTT. 결제·교환에서 들어오면 `fillReturn`으로 교환 화면에 돌아간다.
- 거래 내역: 한 건에 두 통화가 걸리면 오른쪽엔 받은 쪽만("+ 2,500 TP"), 쓴 쪽은 날짜 옆 작은 글씨("· 2,500 TOTT 사용"). 포토카드 결제는 "포토카드 구매"로만 표기.
- 지갑 설정 시트 아이콘은 Phosphor Regular(star · pencil-simple · link-break · arrows-clockwise).

### 고객센터
- 드로어: 홈 · 지갑 · 보유 카드 · 구매 내역 · 찜 목록 · 고객센터(공지사항 · 이용자 가이드 · FAQ · 이용약관) · 이벤트 · 환경설정.
- FAQ: 분류 칩 + Q/A 아코디언 14문항(코드 상수 `FAQ_ITEMS`). 이용약관: 11개 조 + 부칙(`TERMS_SECTIONS`, 법무 검토 전 초안, 회사명·시행일 `TERMS_META`).
- 1:1 문의 게시판은 코드만 있고 메뉴에서 뺐다(관리자 답변·서버 저장이 없어서). 문의 창구 문구는 "토마톡 고객센터".
- 찜 목록은 프로필·앨범명만(가격 없음).

### 이용 가이드 (`GUIDE_PAGES`, `demoScene()`)
4장, CSS 애니메이션으로 실제 화면 요소를 흉내 낸다. 손가락 아이콘은 위를 향하고 글자를 가리지 않는 위치를 누른다.
1. 앨범을 고르고 뽑기: 목록 타일 탭 → 포장 5개 부채꼴 → 가운데 포장 선택.
2. TP로 결제하기: "지갑 연결이 필요해요" 시트 → 연결하기 → "지갑 연결됨 · TOTT → TP 교환 가능" 결제 시트 → 결제하기.
3. 포장을 밀어 열기: 투명 PNG 포장을 찢고 카드가 뜬다.
4. 보유카드함에 보관: 격자에 카드가 차례로 뜬다.
Flutter에서는 Rive/Lottie로 다시 만들거나 짧은 영상으로 대체해도 된다. 문구는 `GUIDE_PAGES`의 `title`/`body`를 그대로.

## 5. 수치 상수 (그대로 옮길 값)

| 상수 | 값 | 뜻 |
| --- | --- | --- |
| `TP_SEED` | 50,000 | 목업 초기 TP. 실서비스는 0 |
| `EXCHANGE_MIN` | 50 TOTT | 최소 교환 |
| `FILL_MIN_SOL` | 0.01 | 최소 채우기 |
| `GUIDE_REWARD_TP` | 1,000 | 가이드 완주 보상(임시) |
| `RATES_DEFAULT` | tottKrw 1, usdKrw 1400 | 시세 기본값. 1 TP = ₩1 고정 |
| `RATES_INTERVAL` | 5분 | 시세 갱신 주기 |
| `OPEN_CUT` | minDistance 72px, duration 1200ms, cut 150→450ms, flap 400→700ms, rise 600→1100ms, particles 6 | 찢기 자동 완료 타임라인 |
| `TEAR_DIAG_MIN` | 22.5° | 대각선 판정 |
| `tearFromEdge` reach | 0.28 | 가장자리 시작 판정 비율 |
| `PACK_FACE` | left 77/659, top 63/1024, right 579/659, bottom 992/1024 | 포장 이미지(659×1024) 안 앞면 영역 |
| `DECK_FAN` | (-105,16,-18°) (-55,5,-9°) (0,0,0°) (55,5,9°) (105,16,18°) | 부채꼴 5자리 (px, 카드 98px 기준) |
| `SPREAD_GRID` | (-82,-158) (82,-158) (0,0) (-82,158) (82,158) | 2-1-2 자리 (카드 104px 기준) |
| `SPREAD_POP_AT` / `SPREAD_FLIP_AT` | 500ms / 800ms | 포장 터짐 / 뒤집기 시작 지연 |
| 덱 선택 연출 | 1,000ms (reduced motion 240ms) | 포장이 가운데로 떠올라 한 바퀴 |
| 덱→펼침 이동 | 650ms | 포장이 2-1-2 자리로 |
| 배너 자동 넘김 | 3,500ms | |
| 토스트 | 1,600ms | |
| 카드 비율 | 55 : 85 | 포토카드. 포장은 659 : 1024 |

`prefers-reduced-motion`이면 연출을 건너뛴다. Flutter는 `MediaQuery.disableAnimations`.

## 6. 데이터 모델 (localStorage에 있는 모양)

```js
// 상품 (관리자 → 앱, packToProduct())
{ id, artistId, artist, album, eventType, eventName, eventNameKo, eventNameEn,
  cover, price /* TP */, home, displayName, summary,
  cards: [{ no, front, back, member, rarity: "NORMAL"|..., stock }],
  perks, facts: { size, type, state }, guides: { random: [], photocard: [] }, sheetNotes: ["", ""] }

// 보유 카드 (own())
{ id: "UC_n", status: "stored"|"shipping_cart"|..., purchasedOn, artist, album, no, front, member, rarity }

// 구매 기록 (persistPurchase(), photocard-orders-v1)
{ id: "PU_ts", kind: "purchase", status: "paid", purchasedOn, productId, productName, artist, album,
  count: 1|5, price /* TP 합계 */, cards: [{ id, artist, album, no, front, member, rarity }] }

// 지갑 (photocard-wallet-v3)
{ tp, walletId, walletConnected,
  wallets: [{ id, name, full /* 주소 */, balance /* TOTT */, sol, main, connected }],
  exchanges: [{ id: "EX_ts", at, wallet, tott, tp, tpAfter }],
  fills: [{ id, at, wallet, sol, tott }] }

// 시세 (photocard-rates-v1) · 설정 (photocard-rates-config-v1)
{ tottKrw, usdKrw, at, fetchedAt }   { api /* 시세 URL */, tottKrw, usdKrw }

// 온보딩 (photocard-onboard-v1)
{ done, guideSeenAt, guideRewardAt }
```

뽑기는 `draw(item, count)`: 상품 카드 중 **균등 무작위**, 중복 허용, 재고는 목업에서 줄이지 않는다. 실서비스의 확률·재고 규칙은 dev-handoff 4.3~4.5.

## 7. 로컬 저장소 → 서버 대체표

| 키 | 지금 | Flutter에서 |
| --- | --- | --- |
| `photocard-register-v5` | 관리자가 쓴 상품·배너·중간 배너 | 상품/배너 API (DB 설계안 카탈로그·콘텐츠 테이블) |
| `photocard-notices-v1`, `photocard-shipping-policy-v1` | 공지, 배송 정책 | 콘텐츠 API |
| `photocard-orders-v1` | 구매 기록 | 주문 API. 결제는 서버에서 TP 차감과 카드 확정을 한 트랜잭션으로 |
| `photocard-wallet-v3` | TP·지갑·교환·채우기·연결 상태 | 토마톡 지갑 연동. TP 잔액은 서버, 지갑 연결은 토마톡 SDK/딥링크 |
| `photocard-rates-v1`, `-config-v1` | 시세 캐시·시세 URL | 시세 API (5분 갱신) |
| `photocard-onboard-v1` | 온보딩·보상 완료 | 계정 설정(기기 바꿔도 유지되려면 서버) |
| `photocard-addresses-v1` | 배송지 | Ver.02 |
| `photocard-inquiries-v1` | 1:1 문의 | 숨김. 관리자 답변 기능과 함께 결정 |
| 보유 카드(`state.owned`) | 메모리 + 구매 기록에서 복원 | 보유 카드 API |

## 8. 금액·환율 규칙

- TP는 원화 1:1 고정. 상품 가격은 TP로 저장하고 시세와 무관.
- TOTT ↔ TP: `tottToTp = round(tott × tottKrw)`, `tpToTott = tp ÷ tottKrw`.
- 교환 "최대"(TP 기준)는 **내림**(`floor`). 반올림하면 보유 TOTT보다 1 TP 많은 값이 들어가 교환이 막힌다. 손으로 최대값을 치면 환산 오차만큼은 보유량으로 맞춘다.
- 환율 안내 줄: "환율 기본값 · 1 TP = ₩1 · 1 USD = ₩1,400 · 1 TOTT ≈ 1 TP". 시세가 오면 시각을 붙인다.
- 달러 보조 표기는 `amount / usdKrw`, 소수 둘째 자리.
- 교환된 TP는 되돌릴 수 없고 지갑 간 이동 불가(약관 제5조와 교환 안내 사항에 명시).

## 9. 에셋

| 경로 | 용도 |
| --- | --- |
| `service/app/tears/base.png` | 닫힌 포장(투명). `base.jpg`는 검은 배경판 — 쓰지 말 것 |
| `tears/back.png` | 포장 뒷면 |
| `tears/over-1..4.png` | 찢김 띠 4단계(985×259, 기준점 85/259) |
| `tears/over-5.png` | 다 찢긴 포장(방법 1용) |
| `tears/pieces/{top,ul,ur,ll,lr}.png` | 흩어지는 조각 |
| `tears/method-1/` | 통이미지 찢기(현재 미사용, `TEAR_METHOD = 1`) |
| `assets/splash/bg-summon.png`, `emblem-chrome.png`, `orbit.png` | 스플래시 배경·타이틀·궤도 |
| `assets/covers/`, `assets/photocards/`, `assets/profiles/` | 목업 상품 이미지 |
| `service/app/fx/fireworks.mp4`, `splash.mp4` | 개봉 폭죽(현재 꺼둠)·반짝임 |
| 글꼴 | Pretendard Variable (jsDelivr CDN). Flutter는 `pretendard` 패키지나 폰트 파일 동봉 |
| 아이콘 | Phosphor Regular (`icon()` 함수의 path 상수, 256 viewBox). Flutter는 `phosphor_flutter` |

색: 바탕 `#0b0b0d`, 서피스 `#1a1a1d`, 선 `#2a2a2e`, 보조 글자 `#96969d`, 주 버튼 `#e3243b`(핑크/레드), TP 코인 `#8cc63f`. 지갑은 밝은 테마(`.light`), 버튼 `#d8262f`.

## 10. Flutter 매핑 제안

- 라우팅: `state.screen` → `go_router` 경로. 시트(`sheet`, `walletSheet`, 모달)는 `showModalBottomSheet`/`showDialog`.
- 상태: `state` 하나를 Riverpod/Bloc 스토어로. 입력 중 부분 갱신(`syncExchangeForm`)은 `ValueNotifier`로.
- 찢기: `GestureDetector` + `CustomPainter`. 띠 이미지를 `Canvas.drawImageRect`로 각도 회전해 그리고 `clipRect`로 span만 보인다. 불꽃은 파티클 리스트를 `Ticker`로.
- 덱·펼침: `AnimatedPositioned`/`Transform` 체인이면 충분. 뒤집기는 `Transform(alignment: center, transform: Matrix4.rotationY)` + 앞뒷면 두 위젯.
- 워터마크: 서버에서 입힌 이미지를 받는 쪽을 권장. 클라이언트만 하면 `RepaintBoundary`와 `CustomPaint` 겹치기.
- 캐러셀·레일: `PageView`, `ListView.horizontal`.
- 온보딩 데모: CSS 애니메이션 4개는 Rive 또는 짧은 mp4로 교체 권장.

## 11. 미결·주의

- 지갑 전체(연결·잔액·교환·받기·채우기)는 **목업**이다. 실제는 토마톡 지갑 연동으로 바뀐다. 결제 시트의 네 상태와 돌아오기 규칙만 유지하면 된다.
- 시세 URL은 관리자 "시세·환율 설정"에서 넣는다. 응답 `{ tottKrw, usdKrw, at }`.
- 받기 화면의 QR은 자리만 있다.
- 가이드 보상 1,000 TP, 약관 회사명·시행일·청약 철회 조문은 확정 전.
- Ver.02 항목(배송·배송바구니·이벤트·NFT 전체보기·보내기)은 코드가 남아 있거나 "준비 중" 토스트다.
- 관리자 페이지는 접근 제한이 없다. 공개 전 주소를 알리지 말 것.
