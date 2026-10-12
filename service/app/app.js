const TRACK = ["shipping_requested", "preparing", "shipped", "delivered"];
const TRACK_SHORT = {
  shipping_requested: "요청",
  preparing: "출고",
  shipped: "배송",
  delivered: "수령",
};

const SHIPPING = { maxCards: 50 };

function shippingPolicy() {
  const base = {
    maxCards: 50,
    cardWeight: "",
    packBands: [
      { label: "1~10장", from: 1, to: 10, weight: "" },
      { label: "11~30장", from: 11, to: 30, weight: "" },
      { label: "31~50장", from: 31, to: 50, weight: "" },
    ],
    zones: [],
  };
  try {
    const saved = JSON.parse(localStorage.getItem("photocard-shipping-policy-v1") || "null");
    if (!saved) return base;
    return {
      ...base,
      ...saved,
      maxCards: Number(saved.maxCards) || base.maxCards,
      packBands: base.packBands.map((band, index) => ({
        ...band,
        ...(saved.packBands?.[index] || {}),
        label: band.label,
        from: band.from,
        to: band.to,
      })),
      zones: Array.isArray(saved.zones) ? saved.zones : [],
    };
  } catch (error) {
    console.warn(error);
    return base;
  }
}

function maxShipCards() {
  const count = Number(shippingPolicy().maxCards);
  return count > 0 ? count : SHIPPING.maxCards;
}

function feeLabel(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "미정";
  const digits = raw.replace(/[^\d.]/g, "");
  if (digits && /^[\d,.\s원]*$/.test(raw)) {
    const amount = Number(digits);
    if (Number.isFinite(amount)) return `${amount.toLocaleString("ko-KR")}원`;
  }
  return raw;
}

function shippingQuote(count, country) {
  const policy = shippingPolicy();
  const zone = (policy.zones || []).find((item) => item.country === country);
  const cardWeight = Number(String(policy.cardWeight || "").replace(/[^\d.]/g, ""));
  const band = (policy.packBands || []).find((item) => count >= Number(item.from) && count <= Number(item.to));
  const packWeight = Number(String(band?.weight || "").replace(/[^\d.]/g, ""));
  const ready = cardWeight > 0 && band && String(band.weight ?? "").trim() !== "" && Number.isFinite(packWeight);
  const grams = ready ? count * cardWeight + packWeight : null;
  const steps = zone ? [[100, zone.w100], [250, zone.w250], [500, zone.w500]] : [];
  const hit = grams == null ? null : steps.find(([max, amount]) => grams <= max && String(amount || "").trim());
  return {
    place: country || "—",
    count,
    method: String(zone?.method || "").trim() || "—",
    feeText: feeLabel(hit?.[1]),
  };
}

const STATUS = {
  stored: "보관 중",
  shipping_cart: "배송바구니",
  shipping_requested: "배송 요청 완료",
  preparing: "출고 준비",
  shipped: "배송 중",
  delivered: "수령",
};

const BADGE = {
  stored: "보관중",
  shipping_cart: "배송바구니",
  shipping_requested: "배송요청",
  preparing: "출고준비",
  shipped: "배송중",
  delivered: "수령완료",
};

const STATUS_ICON = {
  stored: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8l9-4 9 4-9 4-9-4z"></path><path d="M3 8v8l9 4 9-4V8"></path><path d="M12 12v8"></path></svg>`,
  shipped: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h11v8H3z"></path><path d="M14 10h4l3 3v2h-7z"></path><circle cx="7.5" cy="17.5" r="1.5"></circle><circle cx="17.5" cy="17.5" r="1.5"></circle></svg>`,
  delivered: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M8.5 12.5l2.5 2.5 4.5-5"></path></svg>`,
};

const PRODUCTS = [
  {
    id: "blackpink-jump",
    artist: "BLACKPINK",
    artistId: "blackpink",
    album: "JUMP",
    eventType: "album",
    eventName: "",
    cover: "/assets/covers/jump.jpg",
    price: 25,
    home: true,
    banner: true,
    cards: [
      { no: "01", front: "67.jpg", back: "68.jpg", member: "리사", rarity: "NORMAL" },
      { no: "02", front: "69.jpg", back: "68.jpg", member: "로제", rarity: "NORMAL" },
      { no: "03", front: "71.jpg", back: "68.jpg", member: "제니", rarity: "NORMAL" },
      { no: "04", front: "73.jpg", back: "68.jpg", member: "지수", rarity: "NORMAL" },
      { no: "05", front: "75.jpg", back: "68.jpg", member: "단체", rarity: "NORMAL" },
    ],
  },
  {
    id: "lesserafim-crazy",
    artist: "LE SSERAFIM",
    artistId: "lesserafim",
    album: "CRAZY",
    eventType: "album",
    eventName: "",
    cover: "/assets/covers/crazy.jpg",
    price: 25,
    home: true,
    sale: "out",
    cards: [1, 2, 3, 4, 5].map((no) => ({
      no: String(no).padStart(2, "0"),
      front: `0${no}.jpg`,
      back: "06.jpg",
      member: "",
      rarity: "NORMAL",
    })),
  },
  {
    id: "lesserafim-easy",
    artist: "LE SSERAFIM",
    artistId: "lesserafim",
    album: "EASY",
    eventType: "album",
    eventName: "",
    cover: "/assets/covers/easy.jpg",
    price: 25,
    home: true,
    sale: "soon",
    cards: [
      { no: "01", front: "10.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
      { no: "02", front: "12.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
      { no: "03", front: "14.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
      { no: "04", front: "16.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
      { no: "05", front: "18.jpg", back: "11.jpg", member: "", rarity: "NORMAL" },
    ],
  },
  {
    id: "ive-empathy-makestar",
    artist: "IVE",
    artistId: "ive",
    album: "IVE EMPATHY",
    eventType: "pob",
    eventName: "MAKESTAR",
    cover: "/assets/covers/ive-empathy.jpg",
    price: 25,
    home: true,
    cards: [20, 22, 24, 26, 28].map((front, index) => ({
      no: String(index + 1).padStart(2, "0"),
      front: `${front}.jpg`,
      back: "19.jpg",
      member: "",
      rarity: "NORMAL",
    })),
  },
  {
    id: "rose-rosie-jp",
    artist: "로제",
    artistId: "rose",
    album: "rosie",
    eventType: "japan",
    eventName: "WPCR-18718",
    cover: "/assets/covers/rosie.jpg",
    price: 25,
    home: true,
    cards: [59, 61, 63, 65].map((front, index) => ({
      no: String(index + 1).padStart(2, "0"),
      front: `${front}.jpg`,
      back: `${front + 1}.jpg`,
      member: "로제",
      rarity: "NORMAL",
    })),
  },
];

let nextId = 1;

function isoDate(daysAgo = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  const [year, month, day] = String(value || "").split("-");
  if (!year || !month || !day) return "";
  return `${year}. ${month}. ${day}.`;
}

function own(partial) {
  const card = { id: `UC_${nextId}`, status: "stored", purchasedOn: isoDate(), ...partial };
  nextId += 1;
  return card;
}

function shipmentMock(status) {
  const mock = {
    receiver: "홍길동",
    phone: "010-0000-0000",
    place: "대한민국",
    address: "서울특별시 강남구 테헤란로 123, 101동 1001호",
  };
  if (status === "shipped" || status === "delivered") {
    mock.carrier = "CJ대한통운";
    mock.tracking = status === "shipped" ? "123456789012" : "987654321098";
  }
  mock.requestedOn = isoDate(3);
  return mock;
}

function seedShipments(owned) {
  const byStatus = new Map();
  owned.forEach((card) => {
    if (!TRACK.includes(card.status)) return;
    const list = byStatus.get(card.status) || [];
    list.push(card.id);
    byStatus.set(card.status, list);
  });
  return [...byStatus.entries()].map(([status, cardIds], index) => ({
    id: `SH_${index + 1}`,
    kind: "ship",
    status,
    cardIds,
    feeText: "",
    method: "",
    ...shipmentMock(status),
  }));
}

function seedOwned() {
  return [
    own({ artist: "BLACKPINK", album: "JUMP", no: "01", front: "67.jpg", member: "리사", rarity: "NORMAL", status: "shipping_cart" }),
    own({ artist: "BLACKPINK", album: "JUMP", no: "02", front: "69.jpg", member: "로제", rarity: "NORMAL", status: "stored" }),
    own({ artist: "BLACKPINK", album: "JUMP", no: "02", front: "69.jpg", member: "로제", rarity: "NORMAL", status: "stored" }),
    own({ artist: "LE SSERAFIM", album: "CRAZY", no: "01", front: "01.jpg", member: "", rarity: "NORMAL", status: "stored" }),
    own({ artist: "LE SSERAFIM", album: "EASY", no: "01", front: "10.jpg", member: "", rarity: "NORMAL", status: "shipped" }),
    own({ artist: "LE SSERAFIM", album: "EASY", no: "02", front: "12.jpg", member: "", rarity: "NORMAL", status: "shipped" }),
    own({ artist: "LE SSERAFIM", album: "EASY", no: "03", front: "14.jpg", member: "", rarity: "NORMAL", status: "shipped" }),
    own({ artist: "IVE", album: "IVE EMPATHY", no: "01", front: "20.jpg", member: "", rarity: "NORMAL", status: "delivered" }),
    own({ artist: "로제", album: "rosie", no: "01", front: "59.jpg", member: "로제", rarity: "NORMAL", status: "stored" }),
  ].map((card) => ({ ...card, purchasedOn: isoDate(14) }));
}

const state = {
  tab: "home",
  screen: "home",
  board: "service",
  adminScene: "",
  productId: "blackpink-jump",
  sheet: null,
  focusStatus: null,
  albumArtist: "all",
  bannerIndex: 0,
  bannerSuppress: false,
  midIndex: 0,
  midSuppress: false,
  balance: 500,
  walletConnected: false,
  walletModal: false,
  cartModal: false,
  resultBox: false,
  reveal: [],
  revealIndex: 0,
  country: "",
  region: "",
  receiver: "",
  phone: "",
  email: "",
  postcode: "",
  address: "",
  addressDetail: "",
  city: "",
  province: "",
  cardId: "",
  cardFrom: "album",
  addressId: "",
  postcodeOpen: false,
  postcodeError: false,
  shipments: [],
  focusTrack: "all",
  shipmentId: "",
  searchOpen: false,
  menuOpen: false,
  menuGroups: { mypage: false, artist: false },
  query: "",
  catalogQuery: "",
  catalogSearch: false,
  catalogFilter: "all",
  catalogKind: "all",
  excludeSold: false,
  profile: "",
  profileFrom: "",
  pickMode: false,
  shipPick: false,
  picked: [],
  shipQty: 1,
  wished: [],
  toast: "",
  openPhase: "pack",
  openCut: "idle",
  motionArmed: false,
  owned: seedOwned(),
};

const ORDERS_KEY = "photocard-orders-v1";
const ADDRESS_KEY = "photocard-addresses-v1";

function orderCards(cardIds) {
  return cardIds.map((id) => {
    const card = state.owned.find((item) => item.id === id);
    return card
      ? { id: card.id, artist: card.artist, album: card.album, no: card.no, member: card.member || "" }
      : { id, artist: "", album: "", no: "", member: "" };
  });
}

function persistOrders() {
  const purchases = readOrderStore().filter((order) => order.kind === "purchase");
  const ships = state.shipments.map((order) => ({
    id: order.id,
    kind: "ship",
    status: order.status,
    place: order.place || "",
    receiver: order.receiver || "",
    phone: order.phone || "",
    address: order.address || "",
    carrier: order.carrier || "",
    carrierName: order.carrierName || "",
    tracking: order.tracking || "",
    requestedOn: order.requestedOn || "",
    feeText: order.feeText || "",
    method: order.method || "",
    shippedOn: order.shippedOn || "",
    memo: order.memo || "",
    problem: Boolean(order.problem),
    exception: order.exception || "",
    email: order.email || "",
    postcode: order.postcode || "",
    cardIds: order.cardIds,
    cards: order.cards?.length ? order.cards : orderCards(order.cardIds),
  }));
  localStorage.setItem(ORDERS_KEY, JSON.stringify({ orders: [...purchases, ...ships] }));
}

function readOrderStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_KEY) || "null");
    return Array.isArray(saved?.orders) ? saved.orders : [];
  } catch (error) {
    return [];
  }
}

function seedPurchases(owned) {
  const groups = new Map();
  owned.forEach((card) => {
    const key = `${card.artist}|${card.album}`;
    const list = groups.get(key) || [];
    list.push(card);
    groups.set(key, list);
  });
  return [...groups.values()].map((cards, index) => {
    const item = catalog().find((pack) => pack.artist === cards[0].artist && pack.album === cards[0].album);
    return {
      id: `PU_${index + 1}`,
      kind: "purchase",
      status: "paid",
      purchasedOn: cards.find((card) => card.purchasedOn)?.purchasedOn || isoDate(),
      productId: item?.id || "",
      productName: item ? productName(item) : `${cards[0].album} Photocard`,
      artist: cards[0].artist,
      album: cards[0].album,
      count: cards.length,
      price: item ? item.price * cards.length : null,
      cards: cards.map((card) => ({
        id: card.id,
        artist: card.artist,
        album: card.album,
        no: card.no,
        member: card.member || "",
      })),
    };
  });
}

function persistPurchase(record) {
  const orders = readOrderStore().filter((order) => order.id !== record.id);
  orders.unshift(record);
  localStorage.setItem(ORDERS_KEY, JSON.stringify({ orders }));
}

function loadOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_KEY) || "null");
    if (Array.isArray(saved?.orders) && saved.orders.length) return saved.orders;
  } catch (error) {
    console.warn(error);
  }
  return null;
}

function applyStoredOrders(orders) {
  state.shipments = orders.map((order) => {
    const filled = { ...order, kind: "ship" };
    if (!filled.requestedOn) filled.requestedOn = isoDate(3);
    return filled;
  });
  orders.forEach((order) => {
    order.cardIds.forEach((id) => {
      const card = state.owned.find((item) => item.id === id);
      if (card && TRACK.includes(order.status)) card.status = order.status;
    });
  });
}

function shipStub(order) {
  return !order.receiver && !order.requestedOn && !order.tracking;
}

const storedOrders = loadOrders();
if (storedOrders) {
  const ships = storedOrders.filter((order) => order.kind !== "purchase");
  if (ships.length && ships.every(shipStub)) {
    state.shipments = seedShipments(state.owned);
    persistOrders();
  } else applyStoredOrders(ships);
} else {
  state.shipments = seedShipments(state.owned);
  persistOrders();
}

function ensurePurchases() {
  const orders = readOrderStore();
  if (orders.some((order) => order.kind === "purchase")) return;
  const purchases = seedPurchases(state.owned);
  const ships = orders.filter((order) => order.kind !== "purchase");
  localStorage.setItem(ORDERS_KEY, JSON.stringify({ orders: [...purchases, ...ships] }));
}

const app = document.querySelector("#app");

const ARTIST_NAMES = {
  lesserafim: "LE SSERAFIM",
  ive: "IVE",
  blackpink: "BLACKPINK",
  bts: "방탄소년단",
  rose: "로제",
  jungkook: "전정국",
  holding: "미분류",
};

const FACTS = {
  unit: "1장",
  size: "55 × 85 mm",
  type: "Official MD",
  state: "미사용 공식 MD",
  keep: "가능",
  ship: "국내·해외 실물 배송 가능",
};

const PERKS = ["실물 카드", "보관 가능", "배송 가능"];

const GUIDES = {
  random: [
    "상품마다 구성된 포토카드 중 1장이 랜덤으로 제공돼요.",
    "재고 상황에 따라 일부 카드는 추첨 대상에서 제외될 수 있어요.",
    "동일한 카드가 다시 나올 수 있어요.",
    "결제가 완료되면 뽑기 결과가 확정돼요.",
  ],
  storage: [
    "뽑은 포토카드는 바로 배송되지 않고 마이 앨범에 보관돼요.",
    "원하는 카드를 골라 배송바구니에 담을 수 있어요.",
    "여러 장을 모아 한 번에 배송 요청할 수 있어요.",
  ],
  shipping: [
    "국내·해외 배송을 지원해요.",
    "배송비는 배송 요청 시 선택한 국가와 수량에 따라 안내돼요.",
    "해외 배송의 경우 관세나 현지 세금이 추가될 수 있어요.",
  ],
  condition: [
    "공식 상품의 제작·포장 과정에서 미세한 스크래치, 눌림, 인쇄점, 재단 차이가 있을 수 있어요.",
    "상품 상태에 따라 교환·환불 기준이 달라질 수 있으니, 큰 이상이 있는 경우 고객센터로 문의해 주세요.",
  ],
  refund: [
    "랜덤 상품 특성상 단순 변심이나 원하는 카드가 나오지 않은 경우에는 변경이 어려울 수 있어요.",
    "결제 후 뽑기 결과가 확정된 상품은 결과 변경이 어려워요.",
    "상품에 큰 이상이 있는 경우 고객센터에서 확인 후 안내해 드려요.",
  ],
};

