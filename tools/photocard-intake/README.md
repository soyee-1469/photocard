# 포토카드 스캔 정리·재고 관리 (Mac 로컬 도구)

배포하지 않는다. Mac에서만 돌고, 관리자 화면(service/register)은 건드리지 않는다.

## 실행

```sh
node tools/photocard-intake/server.js
```

브라우저에서 http://localhost:4178 을 연다. 처음 실행하면 분석기(helper/vision.swift)를 swiftc로 한 번 컴파일하고(30초쯤), 기존 카드 이미지 147장을 분석해 둔다. 추가 설치는 없다. macOS Vision 프레임워크(OCR, 얼굴 감지, 이미지 특징)만 쓴다.

## 흐름

1. 스캐너 저장 폴더를 고르고 「새로고침」. 새 파일만 분석한다.
2. 파일명은 보지 않는다. 얼굴·색 분포·기존 카드와의 유사도로 앞면/뒷면을 판정하고, 스캔 순서에서 앞면 다음 뒷면을 한 짝으로 묶는다.
3. 묶이지 않은 스캔은 아래 목록에서 두 장을 골라 「짝 확정」(먼저 고른 것이 앞면).
4. 짝마다 양면 OCR + 기존 카드 이미지 대조로 가수·앨범·멤버 후보와 근거를 보여 준다. 없으면 「인터넷 조회」(MusicBrainz·Wikidata, 키 없음)로 가수·멤버·앨범을 찾아 「가수 목록에 넣기」하거나, OCR 키워드로 Google·네이버·나무위키 검색 링크를 열고 직접 입력한다.
   - data/identified.json 에 스캔 파일명(앞면)별로 가수·앨범·멤버와 근거·출처를 적어 두면 「직접 식별」 후보로 맨 위에 올라오고 폼이 채워진다.
5. 「이 카드 등록」. 앞뒷면이 모두 있어야만 등록된다. 원본 스캔은 그대로 두고 복사본만 data/cards/에 둔다.
6. 재고 탭에서 수량·멤버·버전·등급을 고치고, 「관리자 포맷으로 내보내기」로 data/export/<시각>/packs.json + 이미지를 만든다. 필드는 DB 초안 cards 컬럼과 같다.

## 저장 위치 (git에 올리지 않음)

- data/settings.json: 폴더 경로
- data/analysis.json, reference.json: 분석 캐시
- data/intake.json: 짝, 완료 표시
- data/inventory.json: 등록한 카드와 직접 입력한 가수 (관리자 가수에 멤버·앨범을 보탤 때도 여기)
- data/identified.json: 직접 식별한 스캔 (근거·출처 포함)
- data/lookup.json: 인터넷 조회 캐시 (7일)
- data/cards/<id>/front.jpg, back.jpg: 등록된 카드 이미지 복사본
