# 포토카드 DB 설계안 (Supabase)

2026-10-20 초안. 구현 전 승인 필요. 이 문서가 데이터 기준이다.

## 왜 지금 정하나

지금은 데이터가 브라우저 저장소(localStorage)에 흩어져 있다.

| 지금 키 | 내용 | 문제 |
|---|---|---|
| `photocard-register-v5` | 가수, 팩, 카드, 배너 (관리자) | 이 브라우저에서만 보임 |
| `photocard-orders-v1` | 구매, 배송 주문 (서비스·관리자 공용) | 같은 브라우저·같은 주소일 때만 공유됨 |
| `photocard-shipping-policy-v1` | 배송정책 | 〃 |
| `photocard-notices-v1` | 공지 | 〃 |
| `photocard-addresses-v1` | 배송지 | 〃 |

관리자와 서비스가 **같은 DB를 보고**, 관리자가 바꾼 게 서비스에 바로 보여야 한다. 그래서 초반에 테이블을 빠짐없이 정한다.

## 원칙

1. 빠뜨리면 나중에 마이그레이션이 제일 비싸다. 지금 화면에 있는 값은 전부 테이블로 옮긴다.
2. 주문 시점 값은 스냅샷으로 남긴다. 상품을 나중에 고쳐도 지난 주문이 바뀌면 안 된다.
3. 잔액은 숫자를 직접 고치지 않는다. 거래 기록(원장)의 합으로 본다.
4. 이미지는 DB에 넣지 않는다. Storage에 파일, DB에는 경로만.
5. 삭제는 지우지 않고 숨긴다(휴지통·내역 보존).
6. 관리자/일반 사용 권한을 처음부터 나눈다(RLS).

---

## 테이블 목록

### 카탈로그

| 테이블 | 핵심 컬럼 | 비고 |
|---|---|---|
| `artists` | id, slug, kind(group/solo), group_id→artists, name_ko, name_en, aliases, profile_image_path, emblem_path, sort, deleted_at | 개인(solo)은 소속 그룹 연결. "미분류(holding)"도 한 행으로 둔다 |
| `artist_members` | artist_id, name, sort | 그룹 멤버. 개인은 본인 1행. 카드의 멤버는 여기서만 고른다 |
| `albums` | artist_id, name, name_ko, name_en, jacket_image_path, sort | 가수 등록 때 앨범+자켓을 같이 올리는 지금 방식 그대로 |
| `packs` | id, artist_id, album_id, event_type(album/pob/fansign/japan/unknown), event_name, event_name_ko/en, cover_image_path, price_tott, status(draft/on/out/soon), home(bool), sort, sale_start_at, sale_end_at, deleted_at, created_at, updated_at | 상품. 판매 전 필수값 검사는 `draft→on` 전이 때 서버에서 확인 |
| `cards` | pack_id, no, member_id→artist_members, front_image_path, back_image_path, version(unset/standard/compact/weverse/japan/pob), rarity(NORMAL/RARE/SPECIAL), stock(미입력=null), weight, management_code(unique) | 팩 안 슬롯. 재고 0이면 추첨 제외. 관리코드는 가수+앨범+번호로 생성 |

### 콘텐츠

| 테이블 | 핵심 컬럼 |
|---|---|
| `banners` | place(top/mid), image_path, line1, line2, link_type(product/artist/all/album/notice/url/none), pack_id?, url?, is_on, starts_on, ends_on, sort |
| `notices` | scope, category, title, body, body_en, pack_id?, starts_on, ends_on, pinned, popup, deleted_at |
| `shipping_policy` | 단일 행. max_cards, card_weight_g, keep_days |
| `shipping_zones` | country, zone_label, method, supports_tracking, fee_w100, fee_w250, fee_w500, eta_days |
| `shipping_weight_bands` | label, from_cards, to_cards, weight_g |

### 사용자·구매

| 테이블 | 핵심 컬럼 | 비고 |
|---|---|---|
| `profiles` | id→auth.users, display_name, role(user/admin), created_at | 로그인은 Supabase Auth |
| `wallets` | user_id(pk), balance_tott | 원장과 함께 트랜잭션으로만 변경 |
| `wallet_transactions` | user_id, delta, reason(purchase/refund/admin/test_charge), ref_id, balance_after, created_at | TOTT 원장. 기록 삭제 금지 |
| `purchases` | user_id, pack_id, count, unit_price_tott(스냅샷), total_tott, status(paid/cancelled/refunded), purchased_at | 결제 1건 |
| `user_cards` | user_id, card_id→cards, purchase_id, status(stored/shipping_cart), acquired_at | 뽑은 카드 한 장 = 한 행. 중복 당첨은 행이 2개 |
| `draws` | purchase_id, seq, card_id, user_card_id, drawn_at | 추첨 기록. 재고 차감과 한 트랜잭션 |
| `wishes` | user_id, pack_id, created_at | 찜 |
| `addresses` | user_id, receiver, phone, email, country, region, postcode, address, address_detail, city, province, is_default | 배송지 |

### 배송

| 테이블 | 핵심 컬럼 | 비고 |
|---|---|---|
| `shipments` | user_id, status(shipping_requested/preparing/ready/shipped/delivered), receiver·phone·email·country·postcode·address(스냅샷), carrier, carrier_name, tracking, fee_tott, fee_text, method, requested_at, shipped_at, delivered_at, memo, is_problem, exception(delay/return/cancel) | 배송 요청 1건 |
| `shipment_items` | shipment_id, user_card_id, card_snapshot(json) | 어떤 실물 카드를 보냈는지 |
| `shipment_histories` | shipment_id, status, changed_by, created_at | 상태 변경 이력. 관리자 실수 추적용 |

