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

---

## 12. 2026-11-24 변경 요약 (오전, `main`에 반영됨)

### 전달 범위 (2026-11-24)
- **사용자 앱만** 넘긴다. 관리자(`service/register/`)는 이번 전달에서 제외하고 별도로 정리한다.
- 필요한 폴더: `service/app/`(화면), `service/shared/`(카탈로그 `stock-catalog.js` + 공용 `common.js`), `assets/`(covers · groups · photocards · profiles · fx · splash). `service/app/fx/`, `service/app/tears/`는 개봉 연출용 이미지·영상.
- `service/shared/stock-catalog.js`는 생성 파일이다. 다시 만들려면 `service/scripts/build-stock-catalog.py`와 저장소 밖의 600dpi 스캔 원본 폴더(`포토카드 스캔/`, gitignore)가 필요하다. 전달본에는 결과물만 있으면 된다.
- 로컬 확인: 저장소 루트에서 `python3 -m http.server 8080` → `http://127.0.0.1:8080/service/app/`.

> 아래는 이날 `service/app/`(고객 목업)에 들어간 **동작·데이터·결정**이다. HTML/JS는 참고 구현이고, 아래 규칙대로 Flutter에서 다시 만들면 된다. 화면 모양은 같은 브랜치의 커밋 메시지와 이 문서로 판단한다.

### 데이터
- `service/shared/stock-catalog.js`가 상품 원본이다(빌드 스크립트 `service/scripts/build-stock-catalog.py`가 재고표 스냅샷에서 생성). API로 바꿀 때 아래 세 덩어리를 그대로 모델로 옮긴다.
  - `SHELF_GROUPS[]`: 가수별 랜덤 상품 1개씩. `id, artistId, artist, kinds(구성 종수), price(원), groupPhoto, covers[](앨범 커버 경로)`. `sheets`는 더 이상 화면에 쓰지 않는다.
  - `ALBUM_UNITS[]`: 앨범/특전 유닛. `id, artistId, name, eventType(album|pob|fansign|unknown), badge, eventName, covers[]`. `eventType === "pob"`(특전)은 **랜덤 상품에 안 들어간다**(별도 고가 상품 예정). 유닛은 그 상품을 위해 남겨 둔다.
  - `STOCK_PRODUCTS[]`: 상품 카드 목록. 카드 `no, member, front, back(스캔 파일명), stock, unitId(소속 유닛), album(유닛 표시명)`. 특전 카드 제외.
- `service/shared/common.js`: 두 앱 공용 헬퍼(이스케이프·날짜·이름·가수 사전·프로필 사진). Flutter에서는 상수 파일 하나.
- 이름 표기: 재고표의 `?`, `(추정)`, 밑줄은 손님 화면에 안 나온다(빌드 시 제거). 카드의 `album`은 유닛 표시명이다.
- 자산: `assets/groups/*.jpg`(가수 배너용 단체 사진, 1200px), `assets/covers/{GROUP}/`(앨범 커버), `assets/photocards/`(카탈로그가 참조하는 스캔만, 긴 변 1000px). 600dpi 원본은 저장소 밖.

### 종수·품절 규칙 (결정)
- 목록의 숫자는 **지금 뽑힐 수 있는 종수**(재고 있는 종)다. 한 종이 완전히 품절되면 줄어드는 게 맞다. 재고 수량(장수)은 어디에도 안 보여준다.
- 상세: `N종 중 랜덤 1장`. 품절이 생기면 `· 지금 M종 뽑기 가능`을 덧붙인다. 품절 카드는 흐리게 + "품절" 뱃지, 추첨에서 제외.
- 공식 라인업(우리가 안 가진 카드)은 아직 데이터가 없다. 들어오면 상세 구성에 자리표시 + "품절·미보유"로 그린다(공식 이미지 사용 금지).
- 뽑기 가능 종수가 **2종 미만이면 자동 판매중지** — 결정만 됐고 미구현.

