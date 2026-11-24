const ARTISTS = [
  { id: "cortis", name: "CORTIS", kind: "group", members: [] },
  { id: "seventeen", name: "SEVENTEEN", kind: "group", members: [] },
  { id: "twice", name: "TWICE", kind: "group", members: [] },
  { id: "blackpink", name: "BLACKPINK", kind: "group", members: ["지수", "제니", "로제", "리사"] },
  { id: "bts", name: "BTS", kind: "group", members: [] },
];

const HOLDING_ID = "holding";

const ALIASES = {
  cortis: ["코르티스"],
  seventeen: ["세븐틴", "svt"],
  twice: ["트와이스"],
  blackpink: ["블랙핑크"],
  bts: ["방탄", "BTS", "방탄소년단"],
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
      unitId: entry.unitId || "",
      rarity: entry.rarity || "NORMAL",
      stock: entry.stock,
      weight: 1,
    })),
  }),
);