### 공통

- 모든 테이블: `created_at`, `updated_at`.
- 지우는 대신 `deleted_at`(팩 휴지통, 공지, 가수).
- `audit_logs`(관리자, 대상, 변경 전후 json, 시각)는 여유 있으면 1차에 넣는다. 없어서 후회하는 대표 항목이다.

## 관계 그림

```text
artists ─< artist_members
artists ─< albums
artists ─< packs ─< cards
packs ─< purchases ─< draws ─< user_cards >─ cards
profiles ─< purchases / user_cards / wishes / addresses / shipments
shipments ─< shipment_items >─ user_cards
shipments ─< shipment_histories
wallets ─< wallet_transactions
banners / notices / shipping_* (독립)
```

## 상태값 (지금 코드 기준, 임의로 늘리지 않음)

- 팩: `draft` 등록중 · `on` 판매중 · `out` 품절 · `soon` 입고예정
- 카드 등급: `NORMAL` · `RARE` · `SPECIAL`
- 배송: `shipping_requested` 신규 · `preparing` 준비중 · `ready` 발송대기 · `shipped` 배송중 · `delivered` 완료. 문제 주문은 상태가 아니라 `is_problem` + `exception` 플래그 (지금 관리자 필터가 그렇게 본다)

## 꼭 지켜야 하는 규칙

1. **추첨은 서버에서 한 번에.** 재고 확인 → 가중치 추첨 → 재고 차감 → `user_cards` 생성을 한 트랜잭션(RPC)으로. 재고 0·중복 차감 방지.
2. **구매도 한 번에.** 잔액 확인 → 원장 기록 → 구매 생성 → 추첨. 잔액 부족이면 전체 취소.
3. **판매 전 검사.** 커버, 가격, 카드 앞뒷면이 없으면 `on`으로 못 바꾼다(지금 관리자의 "막힌 이유" 목록을 서버 규칙으로).
4. **스냅샷.** 구매 가격, 배송지, 보낸 카드 정보는 주문에 복사해 둔다.
5. **권한(RLS).**
   - 누구나: 판매중 팩·카드·배너·공지 조회
   - 본인만: 내 카드, 지갑, 주소, 구매·배송
   - 관리자(role=admin)만: 카탈로그 수정, 주문 상태 변경, 정책·공지
6. **이미지.** Storage 버킷 `covers` `profiles` `photocards` `banners`에 올리고 경로는 `/{pack-id}/{file}` 식. 지금처럼 data URL을 저장소에 넣지 않는다.
7. **검색.** 가수 이름은 ko/en + 별칭(aliases)까지 검색되게 한다.

## 지금 데이터 옮기기

- `service/register/data.js`의 SEED와 `service/app/app.js`의 PRODUCTS가 같은 상품을 따로 들고 있다. DB가 유일한 원본이 되면 둘 다 DB 조회로 바꾼다.
- `/assets/` 이미지 156장은 Storage로 올리고, 파일명을 경로로 연결한다.
- 목업 주문·보유 카드는 시드로 넣되, 실제 사용자 데이터처럼 보이지 않게 테스트 계정 소유로 표시한다.

## 진행 순서 (승인 후)

1. Supabase 프로젝트 + 위 테이블/RLS + Storage 버킷
2. 시드 이전 (가수·앨범·팩·카드·이미지)
3. 관리자 읽기/쓰기를 DB로 교체 (localStorage 제거)
4. 서비스 카탈로그를 DB 조회로 교체
5. 구매·추첨·지갑을 RPC로
6. 배송·정책·공지를 DB로, 관리자-서비스 공유 확인
7. 로컬/배포에서 끝까지 한 번씩 눌러 보고 스크린샷

## 노출 단위 (2026-11-16 결정)

상품(팩)은 가수별·앨범별로 등록하지만, 앨범별 상품이 아직 적어서 **당분간 손님에게는 가수 단위로 묶어 노출**한다.

- 가수 하나 = 상품 하나. 노출(`home`) 팩 중 판매중(`on`)인 팩의 카드를 한 풀에 모아 그중 랜덤 1장.
- 가격은 묶인 팩 중 가장 높은 값. 커버는 첫 판매중 팩의 커버.
- 뽑은 카드는 원래 팩의 앨범으로 기록한다(`user_cards.card_id`가 팩을 가리키므로 DB에서는 자연히 그렇게 된다).
- 코드에서는 `service/app/app.js`의 `GROUP_BY_ARTIST`로 켜고 끈다. 앨범별로 따로 팔 때가 되면 false. 테이블 구조는 바꿀 것 없다.
- DB에서는 묶음을 저장하지 않는다. 조회 때 `packs`를 `artist_id`로 묶으면 된다. 구매 기록(`purchases.pack_id`)은 실제 뽑힌 카드의 팩을 가리킨다.

## 정해야 할 것

1. 로그인: 토마톡 계정을 붙이기 전까진 이메일 로그인? 테스트 계정만?
2. TOTT: 지금처럼 테스트 잔액(지갑 연결 시 500) 유지?
3. 실물 재고: 카드 슬롯별 개수(stock)만으로 충분? 개별 실물 카드 한 장씩 관리할 필요는 없는지.
4. 배송비: 정책표(무게 구간)대로 자동 계산? 지금처럼 관리자가 문구로 적는 방식 유지?