### 홈
- 상단 이벤트 배너는 뺐다. 순서: 프로필 레일 → 아티스트별 랜덤 → 앨범별 랜덤(아래 비교 섹션들) → 이용 방법 안내 → 관리자 중간 배너.
- **아티스트별 랜덤**: 1열 16:9 배너. 단체 사진(블러) 위에 그룹명(20px 800) → `N종 랜덤` → 가격(흰색) → 구성 앨범(한 줄에 하나, 얇게). 오른쪽 아래 물음표 카드 84px.
- **앨범별 랜덤 = 선반 커버플로우** (확정). 글자(그룹명 22px → `N종 랜덤` → 가격 `N,NNN TP` → 구성 앨범 한 줄씩)가 왼쪽 40%, 오른쪽에 검정 널빤지(7px)·받침대 2개 위에서 도는 순환 캐러셀(최대 폭 300px, 왼쪽으로 20% 당겨 글자 밑까지 들어감). 물음표 카드(77px)는 첫 앨범 왼쪽 아래에 겹친다.
  - 배치: 정면 1장 + 왼쪽 1장 + 오른쪽 나머지. 왼쪽으로 밀려난 장은 보이지 않는 구간에서 오른쪽 끝으로 돌아온다(무한 순환). 기울기 48°(정면도 -8° 기본), 크기 0.82배, 어둡기 0.58배. 간격은 가장 넓은 커버 폭의 72% 이상.
  - 1장이면 같은 커버 3장, 2장이면 두 커버를 번갈아 4장으로 채워 순환시킨다(글줄의 종수·앨범명이 실제 구성을 알려 준다).
  - 손을 떼면 가장 가까운 칸에 스냅(0.36s), 빠른 튕김은 한 칸 더. 끄는 중의 탭은 상세로 가지 않는다.
  - 상세 히어로도 같은 선반 캐러셀(폭 전체, 높이 212px). 아티스트 배너에서 들어오면 단체 사진 히어로.
- 공통: 커버는 앞면 + 좌우 옆면(3D 두께) 상자. 끄는 중의 탭은 상세로 안 간다. 커버가 모자라도 카드 뒷면이나 가짜 자리표시로 채우지 않는다(결정). 양옆 여백 16px.
- 프로필 레일·전체 아티스트에서 가수를 누르면 **그 가수 랜덤 상품 상세로 바로** 간다. 상품 없는 가수만 예전 앨범 목록 화면.

### 상세
- 히어로는 진입한 목록과 같은 부품(아티스트 사진 / 선반 / 커버플로우 / 회전)을 더 크게. 1종이면 커버 확대.
- 상품명 아래 구성 앨범을 한 줄에 하나씩. 구성 섹션은 유닛별로 나누고 헤더는 유닛 이름 + 종수(썸네일 없음).

### 남은 일 / 판단 보류
- 공식 라인업 입력 방식, 2종 미만 자동 판매중지 구현, 특전 별도 상품, 캐러셀 첫 노출 때 '넘길 수 있다'는 힌트(peek) 연출.
- 넓은 폰 대응(콘텐츠 폭 430px 상한 + 히어로 최대 높이) — 제안만 됨.
- UI/UX 점검에서 나온 터치 영역(44px)·11px 글자·드로어 닫기 버튼 크기.

## 13. 2026-11-24 변경 요약 (오후, `main`에 반영됨)