const SHEET_NOTES = [
  "뽑은 카드는 내 앨범에 보관돼요.",
  "배송은 별도로 신청해요.",
  "랜덤 결과 확정 후에는 변경이 어려울 수 있으며, 동일 카드가 중복될 수 있어요.",
];

function registerStore() {
  try {
    return JSON.parse(localStorage.getItem("photocard-register-v5") || "null");
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function linesOf(value, fallback) {
  const custom = String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return custom.length ? custom : fallback;
}

function factValue(item, key) {
  const value = String(item?.facts?.[key] || "").trim();
  return value || FACTS[key];
}

function perkLabels(item) {
  const custom = (item?.perks || []).map((line) => String(line || "").trim());
  if (!custom.some(Boolean)) return PERKS;
  return PERKS.map((label, index) => custom[index] || label);
}

function summaryLine(item) {
  return String(item?.summary || "").trim() || "공식 실물 포토카드 랜덤팩";
}

function sheetNotes(item) {
  const notes = item?.sheetNotes || [];
  return SHEET_NOTES.map((line, index) => String(notes[index] || "").trim() || line);
}

function packToProduct(pack) {
  return {
    id: pack.id,
    artist: shownArtist(pack, ARTIST_NAMES[pack.artistId]),
    artistId: pack.artistId,
    album: pack.album || "",
    eventType: pack.eventType || "",
    eventName: pack.eventName || "",
    eventNameKo: pack.eventNameKo || "",
    eventNameEn: pack.eventNameEn || "",
    cover: pack.cover || "",
    price: Number(pack.price) || 0,
    home: Boolean(pack.home),
    cards: (pack.cards || []).map((card) => ({
      no: card.no,
      front: card.front || "",
      back: card.back || "",
      member: card.member || "",
      rarity: card.rarity || "NORMAL",
      stock: card.stock,
    })),
    displayName: pack.displayName || "",
    summary: pack.summary || "",
    perks: pack.perks || null,
    facts: pack.facts || null,
    guides: pack.guides || null,
    sheetNotes: pack.sheetNotes || null,
  };
}

function applyPack(item) {
  const pack = registerPack(item.id);
  if (!pack) return item;
  const cards = pack.cards?.length
    ? pack.cards.map((card) => ({
      no: card.no,
      front: card.front || "",
      back: card.back || "",
      member: card.member || "",
      rarity: card.rarity || "NORMAL",
      stock: card.stock,
    }))
    : item.cards;
  return {
    ...item,
    artistId: pack.artistId || item.artistId,
    artist: shownArtist(pack, item.artist),
    album: pack.album != null ? pack.album : item.album,
    eventName: pack.eventName != null ? pack.eventName : item.eventName,
    eventNameKo: pack.eventNameKo != null ? pack.eventNameKo : (item.eventNameKo || ""),
    eventNameEn: pack.eventNameEn != null ? pack.eventNameEn : (item.eventNameEn || ""),
    eventType: pack.eventType || item.eventType,
    cover: pack.cover || item.cover,
    price: pack.price != null ? Number(pack.price) : item.price,
    cards,
    displayName: pack.displayName || "",
    summary: pack.summary || "",
    perks: pack.perks || null,
    facts: pack.facts || null,
    guides: pack.guides || null,
    sheetNotes: pack.sheetNotes || null,
  };
}

function catalog() {
  const saved = registerStore();
  const packs = (saved?.packs || []).filter((pack) => !pack.deletedAt);
  const removed = new Set((saved?.packs || []).filter((pack) => pack.deletedAt).map((pack) => pack.id));
  const known = new Set(PRODUCTS.map((item) => item.id));
  const merged = PRODUCTS.map(applyPack).filter((item) => !removed.has(item.id));
  packs.forEach((pack) => {
    if (known.has(pack.id) || !pack.home) return;
    merged.push(packToProduct(pack));
  });
  return merged;
}

function product(id) {
  return catalog().find((item) => item.id === id) || null;
}

function productName(item) {
  if (item?.displayName) return item.displayName;
  const eventName = eventTitle(item);
  const which = eventName ? `${albumTitle(item)} ${eventName}` : albumTitle(item);
  return `${which} Photocard`;
}

function lineup(count) {
  return `${count}종 중 랜덤 1장`;
}

function tott(amount) {
  return `${amount}<span class="tott">TOTT</span>`;
}

function setTitle(item) {
  if (item?.displayName) return item.displayName;
  const eventName = eventTitle(item);
  const which = eventName ? `${albumTitle(item)} ${eventName}` : albumTitle(item);
  return `${which} Random Photocard`;
}

function photo(file) {
  if (!file) return "";
  if (file.startsWith("data:") || file.startsWith("/") || file.startsWith("http") || file.startsWith("blob:")) return file;
  return `/assets/photocards/${file}`;
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function gradeClass(rarity) {
  if (rarity === "RARE") return "grade rare";
  if (rarity === "SPECIAL") return "grade special";
  return "grade";
}

const FALLBACK_BANNERS = [
  { packId: "blackpink-jump", image: "/assets/covers/jump.jpg" },
  { packId: "lesserafim-crazy", image: "/assets/covers/crazy.jpg" },
  { packId: "ive-empathy-makestar", image: "/assets/covers/ive-empathy.jpg" },
];

function bannerLines(packId, line1, line2) {
  const item = product(packId);
  const fallback1 = item ? productName(item) : "";
  const fallback2 = item ? lineup(item.cards.length) : "";
  return {
    line1: String(line1 || "").trim() || fallback1,
    line2: String(line2 || "").trim() || fallback2,
  };
}

function liveBanners(place) {
  const saved = registerStore();
  if (!saved?.banners) return null;
  return saved.banners
    .filter((banner) => banner.on && banner.image && (banner.place || "top") === place)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

function eventBanners() {
  const live = liveBanners("top");
  if (live?.length) {
    return live.map((banner) => {
      const lines = bannerLines(banner.packId, banner.line1, banner.line2);
      return { packId: banner.packId, image: banner.image, ...lines };
    });
  }
  return FALLBACK_BANNERS.map((banner) => ({ ...banner, ...bannerLines(banner.packId) }));
}

let bannerTimer = 0;
let bannerDrag = 0;
let midTimer = 0;
let midDrag = 0;

function unshipped(status) {
  return status === "stored" || status === "shipping_cart";
}

function registerPack(id) {
  return (registerStore()?.packs || []).find((entry) => entry.id === id) || null;
}

function listed(item) {
  const pack = registerPack(item.id);
  if (pack?.deletedAt) return false;
  if (!pack) return Boolean(item.home);
  return Boolean(pack.home);
}

function saleOf(item) {
  if (!item) return "on";
  const pack = registerPack(item.id);
  if (pack) {
    if (pack.status === "on") return "on";
    if (pack.status === "soon") return "soon";
    if (pack.status === "stop") return "stop";
    if (pack.status === "out") return "out";
    if (pack.status === "draft") return "draft";
    if (pack.home) return "out";
  }
  if (item.sale === "soon") return "soon";
  return item.sale === "out" ? "out" : "on";
}

function cardStock(card) {
  if (card.stock === "" || card.stock == null) return 0;
  const value = Number(card.stock);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function packStock(item) {
  if (!item) return 0;
  const pack = registerPack(item.id);
  const cards = pack?.cards?.length ? pack.cards : item.cards;
  return cards.reduce((sum, card) => sum + cardStock(card), 0);
}

function saleWord(item) {
  const sale = saleOf(item);
  if (sale === "out") return "품절";
  if (sale === "soon") return "입고예정";
  if (sale === "stop") return "판매중지";
  if (sale === "draft") return "등록중";
  return "";
}

const ARTIST_META = {
  blackpink: { kind: "group", aliases: ["블랙핑크"] },
  lesserafim: { kind: "group", aliases: ["르세라핌"] },
  ive: { kind: "group", aliases: ["아이브"] },
  rose: { kind: "solo", aliases: ["로지", "rose", "rosé"], group: "BLACKPINK", groupAliases: ["블랙핑크"] },
};

const MEMBER_ALIASES = {
  로제: ["로지", "rose", "rosé"],
};

function artistKindOf(item) {
  const pack = registerPack(item.id);
  if (pack?.kind === "solo" || pack?.kind === "group") return pack.kind;
  return ARTIST_META[item.artistId]?.kind || "group";
}

function eventKindOf(item) {
  const pack = registerPack(item.id);
  const type = pack?.eventType || item.eventType;
  if (type === "album") return "album";
  if (type) return "event";
  return item.eventName ? "event" : "album";
}

function productHaystack(item) {
  const meta = ARTIST_META[item.artistId] || {};
  const members = item.cards.map((card) => card.member).filter(Boolean);
  const memberAliases = members.flatMap((member) => MEMBER_ALIASES[member] || []);
  const names = artistNames(item.artistId);
  const albums = categoryOf(item.artistId)?.albums || [];
  const album = albums.find((entry) => entry && entry.name === item.album);
  return [
    item.artist,
    names.ko,
    names.en,
    ...aliasTokens(names.aliases),
    item.album,
    album?.nameKo,
    album?.nameEn,
    item.eventName,
    item.eventNameKo,
    item.eventNameEn,
    eventTitle(item),
    albumTitle(item),
    productName(item),
    meta.group,
    ...(meta.aliases || []),
    ...(meta.groupAliases || []),
    ...members,
    ...memberAliases,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function searchIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>`;
}

function catalogChips(current, options) {
  return `<div class="artist-tabs">${options
    .map(([id, label]) => `<button type="button" data-catalog="${id}" class="${id === current ? "on" : ""}">${label}</button>`)
    .join("")}</div>`;
}

function catalogGrid(items) {
  if (!items.length) return `<p class="empty catalog-empty">찾는 상품이 없어요.</p>`;
  return `<div class="album-block"><div class="album-grid">${items.map(productTile).join("")}</div></div>`;
}

function resetCatalog() {
  state.catalogQuery = "";
  state.catalogSearch = false;
  state.catalogFilter = "all";
  state.catalogKind = "all";
  state.excludeSold = false;
}

function artistEmblems() {
  try {
    const saved = JSON.parse(localStorage.getItem("photocard-register-v5") || "null");
    return saved?.artistEmblems || {};
  } catch (error) {
    console.warn(error);
    return {};
  }
}

function categoryOf(artistId) {
  return (registerStore()?.categories || []).find((item) => item.id === artistId);
}

const PROFILE_PHOTOS = {
  blackpink: "/assets/profiles/blackpink.png",
  ive: "/assets/profiles/ive.jpg",
  bts: "/assets/profiles/bts.jpg",
  rose: "/assets/profiles/rose.jpg",
  lesserafim: "/assets/profiles/lesserafim.png",
};

function profileImage(artistId) {
  const category = categoryOf(artistId);
  if (category?.profileImage) return category.profileImage;
  const emblem = artistEmblems()[artistId];
  if (emblem) return emblem;
  if (PROFILE_PHOTOS[artistId]) return PROFILE_PHOTOS[artistId];
  const pack = catalog().find((item) => item.artistId === artistId && item.cover);
  return pack?.cover || "";
}

const ARTIST_I18N = {
  blackpink: { ko: "블랙핑크", en: "BLACKPINK", aliases: "블랙핑크" },
  lesserafim: { ko: "르세라핌", en: "LE SSERAFIM", aliases: "르세라핌" },
  ive: { ko: "아이브", en: "IVE", aliases: "아이브" },
  rose: { ko: "로제", en: "ROSÉ", aliases: "로제, rose, rosé, blackpink rose, 로지" },
  bts: { ko: "방탄소년단", en: "BTS", aliases: "방탄, BTS" },
  jungkook: { ko: "전정국", en: "Jung Kook", aliases: "정국" },
};

function localizedName(ko, en, fallback) {
  const korean = (document.documentElement.lang || "ko").toLowerCase().startsWith("ko");
  const first = korean ? ko : en;
  const second = korean ? en : ko;
  return String(first || second || fallback || "").trim();
}

function aliasTokens(value) {
  return String(value || "").split(/[,，]/).map((item) => item.trim()).filter(Boolean);
}

function artistNames(artistId) {
  const category = categoryOf(artistId);
  const seed = ARTIST_I18N[artistId] || {};
  return {
    ko: category && "nameKo" in category ? category.nameKo : (seed.ko || ""),
    en: category && "nameEn" in category ? category.nameEn : (seed.en || ""),
    aliases: category && "aliases" in category ? category.aliases : (seed.aliases || ""),
  };
}

function albumTitle(item) {
  const albums = categoryOf(item?.artistId)?.albums || [];
  const album = albums.find((entry) => entry && (entry.name === item.album || entry.nameEn === item.album || entry.nameKo === item.album));
  if (!album || typeof album !== "object") return item?.album || "";
  return localizedName(album.nameKo, album.nameEn, item.album);
}

function eventTitle(item) {
  return localizedName(item?.eventNameKo, item?.eventNameEn, item?.eventName);
}

function shownArtist(pack, fallback) {
  const names = artistNames(pack?.artistId);
  const named = localizedName(names.ko, names.en, "");
  if (named) return named;
  const category = categoryOf(pack?.artistId);
  return String(category?.profileName || category?.name || pack?.artistName || fallback || "").trim() || fallback || "미분류";
}

function artistImage(item) {
  return profileImage(item?.artistId);
}

function artistMark(item, options = {}) {
  const name = esc(item?.artist || "");
  const src = artistImage(item);
  const image = src ? `<img src="${src}" alt="" />` : "";
  const face = options.link && item?.artistId
    ? `<button type="button" data-profile="${esc(item.artistId)}" aria-label="${name} 상품">${image}</button>`
    : image;
  return `<span class="artist-mark">${face}<span>${name}</span></span>`;
}

function artistProfiles() {
  const seen = new Set();
  const profiles = [];
  catalog().filter((item) => listed(item)).forEach((item) => {
    if (!item.artistId || seen.has(item.artistId)) return;
    seen.add(item.artistId);
    profiles.push({
      id: item.artistId,
      name: item.artist,
      image: profileImage(item.artistId),
    });
  });
  return profiles;
}

function randomCardOverlay() {
  return `<span class="random-card" aria-hidden="true"><b>?</b><small>TOMATOK</small></span>`;
}

function productThumbnail(cover, badge) {
  return `
    <span class="tile-shot">
      <img class="album-cover" src="${cover}" alt="" />
      ${randomCardOverlay()}
      ${badge}
    </span>`;
}

function saleMark(item) {
  const sale = saleOf(item);
  const word = saleWord(item);
  if (!word) return "";
  return `<span class="sale-mark ${sale}">${esc(word)}</span>`;
}

function productTile(item) {
  const word = saleWord(item);
  return `
    <button class="tile${word ? " sold" : ""}" data-open="${item.id}">
      ${productThumbnail(item.cover, saleMark(item))}
      <span class="tile-who">${artistMark(item)}</span>
      <span class="tile-name">${esc(setTitle(item))}</span>
      <span class="tile-line">${esc(lineup(item.cards.length))}</span>
      <span class="tile-price">${tott(item.price)}</span>
    </button>`;
}

function artistsPage() {
  const query = state.catalogQuery.trim().toLowerCase();
  const items = catalog().filter((item) => listed(item))
    .filter((item) => state.catalogKind === "all" || artistKindOf(item) === state.catalogKind)
    .filter((item) => !query || productHaystack(item).includes(query));
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>전체 포토카드</h1>
      <span class="icon-btn" aria-hidden="true"></span>
    </header>
    <div class="scroll">
      <label class="catalog-search">
        <input data-field="catalogQuery" value="${esc(state.catalogQuery)}" placeholder="가수, 앨범 검색" />
        ${searchIcon()}
      </label>
      ${catalogChips(state.catalogKind, [["all", "전체"], ["group", "그룹"], ["solo", "솔로"]])}
      <p class="catalog-count">전체 상품 ${items.length}</p>
      ${catalogGrid(items)}
    </div>
  `;
}

function artistFilterBar() {
  const on = state.excludeSold;
  return `
    <div class="catalog-tools">
      ${catalogChips(state.catalogFilter, [["all", "전체"], ["album", "앨범"], ["event", "특전/이벤트"]])}
      <button type="button" class="sold-toggle${on ? " on" : ""}" data-exclude-sold aria-pressed="${on ? "true" : "false"}">
        <span>품절제외</span>
        <i aria-hidden="true"></i>
      </button>
    </div>`;
}

function artistPage() {
  const profile = artistProfiles().find((item) => item.id === state.profile);
  if (!profile) return home();
  const query = state.catalogQuery.trim().toLowerCase();
  const mine = catalog().filter((item) => listed(item) && item.artistId === profile.id);
  const items = mine
    .filter((item) => state.catalogFilter === "all" || eventKindOf(item) === state.catalogFilter)
    .filter((item) => !state.excludeSold || saleOf(item) !== "out")
    .filter((item) => !query || productHaystack(item).includes(query));
  const search = state.catalogSearch
    ? `<label class="catalog-search">
        <input data-field="catalogQuery" value="${esc(state.catalogQuery)}" placeholder="앨범, 이벤트" />
        <button type="button" data-catalog-search-close>취소</button>
      </label>`
    : "";
  return `
    <header class="bar">
      <button data-back="${state.profileFrom === "artists" ? "artists" : "home"}" aria-label="뒤로">←</button>
      <h1>${esc(profile.name)}</h1>
      <button type="button" class="icon-btn" data-catalog-search aria-label="검색">${searchIcon()}</button>
    </header>
    <div class="scroll">
      ${search}
      <div class="catalog-head">
        <img src="${profile.image}" alt="" />
        <div>
          <strong>${esc(profile.name)}</strong>
          <span>총 ${mine.length}개 상품</span>
        </div>
      </div>
      ${artistFilterBar()}
      ${items.length ? catalogGrid(items) : `<p class="empty catalog-empty">${query ? "찾는 상품이 없어요." : "이 분류의 상품이 없어요."}</p>`}
    </div>
  `;
}

function home() {
  const query = state.query.trim().toLowerCase();
  const banners = eventBanners();
  const slide = (banner) => `
      <button class="banner-slide" data-open="${banner.packId}">
        <img src="${banner.image}" alt="" />
        <span class="banner-copy">
          <strong>${esc(banner.line1)}</strong>
          <span>${esc(banner.line2)}</span>
        </span>
      </button>`;
  const slides = banners.map(slide).join("");
  const loop = banners.length > 1;
  const trackSlides = loop ? `${slide(banners.at(-1))}${slides}${slide(banners[0])}` : slides;
  const dots = banners.map(
    (_, index) => `<button type="button" data-dot="${index}" class="${index === state.bannerIndex ? "on" : ""}" aria-label="이벤트 ${index + 1}"></button>`,
  ).join("");
  const cards = catalog().filter((item) => listed(item) && (!query || productHaystack(item).includes(query)))
    .map(productTile)
    .join("");
  const list = cards
    ? `<div class="shelf">${cards}</div>`
    : `<p class="empty">찾는 상품이 없어요.</p>`;
  const header = state.searchOpen
    ? `
    <header class="bar">
      <input class="search-input" data-field="query" value="${esc(state.query)}" placeholder="가수, 앨범, 이벤트" />
      <button type="button" data-search-close>취소</button>
    </header>`
    : `
    <header class="bar">
      <button type="button" data-back="exit" aria-label="뒤로">←</button>
      <h1>포토카드</h1>
      <span class="bar-tools">
        <button type="button" class="icon-btn" data-search aria-label="검색">${searchIcon()}</button>
        <button type="button" class="icon-btn" data-drawer aria-label="메뉴">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
        </button>
      </span>
    </header>`;
  const profiles = artistProfiles().map((profile) => `
    <button type="button" class="profile" data-profile="${esc(profile.id)}">
      <img src="${profile.image}" alt="" />
      <span>${esc(profile.name)}</span>
    </button>`).join("");
  const allArtists = `
    <button type="button" class="profile" data-profile="all">
      <i class="profile-all" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg></i>
      <span>전체</span>
    </button>`;
  const rail = state.searchOpen ? "" : `<div class="profiles">${profiles}${allArtists}</div>`;
  const banner = state.searchOpen
    ? ""
    : `
      <div class="banner-wrap">
        <div class="banner-viewport${loop ? "" : " is-single"}">
          <div class="banner-track" style="transform:${bannerTransform(loop ? state.bannerIndex + 1 : 0)}">${trackSlides}</div>
        </div>
        <div class="banner-dots">${dots}</div>
      </div>`;
  const albums = catalog().filter((item) => listed(item));
  const albumBlock = state.searchOpen
    ? ""
    : `
      <section class="album-block">
        ${midBanner()}
        <h2>ALL</h2>
        <div class="album-grid">
          ${albums.map(productTile).join("")}
        </div>
      </section>`;

  return `
    ${header}
    <div class="scroll">
      ${rail}
      ${banner}
      <div class="shelf-wrap">${state.searchOpen ? "" : `<h2>NEW</h2>`}${list}</div>
      ${albumBlock}
    </div>
  `;
}

function groupCards(list) {
  const groups = new Map();
  list.forEach((card) => {
    const key = [card.artist, card.album, card.no, card.status, card.rarity].join("|");
    const found = groups.get(key);
    if (found) found.count += 1;
    else groups.set(key, { ...card, count: 1 });
  });
  return [...groups.values()];
}

function sameDesign(left, right) {
  return left.artist === right.artist && left.album === right.album && left.no === right.no && left.rarity === right.rarity;
}

function storedCopies(card) {
  return state.owned.filter((item) => item.status === "stored" && sameDesign(item, card));
}

function cardShot(card) {
  return `<img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" />`;
}

function sameText(left, right) {
  return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

function artistIdForName(name) {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return "";
  const ids = new Set([
    ...Object.keys(ARTIST_I18N),
    ...Object.keys(ARTIST_NAMES),
    ...catalog().map((item) => item.artistId).filter(Boolean),
  ]);
  for (const id of ids) {
    const names = artistNames(id);
    const aliases = [names.ko, names.en, ...aliasTokens(names.aliases), ARTIST_NAMES[id], id];
    if (aliases.some((item) => sameText(item, target))) return id;
  }
  return "";
}

function productForCard(card) {
  const list = catalog();
  const named = list.find((product) => sameText(product.artist, card.artist) && sameText(product.album, card.album))
    || list.find((product) => sameText(product.artist, card.artist));
  if (named) return named;
  const artistId = artistIdForName(card.artist);
  if (!artistId) return null;
  const mine = list.filter((product) => product.artistId === artistId);
  const albumHit = mine.find((product) => sameText(product.album, card.album))
    || mine.find((product) => {
      const albums = categoryOf(artistId)?.albums || [];
      return albums.some((entry) => [entry?.name, entry?.nameKo, entry?.nameEn].some((label) => sameText(label, card.album)));
    });
  return albumHit || mine[0] || { artist: card.artist, artistId };
}

function cardMark(card) {
  const item = productForCard(card);
  if (!item) return `<span class="artist-mark"><span>${esc(card.artist)}</span></span>`;
  return artistMark(item);
}

function statusBadge(status) {
  if (status === "shipping_cart") return "";
  const label = status === "stored" ? "배송바구니에 담을 수 있어요" : (BADGE[status] || STATUS[status] || "");
  const glyph = STATUS_ICON[status];
  if (!glyph) return `<span class="status-badge ${esc(status)}">${esc(label)}</span>`;
  return `<span class="status-badge icon ${esc(status)}" role="img" aria-label="${esc(label)}">${glyph}</span>`;
}

function sourceEvent(card) {
  const events = [...new Set(catalog()
    .filter((item) => item.artist === card.artist && item.album === card.album)
    .map((item) => item.eventName)
    .filter(Boolean))];
  return events.length === 1 ? events[0] : "";
}

function cardSourceLine(card) {
  const event = sourceEvent(card);
  const extra = event ? ` · ${esc(event)}` : (card.no ? ` · <small>${esc(card.no)}</small>` : "");
  return `<p class="card-source">${esc(card.album || "")}${extra}</p>`;
}

function cardFigure(card) {
  return `
    <figure data-card="${esc(card.id)}">
      <div class="shot">
        ${cardShot(card)}
        ${statusBadge(card.status)}
      </div>
      ${cardMark(card)}
      ${cardSourceLine(card)}
    </figure>
  `;
}

function pickFigure(card) {
  const selectable = card.status === "stored";
  const on = selectable && state.picked.includes(card.id);
  const mark = selectable ? `<span class="pick-mark">${on ? "✓" : ""}</span>` : statusBadge(card.status);
  return `
    <figure class="pick-card${on ? " on" : ""}${selectable ? "" : " locked"}" ${selectable ? `data-pick-card="${esc(card.id)}"` : ""}>
      <div class="shot">
        ${cardShot(card)}
        ${mark}
      </div>
      ${cardMark(card)}
      ${cardSourceLine(card)}
    </figure>
  `;
}

function album() {
  const statusOptions = [
    ["all", "전체"],
    ["stored", "보관중"],
    ["shipped", "배송중"],
    ["delivered", "수령완료"],
  ];
  const statusId = statusOptions.some(([id]) => id === state.focusStatus) ? state.focusStatus : "all";
  const pool = state.owned.filter((card) => card.status !== "shipping_cart");
  const source = statusId === "all" ? pool : pool.filter((card) => card.status === statusId);
  const artists = [...new Set(source.map((card) => card.artist))];
  const selected = artists.includes(state.albumArtist) ? state.albumArtist : "all";
  const shown = selected === "all" ? source : source.filter((card) => card.artist === selected);
  const cards = state.pickMode ? shown : groupCards(shown);
  const statusMarkup = statusOptions.map(([id, label]) => `<option value="${id}"${id === statusId ? " selected" : ""}>${label}</option>`).join("");
  const chips = ["all", ...artists]
    .map((artist) => {
      const label = artist === "all" ? "전체" : artist;
      const on = artist === selected ? "on" : "";
      return `<button class="${on}" data-artist="${esc(artist)}">${esc(label)}</button>`;
    })
    .join("");
  const figures = state.pickMode ? cards.map(pickFigure) : cards.map(cardFigure);
  const body = figures.length
    ? `<div class="owned gallery">${figures.join("")}</div>`
    : `<p class="empty">아직 뽑은 카드가 없어요.</p>`;
  const inCart = state.owned.filter((card) => card.status === "shipping_cart").length;
  const pickBar = state.pickMode
    ? `
    <div class="pick-bar">
      <span>${state.picked.length}장 선택</span>
      <button type="button" class="primary" data-pick-add ${state.picked.length ? "" : "disabled"}>배송바구니 담기</button>
    </div>`
    : "";
  return `
    <header class="bar">
      <h1>마이 앨범</h1>
      <span class="bar-tools">
        <button class="cart-link" data-menu="ship" aria-label="배송바구니 ${inCart}장"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8l9-4 9 4-9 4-9-4z"></path><path d="M3 8v8l9 4 9-4V8"></path><path d="M12 12v8"></path></svg><span>${inCart}장</span></button>
        ${menuButton()}
      </span>
    </header>
    <div class="album-filters">
      <div class="artist-tabs">${chips}</div>
      <select class="status-drop" data-album-status aria-label="상태">${statusMarkup}</select>
    </div>
    <div class="scroll">${body}</div>
    ${pickBar}
  `;
}

const SHIP_BADGE = {
  shipping_requested: "배송 요청",
  preparing: "준비중",
  shipped: "배송 중",
  delivered: "수령 완료",
};

const STEP_LABEL = {
  shipping_requested: "요청 완료",
  preparing: "출고 완료",
  shipped: "배송 중",
  delivered: "수령 완료",
};

function orderFacts(order) {
  return `
    <div class="ship-facts">
      <div><span>배송 요청일</span><strong>${esc(formatDate(order.requestedOn) || "—")}</strong></div>
      <div><span>포토카드 수</span><strong>${shipmentCards(order).length}장</strong></div>
      <div><span>배송비</span><strong>${esc(order.feeText || "미정")}</strong></div>
    </div>`;
}

function shipmentCards(order) {
  return order.cardIds
    .map((id) => state.owned.find((card) => card.id === id))
    .filter(Boolean);
}

function stepList(order) {
  const current = TRACK.indexOf(order.status);
  return TRACK.map((status, index) => {
    const cls = index === current ? "current" : index < current ? "on" : "";
    const raw = status === "shipping_requested" ? order.requestedOn : status === "shipped" ? order.shippedOn : "";
    const when = raw ? formatDate(raw) : index === current ? "현재" : "";
    return `<li class="${cls}"><b>${STEP_LABEL[status]}</b>${when ? `<small>${esc(when)}</small>` : ""}</li>`;
  }).join("");
}

function tracking() {
  const selected = TRACK.includes(state.focusTrack) ? state.focusTrack : "all";
  const filters = [
    ["all", "전체"],
    ["shipping_requested", "배송 요청"],
    ["preparing", "준비중"],
    ["shipped", "배송중"],
    ["delivered", "완료"],
  ];
  const chips = filters
    .map(([id, label]) => `<button class="${id === selected ? "on" : ""}" data-track-status="${id}">${label}</button>`)
    .join("");
  const orders = state.shipments.filter((order) => selected === "all" || order.status === selected);
  const body = orders.length
    ? orders.map((order) => {
        const cards = shipmentCards(order);
        const preview = cards.slice(0, 4);
        const extra = cards.length - preview.length;
        const thumbs = preview
          .map((card) => `<img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id)}" alt="" draggable="false" />`)
          .join("");
        const more = extra > 0 ? `<span class="ship-more">+${extra}</span>` : "";
        const moving = order.status === "shipped" && (order.carrier || order.tracking);
        const parcel = moving
          ? `<p class="meta">${esc([order.carrier, order.tracking].filter(Boolean).join(" · "))}</p>`
          : "";
        const lookup = moving && order.tracking
          ? `<button type="button" class="shipment-more" data-track-copy="${esc(order.tracking)}">배송조회</button>`
          : "";
        return `
          <article class="shipment">
            <p class="ship-when">${esc(formatDate(order.requestedOn) || "—")}</p>
            <header>
              <strong>배송 주문 ${esc(order.id)}</strong>
              <span>${esc(SHIP_BADGE[order.status] || STATUS[order.status])}</span>
            </header>
            <p class="meta">포토카드 ${cards.length}장</p>
            <div class="shipment-cards">${thumbs}${more}</div>
            ${parcel}
            <div class="ship-actions${lookup ? "" : " is-single"}">
              ${lookup}
              <button type="button" class="shipment-more" data-shipment="${esc(order.id)}">상세보기</button>
            </div>
          </article>`;
      }).join("")
    : `<p class="empty">이 단계 배송이 없어요.</p>`;
  return `
    <header class="bar">
      <button data-back="mypage" aria-label="마이페이지">←</button>
      <h1>배송내역</h1>
      ${menuButton()}
    </header>
    <div class="artist-tabs">${chips}</div>
    <div class="scroll">${body}</div>
  `;
}

function shipmentDetail() {
  const order = state.shipments.find((item) => item.id === state.shipmentId);
  if (!order) return tracking();
  const cards = shipmentCards(order);
  const rows = cards
    .map((card) => {
      const member = card.member ? ` · ${esc(card.member)}` : "";
      return `
        <button class="ship-line" data-card="${esc(card.id)}">
          <img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id)}" alt="" draggable="false" />
          <span>
            <strong>${esc(card.album)} ${esc(card.no)}</strong>
            <em>${esc(card.artist)}${member}${card.purchasedOn ? ` · 뽑은 날 ${esc(formatDate(card.purchasedOn))}` : ""}</em>
          </span>
        </button>`;
    })
    .join("");
  const address = [order.receiver, order.phone, order.address, order.place].filter(Boolean);
  const moving = order.status === "shipped" && (order.carrier || order.tracking);
  const lookup = moving && order.tracking
    ? `<button type="button" class="shipment-more" data-track-copy="${esc(order.tracking)}">배송조회</button>`
    : "";
  return `
    <div class="detail-top">
      <button data-back="track-list" aria-label="뒤로">←</button>
      <strong>${esc(order.id)}</strong>
      ${menuButton()}
    </div>
    <div class="scroll">
      <section class="shipment open">
        <p class="lead">${esc(SHIP_BADGE[order.status] || STATUS[order.status])}</p>
        ${moving ? `<p>${esc(order.carrier || "")}</p><p>${esc(order.tracking || "")}</p>${lookup}` : ""}
        <section class="ship-block">
          <h3>배송 진행</h3>
          <ol class="steps">${stepList(order)}</ol>
        </section>
        <section class="ship-block">
          <h3>배송 정보</h3>
          ${orderFacts(order)}
        </section>
        <section class="ship-block">
          <h3>배송지</h3>
          ${address.map((line) => `<p>${esc(line)}</p>`).join("")}
        </section>
        <section class="ship-block">
          <h3>담긴 카드</h3>
          <div class="ship-lines">${rows}</div>
        </section>
      </section>
    </div>
  `;
}

function ownedCard() {
  return state.owned.find((card) => card.id === state.cardId);
}

function ownedBackSrc(card) {
  const pack = catalog().find((item) => item.artist === card.artist && item.album === card.album);
  const found = pack?.cards.find((entry) => entry.no === card.no && entry.back);
  return found ? photo(found.back) : "";
}

function otherCards(card) {
  const pool = state.cardFrom === "ship"
    ? state.owned.filter((item) => item.status === "shipping_cart")
    : state.owned.filter((item) => item.status !== "shipping_cart");
  const figures = groupCards(pool.filter((item) => item.id !== card.id)).map(cardFigure).join("");
  if (!figures) return "";
  return `
    <section class="other-cards">
      <h3>다른 카드</h3>
      <div class="owned gallery">${figures}</div>
    </section>`;
}

function ownedDetail() {
  const card = ownedCard();
  if (!card) return album();
  const pack = catalog().find((item) => item.artist === card.artist && item.album === card.album);
  const copies = card.status === "stored" ? storedCopies(card) : [];
  const qty = Math.min(Math.max(state.shipQty, 1), Math.max(copies.length, 1));
  const stepper = copies.length > 1
    ? `
      <div class="qty-line">
        <span>보유 ${copies.length}장</span>
        <span class="qty-row">
          <span>배송할 수량</span>
          <button type="button" data-qty="-1" ${qty <= 1 ? "disabled" : ""}>−</button>
          <strong>${qty}</strong>
          <button type="button" data-qty="1" ${qty >= copies.length ? "disabled" : ""}>+</button>
        </span>
      </div>`
    : "";
  const addLabel = copies.length > 1 ? `${qty}장 배송바구니 담기` : "배송바구니 담기";
  const action = card.status === "stored"
    ? `${stepper}<button class="primary" data-cart-many="${card.id}">${addLabel}</button>`
    : card.status === "shipping_cart"
      ? `<button class="primary" data-receive="${card.id}">배송받기</button>`
      : "";
  const member = card.member ? `<tr><th>멤버</th><td>${esc(card.member)}</td></tr>` : "";
  const back = ownedBackSrc(card);
  const backFace = back
    ? `<figure><img class="guard" src="${back}" alt="뒷면" draggable="false" /><figcaption>뒷면</figcaption></figure>`
    : "";
  return `
    <div class="detail-top">
      <button data-back="${state.cardFrom}" aria-label="뒤로">←</button>
      <strong>포토카드</strong>
      ${menuButton()}
    </div>
    <div class="scroll">
      <div class="owned-detail">
        <div class="owned-faces${back ? "" : " is-single"}">
          <figure>
            <img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id)}" alt="앞면" draggable="false" />
            <figcaption>앞면</figcaption>
          </figure>
          ${backFace}
        </div>
        ${cardMark(card)}
        <h2>${esc(card.album)} ${esc(card.no)}</h2>
        <div class="facts-box">
          <table class="facts">
            <tr><th>상품</th><td>${pack ? esc(productName(pack)) : esc(card.album)}</td></tr>
            ${member}
            <tr><th>번호</th><td>${esc(card.no)}</td></tr>
            <tr><th>등급</th><td>${esc(card.rarity)}</td></tr>
            <tr><th>상태</th><td>${esc(STATUS[card.status])}</td></tr>
            <tr><th>보유 번호</th><td>${esc(card.id)}</td></tr>
          </table>
        </div>
        <section class="card-origin">
          <h3>출처</h3>
          <div class="source-row">
            ${pack?.cover ? `<img src="${esc(pack.cover)}" alt="" />` : ""}
            <div>
              <strong>${esc(card.album)}${sourceEvent(card) ? ` · ${esc(sourceEvent(card))}` : ""}</strong>
              <span>${esc(card.artist)}</span>
            </div>
          </div>
        </section>
      </div>
      ${otherCards(card)}
    </div>
    ${action ? `<div class="buy">${action}</div>` : ""}
  `;
}

function feeNote(cart, place, abroad) {
  const quote = shippingQuote(cart.length, place);
  const customs = abroad
    ? `<p class="notice">관세 및 현지 세금은 배송비에 포함되지 않으며, 발생 시 수취인이 부담할 수 있습니다.</p>`
    : "";
  return `
    <div class="ship-facts">
      <div><span>배송지</span><strong>${esc(quote.place)}</strong></div>
      <div><span>포토카드</span><strong>${quote.count}장</strong></div>
      <div><span>배송방법</span><strong>${esc(quote.method)}</strong></div>
      <div><span>배송비</span><strong>${esc(quote.feeText)}</strong></div>
    </div>
    ${customs}`;
}

function loadAddresses() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADDRESS_KEY) || "null");
    return Array.isArray(saved) ? saved.filter((item) => item && item.id && item.region) : [];
  } catch (error) {
    console.warn(error);
    return [];
  }
}

let addresses = loadAddresses();

function persistAddresses() {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(addresses));
}

function addressesFor(region) {
  return addresses.filter((item) => item.region === region);
}

function blankAddressFields() {
  state.addressId = "";
  state.receiver = "";
  state.phone = "";
  state.email = "";
  state.postcode = "";
  state.address = "";
  state.addressDetail = "";
  state.city = "";
  state.province = "";
  state.country = state.region === "domestic" ? "대한민국" : "";
}

function fillAddress(item) {
  state.addressId = item.id;
  state.receiver = item.receiver || "";
  state.phone = item.phone || "";
  state.email = item.email || "";
  state.postcode = item.postcode || "";
  state.address = item.address || "";
  state.addressDetail = item.addressDetail || "";
  state.city = item.city || "";
  state.province = item.province || "";
  state.country = item.country || (item.region === "domestic" ? "대한민국" : "");
}

function applyDefaultAddress() {
  const list = addressesFor(state.region);
  const picked = list.find((item) => item.isDefault) || list[0];
  if (picked) fillAddress(picked);
  else blankAddressFields();
}

function addressSummary(item) {
  if (item.region === "domestic") return [item.address, item.addressDetail].filter(Boolean).join(" ");
  return [item.address, item.city, item.country].filter(Boolean).join(", ");
}

function currentAddressPayload() {
  return {
    region: state.region,
    receiver: state.receiver.trim(),
    phone: state.phone.trim(),
    email: state.email.trim(),
    postcode: state.postcode.trim(),
    address: state.address.trim(),
    addressDetail: state.addressDetail.trim(),
    city: state.city.trim(),
    province: state.province.trim(),
    country: state.country,
  };
}

function saveCurrentAddress() {
  if (!shipReady()) return false;
  const payload = currentAddressPayload();
  const found = addresses.find((item) => item.id === state.addressId);
  if (found) {
    Object.assign(found, payload);
  } else {
    const id = `AD_${Date.now()}`;
    const isDefault = !addresses.some((item) => item.region === state.region && item.isDefault);
    addresses.push({ id, isDefault, ...payload });
    state.addressId = id;
  }
  persistAddresses();
  return true;
}

function setDefaultAddress(id) {
  const found = addresses.find((item) => item.id === id);
  if (!found) return;
  addresses.forEach((item) => {
    if (item.region === found.region) item.isDefault = item.id === id;
  });
  persistAddresses();
  fillAddress(found);
}

function addressBook() {
  const list = addressesFor(state.region);
  const rows = list.length
    ? list.map((item) => `
      <div class="addr-item${item.id === state.addressId ? " on" : ""}">
        <button type="button" data-address="${esc(item.id)}">
          <strong>${esc(item.receiver)}${item.isDefault ? `<em>기본</em>` : ""}</strong>
          <span>${esc(addressSummary(item))}</span>
        </button>
        ${item.isDefault ? "" : `<button type="button" data-address-default="${esc(item.id)}">기본으로</button>`}
      </div>`).join("")
    : `<p class="meta">저장된 배송지가 없어요. 주소를 입력하고 저장해 주세요.</p>`;
  const add = list.length ? `<button type="button" data-address-new>신규 배송지</button>` : "";
  return `
    <div class="addr-book">
      <div class="addr-book-head">
        <strong>배송지</strong>
        ${add}
      </div>
      ${rows}
    </div>
  `;
}

function addressSaveButton() {
  return `<button type="button" class="ghost" data-address-save ${shipReady() ? "" : "disabled"}>이 배송지 저장</button>`;
}

function shipReady() {
  const cart = state.owned.some((card) => card.status === "shipping_cart");
  if (!cart || !state.receiver.trim() || !state.phone.trim()) return false;
  if (state.region === "domestic") return Boolean(state.postcode && state.address && state.addressDetail.trim());
  if (state.region === "abroad") {
    return Boolean(state.country && state.email.trim() && state.address.trim() && state.city.trim() && state.postcode.trim());
  }
  return false;
}

function domesticForm(cart) {
  return `
    <form class="ship-form">
      ${addressBook()}
      <label>받는 사람
        <input data-field="receiver" value="${esc(state.receiver)}" />
      </label>
      <label>연락처
        <input data-field="phone" value="${esc(state.phone)}" inputmode="tel" />
      </label>
      <label>우편번호
        <span class="postcode-row">
          <input value="${esc(state.postcode)}" readonly placeholder="검색해 주세요" />
          <button type="button" data-postcode>우편번호 검색</button>
        </span>
      </label>
      <label>주소
        <input value="${esc(state.address)}" readonly />
      </label>
      <label>상세 주소
        <input data-field="addressDetail" value="${esc(state.addressDetail)}" placeholder="동, 호수" />
      </label>
      ${addressSaveButton()}
      ${feeNote(cart, "대한민국", false)}
    </form>
  `;
}

function abroadForm(cart) {
  const countries = shippingPolicy().zones.map((item) => String(item.country || "").trim()).filter(Boolean);
  const options = countries.length
    ? countries.map((name) => `<option ${name === state.country ? "selected" : ""}>${esc(name)}</option>`).join("")
    : "";
  return `
    <form class="ship-form">
      ${addressBook()}
      <label>이름
        <input data-field="receiver" value="${esc(state.receiver)}" placeholder="영문 이름" autocomplete="name" />
      </label>
      <label>주소
        <input data-field="address" value="${esc(state.address)}" placeholder="도로명, 번지" autocomplete="address-line1" />
      </label>
      <label>상세 주소
        <input data-field="addressDetail" value="${esc(state.addressDetail)}" placeholder="아파트, 동호. 없으면 비워요" autocomplete="address-line2" />
      </label>
      <div class="addr-split">
        <label>도시
          <input data-field="city" value="${esc(state.city)}" placeholder="도시" autocomplete="address-level2" />
        </label>
        <label>주, 지역
          <input data-field="province" value="${esc(state.province)}" placeholder="없으면 비워요" autocomplete="address-level1" />
        </label>
      </div>
      <div class="addr-split">
        <label>우편번호
          <input data-field="postcode" value="${esc(state.postcode)}" placeholder="우편번호" autocomplete="postal-code" />
        </label>
        <label>국가
          <select data-country autocomplete="country-name">
            <option value="" ${state.country ? "" : "selected"} disabled>국가</option>
            ${options}
          </select>
        </label>
      </div>
      <label>연락처
        <input data-field="phone" value="${esc(state.phone)}" inputmode="tel" placeholder="국가번호 포함" autocomplete="tel" />
      </label>
      <label>이메일
        <input data-field="email" value="${esc(state.email)}" inputmode="email" autocomplete="email" />
      </label>
      ${addressSaveButton()}
      ${feeNote(cart, state.country, true)}
    </form>
  `;
}

function postcodeLayer() {
  const failed = state.postcodeError ? `<p class="notice">우편번호 검색을 불러오지 못했어요.</p>` : "";
  return `
    <div class="postcode-layer">
      <div class="postcode-bar">
        <button type="button" data-postcode-close>닫기</button>
        <strong>우편번호 검색</strong>
      </div>
      <div id="postcode-box"></div>
      ${failed}
    </div>
  `;
}

function shipBasket() {
  const cart = state.owned.filter((card) => card.status === "shipping_cart");
  const stored = state.owned.filter((card) => card.status === "stored");
  const figures = groupCards(cart).map(cardFigure).join("");
  const addLabel = state.shipPick ? "닫기" : "카드 추가";
  const picker = state.shipPick
    ? `
      <div class="ship-picker">
        ${stored.length
          ? `<div class="owned picker">${stored.map(pickFigure).join("")}</div>
             <button type="button" class="ship-confirm" data-ship-add-confirm ${state.picked.length ? "" : "disabled"}><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8l9-4 9 4-9 4-9-4z"></path><path d="M3 8v8l9 4 9-4V8"></path><path d="M12 12v8"></path></svg><span>${state.picked.length ? `${state.picked.length}장 담기` : "담을 카드 선택"}</span></button>`
          : `<p class="empty">담을 수 있는 카드가 없어요.</p>`}
      </div>`
    : "";
  return `
    <div class="owned">${figures}<button type="button" class="ship-add" data-ship-add>${addLabel}</button></div>
    ${picker}`;
}

function ship() {
  const cart = state.owned.filter((card) => card.status === "shipping_cart");
  const cards = shipBasket();
  const count = `<p class="ship-count">${cart.length} / ${maxShipCards()}장</p>`;
  if (!cart.length || !state.region) {
    return `
      <header class="bar">
        <button data-back="mypage" aria-label="마이페이지">←</button>
        <h1>배송바구니</h1>
        <span class="bar-tools">${menuButton()}</span>
      </header>
      <div class="scroll">
        ${count}
        ${cards}
        ${cart.length ? `
          <div class="region-pick">
            <p class="lead">어디로 받을까요?</p>
            <button class="primary" data-region="domestic">국내</button>
            <button class="ghost" data-region="abroad">해외</button>
          </div>` : ""}
      </div>
    `;
  }
  const title = state.region === "domestic" ? "국내 배송" : "해외 배송";
  const form = state.region === "domestic" ? domesticForm(cart) : abroadForm(cart);
  return `
    <header class="bar">
      <button data-region="" aria-label="국내 해외 다시 고르기">←</button>
      <h1>${title}</h1>
      <span class="bar-tools">${menuButton()}</span>
    </header>
    <div class="scroll">${count}${cards}${form}</div>
    <button class="primary pay-bar" data-request ${shipReady() ? "" : "disabled"}>배송비 결제</button>
    ${state.postcodeOpen ? postcodeLayer() : ""}
  `;
}

const ICON_PATH = {
  home: "M217.9,110.1l-80-80a14,14,0,0,0-19.8,0l-80,80A13.92,13.92,0,0,0,34,120v96a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V158h36v58a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V120A13.92,13.92,0,0,0,217.9,110.1ZM210,210H158V152a6,6,0,0,0-6-6H104a6,6,0,0,0-6,6v58H46V120a2,2,0,0,1,.58-1.42l80-80a2,2,0,0,1,2.84,0l80,80A2,2,0,0,1,210,120Z",
  album: "M216,42H72A14,14,0,0,0,58,56V74H40A14,14,0,0,0,26,88V200a14,14,0,0,0,14,14H184a14,14,0,0,0,14-14V182h18a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM70,56a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2v67.57L204.53,110.1a14,14,0,0,0-19.8,0l-21.42,21.41L117.9,86.1a14,14,0,0,0-19.8,0L70,114.2ZM186,200a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2V88a2,2,0,0,1,2-2H58v82a14,14,0,0,0,14,14H186Zm30-30H72a2,2,0,0,1-2-2V131.17l36.58-36.58a2,2,0,0,1,2.83,0l49.66,49.66a6,6,0,0,0,8.49,0l25.65-25.66a2,2,0,0,1,2.83,0l22,22V168A2,2,0,0,1,216,170ZM162,84a10,10,0,1,1,10,10A10,10,0,0,1,162,84Z",
  mypage: "M229.19,213c-15.81-27.32-40.63-46.49-69.47-54.62a70,70,0,1,0-63.44,0C67.44,166.5,42.62,185.67,26.81,213a6,6,0,1,0,10.38,6C56.4,185.81,90.34,166,128,166s71.6,19.81,90.81,53a6,6,0,1,0,10.38-6ZM70,96a58,58,0,1,1,58,58A58.07,58.07,0,0,1,70,96Z",
  ship: "M253.57,117.78l-14-35a13.93,13.93,0,0,0-13-8.8H190V64a6,6,0,0,0-6-6H32A14,14,0,0,0,18,72V184a14,14,0,0,0,14,14H50.6a30,30,0,0,0,58.8,0h53.2a30,30,0,0,0,58.8,0H240a14,14,0,0,0,14-14V120A6,6,0,0,0,253.57,117.78ZM190,86h36.58a2,2,0,0,1,1.86,1.26L239.14,114H190ZM30,72a2,2,0,0,1,2-2H178v68H30ZM80,210a18,18,0,1,1,18-18A18,18,0,0,1,80,210Zm82.6-24H109.4a30,30,0,0,0-58.8,0H32a2,2,0,0,1-2-2V150H178v15.48A30.1,30.1,0,0,0,162.6,186ZM192,210a18,18,0,1,1,18-18A18,18,0,0,1,192,210Zm50-26a2,2,0,0,1-2,2H221.4A30.05,30.05,0,0,0,192,162c-.67,0-1.34,0-2,.07V126h52Z",
  cart: "M134,120v56a6,6,0,0,1-12,0V120a6,6,0,0,1,12,0Zm40.83-.6-5.6,56A6,6,0,0,0,174.6,182l.61,0a6,6,0,0,0,6-5.4l5.6-56a6,6,0,0,0-11.94-1.2Zm-93.66,0a6,6,0,0,0-11.94,1.2l5.6,56a6,6,0,0,0,6,5.4l.61,0a6,6,0,0,0,5.37-6.57ZM238,88.79,222.87,201.85A14,14,0,0,1,209,214H47a14,14,0,0,1-13.87-12.15L18.05,88.79A6,6,0,0,1,24,82H69.28l54.2-61.95a6,6,0,0,1,9,0l54.2,62H232A6,6,0,0,1,238,88.79ZM85.22,82h85.56L128,33.11ZM225.15,94H30.85L45,200.26A2,2,0,0,0,47,202H209a2,2,0,0,0,2-1.74Z",
  heart: "M178,42c-21,0-39.26,9.47-50,25.34C117.26,51.47,99,42,78,42a60.07,60.07,0,0,0-60,60c0,29.2,18.2,59.59,54.1,90.31a334.68,334.68,0,0,0,53.06,37,6,6,0,0,0,5.68,0,334.68,334.68,0,0,0,53.06-37C219.8,161.59,238,131.2,238,102A60.07,60.07,0,0,0,178,42ZM128,217.11C111.59,207.64,30,157.72,30,102A48.05,48.05,0,0,1,78,54c20.28,0,37.31,10.83,44.45,28.27a6,6,0,0,0,11.1,0C140.69,64.83,157.72,54,178,54a48.05,48.05,0,0,1,48,48C226,157.72,144.41,207.64,128,217.11Z",
  heartFill: "M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40Z",
  track: "M222.72,67.91l-88-48.18a13.9,13.9,0,0,0-13.44,0l-88,48.18A14,14,0,0,0,26,80.18v95.64a14,14,0,0,0,7.28,12.27l88,48.18a13.92,13.92,0,0,0,13.44,0l88-48.18A14,14,0,0,0,230,175.82V80.18A14,14,0,0,0,222.72,67.91ZM127,30.25a2,2,0,0,1,1.92,0L212.51,76,178.57,94.57,94.05,48.31ZM122,223,39,177.57a2,2,0,0,1-1-1.75V86.66l84,46ZM43.49,76,81.56,55.15l84.51,46.26L128,122.24ZM218,175.82a2,2,0,0,1-1,1.75h0L134,223V132.64l36-19.71V152a6,6,0,0,0,12,0V106.37l36-19.71Z",
  share: "M176,162a37.91,37.91,0,0,0-28.3,12.67L98.8,143.24a37.89,37.89,0,0,0,0-30.48l48.9-31.43a38,38,0,1,0-6.5-10.09L92.3,102.67a38,38,0,1,0,0,50.66l48.9,31.43A38,38,0,1,0,176,162Zm0-132a26,26,0,1,1-26,26A26,26,0,0,1,176,30ZM64,154a26,26,0,1,1,26-26A26,26,0,0,1,64,154Zm112,72a26,26,0,1,1,26-26A26,26,0,0,1,176,226Z",
};

function icon(name) {
  return `<svg class="ico" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${ICON_PATH[name]}"/></svg>`;
}

function menuButton() {
  return `<button type="button" class="icon-btn" data-drawer aria-label="메뉴"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button>`;
}

function menuGroup(id, label, body) {
  const open = Boolean(state.menuGroups[id]);
  return `
    <button type="button" class="nav-group" data-menu-group="${id}" aria-expanded="${open}">
      <span>${label}</span>
      <i class="nav-chevron" aria-hidden="true"></i>
    </button>
    ${open ? `<div class="nav-sub">${body}</div>` : ""}
  `;
}

function drawer() {
  if (!state.menuOpen) return "";
  const item = (name, label) => `<button type="button" class="nav-item" data-nav="${name}">${label}</button>`;
  const mine = [
    item("album", "내 앨범"),
    item("wished", "찜"),
    item("ship", "배송바구니"),
    item("track", "배송내역"),
  ].join("");
  return `
    <div class="nav-bg">
      <aside class="nav-panel">
        <div class="nav-head">
          <strong>메뉴</strong>
          <button type="button" data-drawer-close aria-label="닫기">닫기</button>
        </div>
        ${item("home", "홈")}
        ${menuGroup("mypage", "MY", mine)}
        ${menuGroup("artist", "아티스트", item("artists", "전체 아티스트"))}
        ${item("notice", "공지사항")}
      </aside>
      <button type="button" class="nav-dim" data-drawer-close aria-label="메뉴 닫기"></button>
    </div>
  `;
}

function noticeItems() {
  try {
    const saved = JSON.parse(localStorage.getItem("photocard-notices-v1") || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) {
    console.warn(error);
  }
  return [{
    title: "보관과 배송",
    body: "뽑은 카드는 마이 앨범에 보관돼요. 실물로 받을 카드만 배송바구니에 담아요.",
    start: "2026-10-08",
  }];
}

function notices() {
  const articles = noticeItems().map((item) => {
    const date = String(item.start || "").slice(0, 10);
    const time = date ? `<time datetime="${esc(date)}">${esc(date.replaceAll("-", "."))}</time>` : "";
    return `
      <article class="notice">
        <strong>${esc(item.title || "공지")}</strong>
        <p>${esc(item.body || "").replaceAll("\n", "<br>")}</p>
        ${time}
      </article>`;
  }).join("");
  return `
    <header class="bar">
      <button data-back="home" aria-label="뒤로">←</button>
      <h1>공지사항</h1>
      ${menuButton()}
    </header>
    <div class="scroll">${articles}</div>
  `;
}

function mypage() {
  const cart = state.owned.filter((card) => card.status === "shipping_cart").length;
  return `
    <header class="bar">
      <h1>마이페이지</h1>
      <span class="bar-tools"><span class="balance">${balanceLabel()}</span>${menuButton()}</span>
    </header>
    <div class="scroll">
      <div class="stat-row">
        <button data-menu="wished">${icon("heart")}<strong>${state.wished.length}</strong><span>찜</span></button>
        <button data-menu="ship">${icon("ship")}<strong>${cart}</strong><span>배송바구니</span></button>
        <button data-menu="track">${icon("track")}<strong>${state.shipments.length}</strong><span>배송내역</span></button>
      </div>
    </div>
  `;
}

function wished() {
  const items = state.wished.map((id) => product(id)).filter(Boolean);
  const rows = items.length
    ? items.map((item) => {
      const word = saleWord(item);
      return `
      <button class="row${word ? " sold" : ""}" data-open="${item.id}">
        <span class="thumb">
          <img src="${item.cover}" alt="" />
          ${word ? `<em>${word}</em>` : ""}
        </span>
        <span>
          ${artistMark(item)}
          <p class="name">${esc(productName(item))}</p>
        </span>
      </button>`;
    }).join("")
    : `<p class="empty">찜한 상품이 없어요.</p>`;
  return `
    <header class="bar">
      <button data-back="mypage" aria-label="마이페이지">←</button>
      <h1>찜</h1>
      ${menuButton()}
    </header>
    <div class="scroll"><div class="list">${rows}</div></div>
  `;
}

function detail(item) {
  const slots = item.cards
    .map((card) => {
      const imgs = [
        card.front ? `<span class="face front"><img src="${photo(card.front)}" alt="" /></span>` : "",
        card.back ? `<span class="face"><img src="${photo(card.back)}" alt="" /></span>` : "",
      ].join("");
      return `
      <div class="slot pair">
        <div class="pair-imgs">${imgs}</div>
        <small>${esc(card.no)}</small>
      </div>`;
    })
    .join("");
  const canOne = state.balance >= item.price;
  const stockForFive = packStock(item) >= 5;
  const canFive = stockForFive && state.balance >= item.price * 5;
  const word = saleWord(item);
  const fiveNote = !word && !stockForFive ? `<p class="five-note">현재 연속 뽑기 불가</p>` : "";
  const buy = word
    ? `<button class="primary" type="button" disabled>${word}</button>`
    : `
      <div class="actions">
        <button class="primary" data-buy="1" ${canOne ? "" : "disabled"}>1장 뽑기</button>
        <button class="ghost" data-buy="5" ${canFive ? "" : "disabled"}>5장 연속 뽑기</button>
      </div>
      ${fiveNote}`;
  return `
    <div class="detail-top">
      <button data-back="${state.productFrom === "artist" || state.productFrom === "artists" ? state.productFrom : ""}" aria-label="뒤로">←</button>
      <strong>${esc(item.artist)}</strong>
    </div>
    <div class="scroll">
      <img class="cover" src="${item.cover}" alt="" />
      <div class="detail">
        <div class="artist-row">
          <button type="button" class="artist" data-profile="${esc(item.artistId)}" aria-label="${esc(item.artist)} 상품">${artistMark(item)}</button>
          <span class="detail-tools">
            <button type="button" data-wish="${item.id}" class="${state.wished.includes(item.id) ? "on" : ""}" aria-label="${state.wished.includes(item.id) ? "찜함" : "찜"}">${icon(state.wished.includes(item.id) ? "heartFill" : "heart")}</button>
            <button type="button" data-share="${item.id}" aria-label="공유하기">${icon("share")}</button>
          </span>
        </div>
        <h2>${esc(productName(item))}</h2>
        <p class="kind">${esc(summaryLine(item))}</p>
        <div class="detail-offer">
          <p class="lead">${lineup(item.cards.length)}</p>
          <p class="lead">${tott(item.price)}</p>
        </div>
        <div class="perks">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="1.5"></rect></svg>${esc(perkLabels(item)[0])}</span>
          <span>${icon("heart")}${esc(perkLabels(item)[1])}</span>
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 12l18-7-7 18-2.2-6.8L3 12z"></path></svg>${esc(perkLabels(item)[2])}</span>
        </div>
        <section class="section">
          <h3>포토카드 구성 ${item.cards.length}종</h3>
          <div class="slots">${slots}</div>
        </section>
        <section class="section">
          <div class="facts-box">
          <h3>상품 정보</h3>
          <table class="facts">
            <tr><th>사이즈</th><td>${esc(factValue(item, "size"))}</td></tr>
            <tr><th>상품 유형</th><td>${esc(factValue(item, "type"))}</td></tr>
            <tr><th>상품 상태</th><td>${esc(factValue(item, "state"))}</td></tr>
          </table>
          </div>
        </section>
        <div class="guides">
          ${guideSection("랜덤 상품 안내", item, "random")}
          ${guideSection("보관 안내", item, "storage")}
          ${guideSection("배송 안내", item, "shipping")}
          ${guideSection("상품 상태 안내", item, "condition")}
          ${guideSection("교환·환불 안내", item, "refund")}
        </div>
      </div>
    </div>
    <div class="buy">
      ${buy}
    </div>
  `;
}

const OPEN_CUT = {
  minDistance: 72,
  duration: 1200,
  haptic: true,
  particles: 6,
  trail: [0, 200],
  cut: [150, 450],
  flap: [400, 700],
  rise: [600, 1100],
};

const OPEN_BASE = "tears/base.jpg?v=2";
const OPEN_OVERS = [1, 2, 3, 4].map((index) => `tears/over-${index}.png?v=2`);

function showOpenFrame(stage, index) {
  const overs = [...stage.querySelectorAll(".open-over")];
  const next = Math.max(0, Math.min(overs.length, index));
  overs.forEach((img, item) => img.classList.toggle("is-on", item + 1 === next));
  return next;
}

function dragFrame(stage, dx) {
  const stack = stage.querySelector(".open-stack");
  const width = stack?.getBoundingClientRect().width || 1;
  const progress = Math.max(0, Math.min(1, Math.abs(dx) / width));
  const count = stage.querySelectorAll(".open-over").length;
  if (progress <= 0 || !count) return 0;
  return Math.min(count, Math.ceil(progress * count));
}

function revealBackSrc(card) {
  const item = product(state.productId);
  const found = item?.cards.find((entry) => entry.no === card.no && entry.back);
  return found ? photo(found.back) : "";
}

function openEase(elapsed, start, end) {
  if (elapsed <= start) return 0;
  if (elapsed >= end) return 1;
  const progress = (elapsed - start) / (end - start);
  return 1 - (1 - progress) ** 3;
}

function openHaptic(kind) {
  if (!OPEN_CUT.haptic || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(kind === "medium" ? 18 : 8);
}

function sealedPack() {
  const card = state.reveal[state.revealIndex];
  const count = state.reveal.length;
  const back = card ? revealBackSrc(card) : "";
  const cardLayer = back
    ? `<img class="open-card" src="${back}" alt="" draggable="false" />`
    : `<div class="open-card open-card-blank"></div>`;
  const overs = OPEN_OVERS.map((src) => `<img class="open-over" src="${src}" alt="" draggable="false" />`).join("");
  const frontFace = card?.front
    ? `<img class="fly-face front guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" />`
    : `<span class="fly-face front fly-blank"></span>`;
  const backFace = back
    ? `<img class="fly-face back" src="${back}" alt="" draggable="false" />`
    : `<span class="fly-face back fly-blank"></span>`;
  return `
    <header class="bar open-bar"><h1>포장</h1>${count > 1 ? `<span class="result-progress">${state.revealIndex + 1} / ${count}</span>` : ""}</header>
    <div class="open-stage" data-open-stage>
      <div class="open-stack">
        <div class="env-back"></div>
        ${cardLayer}
        <div class="open-frames">
          <img class="open-base" src="${OPEN_BASE}" alt="" draggable="false" />
          ${overs}
        </div>
      </div>
      <div class="fly-card">
        <div class="fly-spin">${frontFace}${backFace}</div>
      </div>
      <video class="open-burst" data-open-burst src="fx/splash.mp4?v=1" muted playsinline preload="auto"></video>
      <p class="open-guide"><span class="open-finger" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"></path><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"></path></svg></span>손가락으로 밀어 열어보세요</p>
    </div>
  `;
}

function openMotion() {
  return `
    <div class="motion" aria-label="포장 오픈">
      <span class="motion-ring"></span>
      <span class="motion-flash"></span>
      <img class="motion-pack" src="pack_closed.png" alt="" />
    </div>
  `;
}

function result() {
  const item = product(state.productId);
  const card = state.reveal[state.revealIndex];
  const count = state.reveal.length;
  const index = state.revealIndex + 1;
  const last = index === count;
  const progress = count > 1 ? `<span class="result-progress">${index} / ${count}</span>` : "";
  const who = [card.member, card.rarity].filter(Boolean).join(" · ");
  const back = revealBackSrc(card);
  const backFace = back
    ? `<img class="reveal-face back" src="${back}" alt="" draggable="false" />`
    : `<span class="reveal-face back reveal-back-blank"></span>`;
  const boxed = card.status === "shipping_cart";
  const boxButton = boxed
    ? `<button class="ghost" type="button" data-result-box-go>배송박스 보기</button>`
    : `<button class="ghost" type="button" data-result-box>배송박스에 담기</button>`;
  const status = boxed
    ? `<p class="result-status">배송박스</p>`
    : `<p class="result-status">마이앨범에서 확인 가능해요</p>`;
  const next = last
    ? `
      <div class="result-actions">
        <button class="primary" data-again="1">한 번 더 뽑기</button>
        <div class="result-split">
          ${boxButton}
          <button class="ghost" data-tab="home">다른 팩 보기</button>
        </div>
        <button class="result-more" data-again="5">이 팩 5번 연속 뽑기</button>
      </div>`
    : `<div class="result-actions"><button class="primary" data-next>다음 카드 ${index + 1}/${count}</button></div>`;
  return `
    <header class="bar result-bar"><h1>${boxed ? "배송박스" : ""}</h1>${progress}</header>
    <div class="scroll">
      <div class="result">
        <div class="reveal-flip">
          <div class="reveal-spin">
            <img class="reveal-face front guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" />
            ${backFace}
          </div>
        </div>
        ${artistMark(item)}
        <h2>${esc(item.album)} ${esc(card.no)}</h2>
        ${who ? `<p class="result-grade">${esc(who)}</p>` : ""}
        ${status}
        ${next}
      </div>
    </div>
  `;
}

function balanceLabel() {
  return state.walletConnected ? tott(state.balance) : "미연결";
}

function sheet() {
  if (!state.sheet) return "";
  const item = product(state.productId);
  const count = state.sheet;
  const cost = item.price * count;
  const rows = count === 1
    ? [
        ["현재가격", tott(cost)],
        ["보유", tott(state.balance)],
        ["차감 후 남은 잔액", tott(state.balance - cost)],
      ]
    : [
        ["5장 뽑기", tott(cost)],
        ["보유", tott(state.balance)],
        ["결제 후", tott(state.balance - cost)],
      ];
  if (!state.walletConnected) {
    return `
      <div class="sheet-bg">
        <div class="sheet">
          <span class="sheet-grab"></span>
          <h2 class="sheet-need">지갑 연결이 필요해요</h2>
          <p class="sheet-copy">포토카드는 TOTT로 결제해요.<br>지갑을 연결하면 바로 결제를 계속할 수 있어요.</p>
          <p class="sheet-copy sub">연결 후 현재 결제 화면으로 돌아옵니다.</p>
          <button class="primary" type="button" data-wallet-connect>지갑 연결하기</button>
          <button class="ghost" type="button" data-sheet-close>닫기</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="sheet-bg">
      <div class="sheet">
        <span class="sheet-grab"></span>
        <img class="sheet-cover" src="${item.cover}" alt="" />
        <div class="sheet-who">${artistMark(item)}</div>
        <h2>${esc(productName(item))}</h2>
        <p class="sheet-lineup">${esc(lineup(item.cards.length))}</p>
        <div class="sheet-box">
          ${rows
            .map(
              ([label, value]) => `<div class="sheet-line"><span>${label}</span><strong>${value}</strong></div>`,
            )
            .join("")}
        </div>
        <div class="sheet-note">
          ${sheetNotes(item).map((line) => `<p>${esc(line)}</p>`).join("")}
        </div>
        <button class="primary" data-pay="${count}">결제하기</button>
      </div>
    </div>
  `;
}

function resultBoxModal() {
  if (!state.resultBox) return "";
  return `
    <div class="modal-bg">
      <div class="modal">
        <h2>배송박스에 담았어요.</h2>
        <p>여러 장을 모아 한 번에 배송받을 수 있어요.</p>
        <button type="button" class="primary" data-result-box-go>배송박스 보기</button>
        <button type="button" class="ghost" data-result-box-stay>계속 둘러보기</button>
      </div>
    </div>
  `;
}

function cartModal() {
  if (!state.cartModal) return "";
  return `
    <div class="modal-bg">
      <div class="modal">
        <h2>배송바구니에 담겼습니다.</h2>
        <button type="button" class="primary" data-cart-go>바로이동</button>
        <button type="button" class="ghost" data-cart-more>더담기</button>
      </div>
    </div>
  `;
}

function walletModal() {
  if (!state.walletModal) return "";
  return `
    <div class="modal-bg">
      <div class="modal wallet-modal">
        <h2>지갑 연결</h2>
        <p>TOTT로 결제하려면<br>지갑을 먼저 연결해 주세요.</p>
        <button type="button" class="primary" data-wallet-connect>지갑 연결하기</button>
        <button type="button" class="ghost" data-wallet-close>닫기</button>
      </div>
    </div>
  `;
}

function moveOne(id, status) {
  const card = state.owned.find((item) => item.id === id);
  if (!card) return false;
  if (status === "shipping_cart") {
    const count = state.owned.filter((item) => item.status === "shipping_cart").length;
    if (count >= maxShipCards()) return false;
  }
  card.status = status;
  return true;
}

function moveStored(ids) {
  const targets = [...new Set(ids)]
    .map((id) => state.owned.find((item) => item.id === id))
    .filter((card) => card && card.status === "stored");
  const room = maxShipCards() - state.owned.filter((item) => item.status === "shipping_cart").length;
  if (!targets.length || targets.length > room) return false;
  targets.forEach((card) => {
    card.status = "shipping_cart";
  });
  return true;
}

function draw(item, count) {
  const picked = [];
  for (let i = 0; i < count; i += 1) {
    const card = item.cards[Math.floor(Math.random() * item.cards.length)];
    const owned = own({
      artist: item.artist,
      album: item.album,
      no: card.no,
      front: card.front,
      member: card.member,
      rarity: card.rarity,
      status: "stored",
    });
    picked.push(owned);
    state.owned.push(owned);
  }
  persistPurchase({
    id: `PU_${Date.now()}`,
    kind: "purchase",
    status: "paid",
    purchasedOn: isoDate(),
    productId: item.id,
    productName: productName(item),
    artist: item.artist,
    album: item.album,
    count,
    price: item.price * count,
    cards: picked.map((card) => ({
      id: card.id,
      artist: card.artist,
      album: card.album,
      no: card.no,
      member: card.member || "",
    })),
  });
  state.balance -= item.price * count;
  state.reveal = picked;
  state.revealIndex = 0;
  state.sheet = null;
  state.openPhase = "pack";
  state.openCut = "idle";
  state.motionArmed = false;
  state.screen = "open";
  state.tab = "home";
}

function blurFronts() {
  document.querySelectorAll("[data-front]").forEach((img) => {
    const sourceUrl = img.dataset.front;
    img.removeAttribute("data-front");
    const source = new Image();
    source.onload = () => {
      if (!img.isConnected) return;
      const width = 180;
      const height = Math.round((width * 85) / 55);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const pad = 16;
      ctx.filter = "blur(8px)";
      ctx.drawImage(source, -pad, -pad, width + pad * 2, height + pad * 2);
      ctx.filter = "none";
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, width, height);
      img.src = canvas.toDataURL("image/jpeg", 0.82);
    };
    source.src = sourceUrl;
  });
}

function protectFronts() {
  document.querySelectorAll("[data-protect]").forEach((img) => {
    const sourceUrl = img.dataset.protect;
    const mark = img.dataset.mark || "TOMATOK";
    img.removeAttribute("data-protect");
    const source = new Image();
    source.onload = () => {
      if (!img.isConnected) return;
      const width = 540;
      const height = Math.max(1, Math.round(width * (source.naturalHeight / source.naturalWidth)));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(source, 0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-0.45);
      ctx.textAlign = "center";
      ctx.font = "600 28px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.34)";
      for (let y = -height; y <= height; y += 120) {
        for (let x = -width; x <= width; x += 220) {
          ctx.fillText("TOMATOK", x, y);
          ctx.font = "500 16px sans-serif";
          ctx.fillText(mark, x, y + 24);
          ctx.font = "600 28px sans-serif";
        }
      }
      ctx.restore();
      img.src = canvas.toDataURL("image/jpeg", 0.82);
    };
    source.src = sourceUrl;
  });
}

function shieldFronts(hidden) {
  document.querySelectorAll(".guard").forEach((img) => {
    img.style.visibility = hidden ? "hidden" : "";
  });
}

function previewCard(productId, index) {
  const item = product(productId);
  const card = item.cards[index];
  return {
    artist: item.artist,
    album: item.album,
    no: card.no,
    front: card.front,
    member: card.member,
    rarity: card.rarity,
    status: "stored",
    id: `UC_PREVIEW_${index + 1}`,
  };
}

const ADMIN_PAGES = {
  "admin-dash": "dash",
  "admin-pack": "pack",
  "admin-cards": "cards",
  "admin-banner": "banner",
  "admin-orders": "orders",
  "admin-ship": "ship",
  "admin-track": "track",
  "admin-policy": "policy",
  "admin-notice": "notice",
};

function applyScene(id) {
  if (id === "admin" || ADMIN_PAGES[id]) {
    state.board = "admin";
    state.adminScene = ADMIN_PAGES[id] ? id : "admin-dash";
    state.sheet = null;
    document.body.classList.remove("admin-board");
    openAdmin(ADMIN_PAGES[state.adminScene]);
    paintBoard();
    return;
  }
  state.board = "service";
  state.adminScene = "";
  document.body.classList.remove("admin-board");
  closeAdmin();
  state.owned = seedOwned();
  state.shipments = seedShipments(state.owned);
  state.focusTrack = "all";
  state.shipmentId = "";
  state.searchOpen = false;
  state.query = "";
  state.catalogQuery = "";
  state.catalogSearch = false;
  state.catalogFilter = "all";
  state.catalogKind = "all";
  state.profile = "";
  state.profileFrom = "";
  state.menuOpen = false;
  state.menuGroups = { mypage: false, artist: false };
  state.pickMode = false;
  state.picked = [];
  state.shipQty = 1;
  state.openPhase = "card";
  state.motionArmed = false;
  state.sheet = null;
  state.screen = "home";
  state.tab = "home";
  state.focusStatus = null;
  state.albumArtist = "all";
  state.productId = "blackpink-jump";
  state.reveal = [];
  state.revealIndex = 0;
  state.balance = 500;
  state.walletConnected = false;
  state.walletModal = false;
  state.cartModal = false;
  state.region = "";
  state.country = "";
  state.addressId = "";
  state.receiver = "";
  state.phone = "";
  state.email = "";
  state.postcode = "";
  state.address = "";
  state.addressDetail = "";
  state.city = "";
  state.province = "";
  state.cardId = "";
  state.postcodeOpen = false;
  state.postcodeError = false;
  if (id === "detail" || id === "pay" || id === "pay5") {
    state.screen = "detail";
    if (id === "pay") state.sheet = 1;
    if (id === "pay5") state.sheet = 5;
  } else if (id === "result") {
    state.screen = "result";
    state.reveal = [previewCard("blackpink-jump", 1)];
  } else if (id === "five") {
    state.screen = "result";
    state.reveal = product("blackpink-jump").cards.map((_, index) => previewCard("blackpink-jump", index));
  } else if (id === "album") {
    state.tab = "album";
    state.screen = "album";
  } else if (id === "mypage") {
    state.tab = "mypage";
    state.screen = "mypage";
  } else if (id === "ship") {
    state.tab = "mypage";
    state.screen = "ship";
  } else if (id === "stored") {
    state.tab = "album";
    state.screen = "album";
    state.focusStatus = "stored";
  } else if (id === "track" || TRACK.includes(id)) {
    state.tab = "mypage";
    state.screen = "track";
    state.focusTrack = id === "track" ? "all" : id;
    state.shipmentId = "";
  }
  render();
}

function openAdmin(menu = "dash") {
  document.body.classList.add("admin-view");
  let frame = document.querySelector("#admin-frame");
  if (!frame) {
    frame = document.createElement("iframe");
    frame.id = "admin-frame";
    frame.title = "포토카드 관리자";
    document.querySelector("#stage").append(frame);
  }
  const tell = () => {
    frame.contentWindow?.postMessage({ source: "photocard-preview", screen: menu }, "*");
  };
  frame.onload = tell;
  if (!frame.getAttribute("src")) frame.src = `../register/index.html?v=63&menu=${encodeURIComponent(menu)}`;
  else tell();
}

function closeAdmin() {
  document.body.classList.remove("admin-view");
}

function currentScene() {
  if (state.board === "admin" && state.adminScene) return state.adminScene;
  if (state.screen === "admin") return "admin";
  if (state.sheet === 1 && state.screen === "detail") return "pay";
  if (state.sheet === 5 && state.screen === "detail") return "pay5";
  if (state.screen === "card") return "card";
  if (state.screen === "detail") return "detail";
  if (state.screen === "open" || state.screen === "result") return state.reveal.length > 1 ? "five" : "result";
  if (state.tab === "track" || state.screen === "track") return TRACK.includes(state.focusTrack) ? state.focusTrack : "track";
  if (state.tab === "ship" || state.screen === "ship") return "ship";
  if (state.screen === "mypage" || state.screen === "wished") return "mypage";
  if (state.screen === "album" || state.tab === "album") return state.focusStatus === "stored" ? "stored" : "album";
  if (state.screen === "artist" || state.screen === "artists") return "artist";
  return "home";
}

const NOTES = {
  "admin-dash": "",
  "admin-pack": `<h2>상품관리</h2><p>랜덤팩의 판매와 노출을 정해요.</p>`,
  "admin-cards": `<h2>카드관리</h2><p>팩 안 카드의 앞뒷면과 재고를 정해요.</p>`,
  "admin-banner": `<h2>배너관리</h2><p>홈 배너의 이미지와 순서를 정해요.</p>`,
  "admin-orders": `<h2>주문관리</h2><p>배송 요청과 송장 상태를 봐요.</p>`,
  "admin-policy": `<h2>배송정책</h2><p>나라와 무게구간 배송비를 적어요. 비우면 앱은 미정이에요.</p>`,
  "admin-notice": `<h2>공지관리</h2><p>앱 공지를 등록해요.</p>`,
  home: `<h2>홈</h2><p>가수 프로필과 노출된 상품이 나와요. 카드 앞면은 여기 없어요.</p>`,
  detail: `<h2>상세</h2><p>이 팩을 바로 뽑는 화면이에요.</p>`,
  pay: `<h2>1장 결제</h2><p>같은 팩 1장을 TOTT로 결제해요. 잔액이 부족하면 안 돼요.</p>`,
  pay5: `<h2>5장 결제</h2><p>같은 팩 5장을 한 번에 결제해요. 재고가 5장 미만이면 막혀요.</p>`,
  result: `<h2>결과</h2><p>포장을 연 뒤에 카드 앞면이 나와요.</p>`,
  five: `<h2>5장 연속</h2><p>같은 팩 5장을 한 장씩 이어서 열어요.</p>`,
  mypage: `<h2>마이페이지</h2><p>찜, 배송, 배송 현황으로 가는 메뉴예요.</p>`,
  album: `<h2>마이 앨범</h2><p>가진 카드예요. 보관 중인 카드만 배송바구니에 담아요.</p>`,
  card: `<h2>보유 카드</h2><p>카드 한 장의 앞뒷면과 상태예요.</p>`,
  stored: `<h2>보관 중</h2><p>뽑고 아직 배송 전인 카드예요.</p>`,
  ship: `<h2>배송바구니</h2><p>뽑은 카드를 모아 배송비를 내는 화면이에요.</p>`,
  track: `<h2>배송 현황</h2><p>배송 한 건의 요청, 출고, 배송, 수령이에요.</p>`,
  shipping_requested: `<h2>배송 요청 완료</h2><p>배송비를 낸 직후예요. 송장은 아직 없어요.</p>`,
  preparing: `<h2>출고 준비</h2><p>출고 준비 중인 배송이에요.</p>`,
  shipped: `<h2>배송 중</h2><p>송장이 등록된 배송이에요.</p>`,
  delivered: `<h2>수령</h2><p>받은 배송이에요.</p>`,
  artist: `<h2>가수 상품</h2><p>그 가수의 상품만 나와요.</p>`,
  "sale-on": `<h2>판매중</h2><p>목록에 가격이 보이고 뽑을 수 있어요.</p>`,
  "sale-out": `<h2>품절</h2><p>목록에는 있지만 뽑기는 막혀요.</p>`,
  "sale-soon": `<h2>입고예정</h2><p>목록에는 있지만 아직 뽑을 수 없어요.</p>`,
  "sale-draft": `<h2>등록중</h2><p>앱 목록에 안 나와요.</p>`,
  "ship-requested": `<h2>배송 요청 완료</h2><p>배송비를 낸 직후예요. 다음은 출고 준비예요.</p>`,
  "ship-preparing": `<h2>출고 준비</h2><p>송장을 적은 뒤에 배송 중으로 넘겨요.</p>`,
  "ship-shipped": `<h2>배송 중</h2><p>송장이 등록된 상태예요.</p>`,
  "ship-delivered": `<h2>수령</h2><p>받은 뒤예요. 다음 단계는 없어요.</p>`,
};

function loadPostcode(done) {
  if (window.daum && window.daum.Postcode) {
    done();
    return;
  }
  const existing = document.querySelector("script[data-daum-postcode]");
  if (existing) {
    existing.addEventListener("load", done, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  script.dataset.daumPostcode = "1";
  script.onload = done;
  script.onerror = () => {
    state.postcodeError = true;
    const box = document.querySelector("#postcode-box");
    if (box) box.insertAdjacentHTML("afterend", `<p class="notice">우편번호 검색을 불러오지 못했어요.</p>`);
  };
  document.head.appendChild(script);
}

function mountPostcode() {
  const box = document.querySelector("#postcode-box");
  if (!box || !state.postcodeOpen) return;
  loadPostcode(() => {
    if (!state.postcodeOpen || !window.daum || !window.daum.Postcode) return;
    const current = document.querySelector("#postcode-box");
    if (!current) return;
    current.innerHTML = "";
    new window.daum.Postcode({
      oncomplete(data) {
        state.postcode = data.zonecode;
        state.address = data.roadAddress || data.autoRoadAddress || data.jibunAddress;
        state.postcodeOpen = false;
        render();
      },
      width: "100%",
      height: "100%",
    }).embed(current);
  });
}

function finishOpen() {
  state.openCut = "completed";
  state.openPhase = "card";
  state.screen = "result";
  render();
}

function playBurst(stage, done) {
  const video = stage.querySelector("[data-open-burst]");
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    video?.pause();
    done();
  };
  if (!video || !stage.isConnected) {
    window.setTimeout(finish, 1000);
    return;
  }
  video.playbackRate = 2;
  video.classList.add("is-on");
  const trimEnd = () => {
    if (settled || !stage.isConnected) return;
    if (video.currentTime >= 3) {
      finish();
      return;
    }
    requestAnimationFrame(trimEnd);
  };
  video.addEventListener("ended", finish, { once: true });
  video.addEventListener("error", () => window.setTimeout(finish, 1000), { once: true });
  window.setTimeout(finish, 5000);
  const started = video.play();
  const arm = () => {
    video.playbackRate = 2;
    requestAnimationFrame(trimEnd);
  };
  if (started && typeof started.then === "function") started.then(arm).catch(() => window.setTimeout(finish, 1000));
  else arm();
}

function launchCard(stage) {
  showOpenFrame(stage, stage.querySelectorAll(".open-over").length);
  const fly = stage.querySelector(".fly-card");
  const spin = fly?.querySelector(".fly-spin");
  let left = false;
  const revealFront = () => {
    if (left) return;
    left = true;
    playBurst(stage, () => {
      if (!stage.isConnected) return;
      finishOpen();
    });
  };
  window.setTimeout(() => {
    if (!left && stage.isConnected) revealFront();
  }, 2600);
  if (!fly || !spin || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    fly?.classList.add("is-go");
    left = true;
    window.setTimeout(() => {
      if (!stage.isConnected) return;
      finishOpen();
    }, 1000);
    return;
  }
  fly.classList.add("is-go");
  spin.addEventListener("animationend", (event) => {
    if (event.animationName !== "card-whirl") return;
    revealFront();
  });
}

function runOpenCut(stage, startFrame) {
  const last = stage.querySelectorAll(".open-over").length;
  const from = Math.max(0, Math.min(last, startFrame));
  if (from >= last) {
    launchCard(stage);
    return;
  }
  const started = performance.now();
  const frame = (now) => {
    if (!stage.isConnected) return;
    const cut = openEase(now - started, OPEN_CUT.cut[0], OPEN_CUT.cut[1]);
    showOpenFrame(stage, from + Math.round((last - from) * cut));
    if (cut < 1) {
      requestAnimationFrame(frame);
      return;
    }
    launchCard(stage);
  };
  requestAnimationFrame(frame);
}

function armOpenCut() {
  const stage = document.querySelector("[data-open-stage]");
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = "1";
  let startX = 0;
  let startY = 0;
  let tracking = false;
  stage.addEventListener("pointerdown", (event) => {
    if (state.openCut !== "idle") return;
    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
    stage.classList.add("is-touching");
    try { stage.setPointerCapture(event.pointerId); } catch (error) { /* 합성 이벤트 */ }
  });
  stage.addEventListener("pointermove", (event) => {
    if (!tracking || state.openCut !== "idle") return;
    showOpenFrame(stage, dragFrame(stage, event.clientX - startX));
  });
  stage.addEventListener("pointerup", (event) => {
    if (!tracking || state.openCut !== "idle") return;
    tracking = false;
    stage.classList.remove("is-touching");
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < OPEN_CUT.minDistance) {
      showOpenFrame(stage, 0);
      return;
    }
    const shown = dragFrame(stage, dx);
    state.openCut = "cutting";
    stage.classList.add("is-opening");
    openHaptic("light");
    runOpenCut(stage, shown);
  });
  stage.addEventListener("pointercancel", () => {
    tracking = false;
    stage.classList.remove("is-touching");
    if (state.openCut === "idle") showOpenFrame(stage, 0);
  });
}

function armMotion() {
  if (state.openPhase !== "motion") {
    state.motionArmed = false;
    return;
  }
  if (state.motionArmed) return;
  state.motionArmed = true;
  window.setTimeout(() => {
    state.motionArmed = false;
    if (state.openPhase !== "motion") return;
    state.openPhase = "card";
    state.screen = "result";
    render();
  }, 4300);
}

function guideSection(title, item, key) {
  const lines = linesOf(item.guides?.[key], GUIDES[key]);
  return `
        <details class="guide">
          <summary>${title}</summary>
          <ul>${lines.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
        </details>`;
}

function midBanners() {
  const mid = liveBanners("mid");
  if (mid?.length) {
    return mid.map((banner) => {
      const lines = bannerLines(banner.packId, banner.line1, banner.line2);
      return { open: banner.packId, image: banner.image, alt: lines.line1, ...lines };
    });
  }
  return [
    {
      nav: "album",
      image: "album-banner.png",
      alt: "뽑은 포토카드는 내 앨범에 보관돼요",
    },
  ];
}

function midSlide(banner) {
  const action = banner.nav ? `data-nav="${banner.nav}"` : `data-open="${esc(banner.open)}"`;
  const copy = banner.line1
    ? `<span class="mid-copy"><strong>${esc(banner.line1)}</strong><span>${esc(banner.line2)}</span></span>`
    : "";
  const photo = banner.line1 ? " is-photo" : "";
  return `<button type="button" class="mid-slide${photo}" ${action} aria-label="${esc(banner.alt)}"><img src="${banner.image}" alt="${esc(banner.alt)}" />${copy}</button>`;
}

function midTransform(index) {
  return `translateX(calc(44px - ${index} * (100cqi - 80px)))`;
}

function midBanner() {
  const banners = midBanners();
  if (!banners.length) return "";
  const loop = banners.length > 1;
  const slides = banners.map(midSlide).join("");
  const track = loop ? `${midSlide(banners.at(-1))}${slides}${midSlide(banners[0])}` : slides;
  const index = loop ? state.midIndex + 1 : 0;
  return `
    <div class="mid-banner">
      <div class="mid-viewport${loop ? "" : " is-single"}">
        <div class="mid-track" style="transform:${midTransform(index)}">${track}</div>
      </div>
    </div>`;
}

function bannerTransform(index) {
  return `translateX(calc(28px - ${index} * (100cqi - 48px)))`;
}

function placeBanner(index, animate) {
  const track = document.querySelector(".banner-track");
  if (!track) return;
  if (!animate) track.style.transition = "none";
  track.style.transform = bannerTransform(index);
  if (!animate) {
    track.offsetHeight;
    track.style.transition = "";
  }
}

function paintBannerDots() {
  document.querySelectorAll("[data-dot]").forEach((dot) => {
    dot.classList.toggle("on", Number(dot.dataset.dot) === state.bannerIndex);
  });
}

function moveBanner(index) {
  const count = eventBanners().length;
  if (count < 2) {
    state.bannerIndex = 0;
    placeBanner(0, true);
    paintBannerDots();
    return;
  }
  const next = (index + count) % count;
  const forwardWrap = state.bannerIndex === count - 1 && next === 0 && index > state.bannerIndex;
  const backWrap = state.bannerIndex === 0 && next === count - 1 && index < state.bannerIndex;
  state.bannerIndex = next;
  paintBannerDots();
  if (forwardWrap) {
    placeBanner(count + 1, true);
    const track = document.querySelector(".banner-track");
    track?.addEventListener("transitionend", () => placeBanner(1, false), { once: true });
    return;
  }
  if (backWrap) {
    placeBanner(0, true);
    const track = document.querySelector(".banner-track");
    track?.addEventListener("transitionend", () => placeBanner(count, false), { once: true });
    return;
  }
  placeBanner(next + 1, true);
}

function startBanner() {
  clearInterval(bannerTimer);
  const track = document.querySelector(".banner-track");
  if (!track || eventBanners().length < 2) return;
  const viewport = track.parentElement;
  viewport.onpointerdown = (event) => {
    bannerDrag = event.clientX;
  };
  viewport.onpointerup = (event) => {
    const delta = event.clientX - bannerDrag;
    if (Math.abs(delta) < 36) return;
    event.preventDefault();
    state.bannerSuppress = true;
    moveBanner(state.bannerIndex + (delta < 0 ? 1 : -1));
  };
  bannerTimer = setInterval(() => moveBanner(state.bannerIndex + 1), 3500);
}

function placeMid(index, animate) {
  const track = document.querySelector(".mid-track");
  if (!track) return;
  if (!animate) track.style.transition = "none";
  track.style.transform = midTransform(index);
  if (!animate) {
    track.offsetHeight;
    track.style.transition = "";
  }
}

function moveMid(index) {
  const count = midBanners().length;
  if (count < 2) {
    state.midIndex = 0;
    placeMid(0, true);
    return;
  }
  const next = (index + count) % count;
  const forwardWrap = state.midIndex === count - 1 && next === 0 && index > state.midIndex;
  const backWrap = state.midIndex === 0 && next === count - 1 && index < state.midIndex;
  state.midIndex = next;
  if (forwardWrap) {
    placeMid(count + 1, true);
    document.querySelector(".mid-track")?.addEventListener("transitionend", () => placeMid(1, false), { once: true });
    return;
  }
  if (backWrap) {
    placeMid(0, true);
    document.querySelector(".mid-track")?.addEventListener("transitionend", () => placeMid(count, false), { once: true });
    return;
  }
  placeMid(next + 1, true);
}

function startMidBanner() {
  clearInterval(midTimer);
  const track = document.querySelector(".mid-track");
  if (!track || midBanners().length < 2) return;
  const viewport = track.parentElement;
  viewport.onpointerdown = (event) => {
    midDrag = event.clientX;
  };
  viewport.onpointerup = (event) => {
    const delta = event.clientX - midDrag;
    if (Math.abs(delta) < 36) return;
    event.preventDefault();
    state.midSuppress = true;
    moveMid(state.midIndex + (delta < 0 ? 1 : -1));
  };
  midTimer = setInterval(() => moveMid(state.midIndex + 1), 3500);
}

function paintBoard() {
  const id = currentScene();
  document.querySelectorAll("[data-board]").forEach((button) => {
    button.classList.toggle("on", button.dataset.board === state.board);
  });
  document.querySelectorAll("[data-board-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.boardPanel !== state.board;
  });
  document.querySelectorAll("[data-scene]").forEach((button) => {
    button.classList.toggle("on", button.dataset.scene === id);
  });
  const notes = document.querySelector("#notes");
  if (notes) {
    notes.innerHTML = NOTES[id] || "";
    notes.hidden = !notes.textContent.trim();
  }
}

function adminCanvas() {
  let node = document.querySelector("#admin-canvas");
  if (!node) {
    node = document.createElement("div");
    node.id = "admin-canvas";
    document.querySelector("#stage").append(node);
  }
  return node;
}

function adminRows(pairs) {
  return pairs.map(([label, value]) => `<div class="admin-row"><dt>${label}</dt><dd>${value}</dd></div>`).join("");
}

function paintAdmin() {
  const id = state.adminScene;
  const sale = { "sale-on": "on", "sale-out": "out", "sale-soon": "soon", "sale-draft": "draft" }[id];
  adminCanvas().innerHTML = sale ? adminSaleScreen(sale) : adminShipScreen(id.replace("ship-", ""));
}

function adminSaleScreen(sale) {
  const item = product("blackpink-jump");
  const titles = { on: "판매중", out: "품절", soon: "입고예정", draft: "등록중" };
  const listed = sale !== "draft";
  const badge = sale === "out" ? "품절" : sale === "soon" ? "입고예정" : "";
  const preview = listed
    ? `<div class="shelf">
        <div class="admin-tile tile">
          ${productThumbnail(item.cover, badge ? `<span class="sale-mark ${sale}">${badge}</span>` : "")}
          <span class="tile-who">${artistMark(item)}</span>
          <span class="tile-name">${esc(setTitle(item))}</span>
          <span class="tile-line">${esc(lineup(item.cards.length))}</span>
          <span class="tile-price">${tott(item.price)}</span>
        </div>
      </div>`
    : `<p class="admin-missing">NEW, ALL, 가수 상품에<br />이 상품이 없어요.</p>`;
  return `
    <section class="admin-screen">
      <p class="admin-kicker">고객 화면</p>
      <h2>${titles[sale]}</h2>
      ${preview}
    </section>`;
}

function adminShipScreen(status) {
  const view = {
    requested: ["배송 요청 완료", "없음", "출고 준비"],
    preparing: ["출고 준비", "", "배송 중"],
    shipped: ["배송 중", "등록됨", "수령"],
    delivered: ["수령", "등록됨", ""],
  }[status];
  const [title, tracking, action] = view;
  const trackingCell = status === "preparing"
    ? `<input type="text" placeholder="등록된 번호만" aria-label="송장번호" />`
    : esc(tracking);
  const button = action ? `<button class="primary" type="button">${action}</button>` : "";
  return `
    <section class="admin-screen">
      <p class="admin-kicker">배송 상태</p>
      <h2>${title}</h2>
      <section class="admin-order">
        <h3>SH_1</h3>
        <dl>
          ${adminRows([
            ["상태", title],
            ["국가", "대한민국"],
            ["수량", "3장"],
            ["배송비", "미정"],
            ["송장번호", trackingCell],
          ])}
        </dl>
        ${button}
        <table>
          <thead><tr><th>디자인</th><th>수량</th></tr></thead>
          <tbody>
            <tr><td>LE SSERAFIM EASY 01</td><td>1</td></tr>
            <tr><td>LE SSERAFIM EASY 02</td><td>1</td></tr>
            <tr><td>LE SSERAFIM EASY 03</td><td>1</td></tr>
          </tbody>
        </table>
      </section>
    </section>`;
}

function render() {
  const item = product(state.productId);
  let view = home();
  if (state.screen === "detail" && item) view = detail(item);
  else if (state.screen === "card") view = ownedDetail();
  else if (state.screen === "open" && state.openPhase === "pack") view = sealedPack();
  else if (state.screen === "open" && state.openPhase === "motion") view = openMotion();
  else if (state.screen === "result" || state.screen === "open") view = result();
  else if (state.screen === "wished") view = wished();
  else if (state.tab === "track" || state.screen === "track") view = state.shipmentId ? shipmentDetail() : tracking();
  else if (state.tab === "album") view = album();
  else if (state.tab === "ship" || state.screen === "ship") view = ship();
  else if (state.screen === "artists") view = artistsPage();
  else if (state.screen === "artist") view = artistPage();
  else if (state.screen === "notice") view = notices();
  else if (state.tab === "mypage" || state.screen === "mypage") view = mypage();
  app.innerHTML = view + drawer() + sheet() + walletModal() + cartModal() + resultBoxModal() + (state.toast ? `<p class="toast">${esc(state.toast)}</p>` : "");
  blurFronts();
  protectFronts();
  startBanner();
  startMidBanner();
  paintBoard();
  mountPostcode();
  armMotion();
  armOpenCut();
}

app.addEventListener("click", (event) => {
  const open = event.target.closest("[data-open]");
  const back = event.target.closest("[data-back]");
  const tab = event.target.closest("[data-tab]");
  const buy = event.target.closest("[data-buy]");
  const pay = event.target.closest("[data-pay]");
  const unseal = event.target.closest("[data-unseal]");
  const next = event.target.closest("[data-next]");
  const again = event.target.closest("[data-again]");
  const resultBoxAdd = event.target.closest("[data-result-box]");
  const resultBoxGo = event.target.closest("[data-result-box-go]");
  const resultBoxStay = event.target.closest("[data-result-box-stay]");
  const cart = event.target.closest("[data-cart]");
  const cartGo = event.target.closest("[data-cart-go]");
  const cartMore = event.target.closest("[data-cart-more]");
  const uncart = event.target.closest("[data-uncart]");
  const request = event.target.closest("[data-request]");
  const artist = event.target.closest("[data-artist]");
  const dot = event.target.closest("[data-dot]");
  const receive = event.target.closest("[data-receive]");
  const addressNew = event.target.closest("[data-address-new]");
  const addressDefault = event.target.closest("[data-address-default]");
  const addressSave = event.target.closest("[data-address-save]");
  const addressPick = event.target.closest("[data-address]");
  const region = event.target.closest("[data-region]");
  const postcodeClose = event.target.closest("[data-postcode-close]");
  const postcode = event.target.closest("[data-postcode]");
  const cardHit = event.target.closest("[data-card]");
  const walletConnect = event.target.closest("[data-wallet-connect]");
  const walletClose = event.target.closest("[data-wallet-close]");
  const sheetClose = event.target.closest("[data-sheet-close]");
  const walletBackdrop = event.target.classList.contains("modal-bg");
  const profile = event.target.closest("[data-profile]");
  const catalogSearch = event.target.closest("[data-catalog-search]");
  const catalogSearchClose = event.target.closest("[data-catalog-search-close]");
  const catalogChip = event.target.closest("[data-catalog]");
  const excludeSold = event.target.closest("[data-exclude-sold]");
  const drawerOpen = event.target.closest("[data-drawer]");
  const drawerClose = event.target.closest("[data-drawer-close]");
  const menuGroupHit = event.target.closest("[data-menu-group]");
  const nav = event.target.closest("[data-nav]");
  const navArtist = event.target.closest("[data-nav-artist]");
  const searchOpenBtn = event.target.closest("[data-search]");
  const searchClose = event.target.closest("[data-search-close]");
  const wish = event.target.closest("[data-wish]");
  const share = event.target.closest("[data-share]");
  const menu = event.target.closest("[data-menu]");
  const shipmentHit = event.target.closest("[data-shipment]");
  const trackCopy = event.target.closest("[data-track-copy]");
  const trackStatus = event.target.closest("[data-track-status]");
  if (drawerOpen) {
    state.menuOpen = true;
  } else if (drawerClose) {
    state.menuOpen = false;
    state.menuGroups = { mypage: false, artist: false };
  } else if (menuGroupHit) {
    const id = menuGroupHit.dataset.menuGroup;
    state.menuGroups[id] = !state.menuGroups[id];
  } else if (nav) {
    if (state.midSuppress && nav.closest(".mid-slide")) {
      state.midSuppress = false;
      return;
    }
    const name = nav.dataset.nav;
    state.menuOpen = false;
    state.sheet = null;
    state.shipmentId = "";
    state.pickMode = false;
    state.picked = [];
    state.albumArtist = "all";
    closeAdmin();
    if (name === "admin") {
      state.screen = "admin";
      openAdmin();
      paintBoard();
      return;
    }
    if (name === "home") {
      state.tab = "home";
      state.screen = "home";
      state.profile = "";
      state.searchOpen = false;
      state.query = "";
    } else if (name === "album") {
      state.tab = "album";
      state.screen = "album";
    } else if (name === "mypage") {
      state.tab = "mypage";
      state.screen = "mypage";
    } else if (name === "wished") {
      state.tab = "mypage";
      state.screen = "wished";
    } else if (name === "ship") {
      state.tab = "mypage";
      state.screen = "ship";
      state.region = "";
      state.postcodeOpen = false;
    } else if (name === "track") {
      state.tab = "mypage";
      state.screen = "track";
      state.focusTrack = "all";
    } else if (name === "notice") {
      state.tab = "home";
      state.screen = "notice";
    } else if (name === "artists") {
      resetCatalog();
      state.profile = "";
      state.tab = "home";
      state.screen = "artists";
      state.searchOpen = false;
      state.query = "";
    }
  } else if (navArtist) {
    resetCatalog();
    state.profile = navArtist.dataset.navArtist;
    state.profileFrom = "";
    state.menuOpen = false;
    state.tab = "home";
    state.screen = state.profile ? "artist" : "home";
    state.searchOpen = false;
    state.query = "";
  } else if (open) {
    if (state.bannerSuppress || (state.midSuppress && open.closest(".mid-slide"))) {
      state.bannerSuppress = false;
      state.midSuppress = false;
      return;
    }
    state.productId = open.dataset.open;
    state.productFrom = state.screen;
    state.screen = "detail";
    state.tab = "home";
    state.sheet = null;
  } else if (back) {
    const to = back.dataset.back;
    state.sheet = null;
    state.postcodeOpen = false;
    if (to === "exit") {
      history.back();
      return;
    } else if (to === "track-list") {
      state.shipmentId = "";
      state.screen = "track";
      state.tab = "mypage";
    } else if (to === "artists") {
      state.screen = "artists";
      state.tab = "home";
      state.profile = "";
    } else if (to === "artist" && state.profile) {
      state.screen = "artist";
      state.tab = "home";
    } else if (to === "album" || to === "ship" || to === "track" || to === "mypage") {
      state.screen = to;
      state.tab = to === "album" ? "album" : "mypage";
    } else {
      state.screen = "home";
      state.tab = "home";
    }
  } else if (tab) {
    const name = tab.dataset.tab;
    if (name === "ship" || name === "track") {
      state.tab = "mypage";
      state.screen = name;
    } else {
      state.tab = name;
      state.screen = name;
    }
    state.sheet = null;
    state.focusStatus = null;
    state.albumArtist = "all";
    state.pickMode = false;
    state.picked = [];
  } else if (buy) {
    const buying = product(state.productId);
    const count = Number(buy.dataset.buy);
    if (saleWord(buying)) return;
    if (count === 5 && packStock(buying) < 5) return;
    state.sheet = count;
  } else if (pay) {
    const buying = product(state.productId);
    if (saleWord(buying)) return;
    if (Number(pay.dataset.pay) === 5 && packStock(buying) < 5) return;
    if (!state.walletConnected) return;
    draw(product(state.productId), Number(pay.dataset.pay));
  } else if (unseal) {
    state.openPhase = "motion";
    state.motionArmed = false;
    state.screen = "open";
  } else if (next) {
    state.revealIndex += 1;
    state.openPhase = "pack";
    state.openCut = "idle";
    state.motionArmed = false;
    state.screen = "open";
  } else if (again) {
    state.resultBox = false;
    state.sheet = Number(again.dataset.again);
    state.screen = "detail";
  } else if (resultBoxAdd) {
    const card = state.reveal[state.revealIndex];
    if (card && card.status !== "shipping_cart" && moveOne(card.id, "shipping_cart")) state.resultBox = true;
    else if (card && card.status !== "shipping_cart") {
      state.toast = `배송박스는 ${maxShipCards()}장까지예요.`;
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    }
  } else if (resultBoxGo) {
    state.resultBox = false;
    state.region = "";
    state.postcodeOpen = false;
    state.tab = "mypage";
    state.screen = "ship";
  } else if (resultBoxStay || (state.resultBox && walletBackdrop)) {
    state.resultBox = false;
  } else if (event.target.closest("[data-ship-add]")) {
    state.shipPick = !state.shipPick;
    state.picked = [];
  } else if (event.target.closest("[data-ship-add-confirm]")) {
    if (!state.picked.length) return;
    if (!moveStored(state.picked)) {
      state.toast = `배송바구니는 ${maxShipCards()}장까지예요.`;
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    } else {
      state.picked = [];
      state.shipPick = false;
    }
  } else if (event.target.closest("[data-pick]")) {
    state.pickMode = !state.pickMode;
    state.picked = [];
  } else if (event.target.closest("[data-pick-card]")) {
    const id = event.target.closest("[data-pick-card]").dataset.pickCard;
    state.picked = state.picked.includes(id) ? state.picked.filter((item) => item !== id) : [...state.picked, id];
  } else if (event.target.closest("[data-pick-add]")) {
    if (!moveStored(state.picked)) {
      state.toast = `배송바구니는 ${maxShipCards()}장까지예요.`;
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    } else {
      state.picked = [];
      state.cartModal = true;
    }
  } else if (event.target.closest("[data-qty]")) {
    const card = ownedCard();
    const max = card ? storedCopies(card).length : 1;
    state.shipQty = Math.min(max, Math.max(1, state.shipQty + Number(event.target.closest("[data-qty]").dataset.qty)));
  } else if (event.target.closest("[data-cart-many]")) {
    const card = ownedCard();
    if (!card) return;
    const copies = storedCopies(card);
    const ordered = [card, ...copies.filter((item) => item.id !== card.id)];
    const ids = ordered.slice(0, Math.max(state.shipQty, 1)).map((item) => item.id);
    if (moveStored(ids)) {
      state.shipQty = 1;
      state.cartModal = true;
    } else {
      state.toast = `배송바구니는 ${maxShipCards()}장까지예요.`;
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    }
  } else if (cart) {
    if (moveOne(cart.dataset.cart, "shipping_cart")) state.cartModal = true;
  } else if (uncart) {
    moveOne(uncart.dataset.uncart, "stored");
  } else if (cartGo) {
    state.cartModal = false;
    state.region = "";
    state.postcodeOpen = false;
    state.tab = "mypage";
    state.screen = "ship";
  } else if (cartMore) {
    state.cartModal = false;
  } else if (receive) {
    state.region = "";
    state.postcodeOpen = false;
    state.tab = "mypage";
    state.screen = "ship";
  } else if (addressNew) {
    blankAddressFields();
  } else if (addressDefault) {
    setDefaultAddress(addressDefault.dataset.addressDefault);
  } else if (addressSave) {
    if (!addressSave.disabled && saveCurrentAddress()) {
      state.toast = "배송지를 저장했어요.";
      setTimeout(() => {
        state.toast = "";
        render();
      }, 1600);
    }
  } else if (addressPick) {
    const found = addresses.find((item) => item.id === addressPick.dataset.address);
    if (found) fillAddress(found);
  } else if (region) {
    state.region = region.dataset.region;
    state.postcodeOpen = false;
    state.postcodeError = false;
    if (state.region) applyDefaultAddress();
  } else if (postcodeClose) {
    state.postcodeOpen = false;
  } else if (postcode) {
    state.postcodeOpen = true;
    state.postcodeError = false;
  } else if (cardHit) {
    state.shipQty = 1;
    if (state.screen !== "card") {
      state.cardFrom = state.screen === "ship" ? "ship" : state.screen === "track" ? "track" : "album";
    }
    state.cardId = cardHit.dataset.card;
    state.screen = "card";
    state.tab = state.cardFrom === "album" ? "album" : "mypage";
  } else if (trackCopy) {
    const number = trackCopy.dataset.trackCopy;
    if (navigator.clipboard && number) {
      navigator.clipboard.writeText(number).then(() => {
        state.toast = "송장번호를 복사했어요";
        render();
        window.setTimeout(() => {
          state.toast = "";
          render();
        }, 1600);
      });
    }
    return;
  } else if (shipmentHit) {
    state.shipmentId = shipmentHit.dataset.shipment;
    state.tab = "mypage";
    state.screen = "track";
  } else if (trackStatus) {
    state.focusTrack = trackStatus.dataset.trackStatus;
    state.shipmentId = "";
    state.tab = "mypage";
    state.screen = "track";
  } else if (dot) {
    moveBanner(Number(dot.dataset.dot));
  } else if (artist) {
    state.albumArtist = artist.dataset.artist;
    state.picked = [];
  } else if (request && !request.disabled) {
    saveCurrentAddress();
    const cardIds = [];
    state.owned.forEach((card) => {
      if (card.status !== "shipping_cart") return;
      card.status = "shipping_requested";
      cardIds.push(card.id);
    });
    const place = state.region === "domestic" ? "대한민국" : state.country;
    const quote = shippingQuote(cardIds.length, place);
    const address = state.region === "domestic"
      ? [state.postcode, state.address, state.addressDetail].filter(Boolean).join(" ")
      : [state.address, state.addressDetail, [state.city, state.province].filter(Boolean).join(" "), state.postcode].filter(Boolean).join(", ");
    state.shipments.unshift({
      id: `SH_${state.shipments.length + 1}`,
      status: "shipping_requested",
      place,
      feeText: quote.feeText,
      method: quote.method,
      receiver: state.receiver,
      phone: state.phone.trim(),
      email: state.email.trim(),
      postcode: state.postcode.trim(),
      address,
      tracking: "",
      requestedOn: isoDate(),
      cardIds,
      cards: orderCards(cardIds),
    });
    persistOrders();
    state.focusTrack = "shipping_requested";
    state.shipmentId = state.shipments[0].id;
    state.tab = "mypage";
    state.screen = "track";
  } else if (catalogSearchClose) {
    state.catalogSearch = false;
    state.catalogQuery = "";
  } else if (catalogSearch) {
    state.catalogSearch = true;
  } else if (excludeSold) {
    state.excludeSold = !state.excludeSold;
  } else if (catalogChip) {
    if (state.screen === "artist") state.catalogFilter = catalogChip.dataset.catalog;
    else state.catalogKind = catalogChip.dataset.catalog;
  } else if (profile) {
    const fromArtists = state.screen === "artists";
    state.tab = "home";
    state.searchOpen = false;
    state.query = "";
    resetCatalog();
    if (profile.dataset.profile === "all") {
      state.profile = "";
      state.profileFrom = "";
      state.screen = "artists";
    } else {
      state.profileFrom = fromArtists ? "artists" : "";
      state.profile = profile.dataset.profile;
      state.screen = "artist";
    }
  } else if (searchOpenBtn) {
    state.searchOpen = true;
    state.tab = "home";
    state.screen = "home";
  } else if (searchClose) {
    state.searchOpen = false;
    state.query = "";
  } else if (wish) {
    const id = wish.dataset.wish;
    state.wished = state.wished.includes(id) ? state.wished.filter((item) => item !== id) : [...state.wished, id];
  } else if (share) {
    const item = product(share.dataset.share);
    const text = `${item.artist} ${productName(item)}`;
    if (navigator.share) {
      navigator.share({ title: productName(item), text, url: location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${location.href}`).then(() => {
        state.toast = "링크를 복사했어요";
        render();
        window.setTimeout(() => {
          state.toast = "";
          render();
        }, 1600);
      });
    }
    return;
  } else if (menu) {
    state.tab = "mypage";
    state.screen = menu.dataset.menu;
    state.shipmentId = "";
    if (menu.dataset.menu === "track") state.focusTrack = "all";
  } else if (walletConnect) {
    state.walletConnected = true;
    state.walletModal = false;
  } else if (walletClose || (state.walletModal && walletBackdrop)) {
    state.walletModal = false;
  } else if (state.cartModal && walletBackdrop) {
    state.cartModal = false;
  } else if (sheetClose || event.target.classList.contains("sheet-bg")) {
    state.sheet = null;
    state.walletModal = false;
  } else {
    return;
  }
  const focusSearch = Boolean(searchOpenBtn);
  const focusCatalog = Boolean(catalogSearch);
  render();
  if (cardHit) app.querySelector(".scroll")?.scrollTo(0, 0);
  if (focusSearch) app.querySelector("[data-field=query]")?.focus();
  if (focusCatalog) app.querySelector("[data-field=catalogQuery]")?.focus();
});

app.addEventListener("change", (event) => {
  if (event.target.matches("[data-country]")) {
    state.country = event.target.value;
    render();
    return;
  }
  if (event.target.matches("select[data-album-status]")) {
    const next = event.target.value;
    state.focusStatus = next === "all" ? null : next;
    state.picked = [];
    render();
  }
});

app.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  if (!field) return;
  state[field] = event.target.value;
  if (field === "query" || field === "catalogQuery") {
    const caret = event.target.selectionStart;
    render();
    const input = app.querySelector(`[data-field=${field}]`);
    if (input) {
      input.focus();
      input.setSelectionRange(caret, caret);
    }
    return;
  }
  const ready = shipReady();
  const button = app.querySelector("[data-request]");
  const save = app.querySelector("[data-address-save]");
  if (button) button.disabled = !ready;
  if (save) save.disabled = !ready;
});

document.addEventListener("click", (event) => {
  const board = event.target.closest("[data-board]");
  if (board) {
    if (board.dataset.board === state.board) return;
    applyScene(board.dataset.board === "admin" ? (ADMIN_PAGES[state.adminScene] ? state.adminScene : "admin-dash") : "home");
    return;
  }
  const scene = event.target.closest("[data-scene]");
  if (!scene) return;
  applyScene(scene.dataset.scene);
});

document.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".guard")) event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
  if (event.target.closest(".guard")) event.preventDefault();
});

document.addEventListener("visibilitychange", () => {
  shieldFronts(document.hidden);
});

document.addEventListener("keyup", (event) => {
  if (event.key !== "PrintScreen") return;
  shieldFronts(true);
  setTimeout(() => shieldFronts(false), 1200);
});

ensurePurchases();
render();
