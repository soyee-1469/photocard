# 앨범 · 상품(묶음) 분리 계획

확정일: 2026-11-24  
상태: 합의됨 · **손님 화면/데이터 우선, 관리자 UI는 후순위(계획만)**  
개정: 2026-11-24 코드 대조 후 6곳 보정 (커버 상한, `eventType` 이름, 조회 분리, 저장 키, 특전 매핑, `stop` 상태)

---

## 1. 합의된 답

1. **특전(POB 등)도 상품에 체크해서 넣는다.** 특전임이 보이도록 **표기 필드**가 필요하다. 관리자에서 따로 표시 설정을 한다.
2. **목록 이미지는 묶인 커버 전부** 표시한다. 단 **상한 5장**이며, 유닛별 대표 커버(`covers[0]`)를 먼저 올리고 남는 자리에 나머지 커버를 순서대로 채운다. (BLACKPINK DEADLINE처럼 한 유닛에 버전 커버가 5장 넘게 있는 경우가 실제로 있다.)
3. **커버 1개면 1개만** 올린다. (뒷면/`card_back`으로 빈칸 채우지 않음. 현재 `shelfStage`의 3장 자르기 + `card_back` 채우기는 둘 다 제거)
4. **관리자 UI는 후순위.** 지금은 데이터 모델·손님 화면 연동 계획만 고정하고, 관리자 화면은 나중에 구현한다.

---

## 2. 도메인 모델 (3단)

### 2-1. 가수 (Artist)
- 지금과 동일: `id`, 이름, 프로필, 별칭 등.

### 2-2. 앨범/이벤트 유닛 (AlbumUnit) — 등록 단위
카드·재고가 붙는 단위. **수록 앨범**과 **특전**을 같은 구조로 두고, 종류만 구분한다.

```js
{
  id: "cortis-greengreen",           // 안정적 id
  artistId: "cortis",
  name: "GREENGREEN",                // 표시명
  // 주의: 관리자 `pack.kind`는 이미 그룹/개인(group/solo)이고 필터(`kindFilter`)가 그걸 쓴다.
  // 앨범/특전 구분은 기존 `eventType` 필드를 그대로 쓴다. (새 이름 `kind` 금지)
  eventType: "album" | "pob" | "fansign" | "japan" | "unknown",
  // 특전 표기 (관리자에서 설정). eventType만으로 부족할 때 손님에게 보여줄 라벨
  badge: "" | "특전" | "럭키드로우" | "예판특전" | "팬사인" | ...,
  eventName: "",                     // 판매처·행사명 등 (에버라인, 사운드웨이브…)
  covers: ["/assets/covers/...jpg"], // 커버 여러 장 가능, 순서 = 표시 순서
  cards: [                           // 구성 + 재고
    {
      no: "01",
      member: "Martin",
      front: "...",
      back: "...",
      stock: 2,                      // 0 = 품절 (미보유·다 팔림 동일 취급)
      rarity: "NORMAL",
    },
  ],
}
```

규칙:
- **공식 라인업에 있는데 우리가 안 가진 카드** → `stock: 0`으로 슬롯을 두고 상세에 **품절** 표시. 숨기지 않음.
- **가지고 있다가 0이 된 카드** → 같은 `stock: 0` + 품절. 뽑기 제외.
- 특전 유닛도 앨범과 같이 `covers`·`cards`를 가진다. `badge`/`eventType`으로 목록·상세에서 “특전” 표기.

### 2-3. 상품 / 오퍼 (Offer) — 판매·목록 단위
손님이 NEW에서 보는 한 줄(칸). 앨범/특전 유닛을 묶어 만든다.

```js
{
  id: "cortis-random",
  artistId: "cortis",
  albumIds: ["cortis-greengreen", "cortis-greengreen-everline-ld", ...],
  // 묶는 방식 예: 전 유닛 / 수록만 / 수록+특전 일부 / 4개씩 등 — albumIds로 표현
  displayName: "CORTIS Photocard",
  sheets: 50,          // 목록용 장수(카탈로그 숫자, 고정)
  kinds: 21,           // 목록용 종수. 계산할 경우 stock > 0 인 카드 종수 (stock:0 슬롯은 종수에서 제외)
  price: 3500,
  home: true,
  status: "on",        // on | out | soon | stop | draft  (현재 saleOf가 stop도 처리함)
}
```

파생 필드(저장하지 않고 계산):
- `covers` = ① `albumIds` 순서로 각 유닛의 `covers[0]`, ② 남는 자리에 각 유닛의 나머지 커버를 순서대로. **상한 5장**(`SHELF_COVER_MAX = 5`). 현재 `SHELF_SLOT_COUNT = 3` 자르기는 이 상한으로 대체.
- `cards` = 묶인 유닛 카드 합. 상세 구성·뽑기 풀.
- 유닛별 `badge`가 있으면 상세 섹션/슬롯 그룹 헤더에 특전 표기.

---

## 3. 손님 앱 동작