> 전달 기준은 `main`이다(배포: https://photocard-kappa-nine.vercel.app/service/app/). 이날부터 PR 없이 main에 바로 올린다.

### 등급 (결정: 손님에게 안 보여줌)
- 재고표에 `등급` 열이 생겼고 카탈로그 카드에 `rarity`(NORMAL | RARE | SPECIAL)가 들어 있다. 특전(pob)은 SPECIAL, 중고 시세 상위 10장은 RARE, 나머지 NORMAL.
- **화면에는 어디에도 등급을 표시하지 않는다.** 기준이 운영자 판단이라 팬이 보면 애매하다는 이유. 내부 데이터로만 쓴다. 참고 구현은 `SHOW_RARITY = false` 스위치 하나로 뽑기 결과·상세 구성·보유 카드 상세의 뱃지와 등급 행을 전부 끈다.
- **추첨 확률은 전부 같다**(재고 있는 종류당 동일 확률). 등급·시세 가중치는 넣지 않는다. 재고가 거의 1장씩이라 재고 비례와 차이가 없고, 확률을 공개할 근거가 아직 없기 때문.
- 나중에 켤 때의 조건: 공식 한정판처럼 밖에서 확인되는 기준으로 RARE를 정하고, 가중치를 쓰면 상세에 등급별 확률을 한 줄로 공개한다.

### 구매 내역 (`purchases`)
- 줄 하나 = 주문 하나. 썸네일은 상품 커버가 아니라 **받은 카드**: 첫 카드의 뒷면을 오른쪽 아래(16px, 10px, 8° 회전)에 깔고 그 위에 **앞면**(42×65, 모서리 5px, 그림자). 썸네일 칸 60×76. 여러 장이면 오른쪽 위에 `+N`(나머지 장수) 알약.
- 앞면은 보유 카드와 같은 보호 처리(흐림 + 워터마크 캔버스). 뒷면은 그대로.
- 글줄: 날짜 → 상품명 → `N장 · 멤버, 멤버…`(뽑힌 카드의 멤버 이름) → 오른쪽에 가격(TP, 아래 원화·달러).
- 탭: 1장 주문은 그 카드의 보유 카드 상세로, 여러 장 주문은 보유 카드 화면을 그 가수로 걸러서 연다.
- 상단 기간 칩: `1주일 · 1개월 · 6개월 · 1년 · 전체`(기본 전체). 구매일 기준, 오늘에서 빼서 자정 경계 없이 날짜 문자열로 비교. 비면 "이 기간에는 구매 내역이 없어요."
- 주문 레코드의 `cards[]`에 `front, back`(스캔 파일명)을 함께 저장한다(§6 모델에 추가). 서버에서는 주문에 카드 id만 두고 조인해도 된다. 예전 주문처럼 파일명이 없으면 같은 가수·카드 번호로 카탈로그에서 찾는다.

### 보유 카드 (`album`)
- 격자가 3열 → **2열**(열 간격 16, 행 간격 12). 칸마다 **앞면·뒷면을 나란히**(간격 4px, 각 55:85 비율). 뒷면 파일이 없는 카드(데모)만 앞면 하나.
- 뒷면 찾기: 같은 가수에서 카드 번호가 같은 카탈로그 카드의 `back`. 유닛명이 같은 것을 우선, 없으면 번호만으로.

### 상세 구성의 품절 칸
- 이미지 투명도 0.32 + 흑백, 이름 글자 회색(#6f6f76). 칸 가운데(위 42%)에 `품절` 도장: 빨간 테두리 2px(#ff5b5b), 글자 #ff7676 14px 800, 자간 0.12em, -10° 회전, 반투명 검정 배경, 그림자. 추첨 제외는 전과 같다.

### 결제 시트
- 상품 이미지를 뺐다. 가수 프로필(원형) + 상품명 + 가격(TP)과 지갑 잔액만. 지갑 미연결이면 연결 시트가 먼저.

### 이용 가이드
- 데모 화면 속 가수 사진(2페이지 결제 배경, 3페이지 뜯은 카드, 4페이지 보유 카드 예시)은 **블러 7px + 1.12배 확대**. 1페이지의 선반 캐러셀(앨범 커버)은 홈과 같으므로 블러 없음.

### 홈·에셋 잔손질
- 홈 스크롤 영역은 가로 스크롤 금지(`overflow-x: hidden`), 캐러셀 줄도 넘친 부분을 자른다. 캐러셀 오른쪽 앨범이 화면 밖으로 나가면서 화면 전체가 옆으로 밀리던 문제의 수정이다. Flutter에서는 캐러셀 줄을 clip 하면 된다.
- BTS 정사각형 ARIRANG 커버(1400×1400)는 삭제. BTS 선반은 Rooted in Music · Rooted in Korea · Living Legend 세 장, 경복궁 유닛 대표 커버는 Rooted in Korea.

### 저장소에 함께 들어간 것 (전달 범위 밖)
- `tools/photocard-intake/`: 운영자가 Mac에서 스캔 파일을 짝지어 재고표 초안을 만드는 로컬 도구(Node + Swift Vision). 앱과 무관하고 배포하지 않는다. `README.md` 참고.
- `service/register/`(관리자)는 여전히 이번 전달에서 제외.

### 공식 라인업 (데이터만 받고 화면은 보류)
> **2026-11-24 보류**: 아래 표시(`공식 N종 중 M종 보유`, 미보유 자리표시)는 `SHOW_OFFICIAL_LINEUP = false`로 꺼 두었다. 미보유 카드를 빈 칸으로 둘지, 실물 사진을 구해 넣고 품절로 둘지 결정 뒤 켠다. 재고표 `공식종수` 열과 `officialKinds`는 그대로 쓴다.
- 재고표에 `공식종수` 열을 추가했다. 앨범/버전(유닛)의 공식 포토카드 전체 종수를 숫자로 적는다. 같은 유닛의 어느 줄에 적어도 되고, 빌드가 유닛별 최댓값을 `ALBUM_UNITS[].officialKinds`로 올린다. 비어 있으면 0(= 기능 꺼짐).
- 상세 구성의 유닛 헤더: `officialKinds`가 보유 종수보다 크면 `N종` 대신 **`공식 N종 중 M종 보유`**. 그 아래 구성 칸 뒤에 모자란 수만큼 **빈 자리표시**(앞·뒷면 모양의 점선 칸 두 개 + `미보유`). 공식 이미지는 쓰지 않는다.
- 목록의 종수와 `N종 중 랜덤 1장`은 그대로 **보유 종수** 기준이다. 공식 종수는 상세 유닛 헤더에만 나온다.
- 빠진 카드의 멤버 이름은 안 보여준다(표만 늘고 문의가 는다는 판단).

### 2종 미만 자동 판매중지 (구현)
- 재고를 추적하는 상품에서 **뽑을 수 있는 종류(재고 > 0인 카드 수)가 2종 미만**이면 상품 상태가 자동으로 `stop`(판매중지)이 된다. 상수 `MIN_DRAWABLE_KINDS = 2`. 관리자가 상태를 직접 정해 둔 상품은 그 값이 우선.
- 홈 선반 줄과 아티스트 배너: `N종 랜덤` 자리에 빨간 `판매중지`, 이미지(캐러셀·단체 사진·물음표 카드)는 투명도 0.45 + 흑백. 탭하면 상세로는 간다.
- 상세: 뽑기 버튼이 비활성 `판매중지`로 바뀌고, 안내 줄은 `N종 중 랜덤 1장 · 뽑을 수 있는 종류가 M종뿐이라 판매를 멈췄어요`. 결제 시트는 열리지 않는다.
- 서버에서는 주문 확정 시 같은 규칙을 다시 검사해야 한다(화면 상태만 믿지 않기).

### 품절 표시 (최종)
- 빨간 도장은 뺐다. 품절 칸은 이미지 투명도 0.32 + 흑백, 이름 옆에 `· 품절`, 글자 회색(#6f6f76). §13 앞부분의 도장 설명은 무효.

### 남은 결정
- 특전 별도 상품(SPECIAL): 묶음 단위(앨범별/가수별)와 가격 미정. 캐러셀 peek 힌트, 넓은 폰 콘텐츠 폭 상한, 터치 영역 44px.
