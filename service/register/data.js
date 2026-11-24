const ARTISTS = [
  { id: "cortis", name: "CORTIS", kind: "group", members: [] },
  { id: "seventeen", name: "SEVENTEEN", kind: "group", members: [] },
  { id: "twice", name: "TWICE", kind: "group", members: [] },
  { id: "blackpink", name: "BLACKPINK", kind: "group", members: ["지수", "제니", "로제", "리사"] },
  { id: "bts", name: "BTS", kind: "group", members: [] },
];

const HOLDING_ID = "holding";

const PROFILE_PHOTOS = {
  blackpink: "/assets/profiles/blackpink.jpg",
  bts: "/assets/profiles/bts.jpg",
  cortis: "/assets/covers/CORTIS/01_CORTIS_GREENGREEN_cover.jpg",
  seventeen: "/assets/covers/SEVENTEEN/02_SEVENTEEN_HAPPY_BURSTDAY_cover.jpg",
  twice: "/assets/covers/TWICE/05_TWICE_THIS_IS_FOR_cover.jpg",
};

const ALIASES = {
  cortis: ["코르티스"],
  seventeen: ["세븐틴", "svt"],
  twice: ["트와이스"],
  blackpink: ["블랙핑크"],
  bts: ["방탄", "BTS", "방탄소년단"],
};

const ARTIST_I18N = {
  cortis: { ko: "코르티스", en: "CORTIS", aliases: "cortis, 코르티스" },
  seventeen: { ko: "세븐틴", en: "SEVENTEEN", aliases: "세븐틴, svt" },
  twice: { ko: "트와이스", en: "TWICE", aliases: "트와이스" },
  blackpink: { ko: "블랙핑크", en: "BLACKPINK", aliases: "블랙핑크" },
  bts: { ko: "방탄소년단", en: "BTS", aliases: "방탄, BTS" },
};

const EVENT_TYPES = [
  { id: "album", label: "앨범 수록" },
  { id: "pob", label: "사전예약 특전" },
  { id: "fansign", label: "팬사인 / 영상통화" },
  { id: "japan", label: "일본반 특전" },
  { id: "unknown", label: "기타" },
];

const VERSIONS = [
  { id: "unset", label: "미정" },
  { id: "standard", label: "일반" },
  { id: "compact", label: "컴팩트" },
  { id: "weverse", label: "위버스" },
  { id: "japan", label: "일본반" },
  { id: "pob", label: "특전" },
];

const RARITIES = ["NORMAL", "RARE", "SPECIAL"];

const PACK_FIELDS = [
  ["활동", "그룹인지 개인인지. 앱 화면에는 안 나온다"],
  ["가수명", "프로필 옆에 나오는 이름"],
  ["앨범명", "상품명에 들어간다. 목록은 가수명 앨범명 - 포토 세트"],
  ["행사 종류", "앨범 수록, 특전, 팬사인, 일본반, 미확인"],
  ["행사명", "있으면 상품명에 붙는다"],
  ["상품 이미지", "NEW, 앨범, 상세에 나오는 이미지. 카드 앞면으로 대신하지 않음"],
  ["가격", "앱에 N TOTT로 나온다"],
  ["판매", "판매, 품절, 입고예정. 품절과 입고예정은 뽑을 수 없다"],
];

const CARD_FIELDS = [
  ["번호", "팩 안 슬롯 번호"],
  ["멤버", "그룹이면 팀 안 누구인지. 개인이면 본인"],
  ["앞면", "구매 후에만 공개"],
  ["뒷면", "구성 슬롯에 보이는 면"],
  ["버전", "실물에 적힌 판만. 모르면 미정"],
  ["등급", "한정이나 특별 컷일 때만 RARE, SPECIAL"],
  ["재고", "실물 수량. 0이면 추첨에서 빠짐"],
  ["추첨 가중치", "뽑힐 비율. 확정 전에는 전부 1"],
];

function card(no, member, front, back, version) {
  const n = String(no).padStart(2, "0");
  return {
    no: n,
    member,
    front: `/assets/photocards/${front}`,
    back: `/assets/photocards/${back}`,
    version,
    rarity: "NORMAL",
    stock: "",
    weight: 1,
  };
}

function pack(partial) {
  return {
    cover: "",
    price: 2500,
    status: "draft",
    eventName: "",
    kind: "group",
    home: false,
    ...partial,
  };
}

// 스캔 재고 카탈로그(STOCK_PRODUCTS)를 관리자 시드로 쓴다. 옛 번호 mock 이미지는 쓰지 않는다.
const SEED = (typeof STOCK_PRODUCTS !== "undefined" ? STOCK_PRODUCTS : []).map((item) =>
  pack({
    id: item.id,
    artistId: item.artistId,
    album: item.album || item.artist,
    cover: item.cover || "",
    eventType: item.eventType || "album",
    eventName: item.eventName || "",
    home: true,
    status: "on",
    price: item.price,
    cards: (item.cards || []).map((entry) => ({
      no: entry.no,
      member: entry.member || "",
      front: entry.front?.startsWith("/") ? entry.front : `/assets/photocards/${entry.front}`,
      back: entry.back?.startsWith("/") ? entry.back : `/assets/photocards/${entry.back}`,
      version: "unset",
      rarity: entry.rarity || "NORMAL",
      stock: entry.stock,
      weight: 1,
    })),
  }),
);