### 목록 (NEW, 2열 매대 유지)
- `offer.covers` 길이만큼 선반에 올림.
- 1장이면 1장만 (+ 기존처럼 `?` 오버레이는 유지할지 제품 결정 — 현재는 유지).
- 4장이면 4장 자동. 빈칸 `card_back` 채움 **안 함**. (`shelfStage`의 `while (boxes.length < SHELF_SLOT_COUNT)` 줄 삭제)
- `.shelf-boxes` CSS가 1~5장에서 모두 맞는지 확인 (지금은 3장 기준).

### 상세
- 구성 = 묶인 유닛 카드 전부.
- 가능하면 **유닛(앨범/특전)별 그룹**으로 나누고, 특전이면 `badge` 표시.
- `stock === 0` → 품절 뱃지, 추첨 제외.
- 안내 문구 유지: 「현재 재고 기준이며 품절 카드는 뽑히지 않아요.」

### 뽑기
- `drawableCards` = stock 추적 중이며 stock > 0 인 카드만.

---

## 4. 관리자 (후순위 · UI는 나중에)

구현 순서는 손님/데이터 다음. UI 스케치만:

| 화면 | 역할 |
| --- | --- |
| 가수 | 기존 |
| 앨범/이벤트 | 유닛 CRUD. 커버 다중 업로드·순서. `kind` + **특전 표기(`badge`)** 필수 입력란. 카드·재고 편집 |
| 상품 | 가수 선택 → 유닛 체크리스트(수록/특전 구분·badge 보이게) → 가격·홈·상태. 미리보기에 커버 N장 |

로컬스토리지 키 버전 bump (예: `photocard-register-v6`).  
**손님 앱도 같은 키를 읽는다**: `service/app/app.js`에 `photocard-register-v5`가 두 곳 하드코딩돼 있어 관리자만 올리면 앱이 등록 데이터를 못 읽는다. 키 상수를 공유 파일로 빼고 양쪽을 같이 올린다.  
구 `pack` → `albumUnit` 1개 + `offer` 1개로 마이그레이션. `pack.kind`(group/solo)는 유닛이 아닌 가수 속성이므로 유닛으로 옮기지 않는다.

---

## 5. 현재 코드와의 연결 (우선 구현 시)

지금은 임시로 `STOCK_PRODUCTS` / `SHELF_GROUPS`가 상품+커버를 한곳에 둠.

**기준 코드 먼저 정리**: `build-stock-catalog.py`와 `service/shared/stock-catalog.js`는 커밋된 적이 없고 `stash@{0}`에만 있다. HEAD(`feat/home-2sections`)는 `SHELF_GROUPS`를 `app.js`에 인라인으로 둔다. 0단계로 스태시의 스크립트·공유 카탈로그를 되살려 커밋하고, 그 위에서 아래를 진행한다.

단계적 이행:
1. **공유 카탈로그**를 `ALBUM_UNITS` + `OFFERS`로 쪼개 생성 (`build-stock-catalog` 확장).  
   - 스캔 재고 → 유닛(앨범/특전) + 카드 stock  
   - 커버는 기존 `assets/covers/{GROUP}/` + 유닛 매핑  
   - 오퍼는 지금처럼 그룹당 1개(전 유닛 묶음)로 시작해도 됨  
2. **손님 앱**이 `OFFERS`에서 `covers`/`cards`를 계산해 목록·상세 사용.  
   - **등록 데이터 조회 분리**: 지금은 `listed`·`saleOf`·`packCards`가 모두 `registerPack(item.id)` 한 경로로 상품 id를 찌른다. 나눈 뒤에는 노출·판매 상태(`home`/`status`)는 **오퍼 id**로, 카드·재고(`cards`/`stock`)는 **유닛 id들**로 각각 조회한다. `drawableCards`는 유닛 카드 합 위에서 그대로 동작.  
3. 관리자 UI는 후순위 — 그때 `register`가 같은 스키마로 읽고 쓰게 연결.

---

## 6. 범위 밖 / 나중에
- 관리자 다중 업로드 UX, CDN 업로드
- 시세 연동, 결제 DB
- 공식 미보유 라인업을 시트 없이 자동 추정 (수동 `stock:0` 슬롯이 기본)

---

## 7. 구현 착수 시 체크리스트 (손님·데이터 우선)
- [ ] `ALBUM_UNITS` / `OFFERS` 스키마로 `stock-catalog` 재생성
- [ ] 유닛 `eventType`은 시트 `구분`(일반→album, 특전→pob)에서 자동. `badge`·`eventName`·유닛 id는 시트에 열이 없고 `앨범/버전` 자유 텍스트에만 있으므로, 빌드 스크립트 안에 **`제품번호 → {unitId, badge, eventName}` 수동 매핑 표**를 두고 채운다 (161행 중 특전 41행)
- [ ] 목록 커버: 유닛 대표 커버 우선 + 상한 5, `SHELF_SLOT_COUNT` 자르기와 `card_back` 채우기 제거, 1~5장 CSS 확인
- [ ] 손님 앱 조회 분리: `home`/`status`는 오퍼 id, `cards`/`stock`은 유닛 id
- [ ] 저장 키 bump는 관리자·앱 동시에 (공유 상수)
- [ ] 목록: 묶인 커버 전부, 1개면 1개
- [ ] 상세: 유닛 그룹 + 특전 표기 + 품절
- [ ] 관리자 UI는 이 문서만 기준으로 후속 작업
