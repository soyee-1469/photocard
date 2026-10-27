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

function statusGlyph(status) {
  if (status === "stored") return icon("track");
  if (status === "shipped") return icon("ship");
  if (status === "delivered") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M8.5 12.5l2.5 2.5 4.5-5"></path></svg>`;
  }
  return "";
}

const PRODUCTS = [
  {
    id: "blackpink-jump",
    artist: "BLACKPINK",
    artistId: "blackpink",
    album: "JUMP",
    eventType: "album",
    eventName: "",
    cover: "/assets/covers/jump.jpg",
    price: 2500,
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
    price: 2500,
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
    price: 2500,
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
    price: 2500,
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
    price: 2500,
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
  albumSearch: false,
  albumQuery: "",
  bannerIndex: 0,
  bannerSuppress: false,
  midIndex: 0,
  midSuppress: false,
  balance: 100000,
  // 처음에는 지갑 미연결. 결제 시트의 "지갑 연결하기"를 누르면 연결된 것으로 보고(mock) 저장한다(2026-10-27).
  walletConnected: false,
  walletReturn: null,
  walletCurrency: "KRW",
  ledgerFilter: "all",
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
  menuGroups: { mypage: false, artist: false, support: false },
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
  // 포인트 교환(mock). TP와 교환 내역은 localStorage에 남긴다.
  tp: 0,
  exchanges: [],
  fills: [], // 채우기(SOL → TOTT) 내역
  walletId: "",
  wallets: [],
  walletSheet: null,
  walletRename: null,
  renameText: "",
  historyWallet: "",
  historyPicker: false,
  walletPick: false, // 교환·채우기 화면의 사용 지갑 드롭다운
  exMode: "tott", // 교환 입력 기준: tott | tp
  historyOpen: null,
  exTott: "",
  exTp: "",
  exDate: "",
  fillSol: "",
  // 첫 진입: splash → push → marketing → consent → guide → done
  boot: "done",
  guideSeen: false,
  guidePage: 0,
};

const ORDERS_KEY = "photocard-orders-v1";
const ADDRESS_KEY = "photocard-addresses-v1";
const WALLET_KEY = "photocard-wallet-v3";
// mock 초기 TP. 저장된 지갑이 없을 때만 쓴다.
const TP_SEED = 50000;
const ONBOARD_KEY = "photocard-onboard-v1";

// 최소 교환 수량. 환율은 시세 모듈(rates)에서 온다: TP는 원화 1:1이라 1 TOTT = tottKrw TP.
const EXCHANGE_MIN = 50;
// 지갑 연결하기 → 토마톡 지갑(tomatalk-service-web /wallet, 지갑 여러 개 슬라이드). 로컬: 그 폴더에서 npm run dev (5173)
const WALLET_APP_URL = "http://localhost:5173/tomatok_translate/wallet";
// 지갑 목록 시드(디자인 2025-08 지갑 화면). 이름·순서·대표·연결·잔액은 localStorage에 남기고 NFT는 시드에서만 온다.
const WALLET_SEED = [
  { id: "phantom-1", name: "메인 지갑", full: "0x5961c3f0a8d14e7b92ab2485", balance: 123456.789123, sol: 3.25, main: true, connected: true, nfts: ["토마톡 링", "스테이킹"] },
  { id: "phantom-2", name: "개인 지갑", full: "0x3a8f71c0de4b9a2f5c6e921f", balance: 82340.11, sol: 0.8, main: false, connected: true, nfts: [] },
  { id: "phantom-3", name: "보조 지갑", full: "0xc882b4d19e7a3f6052c7d34a", balance: 0, sol: 0, main: false, connected: true, nfts: [] },
];
// mock 보내기·받기. days는 며칠 전인지(이번 달 안으로 묶는다).
const WALLET_MOCK_ROWS = {
  "phantom-1": [
    { kind: "receive", days: 2, tott: 14.51136, status: "검증완료" },
    { kind: "send", days: 2, tott: -14.51136, status: "진행중" },
    { kind: "receive", days: 5, tott: 14.51136, status: "만료" },
    { kind: "send", days: 5, tott: -14.51136, status: "실패" },
    { kind: "send", days: 7, tott: -14.51136, status: "성공" },
  ],
  "phantom-2": [
    { kind: "receive", days: 3, tott: 3.2, status: "성공" },
  ],
};

function seedWallets() {
  return WALLET_SEED.map((item) => ({ ...item, nfts: [...item.nfts] }));
}

function loadWallet() {
  state.wallets = seedWallets();
  state.tp = TP_SEED;
  try {
    const saved = JSON.parse(localStorage.getItem(WALLET_KEY) || "null");
    if (saved) {
      state.tp = Number(saved.tp) || 0;
      state.exchanges = Array.isArray(saved.exchanges) ? saved.exchanges : [];
      state.fills = Array.isArray(saved.fills) ? saved.fills : [];
      if (Array.isArray(saved.wallets) && saved.wallets.length) {
        const seeded = new Map(state.wallets.map((item) => [item.id, item]));
        state.wallets = saved.wallets.map((item) => ({
          id: String(item.id),
          name: String(item.name || "계정이름"),
          full: String(item.full || seeded.get(item.id)?.full || ""),
          balance: Number(item.balance) || 0,
          sol: Number.isFinite(Number(item.sol)) ? Number(item.sol) : (seeded.get(item.id)?.sol || 0),
          main: Boolean(item.main),
          connected: item.connected !== false,
          nfts: seeded.get(item.id)?.nfts || [],
        }));
      } else if (Number.isFinite(Number(saved.balance))) {
        // v3: 지갑 하나의 잔액만 저장하던 형식
        state.wallets[0].balance = Number(saved.balance);
      }
      state.walletId = typeof saved.walletId === "string" ? saved.walletId : "";
      state.walletConnected = saved.walletConnected === true;
    }
  } catch (error) {
    console.warn(error);
  }
  if (!state.wallets.some((item) => item.main)) state.wallets[0].main = true;
  syncBalance();
}

function persistWallet() {
  localStorage.setItem(WALLET_KEY, JSON.stringify({
    tp: state.tp,
    exchanges: state.exchanges,
    fills: state.fills,
    walletId: state.walletId,
    walletConnected: state.walletConnected,
    wallets: state.wallets.map(({ id, name, full, balance, sol, main, connected }) => ({ id, name, full, balance, sol, main, connected })),
  }));
}

// 대표 지갑 먼저, 그 다음 연결된 지갑 순서(지갑 관리에서 끌어서 바꾼 순서)
function walletList() {
  return [...state.wallets.filter((item) => item.main), ...state.wallets.filter((item) => !item.main)];
}

function activeWallets() {
  return walletList().filter((item) => item.connected);
}

function walletById(id) {
  return state.wallets.find((item) => item.id === id);
}

function currentWallet() {
  return walletById(state.walletId) || activeWallets()[0] || walletList()[0];
}

// 선택된 지갑이 연결 해제됐으면 대표(또는 첫 연결 지갑)로 옮기고, state.balance를 그 지갑 잔액으로 맞춘다.
function syncBalance() {
  const active = activeWallets();
  if (!active.some((item) => item.id === state.walletId)) {
    state.walletId = (active.find((item) => item.main) || active[0] || walletList()[0]).id;
  }
  state.balance = currentWallet().balance;
}

function shortAddr(full) {
  const text = String(full || "");
  return text.length > 12 ? `${text.slice(0, 6)}…${text.slice(-6)}` : text;
}

function loadOnboard() {
  try {
    const saved = JSON.parse(localStorage.getItem(ONBOARD_KEY) || "null");
    return saved && typeof saved === "object" ? saved : {};
  } catch (error) {
    console.warn(error);
    return {};
  }
}

function saveOnboard(patch) {
  localStorage.setItem(ONBOARD_KEY, JSON.stringify({ ...loadOnboard(), ...patch }));
}

loadWallet();
// 첫 실행에만 온보딩이 뜬다. 주소에 ?onboarding을 붙이면 기록과 상관없이 처음부터 다시 본다.
const FORCE_ONBOARDING = new URLSearchParams(window.location.search).has("onboarding");
state.boot = loadOnboard().done && !FORCE_ONBOARDING ? "done" : "splash";

// ---- 시세·환율 ----
// TP는 원화 1:1 고정이라 상품 가격은 시세와 무관하다. 시세는 TOTT 참고 표기와 USD 보조 표기에만 쓴다.
// API가 정해지면 관리자(배송정책 화면)의 '시세 API 주소'에 넣는다. 응답 예: { "tottKrw": 60.39, "usdKrw": 1400, "at": "2026-10-23T14:05:00Z" }
const RATES_KEY = "photocard-rates-v1";
const RATES_CONFIG_KEY = "photocard-rates-config-v1";
const RATES_INTERVAL = 5 * 60 * 1000;
const RATES_DEFAULT = { tottKrw: 1, usdKrw: 1400, at: "" };

function ratesConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(RATES_CONFIG_KEY) || "null") || {};
    return {
      api: String(saved.api || "").trim(),
      tottKrw: Number(saved.tottKrw) > 0 ? Number(saved.tottKrw) : RATES_DEFAULT.tottKrw,
      usdKrw: Number(saved.usdKrw) > 0 ? Number(saved.usdKrw) : RATES_DEFAULT.usdKrw,
    };
  } catch (error) {
    console.warn(error);
    return { api: "", ...RATES_DEFAULT };
  }
}

function rates() {
  const config = ratesConfig();
  try {
    const saved = JSON.parse(localStorage.getItem(RATES_KEY) || "null");
    if (saved && Number(saved.tottKrw) > 0 && Number(saved.usdKrw) > 0) {
      return { tottKrw: Number(saved.tottKrw), usdKrw: Number(saved.usdKrw), at: saved.at || "", fetchedAt: Number(saved.fetchedAt) || 0 };
    }
  } catch (error) {
    console.warn(error);
  }
  return { tottKrw: config.tottKrw, usdKrw: config.usdKrw, at: "", fetchedAt: 0 };
}

async function fetchRates() {
  const url = ratesConfig().api;
  if (!url) return false;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return false;
    const data = await response.json();
    const tottKrw = Number(data.tottKrw);
    const usdKrw = Number(data.usdKrw);
    if (!(tottKrw > 0) || !(usdKrw > 0)) return false;
    localStorage.setItem(RATES_KEY, JSON.stringify({ tottKrw, usdKrw, at: data.at || new Date().toISOString(), fetchedAt: Date.now() }));
    paintPrices();
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

let ratesTimer = 0;

function startRates() {
  fetchRates();
  window.clearInterval(ratesTimer);
  ratesTimer = window.setInterval(fetchRates, RATES_INTERVAL);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (Date.now() - (rates().fetchedAt || 0) >= RATES_INTERVAL) fetchRates();
  });
}

function isKorean() {
  return (document.documentElement.lang || "ko").toLowerCase().startsWith("ko");
}

function tpNumber(amount) {
  return Math.round(Number(amount) || 0).toLocaleString("ko-KR");
}

// 보조 표기: TP는 원화 1:1, USD는 환율로 나눈다. 한국어면 ₩ 먼저, 아니면 $ 먼저.
function priceSub(tp) {
  const amount = Number(tp) || 0;
  const { usdKrw } = rates();
  const won = `₩${Math.round(amount).toLocaleString("ko-KR")}`;
  const dollar = `$${(amount / usdKrw).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return isKorean() ? `≈ ${won} · ${dollar}` : `≈ ${dollar} · ${won}`;
}

// 홈 타일처럼 좁은 자리에는 환산 통화를 한 가지만 보여준다: 한국어면 ₩, 그 외는 $.
function priceSubOne(tp) {
  const amount = Number(tp) || 0;
  if (isKorean()) return `≈ ₩${Math.round(amount).toLocaleString("ko-KR")}`;
  const { usdKrw } = rates();
  return `≈ $${(amount / usdKrw).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function rateNote() {
  const { at, usdKrw, tottKrw } = rates();
  const when = at ? `${clockText(new Date(at)).slice(11)} 기준` : "기본값";
  return `환율 ${when} · 1 TP = ₩1 · 1 USD = ₩${Math.round(usdKrw).toLocaleString("ko-KR")} · 1 TOTT ≈ ${tpNumber(tottKrw)} TP`;
}

function paintPrices() {
  document.querySelectorAll("[data-price-sub]").forEach((node) => {
    node.textContent = node.dataset.one !== undefined ? priceSubOne(node.dataset.priceSub) : priceSub(node.dataset.priceSub);
  });
  document.querySelectorAll("[data-rate-note]").forEach((node) => {
    node.textContent = rateNote();
  });
}

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

// 배송은 Ver.02라 '배송 가능' 혜택은 뺀다.
const PERKS = ["실물 카드", "보관 가능"];

const GUIDES = {
  random: [
    "상품마다 구성된 포토카드 중 1장이 랜덤으로 제공돼요.",
    "동일한 카드가 다시 나올 수 있어요.",
  ],
  photocard: [
    "뽑은 포토카드는 보유카드에서 확인이 가능해요.",
    "배송 기능은 추후 업데이트 될 예정이에요.(국내, 해외)",
    "공식 상품의 제작 및 포장 과정에서 미세한 스크래치, 인쇄점, 재단차이가 있을 수 있어요.",
    "상품은 구매 후 교환 또는 환불이 불가능합니다.",
  ],
};

const SHEET_NOTES = [
  "뽑은 카드는 보유 카드에 보관됩니다.",
  "동일 카드가 중복으로 뽑힐 수 있습니다.",
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
  const custom = (item?.perks || []).slice(0, PERKS.length).map((line) => String(line || "").trim());
  if (!custom.some(Boolean)) return PERKS;
  return PERKS.map((label, index) => custom[index] || label);
}

function summaryLine(item) {
  return String(item?.summary || "").trim() || "공식 실물 포토카드 랜덤팩";
}

// 관리자 값은 앞의 두 칸만 쓴다. 세 번째 칸(옛 배송 문구)은 더 이상 쓰지 않는다.
function sheetNotes(item) {
  const notes = (item?.sheetNotes || []).slice(0, SHEET_NOTES.length);
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

// 포토카드 결제 단위는 TP다. TOTT는 토마톡 지갑에서 TP로 바꿔 쓴다.
function tott(amount) {
  return `${tpNumber(amount)}<span class="tott">TP</span>`;
}

// TP 금액 + 원화·USD 보조 표기. 시세가 갱신되면 paintPrices()가 보조 줄만 바꾼다.
function priceBlock(amount) {
  return `<span class="price"><span class="price-main">${tott(amount)}</span><small class="price-sub" data-price-sub="${Number(amount) || 0}">${priceSub(amount)}</small></span>`;
}

function setTitle(item) {
  if (item?.displayName) return item.displayName;
  return `${shortTitle(item)} Random Photocard`;
}

// 홈 타일용 짧은 제목: "Random Photocard"는 옆의 "랜덤 1장"이 대신한다.
function shortTitle(item) {
  if (item?.displayName) return item.displayName;
  const eventName = eventTitle(item);
  return eventName ? `${albumTitle(item)} ${eventName}` : albumTitle(item);
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

// 재고를 하나도 정하지 않은 상품은 재고 제한 없이 연속 뽑기가 가능하다.
function canDrawFive(item) {
  if (!item) return false;
  const pack = registerPack(item.id);
  const cards = pack?.cards?.length ? pack.cards : item.cards;
  const tracked = cards.some((card) => card.stock !== "" && card.stock != null);
  return !tracked || packStock(item) >= 5;
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

function profileImage(artistId, options = {}) {
  const category = categoryOf(artistId);
  if (category?.profileImage) return category.profileImage;
  const emblem = artistEmblems()[artistId];
  if (emblem) return emblem;
  if (PROFILE_PHOTOS[artistId]) return PROFILE_PHOTOS[artistId];
  if (options.cover === false) return "";
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

function productTile(item, compact = false) {
  const word = saleWord(item);
  if (compact) {
    return `
    <button class="tile compact${word ? " sold" : ""}" data-open="${item.id}">
      ${productThumbnail(item.cover, saleMark(item))}
      <span class="tile-who">${artistMark(item)}</span>
      <span class="tile-name one">${esc(shortTitle(item))}</span>
      <span class="tile-row"><strong>${tott(item.price)}</strong></span>
      <small class="price-sub tile-sub" data-price-sub="${Number(item.price) || 0}" data-one>${priceSubOne(item.price)}</small>
    </button>`;
  }
  return `
    <button class="tile${word ? " sold" : ""}" data-open="${item.id}">
      ${productThumbnail(item.cover, saleMark(item))}
      <span class="tile-who">${artistMark(item)}</span>
      <span class="tile-name">${esc(setTitle(item))}</span>
      <span class="tile-price">${priceBlock(item.price)}</span>
    </button>`;
}

function artistsPage() {
  const rows = artistProfiles().map((profile) => {
    const src = profileImage(profile.id, { cover: false });
    const face = src ? `<img src="${src}" alt="" />` : `<i class="artist-fallback" aria-hidden="true"></i>`;
    return `
      <button type="button" class="artist-row" data-profile="${esc(profile.id)}">
        ${face}
        <span>${esc(profile.name)}</span>
      </button>`;
  }).join("");
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>전체 아티스트</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <div class="artist-list">${rows || `<p class="empty">등록된 아티스트가 없어요.</p>`}</div>
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
    .map((item) => productTile(item, true))
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
    <header class="bar home-bar">
      <button type="button" class="icon-btn home-btn" data-nav="home" aria-label="홈">${TAB_ICONS.home}</button>
      <h1>포토카드</h1>
      <span class="bar-tools">${searchButton()}${menuButton()}</span>
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
  // 슬라이드 7 순서: 프로필 레일, 배너, NEW, 이용 방법 안내 배너. 관리자 중간 배너는 그 아래에 둔다.
  const below = state.searchOpen ? "" : `${guideBanner()}${midBanner()}`;

  return `
    ${header}
    <div class="scroll">
      ${rail}
      ${banner}
      <div class="shelf-wrap">${state.searchOpen ? "" : `<h2>NEW</h2>`}${list}</div>
      ${below}
    </div>
  `;
}

function guideBanner() {
  return `
    <section class="guide-banner-wrap">
      <button type="button" class="guide-banner" data-nav="guide">
        <img src="pack_closed.png" alt="" />
        <span class="guide-banner-copy">
          <small>이용 방법 안내</small>
          <strong>포토카드, 이렇게 뽑아요</strong>
          <span>상품 선택부터 개봉, 보유 카드까지 한눈에</span>
        </span>
        <i class="guide-banner-arrow" aria-hidden="true">›</i>
      </button>
    </section>`;
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
  const glyph = statusGlyph(status);
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

// 배송 상태 표시(statusBadge)는 Ver.02라 보유 카드 격자에서 뺀다.
function cardFigure(card) {
  const qty = Number(card.count) > 0 ? `<span class="qty-badge">${card.count}장</span>` : "";
  return `
    <figure data-card="${esc(card.id)}">
      <div class="shot">
        ${cardShot(card)}
        ${qty}
      </div>
      ${cardMark(card)}
      ${cardSourceLine(card)}
    </figure>
  `;
}

function pickFigure(card, forShip = false) {
  const selectable = card.status === "stored";
  const on = selectable && state.picked.includes(card.id);
  const mark = selectable ? `<span class="pick-mark">${on ? "✓" : ""}</span>` : statusBadge(card.status);
  const shipBadge = forShip && selectable ? `<span class="box-badge add">${on ? "선택됨" : "담을 수 있음"}</span>` : "";
  return `
    <figure class="pick-card${on ? " on" : ""}${selectable ? "" : " locked"}${forShip ? " ship-pick" : ""}" ${selectable ? `data-pick-card="${esc(card.id)}"` : ""}>
      <div class="shot">
        ${cardShot(card)}
        ${mark}
        ${shipBadge}
      </div>
      ${cardMark(card)}
      ${cardSourceLine(card)}
    </figure>
  `;
}

function boxedFigure(card) {
  const qty = Number(card.count) > 0 ? `<span class="qty-badge">${card.count}장</span>` : "";
  return `
    <figure class="box-card" data-card="${esc(card.id)}">
      <div class="shot">
        ${cardShot(card)}
        <span class="box-badge in">담김</span>
        ${qty}
      </div>
      ${cardMark(card)}
      ${cardSourceLine(card)}
    </figure>
  `;
}

// 보유 카드(슬라이드 22·23). 배송 상태 드롭다운과 배송바구니 링크는 Ver.02라 숨긴다.
// 보유 카드 내 검색(슬라이드 21): 가수·앨범·멤버·카드 번호와 상품 검색어(별명 포함)로 찾는다.
function cardHaystack(card) {
  const item = productForCard(card);
  return [card.artist, card.album, card.member, card.no, item ? productHaystack(item) : ""]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function album() {
  const source = state.owned;
  const artists = [...new Set(source.map((card) => card.artist))];
  const selected = artists.includes(state.albumArtist) ? state.albumArtist : "all";
  const query = state.albumQuery.trim().toLowerCase();
  const byArtist = selected === "all" ? source : source.filter((card) => card.artist === selected);
  const shown = query ? byArtist.filter((card) => cardHaystack(card).includes(query)) : byArtist;
  const cards = groupCards(shown.map((card) => ({ ...card, status: "stored" })));
  const chips = ["all", ...artists]
    .map((artist) => {
      const label = artist === "all" ? "전체" : artist;
      const on = artist === selected ? "on" : "";
      return `<button class="${on}" data-artist="${esc(artist)}">${esc(label)}</button>`;
    })
    .join("");
  const figures = cards.map(cardFigure);
  const body = figures.length
    ? `<div class="owned gallery">${figures.join("")}</div>`
    : (query
      ? `<p class="empty album-empty">찾는 카드가 없어요.</p>`
      : `<div class="empty album-empty">
          <span class="album-empty-mark" aria-hidden="true">${TAB_ICONS.album}</span>
          <p>보유 카드가 없습니다.<br>포토카드를 구매해보세요.</p>
          <button type="button" class="primary album-empty-go" data-nav="home">상품 보러 가기</button>
        </div>`);
  const header = state.albumSearch
    ? `
    <header class="bar">
      <input class="search-input" data-field="albumQuery" value="${esc(state.albumQuery)}" placeholder="가수, 앨범, 멤버, 카드 번호" />
      <button type="button" data-album-search-close>취소</button>
    </header>`
    : `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>보유 카드</h1>
      <span class="bar-tools"><button type="button" class="icon-btn" data-album-search aria-label="보유 카드 검색">${searchIcon()}</button>${menuButton()}</span>
    </header>`;
  return `
    ${header}
    <div class="album-filters">
      <div class="artist-tabs snap">${chips}</div>
    </div>
    <div class="scroll">${body}</div>
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
      <button data-back="home" aria-label="홈">←</button>
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
  const pool = state.owned.map((item) => ({ ...item, status: "stored" }));
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
  // 배송바구니 담기·배송받기는 Ver.02라 카드 상세에서 뺀다.
  const copies = state.owned.filter((item) => sameDesign(item, card));
  const action = "";
  const member = card.member ? `<tr><th>멤버</th><td>${esc(card.member)}</td></tr>` : "";
  const back = ownedBackSrc(card);
  const backFace = back
    ? `<figure><img class="guard" src="${back}" alt="뒷면" draggable="false" /><figcaption>뒷면</figcaption></figure>`
    : "";
  return `
    <header class="bar">
      <button data-back="${state.cardFrom}" aria-label="뒤로">←</button>
      <h1>보유 카드</h1>
      ${menuButton()}
    </header>
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
            <tr><th>보유 수량</th><td>${copies.length}장</td></tr>
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
        <label>City
          <input data-field="city" value="${esc(state.city)}" placeholder="City" autocomplete="address-level2" />
        </label>
        <label>State
          <input data-field="province" value="${esc(state.province)}" placeholder="Optional" autocomplete="address-level1" />
        </label>
      </div>
      <div class="addr-split">
        <label>Postal code
          <input data-field="postcode" value="${esc(state.postcode)}" placeholder="Postal code" autocomplete="postal-code" />
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
  const figures = groupCards(cart).map(boxedFigure).join("");
  const addLabel = state.shipPick ? "닫기" : "카드 추가";
  const picker = state.shipPick
    ? `
      <section class="ship-section is-add">
        <div class="ship-section-head"><h2>더 담을 수 있는 카드</h2><span>${stored.length}장</span></div>
        ${stored.length
          ? `<div class="owned picker">${stored.map((card) => pickFigure(card, true)).join("")}</div>
             <button type="button" class="ship-confirm" data-ship-add-confirm ${state.picked.length ? "" : "disabled"}>${icon("track")}<span>${state.picked.length ? `${state.picked.length}장 담기` : "담을 카드 선택"}</span></button>`
          : `<p class="empty">담을 수 있는 카드가 없어요.</p>`}
      </section>`
    : "";
  return `
    <section class="ship-section is-in">
      <div class="ship-section-head"><h2>배송박스에 담긴 카드</h2><span>${cart.length}장</span></div>
      <div class="owned">${figures}<button type="button" class="ship-add" data-ship-add>${addLabel}</button></div>
    </section>
    ${picker}`;
}

function ship() {
  const cart = state.owned.filter((card) => card.status === "shipping_cart");
  const cards = shipBasket();
  const count = `<p class="ship-count">${cart.length} / ${maxShipCards()}장</p>`;
  if (!cart.length || !state.region) {
    return `
      <header class="bar">
        <button data-back="home" aria-label="홈">←</button>
        <h1>배송바구니</h1>
        <span class="bar-tools">${menuButton()}</span>
      </header>
      <div class="scroll">
        ${count}
        ${cards}
        ${cart.length && !state.shipPick ? `
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
  plus: "M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z",
  minus: "M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z",
  caret: "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z",
  // Phosphor regular (phosphoricons.com)
  copy: "M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z",
  qr: "M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm0,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48ZM200,40H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-64,72V144a8,8,0,0,1,16,0v32a8,8,0,0,1-16,0Zm80-16a8,8,0,0,1-8,8H184v40a8,8,0,0,1-8,8H144a8,8,0,0,1,0-16h24V144a8,8,0,0,1,16,0v8h24A8,8,0,0,1,216,160Zm0,32v16a8,8,0,0,1-16,0V192a8,8,0,0,1,16,0Z",
  external: "M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z",
  arrowUp: "M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z",
  arrowDown: "M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z",
  coins: "M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM232,132c0,13.22-30.79,28-72,28-3.73,0-7.43-.13-11.08-.37C170.49,151.77,184,139,184,124V105.74C213.87,110.19,232,122.27,232,132ZM72,150.25V126.46A183.74,183.74,0,0,0,96,128a183.74,183.74,0,0,0,24-1.54v23.79A163,163,0,0,1,96,152,163,163,0,0,1,72,150.25Zm96-40.32V124c0,8.39-12.41,17.4-32,22.87V123.5C148.91,120.37,159.84,115.71,168,109.93ZM96,56c41.21,0,72,14.78,72,28s-30.79,28-72,28S24,97.22,24,84,54.79,56,96,56ZM24,124V109.93c8.16,5.78,19.09,10.44,32,13.57v23.37C36.41,141.4,24,132.39,24,124Zm64,48v-4.17c2.63.1,5.29.17,8,.17,3.88,0,7.67-.13,11.39-.35A121.92,121.92,0,0,0,120,171.41v23.46C100.41,189.4,88,180.39,88,172Zm48,26.25V174.4a179.48,179.48,0,0,0,24,1.6,183.74,183.74,0,0,0,24-1.54v23.79a165.45,165.45,0,0,1-48,0Zm64-3.38V171.5c12.91-3.13,23.84-7.79,32-13.57V172C232,180.39,219.59,189.4,200,194.87Z",
  receipt: "M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z",
  info: "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z",
  swap: "M117.66,170.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L72,188.69V48a8,8,0,0,1,16,0V188.69l18.34-18.35A8,8,0,0,1,117.66,170.34Zm96-96-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L168,67.31V208a8,8,0,0,0,16,0V67.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z",
  caretRight: "M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z",
  refresh: "M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z",
  bell: "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z",
  megaphone: "M248,120a48.05,48.05,0,0,0-48-48H160.2c-2.91-.17-53.62-3.74-101.91-44.24A16,16,0,0,0,32,40V200a16,16,0,0,0,26.29,12.25c37.77-31.68,77-40.76,93.71-43.3v31.72A16,16,0,0,0,159.12,214l11,7.33A16,16,0,0,0,194.5,212l11.77-44.36A48.07,48.07,0,0,0,248,120ZM48,199.93V40h0c42.81,35.91,86.63,45,104,47.24v65.48C134.65,155,90.84,164.07,48,199.93Zm131,8,0,.11-11-7.33V168h21.6ZM200,152H168V88h32a32,32,0,1,1,0,64Z",
  checkCircle: "M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z",
  check: "M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z",
  x: "M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z",
};

function icon(name) {
  return `<svg class="ico" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${ICON_PATH[name]}"/></svg>`;
}

function searchButton() {
  return `<button type="button" class="icon-btn" data-search aria-label="검색">${searchIcon()}</button>`;
}

function menuButton() {
  return `<button type="button" class="icon-btn" data-drawer aria-label="메뉴"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button>`;
}

const TAB_ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v10h13V10"></path><path d="M10 20v-6h4v6"></path></svg>`,
  products: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2.5l2.2 11h10.6L21 7H6.3"></path><circle cx="9.5" cy="19" r="1.4"></circle><circle cx="17" cy="19" r="1.4"></circle></svg>`,
  exchange: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.5-4.6"></path><path d="M5 3v4.5h4.5"></path><path d="M4 13a8 8 0 0 0 14.5 4.6"></path><path d="M19 21v-4.5h-4.5"></path></svg>`,
  album: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="3" width="11" height="15" rx="1.6"></rect><path d="M5 7.5v11A1.5 1.5 0 0 0 6.5 20H15"></path></svg>`,
  mypage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"></path></svg>`,
};

// 햄버거 드로어 = 마이페이지(슬라이드 19): 보유 카드 · 구매 내역 · 찜 목록 · 고객센터(드롭다운: 공지사항 · 이용자 가이드 · FAQ · 이용약관) · 이벤트.
// 맨 위 홈과 맨 아래 환경설정은 기획 메뉴 밖이지만 진입점이 필요해 둔다. 지갑은 상품 상세·결제 시트에서 들어가므로 메뉴에 두지 않는다. SNS는 기획서에 "고민"으로만 있어 뺐다.
// 묶음(라벨·구분선 없이 간격으로만): 홈·보유 카드·구매 내역·찜 목록 / 고객센터·이벤트 / 환경설정(맨 아래).
function drawer() {
  if (!state.menuOpen) return "";
  const item = (name, label) => `<button type="button" class="nav-item" data-nav="${name}">${label}</button>`;
  const open = Boolean(state.menuGroups.support);
  return `
    <div class="nav-bg">
      <aside class="nav-panel">
        <div class="nav-head">
          <strong>마이페이지</strong>
          <button type="button" data-drawer-close aria-label="닫기">닫기</button>
        </div>
        <div class="nav-sec">
          ${item("home", "홈")}
          ${item("album", "보유 카드")}
          ${item("purchases", "구매 내역")}
          ${item("wished", "찜 목록")}
        </div>
        <div class="nav-sec">
          <button type="button" class="nav-group" data-menu-group="support" aria-expanded="${open}">고객센터<i class="nav-chevron" aria-hidden="true"></i></button>
          ${open ? `
          <div class="nav-sub">
            ${item("notice", "공지사항")}
            ${item("guide", "이용자 가이드")}
            ${item("faq", "FAQ")}
            ${item("terms", "이용약관")}
          </div>` : ""}
          ${item("events", "이벤트")}
        </div>
        <div class="nav-sec nav-foot">
          ${item("settings", "환경설정")}
        </div>
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
    title: "보유 카드 안내",
    body: "뽑은 카드는 보유 카드에 보관돼요. 같은 카드를 여러 장 뽑으면 장수로 표시돼요.",
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
      <button data-back="home" aria-label="홈">←</button>
      <h1>공지사항</h1>
      ${menuButton()}
    </header>
    <div class="scroll">${articles}</div>
  `;
}

// 고객센터 하위 화면(슬라이드 25~27). FAQ·이용약관·이벤트는 기획서에도 내용이 비어 있어 빈 상태로 둔다.
const SUPPORT_PAGES = {
  faq: { title: "FAQ", heading: "FAQ 목록", empty: "등록된 FAQ가 아직 없어요." },
  terms: { title: "이용약관", heading: "이용약관", empty: "이용약관 내용이 준비되면 여기에 보여요." },
  events: { title: "이벤트", heading: "진행 중인 이벤트", empty: "진행 중인 이벤트가 없어요." },
};

// FAQ(기본 문항). 관리자 입력 기능이 생기기 전까지 쓰는 기본 내용이다.
const FAQ_ITEMS = [
  { cat: "뽑기", q: "랜덤 포토카드는 어떻게 뽑나요?", a: "홈 목록에서 앨범을 고르고 1장 뽑기 또는 5장 연속 뽑기를 누르면 TP로 결제돼요. 결제 뒤 포장을 손가락으로 밀어 열면 카드가 나와요." },
  { cat: "뽑기", q: "같은 카드가 또 나올 수 있나요?", a: "네. 뽑기는 매번 무작위라 같은 카드가 중복으로 나올 수 있어요. 같은 카드는 보유 카드에서 장수로 함께 표시돼요." },
  { cat: "뽑기", q: "5장 연속 뽑기는 1장 뽑기와 뭐가 다른가요?", a: "한 번 결제로 다섯 장을 이어서 뽑아요. 포장을 하나씩 골라 열거나, 바로 오픈하기로 다섯 장을 한꺼번에 열 수 있어요. 결제 금액은 1장 가격의 5배예요." },
  { cat: "뽑기", q: "포장을 열다가 앱을 닫으면 카드는 어떻게 되나요?", a: "결제가 끝난 순간 카드는 이미 보유 카드에 들어가 있어요. 연출을 보지 못해도 카드는 사라지지 않아요." },
  { cat: "결제·TP", q: "결제는 어떻게 하나요?", a: "포토카드는 TP로만 결제해요. 1 TP는 1원 기준이고, 결제 시트에서 현재 가격과 보유 TP, 차감 후 잔액을 확인한 뒤 결제하기를 누르면 돼요." },
  { cat: "결제·TP", q: "TP는 어디서 충전하나요?", a: "토마톡 지갑에서 TOTT를 TP로 교환해요. 결제 시트에서 TP가 모자라면 TP 교환하기 버튼으로 바로 지갑 교환 화면에 갈 수 있고, 교환이 끝나면 결제 시트로 돌아와요." },
  { cat: "결제·TP", q: "지갑 연결이 꼭 필요한가요?", a: "네. TP 결제와 TOTT 교환은 토마톡 지갑이 연결돼 있어야 해요. 지갑이 연결되어 있지 않으면 결제 시트에서 먼저 연결을 안내해요." },
  { cat: "결제·TP", q: "교환한 TP를 다시 TOTT로 바꿀 수 있나요?", a: "아니요. 한번 교환된 TP는 다시 TOTT로 바꿀 수 없어요. 또 지갑에 있는 TP는 다른 지갑으로 옮길 수 없으니 교환 전에 지갑과 수량을 확인해 주세요." },
  { cat: "결제·TP", q: "뽑기를 취소하거나 환불받을 수 있나요?", a: "랜덤 상품 특성상 결제가 끝나고 카드가 확정된 뒤에는 취소·교환·환불이 되지 않아요. 결제 전에 상품과 장수를 꼭 확인해 주세요." },
  { cat: "보유 카드", q: "뽑은 카드는 어디서 보나요?", a: "메뉴의 보유 카드에서 언제든 볼 수 있어요. 전체 또는 가수별로 모아 보고, 카드를 누르면 앞뒤를 크게 볼 수 있어요." },
  { cat: "보유 카드", q: "카드 이미지를 저장할 수 있나요?", a: "보유 카드 이미지에는 TOMATOK 워터마크와 보유 카드 ID가 들어가고, 저장·캡처는 막혀 있어요. 실물 카드는 배송으로 받아요." },
  { cat: "배송", q: "실물 카드는 언제 받을 수 있나요?", a: "배송 기능은 준비 중이에요. 열리면 보유 카드에서 여러 장을 골라 한 번에 배송 신청할 수 있고, 국내·해외 배송을 지원할 예정이에요." },
  { cat: "배송", q: "실물 카드에 흠집이 있으면 어떻게 하나요?", a: "공식 상품의 제작·포장 과정에서 미세한 스크래치, 인쇄점, 재단 차이가 있을 수 있어요. 이런 경우는 불량으로 보지 않아요. 파손이나 오배송은 토마톡 앱 고객센터로 알려 주세요." },
  { cat: "계정", q: "다른 기기에서도 보유 카드를 볼 수 있나요?", a: "같은 토마톡 계정으로 로그인하면 어느 기기에서든 보유 카드를 볼 수 있어요. TP는 계정에 묶이고, TOTT는 연결한 지갑마다 달라요." },
];
const FAQ_CATS = ["전체", "뽑기", "결제·TP", "보유 카드", "배송", "계정"];

function faqPage() {
  const cat = state.faqCat || "전체";
  const items = FAQ_ITEMS.filter((item) => cat === "전체" || item.cat === cat);
  const chips = FAQ_CATS.map((name) => `<button type="button" class="${name === cat ? "on" : ""}" data-faq-cat="${esc(name)}">${esc(name)}</button>`).join("");
  const list = items.map((item, index) => `
    <details class="faq-item"${index === 0 && cat !== "전체" ? " open" : ""}>
      <summary><span class="faq-q"><b>Q</b>${esc(item.q)}</span><span class="guide-icon" aria-hidden="true"><span class="plus">${icon("plus")}</span><span class="minus">${icon("minus")}</span></span></summary>
      <div class="faq-a"><b>A</b><p>${esc(item.a)}</p></div>
    </details>`).join("");
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>FAQ</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <section class="support-page faq">
        <p class="support-lead">자주 묻는 질문을 모았어요.</p>
        <div class="faq-cats" role="tablist">${chips}</div>
        <div class="faq-list">${list}</div>
      </section>
    </div>
  `;
}

// 이용약관(기본 틀). 법무 검토 전 초안이며, 회사명·시행일은 확정 뒤 바꾼다.
const TERMS_META = { version: "1.0", effective: "2026.11.01" };
const TERMS_SECTIONS = [
  { title: "제1조 (목적)", body: ["이 약관은 토마톡(이하 \"회사\")이 제공하는 포토카드 서비스(이하 \"서비스\")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임 사항을 정하는 것을 목적으로 합니다."] },
  { title: "제2조 (용어의 정의)", list: ["\"서비스\"란 회사가 운영하는 랜덤 포토카드 뽑기, 보유 카드 보관, 실물 배송 등 포토카드와 관련된 일체의 서비스를 말합니다.", "\"이용자\"란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원을 말합니다.", "\"TP\"란 서비스 안에서 포토카드 결제에 쓰는 포인트로, 1 TP는 1원을 기준으로 합니다.", "\"TOTT\"란 토마톡 지갑에 보유한 토큰으로, 이용자는 이를 TP로 교환할 수 있습니다.", "\"보유 카드\"란 이용자가 뽑기를 통해 확보한 포토카드와 그 디지털 이미지를 말합니다."] },
  { title: "제3조 (약관의 효력과 변경)", list: ["이 약관은 서비스 화면에 게시하거나 그 밖의 방법으로 이용자에게 공지함으로써 효력이 생깁니다.", "회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경 시 적용일자와 변경 사유를 명시하여 적용일 7일 전부터 공지합니다. 이용자에게 불리한 변경은 30일 전부터 공지합니다.", "이용자가 변경된 약관의 적용일 이후에도 서비스를 계속 이용하면 변경된 약관에 동의한 것으로 봅니다."] },
  { title: "제4조 (서비스의 내용)", list: ["회사는 앨범 또는 이벤트 단위로 구성된 포토카드 묶음에서 무작위로 카드를 뽑는 랜덤 뽑기 서비스를 제공합니다.", "뽑기 결과는 무작위로 정해지며, 같은 카드가 중복으로 나올 수 있습니다. 각 상품의 구성과 장수는 상품 상세에 표시합니다.", "회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다."] },
  { title: "제5조 (결제와 TP)", list: ["포토카드 결제는 TP로만 할 수 있습니다. TP는 토마톡 지갑에 연결된 TOTT를 교환하여 충전합니다.", "TOTT와 TP의 교환 비율은 교환 시점의 환율을 따르며, 교환 화면에 표시된 비율이 적용됩니다. 실시간 가격 변동으로 실제 지급되는 TP가 예상과 다를 수 있습니다.", "한번 교환된 TP는 다시 TOTT로 바꿀 수 없으며, 지갑에 보유한 TP는 다른 지갑이나 계정으로 옮길 수 없습니다.", "회사는 최소 교환 수량을 정할 수 있으며, 이에 미달하는 교환 요청은 처리되지 않습니다."] },
  { title: "제6조 (청약 철회와 환불)", list: ["랜덤 뽑기 상품은 결제와 동시에 카드가 확정되어 제공되는 디지털 콘텐츠로, 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항에 따라 결제 완료 후에는 청약 철회가 제한됩니다.", "이용자는 결제 전 결제 시트에서 상품명, 장수, 가격, 보유 TP, 차감 후 잔액을 확인해야 하며, 회사는 결제 전 이를 명확히 표시합니다.", "회사의 귀책으로 결제가 중복되거나 카드가 제공되지 않은 경우에는 해당 TP를 복구하거나 카드를 다시 제공합니다."] },
  { title: "제7조 (보유 카드와 실물 배송)", list: ["뽑은 카드는 보유 카드에 보관되며, 이용자는 보유 카드에서 언제든 카드 이미지를 확인할 수 있습니다.", "보유 카드 이미지에는 워터마크와 보유 카드 ID가 표시되며, 원본 이미지 파일은 제공하지 않습니다.", "실물 카드 배송은 회사가 정한 절차와 기간에 따르며, 국내·해외 배송 조건과 비용은 배송 신청 화면에 표시합니다.", "공식 상품의 제작·포장 과정에서 생길 수 있는 미세한 스크래치, 인쇄점, 재단 차이는 불량으로 보지 않습니다."] },
  { title: "제8조 (이용자의 의무)", list: ["이용자는 타인의 계정이나 지갑을 이용하거나, 부정한 방법으로 TP를 취득하거나, 뽑기 결과를 조작하려는 행위를 해서는 안 됩니다.", "이용자는 서비스에서 제공하는 카드 이미지를 무단으로 복제, 배포, 판매하거나 상업적으로 이용할 수 없습니다.", "회사는 이용자가 이 조를 위반한 경우 서비스 이용을 제한하거나 계정을 정지할 수 있습니다."] },
  { title: "제9조 (지식재산권)", list: ["서비스에 포함된 포토카드 이미지, 아티스트 콘텐츠, 디자인, 상표 등은 회사 또는 권리자에게 귀속됩니다.", "이용자는 보유 카드를 개인적인 감상 목적으로만 이용할 수 있으며, 권리자의 허락 없이 2차적 저작물을 만들거나 외부에 게시할 수 없습니다."] },
  { title: "제10조 (책임의 제한)", list: ["회사는 천재지변, 통신 장애, 블록체인 네트워크 지연 등 회사가 통제할 수 없는 사유로 서비스를 제공하지 못한 경우 책임을 지지 않습니다.", "회사는 이용자의 귀책으로 생긴 손해, 이용자가 서비스를 통해 기대하는 수익을 얻지 못한 것에 대해 책임을 지지 않습니다.", "TOTT의 시세 변동으로 생기는 손실은 이용자가 부담합니다."] },
  { title: "제11조 (분쟁 해결)", list: ["회사와 이용자 사이에 분쟁이 생기면 토마톡 고객센터를 통해 먼저 해결하도록 노력합니다.", "이 약관과 서비스 이용에 관한 소송은 대한민국 법을 준거법으로 하며, 민사소송법에 따른 관할 법원에 제기합니다."] },
  { title: "부칙", body: [`이 약관은 ${TERMS_META.effective}부터 시행합니다.`] },
];

function termsPage() {
  const sections = TERMS_SECTIONS.map((section) => `
    <section class="terms-sec">
      <h3>${esc(section.title)}</h3>
      ${section.body ? section.body.map((line) => `<p>${esc(line)}</p>`).join("") : ""}
      ${section.list ? `<ol>${section.list.map((line) => `<li>${esc(line)}</li>`).join("")}</ol>` : ""}
    </section>`).join("");
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>이용약관</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <section class="support-page terms">
        <div class="terms-head">
          <h2>포토카드 서비스 이용약관</h2>
          <p>버전 ${esc(TERMS_META.version)} · 시행일 ${esc(TERMS_META.effective)}</p>
        </div>
        ${sections}
      </section>
    </div>
  `;
}

// 1:1 문의 게시판(기기 저장). 관리자 답변·서버 저장이 없어 드로어 메뉴에서는 뺐다(2026-10-27). 붙을 때 메뉴만 다시 켠다.
const INQUIRY_KEY = "photocard-inquiries-v1";
const INQUIRY_CATS = ["주문·결제", "뽑기·개봉", "지갑·TP", "배송", "기타"];

function loadInquiries() {
  try {
    const saved = JSON.parse(localStorage.getItem(INQUIRY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveInquiries(list) {
  localStorage.setItem(INQUIRY_KEY, JSON.stringify(list));
}

function inquiryWhen(iso) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return `${at.getFullYear()}.${pad2(at.getMonth() + 1)}.${pad2(at.getDate())} ${pad2(at.getHours())}:${pad2(at.getMinutes())}`;
}

function inquiryStatus(item) {
  return item.answer
    ? `<span class="inq-status done">답변 완료</span>`
    : `<span class="inq-status">답변 대기</span>`;
}

function inquiryPage() {
  const view = state.inqView || "list";
  if (view === "write") return inquiryWrite();
  if (view !== "list") {
    const found = loadInquiries().find((item) => item.id === view);
    if (found) return inquiryDetail(found);
  }
  const list = loadInquiries();
  const rows = list.map((item) => `
    <button type="button" class="inq-row" data-inq-open="${esc(item.id)}">
      <span class="inq-row-top"><em>${esc(item.cat)}</em>${inquiryStatus(item)}</span>
      <strong>${esc(item.title)}</strong>
      <small>${esc(inquiryWhen(item.at))}</small>
    </button>`).join("");
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>1:1 문의</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <section class="support-page inq">
        <p class="support-lead">궁금한 점이나 문제가 있으면 남겨 주세요. 답변은 보통 1~2일 안에 드리고, 답변이 달리면 앱 알림으로 알려 드려요.</p>
        <button class="primary inq-new" type="button" data-inq-write>문의하기</button>
        <h2 class="inq-head">내 문의 <span>${list.length}</span></h2>
        ${rows || `<p class="empty inq-empty">아직 남긴 문의가 없어요.<br>FAQ에서 답을 먼저 찾아보셔도 좋아요.</p>`}
      </section>
    </div>
  `;
}

function inquiryWrite() {
  const cat = state.inqCat || INQUIRY_CATS[0];
  const ready = String(state.inqTitle || "").trim() && String(state.inqBody || "").trim();
  const chips = INQUIRY_CATS.map((name) => `<button type="button" class="${name === cat ? "on" : ""}" data-inq-cat="${esc(name)}">${esc(name)}</button>`).join("");
  return `
    <header class="bar">
      <button type="button" data-inq-back aria-label="문의 목록">←</button>
      <h1>문의하기</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <form class="ship-form inq-form" data-inq-form>
        <label>문의 유형
          <span class="faq-cats inq-cats">${chips}</span>
        </label>
        <label>제목
          <input data-field="inqTitle" value="${esc(state.inqTitle || "")}" maxlength="60" placeholder="무엇이 궁금한가요?" />
        </label>
        <label>내용
          <textarea data-field="inqBody" rows="7" maxlength="1000" placeholder="상황을 자세히 적어 주시면 더 빨리 도와드릴 수 있어요. 주문 번호나 카드 번호가 있으면 함께 적어 주세요.">${esc(state.inqBody || "")}</textarea>
        </label>
        <p class="inq-note">${icon("info")}<span>결제·지갑 문의는 토마톡 계정과 연결 지갑 주소를 기준으로 확인해요. 비밀번호나 지갑 복구 문구는 절대 적지 마세요.</span></p>
        <button class="primary inq-submit" type="button" data-inq-submit ${ready ? "" : "disabled"}>문의 등록</button>
      </form>
    </div>
  `;
}

function inquiryDetail(item) {
  const answer = item.answer
    ? `
      <section class="inq-answer">
        <h3>답변 <small>${esc(inquiryWhen(item.answeredAt || ""))}</small></h3>
        <p>${esc(item.answer).replaceAll("\n", "<br>")}</p>
      </section>`
    : `
      <section class="inq-answer waiting">
        <h3>답변 대기</h3>
        <p>답변을 준비하고 있어요. 보통 1~2일 안에 답변드리고, 답변이 달리면 앱 알림으로 알려 드려요.</p>
      </section>`;
  return `
    <header class="bar">
      <button type="button" data-inq-back aria-label="문의 목록">←</button>
      <h1>문의 내역</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <section class="support-page inq-detail">
        <span class="inq-row-top"><em>${esc(item.cat)}</em>${inquiryStatus(item)}</span>
        <h2>${esc(item.title)}</h2>
        <small>${esc(inquiryWhen(item.at))}</small>
        <p class="inq-body">${esc(item.body).replaceAll("\n", "<br>")}</p>
        ${answer}
        <button class="ghost inq-delete" type="button" data-inq-delete="${esc(item.id)}">문의 삭제</button>
      </section>
    </div>
  `;
}

function supportPage(kind) {
  if (kind === "faq") return faqPage();
  if (kind === "terms") return termsPage();
  const page = SUPPORT_PAGES[kind];
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>${esc(page.title)}</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <section class="support-page">
        <h2>${esc(page.heading)}</h2>
        <p class="empty">${esc(page.empty)}</p>
      </section>
    </div>
  `;
}

// 환경설정(기획 2장 Ver.01 항목). 6장 안내 문구의 '내 기본정보 설정'이 여기다: 첫 진입 팝업에서 고른 PUSH·마케팅 동의를 바꾼다.
function settings() {
  const saved = loadOnboard();
  const row = (key, label, note, on) => `
    <div class="set-row">
      <span><b>${label}</b><small>${note}</small></span>
      <button type="button" class="switch${on ? " on" : ""}" role="switch" aria-checked="${on}" data-consent="${key}" aria-label="${label}"><i></i></button>
    </div>`;
  const when = saved.decidedAt ? consentWhen(saved.decidedAt) : "—";
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>환경설정</h1>
      ${menuButton()}
    </header>
    <div class="scroll">
      <section class="set-box">
        <h2>내 기본정보 설정</h2>
        ${row("push", "PUSH 알림", "새 상품과 뽑기 소식을 받아요.", Boolean(saved.push))}
        ${row("marketing", "마케팅 수신 동의", "이벤트와 혜택 안내를 받아요.", Boolean(saved.marketing))}
        <p class="set-note">전송자 TOMATOK · 처리 일시 ${esc(when)}</p>
      </section>
    </div>
  `;
}

function purchaseDate(value) {
  const text = String(value || "");
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return formatDate(text.slice(0, 10));
  return formatDate(text);
}

// 구매 내역(Q22 기본값): 결제 기록을 단순 목록으로 보여 준다.
function purchases() {
  const orders = readOrderStore()
    .filter((order) => order.kind === "purchase")
    .sort((a, b) => String(b.purchasedOn || "").localeCompare(String(a.purchasedOn || "")));
  const rows = orders.length
    ? orders.map((order) => {
      const item = product(order.productId);
      const cover = item?.cover ? `<img src="${esc(item.cover)}" alt="" />` : `<span class="thumb-blank"></span>`;
      const price = Number.isFinite(Number(order.price)) && order.price != null ? priceBlock(order.price) : "—";
      return `
        <article class="purchase">
          <span class="thumb">${cover}</span>
          <span>
            <p class="purchase-when">${esc(purchaseDate(order.purchasedOn) || "—")}</p>
            <p class="name">${esc(order.productName || order.album || "")}</p>
            <p class="meta">${esc(order.artist || "")} · ${Number(order.count) || (order.cards || []).length}장</p>
          </span>
          <strong>${price}</strong>
        </article>`;
    }).join("")
    : `<p class="empty">구매 내역이 없어요.</p>`;
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>구매 내역</h1>
      ${menuButton()}
    </header>
    <div class="scroll"><div class="list">${rows}</div></div>
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
          <p class="wish-price">${priceBlock(item.price)}</p>
        </span>
      </button>`;
    }).join("")
    : `<p class="empty">찜한 상품이 없어요.</p>`;
  return `
    <header class="bar">
      <button data-back="home" aria-label="홈">←</button>
      <h1>찜 목록</h1>
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
  // TP가 모자라도 버튼은 열어 둔다. 결제 시트가 부족분과 [TP 교환하기]를 보여 준다.
  const canOne = true;
  const stockForFive = canDrawFive(item);
  const canFive = stockForFive;
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
    <header class="bar">
      <button data-back="${state.productFrom === "artist" || state.productFrom === "artists" ? state.productFrom : ""}" aria-label="뒤로">←</button>
      <h1>${esc(item.artist)}</h1>
      ${menuButton()}
    </header>
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
          <p class="lead">${priceBlock(item.price)}</p>
        </div>
        <p class="pay-note">TP로 결제해요 · TOTT는 토마톡 지갑에서 TP로 바꿔요</p>
        <div class="perks">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="1.5"></rect></svg>${esc(perkLabels(item)[0])}</span>
          <span>${icon("track")}${esc(perkLabels(item)[1])}</span>
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
          ${guideSection("포토카드 안내", item, "photocard")}
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

// 1은 통이미지로 포장 위쪽을 찢고, 2는 자른 찢어짐을 손가락 높이에 붙인다.
const TEAR_METHOD = 2;
// false면 결제 뒤 바로 포장 개봉으로 간다. 덱 연출만 뺄 때 이 값만 바꾸면 된다.
const CARD_DECK = true;
const DECK_FAN = [
  { x: -105, y: 16, r: -18 },
  { x: -55, y: 5, r: -9 },
  { x: 0, y: 0, r: 0 },
  { x: 55, y: 5, r: 9 },
  { x: 105, y: 16, r: 18 },
];
// 5장 바로 오픈하기(슬라이드 16): 다섯 장을 2-1-2로 펼친다.
const SPREAD_POP_AT = 500; // ms, 2-1-2 자리에서 포장이 터져 사라지는 데 걸리는 시간
const SPREAD_FLIP_AT = 800; // ms, 포장이 사라진 뒤 다섯 장이 한꺼번에 뒤집히기 시작
const SPREAD_GRID = [
  { x: -82, y: -158 },
  { x: 82, y: -158 },
  { x: 0, y: 0 },
  { x: -82, y: 158 },
  { x: 82, y: 158 },
];
const OPEN_BASE = "tears/base.jpg?v=4";
const DECK_PACK = "tears/base.png?v=1";
const DECK_BACK = "tears/back.png?v=1";
const DECK_HIT = { x0: 0.111, y0: 0.057, x1: 0.885, y1: 0.971 };
const OPEN_OVERS = [1, 2, 3, 4].map((index) => (
  TEAR_METHOD === 1 ? `tears/method-1/over-${index}.png?v=1` : `tears/over-${index}.png?v=5`
));

function showOpenFrame(stage, index) {
  const overs = [...stage.querySelectorAll(".open-over")];
  const next = Math.max(0, Math.min(overs.length, index));
  overs.forEach((img, item) => img.classList.toggle("is-on", item + 1 === next));
  return next;
}

function dragSpan(dx, dy) {
  return Math.hypot(dx, dy);
}

function dragFrame(stage, distance) {
  const stack = stage.querySelector(".open-stack");
  const width = stack?.getBoundingClientRect().width || 1;
  const progress = Math.max(0, Math.min(1, Math.abs(distance) / width));
  const count = stage.querySelectorAll(".open-over").length;
  if (progress <= 0 || !count) return 0;
  return Math.min(count, Math.ceil(progress * count));
}

const TEAR_INK = [
  { x0: 0.044, y0: 0.1, x1: 0.463, y1: 0.703 },
  { x0: 0.077, y0: 0.062, x1: 0.682, y1: 0.591 },
  { x0: 0.037, y0: 0, x1: 0.727, y1: 0.668 },
  { x0: 0.02, y0: 0.015, x1: 0.978, y1: 1 },
];

function tearInk(stage, frame) {
  if (TEAR_METHOD !== 2) return { x0: 0, x1: 1, y0: 0, y1: 1 };
  const stack = stage.querySelector(".open-stack");
  if (!stack) return null;
  const box = stack.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  const ink = TEAR_INK[Math.max(0, Math.min(TEAR_INK.length, frame) - 1)];
  const mid = stage.classList.contains("is-mid");
  const span = (parseFloat(stack.style.getPropertyValue("--tear-span")) || 0);
  if (stage.classList.contains("is-diag")) {
    const originX = (parseFloat(stack.style.getPropertyValue("--tear-origin-x")) || 0) / box.width;
    const originY = (parseFloat(stack.style.getPropertyValue("--tear-origin-y")) || 0) / box.height;
    const thick = (parseFloat(stack.style.getPropertyValue("--tear-thick")) || 0);
    const rad = ((Number(stage.dataset.tearAngle) || 0) * Math.PI) / 180;
    const shown = Math.min(ink.x1, span / box.width);
    if (shown <= ink.x0) return null;
    const padX = (thick * 0.5) / box.width;
    const padY = (thick * 0.5) / box.height;
    const ax = originX + (ink.x0 * box.width * Math.cos(rad)) / box.width;
    const ay = originY + (ink.x0 * box.width * Math.sin(rad)) / box.height;
    const bx = originX + (shown * box.width * Math.cos(rad)) / box.width;
    const by = originY + (shown * box.width * Math.sin(rad)) / box.height;
    return {
      x0: Math.min(ax, bx) - padX,
      x1: Math.max(ax, bx) + padX,
      y0: Math.min(ay, by) - padY,
      y1: Math.max(ay, by) + padY,
    };
  }
  if (stage.classList.contains("is-vert")) {
    const thick = (parseFloat(stack.style.getPropertyValue("--tear-thick")) || 0) / box.width;
    const left = (parseFloat(stack.style.getPropertyValue("--tear-left")) || 0) / box.width;
    const anchor = 85 / 259;
    const up = stage.classList.contains("is-up");
    const across = (iy) => left + (up ? 1 : -1) * (iy - anchor) * thick;
    const x0 = Math.min(across(ink.y0), across(ink.y1));
    const x1 = Math.max(across(ink.y0), across(ink.y1));
    if (!mid) {
      return {
        x0,
        x1,
        y0: up ? 1 - ink.x1 : ink.x0,
        y1: up ? 1 - ink.x0 : ink.x1,
      };
    }
    const originY = (parseFloat(stack.style.getPropertyValue("--tear-origin-y")) || 0) / box.height;
    const shown = Math.min(ink.x1, span / box.height);
    if (shown <= ink.x0) return null;
    const y0 = up ? originY - shown : originY + ink.x0;
    const y1 = up ? originY - ink.x0 : originY + shown;
    return { x0, x1, y0: Math.min(y0, y1), y1: Math.max(y0, y1) };
  }
  const top = (parseFloat(stack.style.getPropertyValue("--tear-top")) || 0) / box.height;
  const height = (box.width * (259 / 985)) / box.height;
  const fromRight = stage.classList.contains("is-rtl");
  if (!mid) {
    return {
      x0: fromRight ? 1 - ink.x1 : ink.x0,
      x1: fromRight ? 1 - ink.x0 : ink.x1,
      y0: top + ink.y0 * height,
      y1: top + ink.y1 * height,
    };
  }
  const originX = (parseFloat(stack.style.getPropertyValue("--tear-origin-x")) || 0) / box.width;
  const shown = Math.min(ink.x1, span / box.width);
  if (shown <= ink.x0) return null;
  return {
    x0: fromRight ? originX - shown : originX + ink.x0,
    x1: fromRight ? originX - ink.x0 : originX + shown,
    y0: top + ink.y0 * height,
    y1: top + ink.y1 * height,
  };
}

function fingerOnTear(stage, frame) {
  const ink = tearInk(stage, frame);
  const x = Number(stage.dataset.fingerX);
  const y = Number(stage.dataset.fingerY);
  if (!ink || !Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (x < ink.x0 || x > ink.x1 || y < ink.y0 || y > ink.y1) return null;
  return { x, y, ink };
}

function tearSparks(stage, frame, hit) {
  if (!frame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const stack = stage.querySelector(".open-stack");
  const ink = hit?.ink || tearInk(stage, frame);
  if (!stack || !ink || stack.querySelectorAll(".tear-spark").length > 120) return;
  const fromRight = stage.classList.contains("is-rtl");
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const addSpark = (x, top, hot, reach) => {
    const spark = document.createElement("i");
    const tooth = Math.random() < 0.5 ? -1 : 1;
    let angle = hot ? tooth * (18 + Math.random() * 120) : tooth * (42 + Math.random() * 58);
    spark.className = hot ? "tear-spark is-hot" : "tear-spark";
    spark.style.left = `${clamp(x, ink.x0, ink.x1) * 100}%`;
    spark.style.top = `${clamp(top, ink.y0, ink.y1) * 100}%`;
    if (stage.classList.contains("is-diag")) angle += Number(stage.dataset.tearAngle) || 0;
    else if (stage.classList.contains("is-vert")) angle += stage.classList.contains("is-up") ? -90 : 90;
    else if (fromRight) angle = 180 - angle;
    spark.style.setProperty("--rot", `${angle}deg`);
    spark.style.setProperty("--dist", reach);
    spark.style.setProperty("--len", `${8 + Math.random() * 14}px`);
    spark.style.animationDuration = `${0.14 + Math.random() * 0.15}s`;
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
    stack.appendChild(spark);
  };
  for (let index = 0; index < 8; index += 1) {
    addSpark(
      ink.x0 + Math.random() * (ink.x1 - ink.x0),
      ink.y0 + Math.random() * (ink.y1 - ink.y0),
      false,
      `${46 + Math.random() * 94}px`
    );
  }
  for (let index = 0; index < 8; index += 1) {
    addSpark(
      ink.x0 + Math.random() * (ink.x1 - ink.x0),
      ink.y0 + Math.random() * (ink.y1 - ink.y0),
      true,
      `${18 + Math.random() * 40}px`
    );
  }
  if (!hit) return;
  for (let index = 0; index < 10; index += 1) {
    addSpark(
      hit.x + (Math.random() - 0.5) * 0.04,
      hit.y + (Math.random() - 0.5) * 0.02,
      true,
      `${14 + Math.random() * 48}px`
    );
  }
}

function visibleTear(stage) {
  const overs = [...stage.querySelectorAll(".open-over")];
  const index = overs.findIndex((img) => img.classList.contains("is-on"));
  return index < 0 ? 0 : index + 1;
}

function keepTearSparks(stage) {
  if (stage.dataset.sparking) return;
  stage.dataset.sparking = "1";
  const tick = () => {
    if (!stage.isConnected || stage.dataset.sparkStop) return;
    const frame = visibleTear(stage);
    if (!frame) {
      window.setTimeout(tick, 69);
      return;
    }
    const hit = stage.classList.contains("is-touching") ? fingerOnTear(stage, frame) : null;
    tearSparks(stage, frame, hit);
    window.setTimeout(tick, 69);
  };
  tick();
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
    ${openBar(count > 1 ? `${count}장 뽑기` : "")}
    <div class="open-stage tear-${TEAR_METHOD}" data-open-stage>
      <video class="open-fire-src" data-fireworks src="fx/fireworks.mp4?v=4" muted loop playsinline preload="auto"></video>
      <div class="open-stack">
        <div class="env-back"></div>
        ${cardLayer}
        <div class="open-frames">
          <img class="open-base" src="${OPEN_BASE}" alt="" draggable="false" />
          ${overs}
          <img class="open-shell" src="tears/over-5.png?v=3" alt="" draggable="false" />
        </div>
        <img class="pack-piece p-top" src="tears/pieces/top.png?v=1" alt="" draggable="false" />
        <img class="pack-piece p-ul" src="tears/pieces/ul.png?v=1" alt="" draggable="false" />
        <img class="pack-piece p-ur" src="tears/pieces/ur.png?v=1" alt="" draggable="false" />
        <img class="pack-piece p-ll" src="tears/pieces/ll.png?v=1" alt="" draggable="false" />
        <img class="pack-piece p-lr" src="tears/pieces/lr.png?v=1" alt="" draggable="false" />
        <div class="tear-hint" aria-hidden="true">
          <div class="tear-hint-arm">
            <i class="tear-hint-line"></i>
            <span class="tear-hint-finger">${fingerIcon()}</span>
          </div>
        </div>
      </div>
      <div class="fly-card">
        <div class="fly-spin">${frontFace}<span class="prism" aria-hidden="true"></span>${backFace}</div>
      </div>
      <video class="open-burst" data-open-burst src="fx/splash.mp4?v=1" muted playsinline preload="auto"></video>
      <p class="open-guide">손가락으로 밀어 열어보세요.</p>
      <p class="open-turn"><span class="open-turn-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="12" rx="1.4"></rect><path d="M4 19h16"></path><path d="M7 16.5 4 19l3 2.5"></path><path d="M17 16.5 20 19l-3 2.5"></path></svg></span>드래그하여 앞뒤로 돌려보세요.</p>
      <button class="primary open-ok" type="button" data-open-ok>OK</button>
    </div>
  `;
}

function openMotion() {
  return `
    <div class="motion" aria-label="Photocard Open">
      <span class="motion-ring"></span>
      <span class="motion-flash"></span>
      <img class="motion-pack" src="pack_closed.png" alt="" />
    </div>
  `;
}

// 개봉 흐름 공통 헤더(슬라이드 11~17): ←는 결과 화면으로 건너뛴다(Q13 기본값).
function openBar(note) {
  return `
    <header class="bar open-bar">
      <button type="button" data-open-skip aria-label="결과로 건너뛰기">←</button>
      <h1>Photocard Open</h1>
      ${note ? `<span class="result-progress">${esc(note)}</span>` : ""}
    </header>`;
}

function cardWho(card) {
  return [card.member, card.rarity].filter(Boolean).join(" · ");
}

function revealSlide(card, index) {
  const back = revealBackSrc(card);
  const backFace = back
    ? `<img class="reveal-face back" src="${back}" alt="" draggable="false" />`
    : `<span class="reveal-face back reveal-back-blank"></span>`;
  return `
    <div class="result-slide" data-result-slide="${index}">
      <div class="reveal-flip">
        <div class="reveal-spin">
          <img class="reveal-face front guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" />
          ${backFace}
        </div>
      </div>
    </div>`;
}

// 결과 화면(슬라이드 14·17). 5장 뽑기는 좌우 스와이프 캐러셀로 다섯 장을 모두 보여 준다.
function result() {
  const item = product(state.productId);
  const count = state.reveal.length;
  const index = Math.max(0, Math.min(count - 1, state.revealIndex));
  const card = state.reveal[index];
  const many = count > 1;
  const progress = many ? `${index + 1} / ${count}` : "";
  const dots = many
    ? `<div class="result-dots" data-result-dots>${state.reveal.map((_, i) => `<i class="${i === index ? "on" : ""}"></i>`).join("")}</div>`
    : "";
  const otherLabel = many ? "1장 뽑기 구매" : "5장 연속 뽑기 구매";
  const otherCount = many ? 1 : 5;
  return `
    <header class="bar open-bar">
      <button type="button" data-result-close aria-label="닫기">←</button>
      <h1>Photocard Open</h1>
      <button type="button" class="result-album" data-nav="album" aria-label="보유 카드">${TAB_ICONS.album}<span>보유 카드</span></button>
    </header>
    <div class="scroll">
      <div class="result">
        <div class="result-cards${many ? " is-many" : ""}" data-result-cards>
          ${state.reveal.map(revealSlide).join("")}
        </div>
        ${dots}
        ${progress ? `<p class="result-count" data-result-progress>${progress}</p>` : ""}
        ${artistMark(item)}
        <h2 data-result-name>${esc(item.album)} ${esc(card.no)}</h2>
        <p class="result-grade" data-result-grade>${esc(cardWho(card))}</p>
        <p class="result-status">보유 카드에서 확인 가능해요</p>
        <div class="result-actions">
          <button class="primary" data-again="${count}">${many ? `${count}장 한 번 더 뽑기` : "한 번 더 뽑기"}</button>
          <div class="result-split">
            <button class="ghost" data-again="${otherCount}">${otherLabel}</button>
            <button class="ghost" type="button" data-nav="home">다른 상품 보기</button>
          </div>
          <button class="result-close" type="button" data-result-close>닫기</button>
        </div>
      </div>
    </div>
  `;
}

// 5장 결과 캐러셀: 스와이프하면 이름·등급·n / 5 표시를 바꾼다.
function armResultCarousel() {
  const rail = document.querySelector("[data-result-cards]");
  if (!rail || rail.dataset.bound || state.reveal.length < 2) return;
  rail.dataset.bound = "1";
  const item = product(state.productId);
  const name = document.querySelector("[data-result-name]");
  const grade = document.querySelector("[data-result-grade]");
  const progress = document.querySelector("[data-result-progress]");
  const dots = [...document.querySelectorAll("[data-result-dots] i")];
  const width = () => rail.clientWidth || 1;
  if (state.revealIndex > 0) rail.scrollLeft = width() * state.revealIndex;
  let timer = 0;
  rail.addEventListener("scroll", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const index = Math.max(0, Math.min(state.reveal.length - 1, Math.round(rail.scrollLeft / width())));
      if (index === state.revealIndex) return;
      state.revealIndex = index;
      const card = state.reveal[index];
      if (name) name.textContent = `${item.album} ${card.no}`;
      if (grade) grade.textContent = cardWho(card);
      if (progress) progress.textContent = `${index + 1} / ${state.reveal.length}`;
      dots.forEach((dot, i) => dot.classList.toggle("on", i === index));
    }, 60);
  }, { passive: true });
}

function balanceLabel() {
  return state.walletConnected ? tott(state.tp) : "미연결";
}

function sheet() {
  if (!state.sheet) return "";
  const item = product(state.productId);
  const count = state.sheet;
  const cost = item.price * count;
  const short = state.tp < cost;
  const rows = count === 1
    ? [
        ["현재가격", priceBlock(cost)],
        ["보유", priceBlock(state.tp)],
        short ? ["부족한 TP", `<span class="price short"><span class="price-main">${tott(cost - state.tp)}</span><small class="price-sub" data-price-sub="${cost - state.tp}">${priceSub(cost - state.tp)}</small></span>`] : ["차감 후 남은 잔액", priceBlock(state.tp - cost)],
      ]
    : [
        ["5장 뽑기", priceBlock(cost)],
        ["보유", priceBlock(state.tp)],
        short ? ["부족한 TP", `<span class="price short"><span class="price-main">${tott(cost - state.tp)}</span><small class="price-sub" data-price-sub="${cost - state.tp}">${priceSub(cost - state.tp)}</small></span>`] : ["결제 후", priceBlock(state.tp - cost)],
      ];
  if (!state.walletConnected) {
    return `
      <div class="sheet-bg">
        <div class="sheet">
          <span class="sheet-grab"></span>
          <h2 class="sheet-need">지갑 연결이 필요해요</h2>
          <p class="sheet-copy">포토카드는 TP로 결제해요.<br>지갑을 연결하면 바로 결제를 계속할 수 있어요.</p>
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
        <p class="rate-note" data-rate-note>${esc(rateNote())}</p>
        ${state.tp < cost
          ? (state.balance > 0
            ? `<p class="sheet-short">토마톡 지갑에서 TOTT를 TP로 교환해요.</p>
               <button class="primary" type="button" data-go-exchange>TP 교환하기</button>`
            : `<p class="sheet-short">지갑에 TOTT가 없어요. TOTT를 받은 뒤 TP로 교환해요.</p>
               <button class="primary" type="button" data-go-receive>TOTT 받기</button>`)
            + `<button class="ghost" type="button" disabled>결제하기</button>`
          : `<div class="sheet-note">
               ${sheetNotes(item).map((line) => `<p>${esc(line)}</p>`).join("")}
             </div>
             <button class="primary" data-pay="${count}">결제하기</button>`}
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
        <p>TP로 결제하려면<br>지갑을 먼저 연결해 주세요.</p>
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
  state.tp -= item.price * count;
  persistWallet();
  state.reveal = picked;
  state.revealIndex = 0;
  beginOpen();
}

function beginOpen() {
  if (!CARD_DECK) {
    showPack();
    return;
  }
  state.sheet = null;
  state.openPhase = "deck";
  state.openCut = "idle";
  state.motionArmed = false;
  state.screen = "open";
  state.tab = "home";
  render();
}

// 셔플 화면(슬라이드 11·15·16): SKIP, [한 번 더 섞기 | 바로 오픈하기], 선택 뒤 중간 연출.
// 셔플에 펼치는 포장 수: 상품의 포토카드 종류("N종 중 랜덤 1장")가 5종 이하면 부채꼴 5개, 6종 이상이면 원형 10개.
// 매 뽑기가 독립이라 몇 번째든 같은 수에서 고른다.
const DECK_RING_COUNT = 10;
const DECK_RING_RADIUS = 118;

function deckCount() {
  const kinds = product(state.productId)?.cards?.length || 0;
  return kinds > DECK_FAN.length ? DECK_RING_COUNT : DECK_FAN.length;
}

function fanSpots(n) {
  if (n <= DECK_FAN.length) return DECK_FAN.slice(0, n);
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * 360;
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(Math.sin(rad) * DECK_RING_RADIUS), y: Math.round(-Math.cos(rad) * DECK_RING_RADIUS), r: Math.round(angle) };
  });
}

// 5장 뽑기: 1장과 같은 선택 → 연출 → 찢기 흐름을 포장마다 되풀이한다. 연 카드는 위에 쌓인다.
// 포장은 매번 5개 그대로 펼친다(줄이지 않는다). 뽑기는 매번 무작위라 포장 수가 남은 장수를 뜻하지 않기 때문.
// 5장 뽑기 안내 둘째 줄: "5장 중 첫 번째 카드입니다." (숫자 1 / 5 대신 순서말)
const DECK_ORDINALS = ["첫", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"];
function deckOrderNote(index, count) {
  const word = DECK_ORDINALS[index] || `${index + 1}`;
  return `${count}장 중 ${word} 번째 카드입니다.`;
}

function cardDeck() {
  const count = state.reveal.length;
  const done = count > 1 ? Math.min(state.revealIndex, count) : 0;
  const remain = deckCount();
  const opened = done
    ? `<div class="deck-opened" aria-label="연 카드">${state.reveal.slice(0, done).map((card) => `<img class="deck-opened-card guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" />`).join("")}</div>`
    : "";
  const packs = fanSpots(remain).map((spot, index) => `
    <button type="button" class="deck-card" data-deck-pick="${index}" style="--i:${index};--fan-x:${spot.x}px;--fan-y:${spot.y}px;--fan-r:${spot.r}deg" aria-label="포장 ${index + 1}">
      <span class="deck-spin">
        <img class="deck-face" src="${DECK_PACK}" alt="" draggable="false" />
        <span class="prism" aria-hidden="true"></span>
        <img class="deck-face back" src="${DECK_BACK}" alt="" draggable="false" />
      </span>
    </button>`).join("");
  return `
    ${openBar(count > 1 ? `${count}장 뽑기` : "")}
    <div class="deck-stage" data-deck>
      <div class="deck-top">
        <p class="deck-hint" data-deck-hint>${count > 1 ? "포장을 골라 열어보세요" : "한 장을 선택하세요"}</p>
      </div>
      ${count > 1 ? `<p class="deck-note">${deckOrderNote(Math.min(done, count - 1), count)}</p>` : ""}
      ${opened}
      <div class="deck${remain > DECK_FAN.length ? " is-ring" : ""}" data-deck-cards>${packs}</div>
      <span class="deck-ring" aria-hidden="true"></span>
      <span class="deck-flash" aria-hidden="true"></span>
      <div class="deck-actions">
        <button class="ghost deck-again" type="button" data-deck-again aria-label="한 번 더 섞기"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"></path></svg>섞기</button>
        <button class="primary deck-direct" type="button" data-deck-direct>${count > 1 ? (done > 0 ? `남은 ${count - done}장 바로 오픈하기` : "5장 바로 오픈하기") : "바로 오픈하기"}</button>
      </div>
      <img class="deck-cover" src="${DECK_PACK}" alt="" draggable="false" />
    </div>
  `;
}

function deckCardAt(deck, clientX, clientY) {
  const cards = [...deck.querySelectorAll(".deck-card")].sort((a, b) => {
    const za = Number(getComputedStyle(a).zIndex) || 0;
    const zb = Number(getComputedStyle(b).zIndex) || 0;
    return zb - za;
  });
  return cards.find((card) => {
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const parent = card.offsetParent;
    if (!width || !height || !parent) return false;
    const parentBox = parent.getBoundingClientRect();
    const origin = getComputedStyle(card).transformOrigin.split(" ");
    const originX = parseFloat(origin[0]) || width / 2;
    const originY = parseFloat(origin[1]) || height / 2;
    const matrix = new DOMMatrix(getComputedStyle(card).transform);
    const inverse = matrix.inverse();
    if (!inverse) return false;
    const local = inverse.transformPoint(new DOMPoint(
      clientX - (parentBox.left + card.offsetLeft + originX),
      clientY - (parentBox.top + card.offsetTop + originY),
    ));
    const x = local.x + originX;
    const y = local.y + originY;
    return x >= width * DECK_HIT.x0 && x <= width * DECK_HIT.x1
      && y >= height * DECK_HIT.y0 && y <= height * DECK_HIT.y1;
  }) || null;
}

function armDeck() {
  const stage = document.querySelector("[data-deck]");
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = "1";
  const deck = stage.querySelector("[data-deck-cards]");
  const hint = stage.querySelector("[data-deck-hint]");
  const cards = [...deck.querySelectorAll(".deck-card")];
  const count = state.reveal.length;
  const multi = count > 1;
  const pickHint = multi ? "포장을 골라 열어보세요" : "한 장을 선택하세요";
  // 셔플 줄 간격: 포장 수에 맞춰 가운데 정렬
  const row = cards.map((_, index) => (index - (cards.length - 1) / 2) * (cards.length > 5 ? 32 : 60));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stops = [];
  let seats = cards.map((_, index) => index);
  const later = (fn, ms) => {
    stops.push(window.setTimeout(fn, ms));
  };
  const clearInline = () => {
    cards.forEach((card) => {
      card.style.removeProperty("--x");
      card.style.removeProperty("--y");
      card.style.zIndex = "";
    });
  };
  const layout = (lifted) => {
    cards.forEach((card, index) => {
      const moving = lifted?.has(index);
      card.style.setProperty("--x", `${row[seats[index]]}px`);
      card.style.setProperty("--y", moving ? "-30px" : "0px");
      card.style.zIndex = moving ? "8" : String(seats[index] + 1);
    });
  };
  const swap = () => {
    let first = Math.floor(Math.random() * cards.length);
    let second = Math.floor(Math.random() * (cards.length - 1));
    if (second >= first) second += 1;
    const seat = seats[first];
    seats[first] = seats[second];
    seats[second] = seat;
    layout(new Set([first, second]));
    cards[first].style.zIndex = "9";
    cards[second].style.zIndex = "7";
    later(() => layout(null), 340);
  };
  const gather = () => {
    cards.forEach((card, index) => {
      card.style.setProperty("--x", `${(index - 2) * 4}px`);
      card.style.setProperty("--y", `${(2 - index) * 3}px`);
      card.style.zIndex = String(index + 1);
    });
  };
  const playShuffle = () => {
    stops.forEach((id) => window.clearTimeout(id));
    stops = [];
    deck.classList.remove("is-fan", "is-shuffle", "is-picked");
    stage.classList.remove("is-cover");
    seats = cards.map((_, index) => index);
    clearInline();
    if (hint) hint.textContent = pickHint;
    if (reduced || cards.length < 2) {
      deck.classList.add("is-fan");
      return;
    }
    cards.forEach((card, index) => {
      card.style.setProperty("--x", `${row[index]}px`);
      card.style.setProperty("--y", "0px");
    });
    void deck.offsetWidth;
    deck.classList.add("is-shuffle");
    [420, 940, 1460, 1980].forEach((ms) => later(swap, ms));
    later(gather, 2460);
    later(() => {
      if (!stage.isConnected) return;
      clearInline();
      deck.classList.remove("is-shuffle");
      deck.classList.add("is-fan");
    }, 2920);
  };
  if (multi && state.revealIndex > 0) {
    // 두 번째 포장부터는 다시 섞지 않고 남은 포장을 바로 펼친다.
    seats = cards.map((_, index) => index);
    deck.classList.add("is-fan");
  } else {
    playShuffle();
  }
  // 중간 연출(슬라이드 16): 나머지 넉 장이 X자 네 방향으로 퍼지고, 고른 포장이 가운데서 커지며 돈다.
  const corners = [[-104, -176], [104, -176], [-104, 176], [104, 176]];
  const choose = (pick, direct = false) => {
    if (!deck.classList.contains("is-fan") || deck.classList.contains("is-picked")) return;
    deck.classList.add("is-picked");
    pick.classList.add("is-choice");
    let seat = 0;
    cards.forEach((card) => {
      if (card === pick) return;
      if (cards.length > 5) {
        // 원형 배치: 각자 바깥쪽으로 밀려난다
        const fx = parseFloat(card.style.getPropertyValue("--fan-x")) || 0;
        const fy = parseFloat(card.style.getPropertyValue("--fan-y")) || 0;
        card.style.setProperty("--sx", `${Math.round(fx * 2.4)}px`);
        card.style.setProperty("--sy", `${Math.round(fy * 2.4)}px`);
        return;
      }
      const [x, y] = corners[seat % corners.length];
      seat += 1;
      card.style.setProperty("--sx", `${x}px`);
      card.style.setProperty("--sy", `${y}px`);
    });
    if (hint) hint.textContent = "선택 완료";
    // 고른 포장은 가운데로 올라오며 한 바퀴 돈다(링·플래시 연출은 뺐다).
    later(() => {
      if (!stage.isConnected) return;
      if (direct) showSpread();
      else showPack();
    }, reduced ? 240 : 1100);
  };
  // 바로 오픈하기(5장): 한 장을 고르지 않고 부채꼴 포장 다섯 개가 각자 2-1-2 자리로 간다.
  // 자리에 서면 펼침 화면(cardSpread)이 같은 자리에서 포장을 터뜨리고 카드를 뒤집는다.
  const spreadFromDeck = () => {
    deck.classList.add("is-picked", "is-spread");
    // 이미 연 카드만큼은 포장이 필요 없다: 앞쪽 포장은 사라지고, 나머지가 남은 자리로 간다.
    const done = Math.min(state.revealIndex, count);
    cards.forEach((card, index) => {
      if (index < done) {
        card.classList.add("is-gone");
        return;
      }
      const spot = SPREAD_GRID[index];
      card.style.setProperty("--sx", `${spot.x}px`);
      card.style.setProperty("--sy", `${spot.y}px`);
    });
    stage.querySelector(".deck-opened")?.classList.add("is-gone");
    if (hint) hint.textContent = "포장을 열어요";
    later(() => {
      if (stage.isConnected) showSpread();
    }, reduced ? 240 : 650);
  };
  stage.addEventListener("click", (event) => {
    const again = event.target.closest("[data-deck-again]");
    if (again) {
      event.stopPropagation();
      if (!deck.classList.contains("is-fan") || deck.classList.contains("is-picked")) return;
      playShuffle();
      return;
    }
    // 바로 오픈하기: 무작위 한 장을 고른 뒤 찢기 없이 바로 공개한다.
    // 1장이면 결과로, 5장이면 2-1-2 펼침 화면(슬라이드 16)으로 간다.
    const direct = event.target.closest("[data-deck-direct]");
    if (direct) {
      event.stopPropagation();
      if (!deck.classList.contains("is-fan") || deck.classList.contains("is-picked")) return;
      if (multi && cards.length === SPREAD_GRID.length) {
        spreadFromDeck();
        return;
      }
      choose(cards[Math.floor(Math.random() * cards.length)], true);
      return;
    }
    if (event.target.closest("[data-open-skip]")) return;
    const pick = deckCardAt(deck, event.clientX, event.clientY);
    if (!pick || !deck.classList.contains("is-fan") || deck.classList.contains("is-picked")) return;
    event.stopPropagation();
    choose(pick);
  });
}

// 찢기 없이 공개: 1장은 결과, 여러 장은 2-1-2 펼침 화면.
function showSpread() {
  state.sheet = null;
  // 이미 찢어서 연 카드 수. 펼침 화면에서 그 카드들은 포장 없이 앞면으로 바로 선다.
  state.spreadDone = Math.min(state.revealIndex, state.reveal.length);
  state.revealIndex = 0;
  if (state.reveal.length < 2) {
    finishOpen();
    return;
  }
  state.openPhase = "spread";
  state.openCut = "idle";
  state.motionArmed = false;
  state.screen = "open";
  state.tab = "home";
  render();
}

function cardSpread() {
  const count = state.reveal.length;
  const done = state.spreadDone || 0;
  const cards = state.reveal.slice(0, SPREAD_GRID.length).map((card, index) => {
    const spot = SPREAD_GRID[index];
    const back = revealBackSrc(card);
    const opened = index < done;
    const backFace = back
      ? `<span class="spread-face back"><img src="${back}" alt="" draggable="false" /></span>`
      : `<span class="spread-face back spread-back-blank"></span>`;
    return `
      <div class="spread-card${opened ? " is-open" : ""}" style="--i:${index};--sx:${spot.x}px;--sy:${spot.y}px">
        ${opened ? "" : `<img class="spread-pack" src="${DECK_PACK}" alt="" draggable="false" />`}
        <div class="spread-spin">
          ${backFace}
          <span class="spread-face front"><img class="guard" data-protect="${photo(card.front)}" data-mark="${esc(card.id || "TOMATOK")}" alt="" draggable="false" /><span class="prism" aria-hidden="true"></span></span>
        </div>
        <small>${esc(card.no)}</small>
      </div>`;
  }).join("");
  return `
    ${openBar(`${count}장 뽑기`)}
    <div class="spread-stage" data-spread>
      <p class="deck-hint">뽑은 카드 ${count}장</p>
      <div class="spread">${cards}</div>
      <button class="primary open-ok spread-ok" type="button" data-open-ok>OK</button>
    </div>
  `;
}

function armSpread() {
  const stage = document.querySelector("[data-spread]");
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = "1";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    stage.classList.add("is-done");
    return;
  }
  // 2-1-2 자리의 포장이 터져 사라지고(0.5초) 뒷면이 남은 뒤 다섯 장이 한꺼번에 앞면으로 뒤집힌다
  requestAnimationFrame(() => stage.classList.add("is-live"));
  window.setTimeout(() => {
    if (stage.isConnected) stage.classList.add("is-done");
  }, SPREAD_POP_AT + SPREAD_FLIP_AT + 700 + 400);
}

function showPack() {
  const go = () => {
    state.sheet = null;
    state.openPhase = "pack";
    state.openCut = "idle";
    state.motionArmed = false;
    state.screen = "open";
    state.tab = "home";
    render();
  };
  const pack = new Image();
  pack.src = new URL(OPEN_BASE, document.baseURI).href;
  if (pack.complete && pack.naturalWidth) {
    go();
    return;
  }
  const ready = typeof pack.decode === "function" ? pack.decode() : new Promise((resolve, reject) => {
    pack.onload = resolve;
    pack.onerror = reject;
  });
  ready.then(go, go);
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
  state.menuGroups = { mypage: false, artist: false, support: false };
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
  state.exchanges = [];
  state.fills = [];
  localStorage.removeItem(WALLET_KEY);
  loadWallet();
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
    // 마이페이지 = 우측 상단 메뉴(슬라이드 19)
    state.menuOpen = true;
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
  if (state.menuOpen || state.screen === "wished") return "mypage";
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
  pay: `<h2>1장 결제</h2><p>같은 팩 1장을 TP로 결제해요. 잔액이 부족하면 안 돼요.</p>`,
  pay5: `<h2>5장 결제</h2><p>같은 팩 5장을 한 번에 결제해요. 재고가 5장 미만이면 막혀요.</p>`,
  result: `<h2>결과</h2><p>포장을 연 뒤에 카드 앞면이 나와요.</p>`,
  five: `<h2>5장 연속</h2><p>같은 팩 5장을 한 장씩 이어서 열어요.</p>`,
  mypage: `<h2>마이페이지</h2><p>우측 상단 메뉴예요. 보유 카드, 구매 내역, 찜 목록, 고객센터, 이벤트로 가요.</p>`,
  album: `<h2>보유 카드</h2><p>가진 카드예요. 같은 카드는 장수로 묶여요.</p>`,
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

function playFireworks(stage) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const video = stage.querySelector("[data-fireworks]");
  if (!video || stage.dataset.fire) return;
  stage.dataset.fire = "1";
  stage.classList.add("is-fire");
  video.loop = true;
  video.muted = true;
  const started = video.play();
  if (started && typeof started.catch === "function") started.catch(() => {});
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
    if (video.currentTime >= 4) {
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

function crackSparks(stage, burst) {
  const stack = stage.querySelector(".open-stack");
  if (!stack) return;
  const seams = [
    (t) => [0.514, 0.24 + t * 0.66],
    (t) => [0.16 + t * 0.7, 0.24],
    (t) => [0.1 + t * 0.82, 0.62],
  ];
  const count = burst ? 28 : 14;
  for (let index = 0; index < count; index += 1) {
    const [x, y] = seams[index % seams.length](Math.random());
    const spark = document.createElement("i");
    const angle = burst ? Math.random() * 360 : (Math.random() < 0.5 ? -1 : 1) * (68 + Math.random() * 36);
    spark.className = "tear-spark is-hot";
    spark.style.left = `${x * 100}%`;
    spark.style.top = `${y * 100}%`;
    spark.style.setProperty("--rot", `${angle}deg`);
    spark.style.setProperty("--dist", burst ? `${48 + Math.random() * 120}px` : `${5 + Math.random() * 14}px`);
    spark.style.setProperty("--len", `${8 + Math.random() * 14}px`);
    spark.style.animationDuration = burst ? `${0.16 + Math.random() * 0.18}s` : `${0.07 + Math.random() * 0.08}s`;
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
    stack.appendChild(spark);
  }
}

function rumblePieces(stage) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticks = 0;
  const timer = window.setInterval(() => {
    if (!stage.isConnected) {
      window.clearInterval(timer);
      return;
    }
    crackSparks(stage, false);
    ticks += 1;
    if (ticks < 11) return;
    window.clearInterval(timer);
    crackSparks(stage, true);
    window.setTimeout(() => {
      if (stage.isConnected) crackSparks(stage, true);
    }, 80);
  }, 50);
}

function armFloatCard(fly) {
  if (!fly || fly.dataset.float) return;
  fly.dataset.float = "1";
  let originX = 0;
  let originYaw = 22;
  let span = 196;
  let lastShine = 22;
  const shine = () => {
    const prism = fly.querySelector(".prism");
    if (!prism) return;
    prism.classList.remove("is-shine");
    void prism.offsetWidth;
    prism.classList.add("is-shine");
  };
  const turn = (clientX) => {
    const yaw = originYaw + ((clientX - originX) / span) * 360;
    fly.style.setProperty("--spin-y", `${yaw}deg`);
    if (Math.abs(yaw - lastShine) > 40) {
      shine();
      lastShine = yaw;
    }
  };
  fly.addEventListener("pointerdown", (event) => {
    if (!fly.classList.contains("is-front")) return;
    try { fly.setPointerCapture(event.pointerId); } catch (error) { /* 합성 이벤트 */ }
    const current = parseFloat(fly.style.getPropertyValue("--spin-y"));
    originYaw = Number.isFinite(current) ? current : 22;
    originX = event.clientX;
    span = fly.getBoundingClientRect().width || fly.offsetWidth || 196;
    fly.classList.add("is-float", "is-nudge", "is-spun");
    lastShine = originYaw;
    shine();
  });
  fly.addEventListener("pointermove", (event) => {
    if (!fly.classList.contains("is-nudge")) return;
    turn(event.clientX);
  });
  const release = () => fly.classList.remove("is-nudge");
  fly.addEventListener("pointerup", release);
  fly.addEventListener("pointercancel", release);
}

function launchCard(stage) {
  const stack = stage.querySelector(".open-stack");
  const fly = stage.querySelector(".fly-card");
  stack?.classList.add(TEAR_METHOD === 1 ? "is-shell" : "is-scatter");
  if (TEAR_METHOD !== 1) {
    stage.dataset.sparkStop = "1";
    stage.querySelectorAll(".tear-spark").forEach((spark) => spark.remove());
    rumblePieces(stage);
  }
  const scatter = Boolean(stack?.classList.contains("is-scatter"));
  let started = false;
  const beginVideo = () => {
    if (started) return;
    started = true;
    playBurst(stage, () => {
      if (!stage.isConnected) return;
      finishOpen();
    });
  };
  if (scatter) playFireworks(stage);
  else {
    window.setTimeout(() => {
      if (!started && stage.isConnected) beginVideo();
    }, 4200);
  }
  if (!fly || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    fly?.classList.add("is-front");
    if (scatter) {
      stage.classList.add("is-ready");
      if (fly) armFloatCard(fly);
    } else {
      window.setTimeout(() => {
        if (!stage.isConnected) return;
        finishOpen();
      }, 1000);
    }
    return;
  }
  fly.addEventListener("animationend", (event) => {
    if (event.animationName === "card-hang") fly.classList.add("is-float");
    if (event.animationName !== "card-rise" && event.animationName !== "card-from-pack") return;
    fly.classList.remove("is-rise");
    fly.classList.add("is-front");
    if (scatter) {
      armFloatCard(fly);
      stage.classList.add("is-ready");
    }
    else {
      window.setTimeout(() => {
        if (stage.isConnected) beginVideo();
      }, 1000);
    }
  });
  if (stack?.classList.contains("is-scatter")) {
    const stageBox = stage.getBoundingClientRect();
    const stackBox = stack.getBoundingClientRect();
    const cardH = fly.offsetHeight;
    const top = stackBox.top - stageBox.top + stackBox.height / 2 - cardH / 2;
    fly.style.setProperty("--back-top", `${top}px`);
  }
  fly.classList.add("is-rise");
}

function runOpenCut(stage, startFrame) {
  const last = stage.querySelectorAll(".open-over").length;
  const from = Math.max(0, Math.min(last, startFrame));
  if (from >= last) {
    keepTearSparks(stage);
    launchCard(stage);
    return;
  }
  const started = performance.now();
  let shown = from;
  keepTearSparks(stage);
  const frame = (now) => {
    if (!stage.isConnected) return;
    const cut = openEase(now - started, OPEN_CUT.cut[0], OPEN_CUT.cut[1]);
    const next = from + Math.round((last - from) * cut);
    showOpenFrame(stage, next);
    if (next > shown) {
      tearSparks(stage, next);
      shown = next;
    }
    if (cut < 1) {
      requestAnimationFrame(frame);
      return;
    }
    launchCard(stage);
  };
  requestAnimationFrame(frame);
}

const PACK_FACE = { left: 77 / 659, top: 63 / 1024, right: 579 / 659, bottom: 992 / 1024 };
const PACK_REACH = 0.5;
const TEAR_EDGE = 0.05;

function packBox(stage) {
  const stack = stage.querySelector(".open-stack");
  if (!stack) return null;
  const box = stack.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  return box;
}

function inPack(box, clientX, clientY, reach) {
  const x = (clientX - box.left) / box.width;
  const y = (clientY - box.top) / box.height;
  const padX = (PACK_FACE.right - PACK_FACE.left) * reach;
  const padY = (PACK_FACE.bottom - PACK_FACE.top) * reach;
  return x >= PACK_FACE.left - padX && x <= PACK_FACE.right + padX
    && y >= PACK_FACE.top - padY && y <= PACK_FACE.bottom + padY;
}

function tearBand() {
  const span = PACK_FACE.bottom - PACK_FACE.top;
  return {
    top: PACK_FACE.top + span * TEAR_EDGE,
    bottom: PACK_FACE.bottom - span * TEAR_EDGE,
  };
}

function inTearBand(box, clientY) {
  const y = (clientY - box.top) / box.height;
  const band = tearBand();
  return y >= band.top && y <= band.bottom;
}

function tearFromEdge(box, clientX, clientY, vertical) {
  const reach = 0.28;
  if (vertical) {
    const band = tearBand();
    const y = (clientY - box.top) / box.height;
    const edge = (band.bottom - band.top) * reach;
    return y <= band.top + edge || y >= band.bottom - edge;
  }
  const x = (clientX - box.left) / box.width;
  const face = PACK_FACE.right - PACK_FACE.left;
  const edge = face * reach;
  return x <= PACK_FACE.left + edge || x >= PACK_FACE.right - edge;
}

// 대각선 판정: 가로·세로 축에서 22.5° 넘게 벗어난 드래그
const TEAR_DIAG_MIN = 22.5;
function tearIsDiagonal(angle) {
  const off = Math.abs(angle) % 90;
  return Math.min(off, 90 - off) >= TEAR_DIAG_MIN;
}

// 손끝(origin)에서 각도 방향으로 포장 앞면 경계까지의 거리(px). 띠가 포장 밖으로 자라지 않게 한다.
function tearRayLimit(box, originX, originY, angle) {
  const rad = (angle * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  let limit = Infinity;
  if (Math.abs(ux) > 1e-6) {
    const edge = ux > 0 ? box.width * PACK_FACE.right : box.width * PACK_FACE.left;
    limit = Math.min(limit, (edge - originX) / ux);
  }
  if (Math.abs(uy) > 1e-6) {
    const edge = uy > 0 ? box.height * PACK_FACE.bottom : box.height * PACK_FACE.top;
    limit = Math.min(limit, (edge - originY) / uy);
  }
  return Number.isFinite(limit) ? Math.max(0, limit) : 0;
}

function placeTear(stage, clientX, clientY) {
  const stack = stage.querySelector(".open-stack");
  if (!stack) return;
  const box = stack.getBoundingClientRect();
  const anchor = 85 / 259;
  const band = tearBand();
  const mid = stage.classList.contains("is-mid");
  if (stage.classList.contains("is-diag")) {
    // 띠 길이는 가로 찢기와 같게(box.width) 두어 질감 배율을 맞추고, 길이는 --tear-span으로만 드러낸다.
    const angle = Number(stage.dataset.tearAngle) || 0;
    const originX = Math.max(box.width * PACK_FACE.left, Math.min(box.width * PACK_FACE.right, clientX - box.left));
    const originY = Math.max(box.height * band.top, Math.min(box.height * band.bottom, clientY - box.top));
    const thick = box.width * (259 / 985);
    stack.style.setProperty("--tear-origin-x", `${originX}px`);
    stack.style.setProperty("--tear-origin-y", `${originY}px`);
    stack.style.setProperty("--tear-top", `${originY - anchor * thick}px`);
    stack.style.setProperty("--tear-long", `${box.width}px`);
    stack.style.setProperty("--tear-thick", `${thick}px`);
    stack.style.setProperty("--tear-angle", `${angle}deg`);
    // 왼쪽으로 찢을 때는 띠를 세로로 뒤집어 질감의 위쪽이 계속 위를 보게 한다(가로의 scaleX(-1)에 해당)
    stack.style.setProperty("--tear-flip", Math.abs(angle) > 90 ? "-1" : "1");
    stack.style.setProperty("--tear-span", "0px");
    stage.dataset.tearY = String(originY / box.height);
    return;
  }
  if (stage.classList.contains("is-vert")) {
    const span = PACK_FACE.right - PACK_FACE.left;
    const minX = box.width * (PACK_FACE.left + span * TEAR_EDGE);
    const maxX = box.width * (PACK_FACE.right - span * TEAR_EDGE);
    const x = Math.max(minX, Math.min(maxX, clientX - box.left));
    const long = box.height;
    const thick = long * (259 / 985);
    stack.style.setProperty("--tear-left", `${x}px`);
    stack.style.setProperty("--tear-long", `${long}px`);
    stack.style.setProperty("--tear-thick", `${thick}px`);
    if (!mid) {
      const top = stage.classList.contains("is-up") ? box.height - anchor * thick : -anchor * thick;
      stack.style.setProperty("--tear-top", `${top}px`);
      stage.dataset.tearY = String((clientY - box.top) / box.height);
      return;
    }
    const minY = box.height * band.top;
    const maxY = box.height * band.bottom;
    const originY = Math.max(minY, Math.min(maxY, clientY - box.top));
    stack.style.setProperty("--tear-top", `${originY - anchor * thick}px`);
    stack.style.setProperty("--tear-origin-y", `${originY}px`);
    stack.style.setProperty("--tear-span", "0px");
    stage.dataset.tearY = String(originY / box.height);
    return;
  }
  const stripH = box.width * (259 / 985);
  const minY = box.height * band.top;
  const maxY = box.height * band.bottom;
  const local = Math.max(minY, Math.min(maxY, clientY - box.top));
  stack.style.setProperty("--tear-top", `${local - stripH * anchor}px`);
  stage.dataset.tearY = String(local / box.height);
  if (!mid) return;
  const originX = Math.max(box.width * PACK_FACE.left, Math.min(box.width * PACK_FACE.right, clientX - box.left));
  stack.style.setProperty("--tear-origin-x", `${originX}px`);
  stack.style.setProperty("--tear-span", "0px");
}

function growTear(stage, clientX, clientY) {
  const stack = stage.querySelector(".open-stack");
  if (!stack) return;
  const box = stack.getBoundingClientRect();
  if (!box.width || !box.height) return;
  let span = parseFloat(stack.style.getPropertyValue("--tear-span")) || 0;
  if (stage.classList.contains("is-diag")) {
    const originX = parseFloat(stack.style.getPropertyValue("--tear-origin-x")) || 0;
    const originY = parseFloat(stack.style.getPropertyValue("--tear-origin-y")) || 0;
    const angle = Number(stage.dataset.tearAngle) || 0;
    const rad = (angle * Math.PI) / 180;
    const travel = (clientX - box.left - originX) * Math.cos(rad) + (clientY - box.top - originY) * Math.sin(rad);
    const limit = tearRayLimit(box, originX, originY, angle);
    span = Math.max(span, Math.min(limit, Math.max(0, travel)));
    stack.style.setProperty("--tear-span", `${span}px`);
    return;
  }
  if (stage.classList.contains("is-vert")) {
    const originY = parseFloat(stack.style.getPropertyValue("--tear-origin-y")) || 0;
    const y = clientY - box.top;
    const up = stage.classList.contains("is-up");
    const band = tearBand();
    const travel = up ? originY - y : y - originY;
    const limit = up ? originY - box.height * band.top : box.height * band.bottom - originY;
    span = Math.max(span, Math.min(Math.max(0, limit), Math.max(0, travel)));
  } else {
    const originX = parseFloat(stack.style.getPropertyValue("--tear-origin-x")) || 0;
    const x = clientX - box.left;
    const faceMin = box.width * PACK_FACE.left;
    const faceMax = box.width * PACK_FACE.right;
    const rtl = stage.classList.contains("is-rtl");
    const travel = rtl ? originX - x : x - originX;
    const limit = rtl ? originX - faceMin : faceMax - originX;
    span = Math.max(span, Math.min(Math.max(0, limit), Math.max(0, travel)));
  }
  stack.style.setProperty("--tear-span", `${span}px`);
}

let openCutListen = null;

function armOpenCut() {
  const stage = document.querySelector("[data-open-stage]");
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = "1";
  openCutListen?.abort();
  openCutListen = new AbortController();
  const signal = openCutListen.signal;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let pending = false;
  const beginTear = (event, box) => {
    pending = false;
    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
    if (TEAR_METHOD === 2) {
      stage.classList.remove("is-rtl", "is-vert", "is-up", "is-mid", "is-diag");
      delete stage.dataset.tearAxis;
      placeTear(stage, event.clientX, event.clientY);
    } else {
      stage.classList.toggle("is-rtl", event.clientX >= box.left + box.width / 2);
      delete stage.dataset.tearY;
    }
    const origin = packBox(stage);
    if (origin) {
      stage.dataset.fingerX = String((event.clientX - origin.left) / origin.width);
      stage.dataset.fingerY = String((event.clientY - origin.top) / origin.height);
    }
    stage.classList.add("is-touching");
    keepTearSparks(stage);
  };
  const listen = (type, handler) => document.addEventListener(type, handler, { signal });
  listen("pointerdown", (event) => {
    if (!stage.isConnected || state.openCut !== "idle") return;
    // 헤더(←)처럼 무대 밖에서 시작한 터치는 잡지 않는다. 포인터를 잡으면 버튼 클릭이 사라진다.
    if (!stage.contains(event.target)) return;
    const box = packBox(stage);
    if (!box) return;
    if (TEAR_METHOD === 1) {
      beginTear(event, box);
      return;
    }
    try { stage.setPointerCapture(event.pointerId); } catch (error) { /* 합성 이벤트 */ }
    if (inPack(box, event.clientX, event.clientY, PACK_REACH) && inTearBand(box, event.clientY)) {
      beginTear(event, box);
      return;
    }
    pending = true;
  });
  listen("pointermove", (event) => {
    if (pending && !tracking && state.openCut === "idle") {
      const box = packBox(stage);
      if (box && inPack(box, event.clientX, event.clientY, 0) && inTearBand(box, event.clientY)) beginTear(event, box);
    }
    if (!tracking || state.openCut !== "idle") return;
    const box = packBox(stage);
    if (box) {
      stage.dataset.fingerX = String((event.clientX - box.left) / box.width);
      stage.dataset.fingerY = String((event.clientY - box.top) / box.height);
    }
    if (TEAR_METHOD === 2) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!stage.dataset.tearAxis && dragSpan(dx, dy) >= 10) {
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const diagonal = tearIsDiagonal(angle);
        const vertical = !diagonal && Math.abs(dy) > Math.abs(dx);
        const fromEdge = !diagonal && box ? tearFromEdge(box, startX, startY, vertical) : false;
        stage.dataset.tearAxis = diagonal ? "d" : vertical ? "v" : "h";
        stage.dataset.tearAngle = String(angle);
        stage.classList.toggle("is-diag", diagonal);
        stage.classList.toggle("is-vert", vertical);
        stage.classList.toggle("is-up", vertical && dy < 0);
        // 대각선은 항상 손끝에서 시작해 드래그 방향으로 자란다
        stage.classList.toggle("is-mid", diagonal || !fromEdge);
        stage.classList.toggle("is-rtl", !diagonal && !vertical && (fromEdge ? startX >= box.left + box.width / 2 : dx < 0));
        placeTear(stage, startX, startY);
      }
      if (stage.dataset.tearAxis && stage.classList.contains("is-mid")) growTear(stage, event.clientX, event.clientY);
    }
    const frame = TEAR_METHOD === 2 && !stage.dataset.tearAxis
      ? 0
      : dragFrame(stage, dragSpan(event.clientX - startX, event.clientY - startY));
    showOpenFrame(stage, frame);
  });
  listen("pointerup", (event) => {
    if (pending && !tracking) pending = false;
    if (!tracking || state.openCut !== "idle") return;
    tracking = false;
    stage.classList.remove("is-touching");
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const span = dragSpan(dx, dy);
    if (span < OPEN_CUT.minDistance) {
      showOpenFrame(stage, 0);
      stage.classList.remove("is-rtl", "is-vert", "is-up", "is-mid", "is-diag");
      delete stage.dataset.tearAxis;
      stage.querySelectorAll(".tear-spark").forEach((spark) => spark.remove());
      return;
    }
    const shown = dragFrame(stage, span);
    state.openCut = "cutting";
    stage.classList.add("is-opening");
    openHaptic("light");
    runOpenCut(stage, shown);
  });
  listen("pointercancel", () => {
    pending = false;
    tracking = false;
    stage.classList.remove("is-touching");
    if (state.openCut === "idle") {
      showOpenFrame(stage, 0);
      stage.classList.remove("is-rtl", "is-vert", "is-up", "is-mid", "is-diag");
      delete stage.dataset.tearAxis;
    }
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
          <summary>${title}<span class="guide-icon" aria-hidden="true"><span class="plus">${icon("plus")}</span><span class="minus">${icon("minus")}</span></span></summary>
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
  // 기본 중간 배너는 홈의 이용 방법 안내 배너(guideBanner)가 대신한다.
  return [];
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

let toastTimer = 0;

function toast(message) {
  state.toast = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 1600);
}

// ---- 포인트 교환 (슬라이드 19~21, mock) ----
// 교환은 토마톡 지갑에서 하기로 결정돼(2026-10-23) 앱 안에는 진입점이 없다. 화면 코드는 참고용으로 남긴다.

function pad2(value) {
  return String(value).padStart(2, "0");
}

function clockText(date = new Date()) {
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function exchangeWhen(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getFullYear()).slice(2)}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function tottText(amount) {
  const value = Number(amount) || 0;
  return Number.isInteger(value) ? value.toLocaleString("ko-KR") : value.toLocaleString("ko-KR", { maximumFractionDigits: 6 });
}

function tpText(amount) {
  return Math.round(Number(amount) || 0).toLocaleString("ko-KR");
}

// 1 TOTT = tottKrw 원 = tottKrw TP (TP는 원화 1:1)
function tpPerTott() {
  const value = Number(rates().tottKrw);
  return value > 0 ? value : 1;
}

function tottToTp(tott) {
  return Math.round((Number(tott) || 0) * tpPerTott());
}

function tpToTott(tp) {
  return (Number(tp) || 0) / tpPerTott();
}

function usdText(krw) {
  const { usdKrw } = rates();
  return `$${((Number(krw) || 0) / usdKrw).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function wonText(krw) {
  return `₩${Math.round(Number(krw) || 0).toLocaleString("ko-KR")}`;
}

// ---- 토마톡 지갑 mock 화면 (디자인 2025-08: 지갑 · 지갑 관리 · 거래 내역) ----

const WALLET_SVG = {
  ghost: `<svg viewBox="0 0 21 21" fill="none" aria-hidden="true"><path d="M9.17939e-07 10.5C4.10975e-07 16.299 4.70101 21 10.5 21C16.299 21 21 16.299 21 10.5C21 4.70101 16.299 1.4249e-06 10.5 9.1794e-07C4.70101 4.10976e-07 1.4249e-06 4.70101 9.17939e-07 10.5Z" fill="#9083D8"/><path d="M17.6883 7.03317C17.6883 7.03317 16.7724 2.9647 11.2812 4.89812C11.2812 4.89812 5.89179 6.52626 3.44958 13.1368C3.13111 13.9999 2.83902 16.1877 4.26365 16.5947C5.68827 17.0018 7.86855 15.9314 8.91252 13.8736C8.91252 13.8736 8.63551 15.7825 9.95837 15.8843C11.2812 15.9861 12.5909 15.0175 13.2071 13.8736C13.2071 13.8736 13.111 15.4773 14.6374 14.9685C16.1638 14.4597 18.5023 11.7141 17.6883 7.03505V7.03317ZM12.6022 9.67701C12.0972 9.67701 11.6864 9.22098 11.6864 8.65943C11.6864 8.09787 12.0953 7.64184 12.6022 7.64184C13.1091 7.64184 13.518 8.09787 13.518 8.65943C13.518 9.22098 13.1091 9.67701 12.6022 9.67701ZM15.1443 9.67701C14.6393 9.67701 14.2285 9.22098 14.2285 8.65943C14.2285 8.09787 14.6374 7.64184 15.1443 7.64184C15.6512 7.64184 16.0601 8.09787 16.0601 8.65943C16.0601 9.22098 15.6512 9.67701 15.1443 9.67701Z" fill="white"/></svg>`,
  // 지갑 카드 하단 4개 액션 아이콘: 디자인 프레임(Frame 2087324830.svg)에서 아이콘 부분만 잘라 썼다.
  actSend: `<svg class="ico" viewBox="14.5 3 28 28" fill="currentColor" aria-hidden="true"><path d="M28.9783 8.65021C28.6528 8.31608 28.0659 8.31608 27.7404 8.65021L25.1156 11.2352C24.774 11.5716 24.774 12.1179 25.1156 12.4543C25.4571 12.7907 26.0119 12.7907 26.3535 12.4543L27.4837 11.339L27.4837 18.7372C27.4837 19.2136 27.8757 19.5996 28.3594 19.5996C28.8431 19.5996 29.2351 19.2136 29.2351 18.7372L29.2351 11.339L30.3653 12.4543C30.7068 12.7907 31.2616 12.7907 31.6032 12.4543C31.9448 12.1179 31.9448 11.5716 31.6032 11.2352L28.9783 8.65021Z"/><path d="M39.6772 14C40.1521 14 40.5403 14.3863 40.5067 14.8601C40.0642 21.0988 34.8465 26.04 28.4971 26.04C21.9623 26.04 16.6262 20.8062 16.4609 14.3105C16.4588 14.1397 16.5967 14 16.7676 14H17.3224C17.7943 14 18.1731 14.3838 18.2119 14.8541C18.6484 20.1469 23.0933 24.3183 28.4971 24.3184C33.899 24.3184 38.3428 20.1497 38.7818 14.8595C38.821 14.3862 39.2023 14 39.6772 14Z"/></svg>`,
  actReceive: `<svg class="ico" viewBox="85 3 28 28" fill="currentColor" aria-hidden="true"><path d="M98.4064 19.3498C98.7189 19.6839 99.2823 19.6839 99.5948 19.3498L102.115 16.7648C102.443 16.4284 102.443 15.8821 102.115 15.5457C101.787 15.2093 101.254 15.2093 100.926 15.5457L99.8413 16.661V9.2628C99.8413 8.78644 99.465 8.40039 99.0006 8.40039C98.5363 8.40039 98.1599 8.78644 98.1599 9.2628V16.661L97.075 15.5457C96.7471 15.2093 96.2145 15.2093 95.8866 15.5457C95.5586 15.8821 95.5586 16.4284 95.8866 16.7648L98.4064 19.3498Z"/><path d="M110.219 13.5C110.694 13.5 111.082 13.8863 111.049 14.3601C110.606 20.5984 105.388 25.539 99.0391 25.5391C92.69 25.5391 87.4725 20.5984 87.0295 14.3601C86.9959 13.8863 87.3841 13.5 87.8591 13.5C88.3339 13.5 88.7151 13.8862 88.7544 14.3594C89.1939 19.6492 93.6374 23.8174 99.0391 23.8174C104.441 23.8173 108.884 19.6492 109.324 14.3594C109.363 13.8862 109.744 13.5 110.219 13.5Z"/></svg>`,
  actFill: `<svg class="ico" viewBox="154 0 28 28" fill="currentColor" aria-hidden="true"><path d="M178.68 17.9364C178.647 17.605 178.555 17.2808 178.409 16.9728C178.27 16.6815 178.081 16.4031 177.847 16.1452C177.41 15.6642 176.823 15.2577 176.104 14.937C174.919 14.4085 173.457 14.1527 171.917 14.1964C171.904 14.1387 171.89 14.0809 171.874 14.023C171.854 13.9525 171.832 13.8821 171.808 13.8116C173.231 13.4459 174.506 12.8363 175.468 12.0509C176.078 11.5539 176.536 11.0087 176.83 10.4306C176.988 10.1207 177.097 9.80272 177.154 9.48552C177.214 9.15005 176.728 5.91013 176.672 5.58163C176.617 5.25312 176.505 4.93562 176.338 4.63791C176.18 4.35635 175.973 4.09084 175.722 3.84885C175.254 3.39749 174.642 3.03021 173.903 2.75713C172.46 2.2241 170.655 2.09831 168.821 2.40309C166.986 2.70787 165.321 3.41031 164.131 4.38098C163.521 4.87798 163.063 5.42313 162.769 6.00119C162.647 6.23995 162.555 6.48355 162.493 6.72786C162.466 6.82366 162.444 6.91967 162.427 7.01558C162.367 7.35105 162.364 7.68763 162.42 8.01613C162.445 8.16706 162.483 8.31566 162.532 8.46104C162.539 8.49698 162.546 8.53433 162.553 8.57289C162.227 8.58339 161.909 8.61257 161.602 8.66093C160.824 8.78379 160.151 9.02396 159.602 9.37477C159.376 9.51974 159.172 9.68339 158.994 9.86309C158.923 9.93234 158.855 10.0041 158.791 10.0783C158.568 10.3376 158.395 10.6268 158.275 10.9379C158.221 11.0809 158.178 11.228 158.146 11.3782C157.795 12.3435 157.085 14.3492 157.079 14.6202C157.072 14.9424 157.115 15.2754 157.209 15.6102C157.382 16.2346 157.723 16.8588 158.222 17.4654C159.196 18.6501 160.689 19.6651 162.427 20.3234C163.118 20.5852 163.818 20.7792 164.506 20.903C164.637 21.9167 164.802 23.0809 164.887 23.2591C165.026 23.5503 165.215 23.8288 165.449 24.0867C165.886 24.5676 166.472 24.9742 167.192 25.2948C168.596 25.9211 170.389 26.1645 172.24 25.9802C174.091 25.7959 175.799 25.2038 177.051 24.3129C177.692 23.8568 178.185 23.3428 178.517 22.7852C178.695 22.4863 178.825 22.176 178.903 21.8632C178.985 21.5324 178.714 18.2676 178.68 17.9363L178.68 17.9364ZM175.662 8.55048C175.642 9.45311 175.384 10.3584 174.566 10.9587C173.654 11.6274 172.477 12.2069 171.13 12.5186C171.046 12.4011 170.956 12.2842 170.86 12.1679C170.596 11.8457 170.292 11.5362 169.956 11.2429C170.061 11.2283 170.166 11.2123 170.271 11.1949C172.106 10.8901 173.771 10.1877 174.961 9.21698C175.223 9.00336 175.457 8.78076 175.662 8.55058V8.55048ZM163.868 7.0811C164.061 6.41399 164.629 5.85763 165.015 5.54256C166.016 4.72634 167.444 4.13112 169.037 3.86652C170.63 3.60192 172.176 3.70297 173.389 4.15131C174.014 4.38229 175.088 4.91462 175.251 5.88429C175.414 6.85405 174.574 7.70429 174.058 8.12476C173.058 8.94097 171.629 9.5362 170.037 9.8008C169.358 9.91356 168.688 9.9597 168.049 9.94102C167.607 9.7055 167.141 9.4937 166.655 9.30976C165.874 9.01396 165.082 8.80458 164.308 8.68546C164.118 8.49051 163.962 8.26246 163.876 7.99766C163.866 7.89155 163.855 7.79615 163.841 7.71367C163.805 7.49551 163.819 7.28351 163.868 7.081V7.0811ZM164.455 18.1537C164.422 18.2476 164.394 18.342 164.37 18.4366C164.291 18.7577 164.265 19.0835 164.294 19.4055C163.844 19.3076 163.388 19.175 162.934 19.003C161.425 18.4314 160.14 17.5705 159.324 16.5718C158.612 15.6992 158.512 14.7832 158.657 13.9502C158.816 14.2245 159.006 14.4968 159.227 14.7657C160.2 15.9504 161.694 16.9654 163.432 17.6237C163.792 17.7603 164.155 17.8784 164.518 17.9779C164.495 18.0363 164.474 18.0951 164.455 18.1539L164.455 18.1537ZM165.323 16.723C164.864 16.6181 164.4 16.4777 163.939 16.3029C162.43 15.7313 161.148 14.868 160.329 13.8718C159.939 13.3977 159.351 12.51 159.541 11.6534C159.587 11.557 159.626 11.4692 159.656 11.391C159.735 11.1844 159.856 11.0086 160.001 10.8588C160.507 10.3798 161.281 10.1853 161.774 10.1074C162.113 10.054 162.469 10.0291 162.838 10.0318C163.864 10.0394 164.988 10.2606 166.097 10.681C166.587 10.8667 167.053 11.0831 167.487 11.3248C168.231 11.7391 168.881 12.2278 169.396 12.7635C169.506 12.8777 169.61 12.994 169.707 13.1122C169.905 13.3528 170.153 13.6998 170.326 14.0954C170.36 14.1727 170.39 14.2519 170.417 14.3324C168.814 14.5777 167.351 15.1317 166.245 15.919C165.892 16.1703 165.584 16.4391 165.323 16.7231L165.323 16.723ZM165.751 19.5112C165.749 19.4047 165.744 19.3087 165.736 19.2256C165.713 19.0055 165.742 18.7949 165.805 18.596C165.845 18.4844 165.896 18.3768 165.955 18.2736C166.242 17.7726 166.714 17.3755 167.051 17.1357C167.14 17.0727 167.231 17.0114 167.326 16.952C168.136 16.4406 169.15 16.0635 170.266 15.8554C170.563 15.8002 170.866 15.7568 171.175 15.726C171.423 15.7013 171.669 15.6853 171.913 15.6776C173.247 15.636 174.5 15.8491 175.499 16.2944C176.107 16.5657 177.143 17.1669 177.242 18.1453C177.341 19.1236 176.446 19.9171 175.903 20.303C174.851 21.0521 173.386 21.5528 171.779 21.7128C170.173 21.8728 168.637 21.6709 167.456 21.1443C167.372 21.1068 167.279 21.0629 167.183 21.0127C166.658 20.7404 165.999 20.279 165.78 19.6089C165.769 19.5768 165.76 19.5443 165.751 19.5112H165.751ZM176.222 23.1641C175.132 23.8581 173.705 24.4138 172.098 24.5738C170.491 24.7338 168.954 24.5357 167.774 24.0053C166.744 23.5421 166.242 22.767 165.996 21.9577C166.262 22.1325 166.554 22.2915 166.873 22.4337C168.278 23.06 170.07 23.3034 171.921 23.1191C173.772 22.9347 175.48 22.3426 176.732 21.4518C177.007 21.2557 177.256 21.0489 177.475 20.8325C177.395 21.7318 177.078 22.6184 176.222 23.164L176.222 23.1641Z"/></svg>`,
  actHistory: `<svg class="ico" viewBox="231.5 -1 28 28" fill="currentColor" aria-hidden="true"><path d="M240.416 9.81625C240.917 9.81625 241.324 9.40967 241.324 8.90812C241.324 8.40658 240.917 8 240.416 8C239.914 8 239.508 8.40658 239.508 8.90812C239.508 9.40967 239.914 9.81625 240.416 9.81625Z"/><path d="M240.416 13.8162C240.917 13.8162 241.324 13.4097 241.324 12.9081C241.324 12.4066 240.917 12 240.416 12C239.914 12 239.508 12.4066 239.508 12.9081C239.508 13.4097 239.914 13.8162 240.416 13.8162Z"/><path d="M240.416 17.8162C240.917 17.8162 241.324 17.4097 241.324 16.9081C241.324 16.4066 240.917 16 240.416 16C239.914 16 239.508 16.4066 239.508 16.9081C239.508 17.4097 239.914 17.8162 240.416 17.8162Z"/><path d="M251.018 8H243.332C242.872 8 242.5 8.38035 242.5 8.84954V8.85046C242.5 9.31965 242.872 9.7 243.332 9.7H251.018C251.478 9.7 251.85 9.31965 251.85 8.85046V8.84954C251.85 8.38035 251.478 8 251.018 8Z"/><path d="M251.018 12H243.332C242.872 12 242.5 12.3804 242.5 12.8495V12.8505C242.5 13.3196 242.872 13.7 243.332 13.7H251.018C251.478 13.7 251.85 13.3196 251.85 12.8505V12.8495C251.85 12.3804 251.478 12 251.018 12Z"/><path d="M251.018 16H243.332C242.872 16 242.5 16.3804 242.5 16.8495V16.8505C242.5 17.3196 242.872 17.7 243.332 17.7H251.018C251.478 17.7 251.85 17.3196 251.85 16.8505V16.8495C251.85 16.3804 251.478 16 251.018 16Z"/><path d="M253.5 5.44629C253.5 4.37482 252.626 3.5 251.54 3.5H238.96C237.874 3.5 237 4.37482 237 5.44629V21.7197L240.728 20.5166L243.861 21.8691L245.343 20.5186L247.757 21.8613L250.203 20.0967L253.5 21.5869V5.44629ZM255 23.9121L250.377 21.8213L248.249 23.3584L247.861 23.6377L245.556 22.3535L244.157 23.6309L243.713 23.4385L240.651 22.1172L235.5 23.7803V5.44629C235.5 3.53937 237.053 2 238.96 2H251.54C253.447 2 255 3.53937 255 5.44629V23.9121Z"/></svg>`,
  starFill: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 17.8l-5.9 3.1 1.2-6.6L2.5 9.7l6.6-.9z" fill="#f5b400"/></svg>`,
  // 지갑 설정 시트 아이콘: Phosphor Icons Regular(star · pencil-simple · link-break · arrows-clockwise)
  star: `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z"/></svg>`,
  pencil: `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/></svg>`,
  link: `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"/></svg>`,
  unlink: `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M198.63,57.37a32,32,0,0,0-45.19-.06L141.79,69.52a8,8,0,0,1-11.58-11l11.72-12.29a1.59,1.59,0,0,1,.13-.13,48,48,0,0,1,67.88,67.88,1.59,1.59,0,0,1-.13.13l-12.29,11.72a8,8,0,0,1-11-11.58l12.21-11.65A32,32,0,0,0,198.63,57.37ZM114.21,186.48l-11.65,12.21a32,32,0,0,1-45.25-45.25l12.21-11.65a8,8,0,0,0-11-11.58L46.19,141.93a1.59,1.59,0,0,0-.13.13,48,48,0,0,0,67.88,67.88,1.59,1.59,0,0,0,.13-.13l11.72-12.29a8,8,0,1,0-11.58-11ZM216,152H192a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16ZM40,104H64a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm120,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V192A8,8,0,0,0,160,184ZM96,72a8,8,0,0,0,8-8V40a8,8,0,0,0-16,0V64A8,8,0,0,0,96,72Z"/></svg>`,
  more: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5.5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="18.5" r="1.7"/></svg>`,
  drag: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>`,
  down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
  next: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>`,
  avatar: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#8b7cf6"/><ellipse cx="12" cy="9" rx="6.5" ry="2.4" fill="#fff"/><path d="M5.5 9v3.2c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4V9" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M5.5 12.2v3.2c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4v-3.2" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="19" cy="5" r="3.2" fill="#2fb36a" stroke="#fff" stroke-width="1.2"/></svg>`,
  tott: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8.5" fill="#e3243b"/><path d="M12 4.5c-1 0-2.2.8-2.6 1.8M12 4.5c1.2-1 2.6-1.3 3.6-.9" fill="none" stroke="#2fb36a" stroke-width="1.6" stroke-linecap="round"/><text x="12" y="16.5" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" font-family="inherit">TOTT</text></svg>`,
  sol: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#9945ff"/><path d="M7 8.5h8.5l1.8-1.8H8.8zM7 12.9h8.5l1.8-1.8H8.8zM7 17.3h8.5l1.8-1.8H8.8z" fill="#fff"/></svg>`,
};

const LEDGER_BADGE = { 검증완료: "verified", 진행중: "pending", 만료: "expired", 실패: "failed", 성공: "ok", 완료: "done" };

// 지갑별 거래 내역: 그 지갑의 교환, 포토카드 결제(TP 사용·대표 지갑에만), mock 보내기·받기
function walletLedger(walletId = currentWallet().id) {
  const w = walletById(walletId);
  if (!w) return [];
  const rows = [];
  state.exchanges
    .filter((entry) => (entry.wallet || WALLET_SEED[0].id) === walletId)
    .forEach((entry) => rows.push({ kind: "exchange", at: entry.at, label: "교환", tott: -entry.tott, tp: entry.tp, status: "완료" }));
  state.fills
    .filter((entry) => entry.wallet === walletId)
    .forEach((entry) => rows.push({ kind: "fill", at: entry.at, label: "채우기", sol: -entry.sol, tott: entry.tott, status: "완료" }));
  if (w.main) {
    readOrderStore().filter((order) => order.kind === "purchase").forEach((order) => {
      const price = Number(order.price);
      if (!Number.isFinite(price)) return;
      const at = /^\d{4}-\d{2}-\d{2}T/.test(String(order.purchasedOn)) ? order.purchasedOn : `${String(order.purchasedOn || "").slice(0, 10)}T12:00:00`;
      rows.push({ kind: "use", at, label: "포토카드 구매", tp: -price, status: "완료" });
    });
  }
  const today = new Date().getDate();
  (WALLET_MOCK_ROWS[walletId] || []).forEach((mock) => {
    rows.push({
      kind: mock.kind,
      at: `${isoDate(Math.min(mock.days, today - 1))}T14:00:00`,
      label: mock.kind === "receive" ? "받기" : "보내기",
      tott: mock.tott,
      status: mock.status,
    });
  });
  return rows.sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

function ledgerRow(row) {
  const glyph = row.kind === "exchange" ? "swap" : row.kind === "use" || row.kind === "fill" ? "coins" : row.kind === "receive" ? "arrowDown" : "arrowUp";
  // 교환·채우기처럼 한 건에 두 통화가 걸리면 오른쪽에는 받은 쪽만 크게 쓰고, 쓴 쪽은 왼쪽 날짜 옆에 작게 적는다(세 줄 방지)
  const amount = (value, unitHtml, text) => `<strong class="${value < 0 ? "minus" : "plus"}">${value < 0 ? "- " : "+ "}${text(Math.abs(value))} ${unitHtml}</strong>`;
  const units = {
    sol: [`<small>SOL</small>`, solText, "SOL"],
    tott: [`<small>TOTT</small>`, tottText, "TOTT"],
    tp: [`<span class="coin-mark tp" aria-hidden="true">TP</span>`, tpText, "TP"],
  };
  const moves = ["sol", "tott", "tp"].filter((key) => row[key]);
  const gained = moves.filter((key) => row[key] > 0);
  const spent = moves.filter((key) => row[key] < 0);
  const main = gained.length && spent.length ? gained : moves;
  const amounts = main.map((key) => amount(row[key], units[key][0], units[key][1]));
  const spentNote = gained.length && spent.length
    ? ` · ${spent.map((key) => `${units[key][1](Math.abs(row[key]))} ${units[key][2]} 사용`).join(", ")}`
    : "";
  return `
    <article class="ledger-row">
      <span class="ledger-icon" aria-hidden="true">${icon(glyph)}</span>
      <span class="ledger-body">
        <strong>${esc(row.label)}</strong>
        <small>${esc(exchangeWhen(row.at))}${esc(spentNote)}</small>
      </span>
      <span class="ledger-amount">
        ${amounts.join("")}
        <em class="ledger-badge ${LEDGER_BADGE[row.status] || "done"}">${esc(row.status)}</em>
      </span>
    </article>`;
}

function walletBack() {
  return state.walletReturn ? "wallet-return" : "home";
}

function currencyToggle(dark = false) {
  const usd = state.walletCurrency === "USD";
  return `
    <span class="wallet-toggle${dark ? " dark" : ""}" role="group" aria-label="통화">
      <button type="button" data-wallet-currency="USD" class="${usd ? "on" : ""}">USD</button>
      <button type="button" data-wallet-currency="KRW" class="${usd ? "" : "on"}">KRW</button>
    </span>`;
}

function approxText(tott) {
  const krw = (Number(tott) || 0) * tpPerTott();
  return state.walletCurrency === "USD" ? usdText(krw) : wonText(krw);
}

// 지갑 카드 한 장. 지갑이 여러 개면 옆으로 넘긴다.
function walletCard(w) {
  return `
    <article class="wallet-card" data-wallet-card="${esc(w.id)}">
      <div class="wallet-addr">
        ${w.main ? `<span class="wallet-star" aria-label="대표 지갑">${WALLET_SVG.starFill}</span>` : ""}
        <span class="wallet-logo" aria-hidden="true">${WALLET_SVG.ghost}</span>
        <span class="wallet-short">${esc(shortAddr(w.full))}</span>
        <button type="button" data-wallet-copy="${esc(w.full)}" aria-label="주소 복사">${icon("copy")}</button>
        <button type="button" data-soon="QR" aria-label="QR">${icon("qr")}</button>
        <button type="button" data-soon="익스플로러" aria-label="익스플로러에서 보기">${icon("external")}</button>
      </div>
      <div class="wallet-sum">
        <p class="wallet-coin">토마톡(TOTT)</p>
        <strong class="wallet-amount">${tottText(w.balance)}</strong>
        <div class="wallet-approx">
          <span>≈ ${approxText(w.balance)} ${icon("info")}</span>
          ${currencyToggle()}
        </div>
      </div>
      <div class="wallet-tp">
        <span class="wallet-tp-body"><small>TP 포인트</small><strong>${tpText(state.tp)} <span class="coin-mark tp" aria-hidden="true">TP</span></strong></span>
        <button type="button" class="wallet-exchange" data-nav="exchange-form">교환하기 ${icon("caretRight")}</button>
      </div>
      <div class="wallet-actions">
        <button type="button" data-soon="보내기">${WALLET_SVG.actSend}<span>보내기</span></button>
        <button type="button" data-nav="receive">${WALLET_SVG.actReceive}<span>받기</span></button>
        <button type="button" data-nav="fill">${WALLET_SVG.actFill}<span>채우기</span></button>
        <button type="button" data-nav="exchange-history">${WALLET_SVG.actHistory}<span>거래보기</span></button>
      </div>
    </article>`;
}

// 토마톡 지갑 mock. 디자인의 지갑 화면 구성(지갑 슬라이드 · 보유 NFT · 최근 거래내역 · 토큰 정보)에 TP 줄과 [교환하기]를 더했다.
function wallet() {
  const list = activeWallets();
  const w = currentWallet();
  const index = Math.max(0, list.findIndex((item) => item.id === w.id));
  const ledger = walletLedger(w.id).slice(0, 5);
  const price = rates();
  const tottUsdt = (price.tottKrw / price.usdKrw).toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  const link = state.walletReturn
    ? `<div class="buy light-buy"><button class="primary" type="button" data-wallet-link>이 지갑 연결하고 결제로 돌아가기</button></div>`
    : "";
  const dots = list.length > 1
    ? `<div class="wallet-dots">${list.map((_, i) => `<button type="button" data-wallet-dot="${i}" class="${i === index ? "on" : ""}" aria-label="지갑 ${i + 1}"></button>`).join("")}</div>`
    : "";
  return `
    <header class="bar light-bar">
      <button data-back="${walletBack()}" aria-label="뒤로">←</button>
      <h1>지갑</h1>
      <button type="button" class="wallet-manage-btn" data-nav="wallet-manage">지갑 관리 <span class="wallet-avatar" aria-hidden="true">${WALLET_SVG.avatar}</span></button>
    </header>
    <div class="scroll light">
      <section class="wallet-hero">
        <div class="wallet-top">
          <time data-clock>${clockText()}</time>
          <button type="button" data-ex-refresh aria-label="새로고침">${icon("refresh")}</button>
        </div>
        <div class="wallet-rail${list.length > 1 ? " many" : ""}" data-wallet-rail data-index="${index}">${list.map(walletCard).join("")}</div>
      </section>
      ${dots}
      <section class="wallet-section">
        <div class="wallet-head"><h2>보유 NFT <small>${w.nfts.length}개</small></h2><button type="button" data-soon="NFT 전체보기">전체보기 ${WALLET_SVG.next}</button></div>
        ${w.nfts.length
          ? `<div class="nft-row">${w.nfts.map((name) => `<span class="nft-box"><b>${esc(name)}</b></span>`).join("")}</div>`
          : `<div class="wallet-empty"><strong>아직 보유한 NFT가 없습니다</strong><span>이 지갑으로 받은 NFT가 여기에 모여요</span></div>`}
      </section>
      <section class="wallet-section">
        <div class="wallet-head"><h2>최근 거래내역</h2><button type="button" data-nav="exchange-history">전체보기 ${WALLET_SVG.next}</button></div>
        ${ledger.length ? `<div class="ledger">${ledger.map(ledgerRow).join("")}</div>` : `<div class="wallet-empty"><span>거래 내역이 없습니다.</span></div>`}
      </section>
      <section class="wallet-section">
        <div class="wallet-head"><h2>토큰 정보</h2></div>
        <div class="token-row">
          <div class="token-card">
            <p><span class="token-mark" aria-hidden="true">${WALLET_SVG.tott}</span><b>TOTT</b> <small>USDT</small></p>
            <div><span>현재가</span><strong>${tottUsdt}</strong></div>
            <div class="up"><span>전일 대비</span><strong>0.567890<br>+ 5.67%</strong></div>
          </div>
          <div class="token-card">
            <p><span class="token-mark" aria-hidden="true">${WALLET_SVG.sol}</span><b>Solana</b> <small>USDT</small></p>
            <div><span>현재가</span><strong>${SOL_USDT}</strong></div>
            <div class="down"><span>전일 대비</span><strong>- 0.98<br>- 0.49%</strong></div>
          </div>
        </div>
      </section>
    </div>
    ${link}
  `;
}

// 지갑 슬라이드: 넘기면 선택 지갑이 바뀌고 아래 NFT·거래내역이 그 지갑 것으로 바뀐다.
function armWalletRail() {
  const rail = document.querySelector("[data-wallet-rail]");
  if (!rail || rail.dataset.bound) return;
  rail.dataset.bound = "1";
  const cards = [...rail.querySelectorAll("[data-wallet-card]")];
  if (cards.length < 2) return;
  const stride = () => cards[1].offsetLeft - cards[0].offsetLeft || rail.clientWidth || 1;
  const index = Number(rail.dataset.index) || 0;
  if (index > 0) rail.scrollLeft = stride() * index;
  // 마우스로도 넘긴다: 36px 이상 끌면 한 장씩. 끌고 난 뒤의 click은 카드 안 버튼이 눌리지 않게 막는다.
  let dragX = null;
  let dragged = false;
  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragX = event.clientX;
    dragged = false;
  });
  rail.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse" || dragX === null) return;
    const delta = event.clientX - dragX;
    dragX = null;
    if (Math.abs(delta) < 36) return;
    dragged = true;
    const current = Math.round(rail.scrollLeft / stride());
    scrollWalletRail(current + (delta < 0 ? 1 : -1));
  });
  rail.addEventListener("click", (event) => {
    if (!dragged) return;
    dragged = false;
    event.stopPropagation();
    event.preventDefault();
  }, true);
  let timer = 0;
  rail.addEventListener("scroll", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const next = Math.max(0, Math.min(cards.length - 1, Math.round(rail.scrollLeft / stride())));
      const id = cards[next].dataset.walletCard;
      if (id === state.walletId) return;
      state.walletId = id;
      syncBalance();
      persistWallet();
      render();
    }, 120);
  }, { passive: true });
}

function scrollWalletRail(index) {
  const rail = document.querySelector("[data-wallet-rail]");
  const cards = rail ? [...rail.querySelectorAll("[data-wallet-card]")] : [];
  if (!rail || cards.length < 2) return;
  const stride = cards[1].offsetLeft - cards[0].offsetLeft || rail.clientWidth;
  rail.scrollTo({ left: stride * Math.max(0, Math.min(cards.length - 1, index)), behavior: "smooth" });
}

// ---- 지갑 관리 ----

function manageRow(w, isMain) {
  const balance = (Number(w.balance) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `
    <article class="manage-row${isMain ? " main" : ""}${w.connected ? "" : " off"}" data-wallet-row="${esc(w.id)}">
      ${isMain
        ? `<span class="wallet-star" aria-label="대표 지갑">${WALLET_SVG.starFill}</span>`
        : `<span class="drag-handle" data-drag aria-label="순서 바꾸기">${WALLET_SVG.drag}</span>`}
      <span class="wallet-logo big" aria-hidden="true">${WALLET_SVG.ghost}</span>
      <span class="manage-body"><strong>${esc(w.name)}</strong><small>${esc(shortAddr(w.full))}</small></span>
      <span class="manage-amount">${w.connected
        ? `<strong>${balance}</strong><small>≈ ${approxText(w.balance)}</small>`
        : `<small class="off-tag">연결 해제됨</small>`}</span>
      <button type="button" class="manage-more" data-wallet-menu="${esc(w.id)}" aria-label="지갑 메뉴">${WALLET_SVG.more}</button>
    </article>`;
}

function walletManage() {
  const list = walletList();
  const main = list.find((item) => item.main);
  const rest = list.filter((item) => !item.main);
  return `
    <header class="bar light-bar center-bar">
      <button data-back="wallet" aria-label="뒤로">←</button>
      <h1>지갑 관리</h1>
      <span class="bar-spacer" aria-hidden="true"></span>
    </header>
    <div class="scroll light manage">
      <div class="manage-top">
        <span class="manage-clock"><time data-clock>${clockText()}</time><button type="button" data-ex-refresh aria-label="새로고침">${icon("refresh")}</button></span>
        ${currencyToggle(true)}
      </div>
      <h2 class="manage-h">대표 지갑</h2>
      ${main ? manageRow(main, true) : `<p class="empty">대표 지갑이 없어요.</p>`}
      <h2 class="manage-h">연결된 지갑</h2>
      <p class="manage-hint">카드를 위아래로 밀어 노출 순서를 바꿀 수 있어요</p>
      <div class="manage-list" data-wallet-list>
        ${rest.length ? rest.map((item) => manageRow(item, false)).join("") : `<p class="empty">연결된 지갑이 없어요.</p>`}
      </div>
    </div>
    <div class="buy light-buy"><button class="primary" type="button" data-wallet-add>지갑 추가</button></div>
  `;
}

// 연결된 지갑 행을 핸들로 끌어 순서를 바꾼다. 끄는 동안은 DOM만 옮기고, 놓을 때 state에 반영한다.
function armWalletDrag() {
  const list = document.querySelector("[data-wallet-list]");
  if (!list || list.dataset.bound) return;
  list.dataset.bound = "1";
  list.addEventListener("pointerdown", (event) => {
    const row = event.target.closest("[data-drag]") && event.target.closest("[data-wallet-row]");
    if (!row) return;
    event.preventDefault();
    row.classList.add("dragging");
    const move = (e) => {
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-wallet-row]");
      if (!over || over === row || over.parentNode !== list) return;
      const rect = over.getBoundingClientRect();
      list.insertBefore(row, e.clientY > rect.top + rect.height / 2 ? over.nextSibling : over);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      row.classList.remove("dragging");
      const order = [...list.querySelectorAll("[data-wallet-row]")].map((node) => node.dataset.walletRow);
      const rest = order.map(walletById).filter(Boolean);
      state.wallets = [
        ...state.wallets.filter((item) => item.main),
        ...rest,
        ...state.wallets.filter((item) => !item.main && !order.includes(item.id)),
      ];
      persistWallet();
      render();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  });
}

// ⋮ → 지갑 설정 시트. 대표 지갑은 이름 변경만, 연결 지갑은 대표 설정·이름 변경·연결 해제·재연결.
function walletSheet() {
  const w = state.walletSheet ? walletById(state.walletSheet) : null;
  if (!w) return "";
  const item = (attr, svg, label, cls = "") => `<button type="button" class="wsheet-item${cls ? ` ${cls}` : ""}" ${attr}="${esc(w.id)}">${svg}<span>${label}</span></button>`;
  return `
    <div class="sheet-bg">
      <div class="sheet light-sheet">
        <span class="sheet-grab"></span>
        <h2>지갑 설정</h2>
        ${w.main ? "" : item("data-wallet-main", WALLET_SVG.star, "대표 지갑으로 설정")}
        ${item("data-wallet-rename", WALLET_SVG.pencil, "이름 변경")}
        ${w.main ? "" : item("data-wallet-unlink", WALLET_SVG.unlink, "연결 해제", "danger")}
        ${w.main ? "" : item("data-wallet-relink", WALLET_SVG.link, "재연결")}
      </div>
    </div>`;
}

function walletRenameModal() {
  const w = state.walletRename ? walletById(state.walletRename) : null;
  if (!w) return "";
  return `
    <div class="modal-bg">
      <div class="modal light-modal">
        <h2>이름 변경</h2>
        <input class="rename-input" type="text" data-field="renameText" value="${esc(state.renameText)}" maxlength="20" placeholder="지갑 이름" autocomplete="off" />
        <button type="button" class="primary" data-rename-save>저장</button>
        <button type="button" class="ghost" data-rename-cancel>취소</button>
      </div>
    </div>`;
}

function setMainWallet(id) {
  const next = walletById(id);
  if (!next) return;
  state.wallets.forEach((item) => { item.main = item.id === id; });
  state.wallets = [next, ...state.wallets.filter((item) => item.id !== id)];
  syncBalance();
  persistWallet();
}

function addMockWallet() {
  const hex = "0123456789abcdef";
  const full = `0x${Array.from({ length: 24 }, () => hex[Math.floor(Math.random() * 16)]).join("")}`;
  state.wallets.push({ id: `phantom-${Date.now()}`, name: `계정${state.wallets.length + 1}`, full, balance: 0, main: false, connected: true, nfts: [] });
  persistWallet();
}

// ---- 거래 내역: 지갑 선택 · 종류 필터 · 이번 달 날짜별 아코디언 ----

function historyMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad2(now.getMonth() + 1);
  const last = new Date(year, now.getMonth() + 1, 0).getDate();
  return { key: `${year}-${month}`, title: `${year}.${month}.01~${year}.${month}.${pad2(last)}` };
}

function historyWallet() {
  return walletById(state.historyWallet) || currentWallet();
}

function historyGroups() {
  const kind = state.ledgerFilter;
  const { key } = historyMonth();
  const groups = [];
  walletLedger(historyWallet().id)
    .filter((row) => kind === "all" || (kind === "move" ? row.kind === "send" || row.kind === "receive" : row.kind === kind))
    .filter((row) => (state.exDate ? String(row.at).slice(0, 10) === state.exDate : String(row.at).slice(0, 7) === key))
    .forEach((row) => {
      const day = String(row.at).slice(0, 10);
      let group = groups.find((item) => item.day === day);
      if (!group) groups.push((group = { day, rows: [] }));
      group.rows.push(row);
    });
  return groups;
}

// 펼친 날짜 목록. 처음에는 가장 최근 날짜만 펼친다.
function historyOpenDays(groups) {
  return state.historyOpen || (groups[0] ? [groups[0].day] : []);
}

function pickerRow(w) {
  return `<span class="wallet-logo big" aria-hidden="true">${WALLET_SVG.ghost}</span><span class="manage-body"><strong>${esc(w.name)}</strong><small>${esc(shortAddr(w.full))}</small></span>`;
}

function exchangeHistory() {
  const w = historyWallet();
  const list = activeWallets();
  const groups = historyGroups();
  const open = historyOpenDays(groups);
  const chips = [["all", "전체"], ["exchange", "교환"], ["use", "사용"], ["move", "보내기·받기"]]
    .map(([id, label]) => `<button type="button" class="${id === state.ledgerFilter ? "on" : ""}" data-ledger-filter="${id}">${label}</button>`).join("");
  const picker = `
    <div class="hist-pick${state.historyPicker ? " open" : ""}">
      <button type="button" class="hist-pick-btn" data-history-picker aria-expanded="${state.historyPicker ? "true" : "false"}">${pickerRow(w)}${WALLET_SVG.down}</button>
      ${state.historyPicker
        ? `<div class="hist-pick-list">${list.map((item) => `<button type="button" class="hist-pick-item${item.id === w.id ? " on" : ""}" data-history-wallet="${esc(item.id)}">${pickerRow(item)}</button>`).join("")}</div>`
        : ""}
    </div>`;
  const body = groups.length
    ? groups.map((group) => {
        const isOpen = open.includes(group.day);
        return `
          <section class="hist-day${isOpen ? " open" : ""}">
            <button type="button" class="hist-day-btn" data-history-day="${group.day}" aria-expanded="${isOpen ? "true" : "false"}"><span>${group.day.replace(/-/g, ".")}</span>${WALLET_SVG.down}</button>
            ${isOpen ? `<div class="ledger">${group.rows.map(ledgerRow).join("")}</div>` : ""}
          </section>`;
      }).join("")
    : `<div class="wallet-empty tall"><strong>${state.exDate ? "이 날짜의 거래 내역이 없어요." : "거래 내역이 없어요."}</strong></div>`;
  return `
    <header class="bar light-bar center-bar">
      <button data-back="wallet" aria-label="지갑">←</button>
      <h1>거래 내역</h1>
      ${menuButton()}
    </header>
    <div class="scroll light hist">
      ${picker}
      <div class="artist-tabs light-tabs hist-tabs">${chips}</div>
      <div class="hist-date">
        <label>지정된 날짜만 보기<input type="date" data-field="exDate" value="${esc(state.exDate)}" /></label>
        <button type="button" data-ex-date-clear ${state.exDate ? "" : "disabled"}>전체</button>
      </div>
      <h2 class="hist-period">${state.exDate ? state.exDate.replace(/-/g, ".") : historyMonth().title}</h2>
      ${body}
    </div>
  `;
}

function exchangeAmounts() {
  const tott = Number(String(state.exTott).replace(/,/g, ""));
  const safe = Number.isFinite(tott) ? Math.max(0, tott) : 0;
  return { tott: safe, tp: tottToTp(safe) };
}

function exchangeReady() {
  const { tott } = exchangeAmounts();
  return tott >= EXCHANGE_MIN && tott <= state.balance;
}

function exchangeHint() {
  const { tott } = exchangeAmounts();
  if (!tott) return `최소 ${EXCHANGE_MIN} TOTT부터 교환할 수 있어요.`;
  if (tott < EXCHANGE_MIN) return `최소 ${EXCHANGE_MIN} TOTT부터 교환할 수 있어요.`;
  if (tott > state.balance) return "보유한 TOTT보다 많아요. 채우기에서 SOL을 TOTT로 바꿔요.";
  return "";
}

function exchangeRateLine() {
  const { at } = rates();
  const when = at ? `${clockText(new Date(at)).slice(11)} 기준` : "기본 환율";
  return `1 TOTT ≈ ${tpText(tpPerTott())} TP · ${when}`;
}

// ---- 채우기: 솔라나(SOL) → TOTT 교환 ----
// 실제 토마톡 지갑에서 "채우기"를 누르면 SOL을 TOTT로 바꾸는 화면이 열린다. 그 흐름을 TP 교환 페이지와 같은 틀로 목업한다.
const SOL_USDT = 200.96;
const FILL_MIN_SOL = 0.01;

function solText(amount) {
  return (Number(amount) || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 });
}

// 1 SOL이 몇 TOTT인지: SOL 달러 시세 ÷ TOTT 달러 시세
function tottPerSol() {
  const price = rates();
  const tottUsdt = price.tottKrw / price.usdKrw;
  return tottUsdt > 0 ? SOL_USDT / tottUsdt : 0;
}

function fillAmounts() {
  const sol = Number(String(state.fillSol).replace(/,/g, ""));
  const safe = Number.isFinite(sol) ? Math.max(0, sol) : 0;
  return { sol: safe, tott: Number((safe * tottPerSol()).toFixed(6)) };
}

function fillReady() {
  const { sol } = fillAmounts();
  return sol >= FILL_MIN_SOL && sol <= currentWallet().sol;
}

function fillHint() {
  const { sol } = fillAmounts();
  if (!sol || sol < FILL_MIN_SOL) return `최소 ${FILL_MIN_SOL} SOL부터 바꿀 수 있어요.`;
  if (sol > currentWallet().sol) return "보유한 SOL보다 많아요.";
  return "";
}

function fillRateLine() {
  const { at } = rates();
  const when = at ? `${clockText(new Date(at)).slice(11)} 기준` : "기본 환율";
  return `1 SOL ≈ ${tottText(tottPerSol())} TOTT · ${when}`;
}

function setFillSol(amount) {
  const value = Math.max(0, Math.min(currentWallet().sol, Number(amount) || 0));
  state.fillSol = value ? String(Number(value.toFixed(4))) : "";
}

// 받기: TOTT를 지갑 주소로 바로 받는다(거래소·다른 지갑에서 송금). TOTT가 0일 때의 기본 경로.
function receivePage() {
  const w = currentWallet();
  const action = state.walletReturn
    ? `<button class="primary ex-confirm" type="button" data-ex-return>결제로 돌아가기</button>`
    : `<button class="primary ex-confirm" type="button" data-nav="wallet">지갑으로 가기</button>`;
  return `
    <header class="bar light-bar">
      <button data-back="wallet" aria-label="지갑">←</button>
      <h1>TOTT 받기</h1>
      ${menuButton()}
    </header>
    <div class="scroll light ex-form rcv">
      <p class="ex-intro">거래소나 다른 지갑에서 아래 주소로 TOTT를 보내면 이 지갑에 들어와요.</p>
      ${walletPicker()}
      <section class="ex-card rcv-card">
        <div class="rcv-qr" aria-hidden="true">${icon("qr")}</div>
        <p class="rcv-label">${esc(w.name || "지갑")} 주소 · Solana</p>
        <p class="rcv-addr">${esc(w.full)}</p>
        <button type="button" class="rcv-copy" data-wallet-copy="${esc(w.full)}">${icon("copy")} 주소 복사</button>
      </section>
      <ul class="rcv-notes">
        <li>Solana 네트워크의 TOTT만 받을 수 있어요. 다른 네트워크로 보내면 돌려받을 수 없어요.</li>
        <li>입금은 보통 몇 분 안에 반영되고, 거래 내역에서 확인할 수 있어요.</li>
        <li>받은 TOTT는 교환하기에서 TP로 바꿔 결제에 써요.</li>
      </ul>
      ${action}
      <button class="rcv-alt" type="button" data-nav="fill">SOL이 있다면 TOTT로 채우기 ›</button>
    </div>
  `;
}

function fillForm() {
  const w = currentWallet();
  const { sol, tott } = fillAmounts();
  const ready = fillReady();
  return `
    <header class="bar light-bar">
      <button data-back="wallet" aria-label="지갑">←</button>
      <h1>채우기</h1>
      ${menuButton()}
    </header>
    <div class="scroll light ex-form">
      <p class="ex-intro">지갑에 있는 솔라나(SOL)를 TOTT로 바꿔 채워요.</p>
      ${walletPicker()}
      <section class="ex-card">
        <div class="ex-line"><span>보유 SOL</span><strong class="ex-inline">${solText(w.sol)} <small>SOL</small></strong></div>
        <div class="ex-line"><span>보유 TOTT</span><strong class="ex-inline">${tottText(state.balance)} <small>TOTT</small></strong></div>
      </section>
      <div class="ex-head-row"><h2>사용할 SOL</h2></div>
      <section class="ex-card ex-box">
        <div class="ex-field">
          <span class="ex-field-head"><label for="fill-sol">보유 ${solText(w.sol)} SOL</label><button type="button" class="ex-max" data-fill-pct="100">최대</button></span>
          <span class="ex-input">
            <input id="fill-sol" data-field="fillSol" inputmode="decimal" placeholder="0" value="${esc(state.fillSol)}" aria-label="사용할 SOL" />
            <b>SOL</b>
          </span>
        </div>
        <div class="ex-big"><span>받을 TOTT</span><strong class="green" data-fill-get>+ ${tottText(tott)} TOTT</strong></div>
        <p class="ex-rate"><span class="ex-rate-label">현재 환율</span><span class="ex-rate-value" data-fill-rate>${esc(fillRateLine())} <button type="button" data-ex-refresh aria-label="환율 새로고침">${icon("refresh")}</button></span></p>
        <p class="ex-hint${sol > 0 && !ready ? " warn" : ""}${fillHint() ? "" : " is-empty"}" data-fill-hint>${icon("info")}<span>${esc(fillHint())}</span></p>
      </section>
      <section class="ex-card ex-preview">
        <div class="ex-line"><span>교환 후 TOTT</span><strong class="ex-inline" data-fill-after-tott>${tottText(state.balance + tott)} <small>TOTT</small></strong></div>
        <div class="ex-line"><span>교환 후 남은 SOL</span><strong class="ex-inline" data-fill-after-sol>${solText(Math.max(0, w.sol - sol))} <small>SOL</small></strong></div>
      </section>
      <button class="primary ex-confirm" type="button" data-fill-confirm ${ready ? "" : "disabled"}>TOTT로 바꾸기</button>
      <section class="ex-notice">
        <h3>${icon("info")} 채우기 안내 사항</h3>
        <ol>
          <li>솔라나 네트워크 수수료가 따로 들 수 있어요.</li>
          <li>SOL·TOTT 시세 변동으로 실제 받는 TOTT 수량이 달라질 수 있어요.</li>
          <li>바꾼 TOTT는 다시 SOL로 되돌릴 수 없어요.</li>
        </ol>
      </section>
    </div>
  `;
}

// 입력 중에는 전체 render 없이 미리보기·버튼만 갱신한다(포커스 유지).
function syncFillForm() {
  const { sol, tott } = fillAmounts();
  const w = currentWallet();
  const button = app.querySelector("[data-fill-confirm]");
  if (button) button.disabled = !fillReady();
  const hint = app.querySelector("[data-fill-hint]");
  if (hint) {
    const text = fillHint();
    hint.lastElementChild.textContent = text;
    hint.classList.toggle("warn", sol > 0 && !fillReady());
    hint.classList.toggle("is-empty", !text);
  }
  const get = app.querySelector("[data-fill-get]");
  if (get) get.textContent = `+ ${tottText(tott)} TOTT`;
  const afterTott = app.querySelector("[data-fill-after-tott]");
  if (afterTott) afterTott.firstChild.textContent = `${tottText(state.balance + tott)} `;
  const afterSol = app.querySelector("[data-fill-after-sol]");
  if (afterSol) afterSol.firstChild.textContent = `${solText(Math.max(0, w.sol - sol))} `;
}

function runFill() {
  if (!fillReady()) return false;
  const { sol, tott } = fillAmounts();
  const w = currentWallet();
  w.sol = Number((w.sol - sol).toFixed(6));
  state.balance = Number((state.balance + tott).toFixed(6));
  w.balance = state.balance;
  state.fills.unshift({ id: `FILL_${Date.now()}`, at: new Date().toISOString(), wallet: w.id, sol, tott });
  persistWallet();
  state.fillSol = "";
  return true;
}

// 사용 지갑(교환·채우기 공통): 지갑 종류는 Phantom으로 고정(줄 앞 로고가 그 표시), 연결된 Phantom 주소 중 하나만 고른다.
// 드롭다운은 거래 내역 화면의 지갑 선택(hist-pick)을 그대로 쓴다.
function walletPicker() {
  const w = currentWallet();
  const list = activeWallets();
  const open = Boolean(state.walletPick);
  return `
    <div class="hist-pick use-wallet${open ? " open" : ""}">
      <button type="button" class="hist-pick-btn" data-wallet-pick aria-expanded="${open ? "true" : "false"}">${pickerRow(w)}${WALLET_SVG.down}</button>
      ${open
        ? `<div class="hist-pick-list">${list.map((item) => `<button type="button" class="hist-pick-item${item.id === w.id ? " on" : ""}" data-wallet-pick-item="${esc(item.id)}">${pickerRow(item)}</button>`).join("")}</div>`
        : ""}
    </div>`;
}

// 사용 지갑을 바꾸면: 선택 지갑·TOTT/SOL 잔액 갱신, 입력값과 예상값 초기화. TP는 계정 공통이라 그대로.
function pickWallet(id) {
  if (!walletById(id)) return;
  state.walletId = id;
  syncBalance();
  persistWallet();
  state.exTott = "";
  state.exTp = "";
  state.fillSol = "";
  state.walletPick = false;
}

// TOTT · TP 교환 (기획 31장): 사용 지갑 → 잔액 → 입력(TOTT 기준 / TP 기준 전환) → 교환 예상 → 교환 → 안내 사항
function exchangeForm() {
  const { tott, tp } = exchangeAmounts();
  const ready = exchangeReady();
  const tpMode = state.exMode === "tp";
  const amount = tpMode ? state.exTp : state.exTott;
  return `
    <header class="bar light-bar">
      <button data-back="wallet" aria-label="지갑">←</button>
      <h1>TOTT · TP 교환</h1>
      ${menuButton()}
    </header>
    <div class="scroll light ex-form">
      <p class="ex-intro">토마톡 앱에 연동되어 있는 팬텀 지갑을 통해 TOTT를 TP로 교환할 수 있습니다.</p>
      ${walletPicker()}
      <section class="ex-card">
        <div class="ex-line"><span>보유 TOTT</span><strong class="ex-inline">${tottText(state.balance)} <small>TOTT</small></strong></div>
        <div class="ex-line"><span>보유 TP</span><strong class="ex-inline">${tpText(state.tp)} <span class="coin-mark tp" aria-hidden="true">TP</span></strong></div>
      </section>
      ${state.balance > 0 ? "" : `
      <section class="ex-card ex-none">
        <h2>TOTT가 없어요</h2>
        <p>지갑 주소로 TOTT를 받은 뒤<br>TP로 교환할 수 있어요.</p>
        <button class="primary" type="button" data-go-receive>TOTT 받기</button>
      </section>`}
      <div class="ex-head-row"><h2>교환할 수량</h2>
        <div class="ex-mode" role="tablist">
          <button type="button" role="tab" class="${tpMode ? "" : "on"}" aria-selected="${!tpMode}" data-ex-mode="tott">TOTT 기준</button>
          <button type="button" role="tab" class="${tpMode ? "on" : ""}" aria-selected="${tpMode}" data-ex-mode="tp">TP 기준</button>
        </div>
      </div>
      <section class="ex-card ex-box${state.balance > 0 ? "" : " is-off"}">
        <div class="ex-field">
          <span class="ex-field-head"><label for="ex-amount">${tpMode ? "받고 싶은 TP" : "사용할 TOTT"} <small>1 TP = ₩1</small></label><button type="button" class="ex-max" data-ex-pct="100">최대</button></span>
          <span class="ex-input">
            <input id="ex-amount" data-field="exAmount" inputmode="${tpMode ? "numeric" : "decimal"}" placeholder="0" value="${esc(amount)}" />
            <b>${tpMode ? "TP" : "TOTT"}</b>
          </span>
        </div>
        <p class="ex-rate"><span class="ex-rate-label">현재 환율</span><span class="ex-rate-value" data-ex-rate>${esc(exchangeRateLine())} <button type="button" data-ex-refresh aria-label="환율 새로고침">${icon("refresh")}</button></span></p>
        <p class="ex-hint${tott > 0 && !ready ? " warn" : ""}${exchangeHint() ? "" : " is-empty"}" data-ex-hint>${icon("info")}<span>${esc(exchangeHint())}</span></p>
      </section>
      <div class="ex-head-row"><h2>교환 예상</h2></div>
      <section class="ex-card ex-preview">
        <div class="ex-line"><span>받을 TP</span><strong class="green ex-inline" data-ex-get>+ ${tpText(tp)} <span class="coin-mark tp" aria-hidden="true">TP</span></strong></div>
        <div class="ex-line"><span>교환 후 TP</span><strong class="ex-inline" data-ex-after-tp>${tpText(state.tp + tp)} <span class="coin-mark tp" aria-hidden="true">TP</span></strong></div>
      </section>
      <button class="primary ex-confirm" type="button" data-ex-confirm ${ready ? "" : "disabled"}>교환하기</button>
      <section class="ex-notice">
        <h3>${icon("info")} 교환 안내 사항</h3>
        <ol>
          <li>최소 변경 가능한 금액은 ${EXCHANGE_MIN} TOTT에요.</li>
          <li>최소 변경 수량보다 적을 경우 교환이 되지 않아요.</li>
          <li>실시간 TOTT 가격 변동으로 인해 실제 지급 TP 수량이 달라질 수 있어요.</li>
          <li>TP 교환 비율은 KRW와 1:1로 맞춰져 있어요.</li>
          <li>한번 교환된 TP는 다시 TOTT로 변경할 수 없어요.</li>
          <li>지갑별 TOTT 수량과 TP 수량이 다르므로 확인을 잘해주세요.</li>
          <li>지갑에 보유한 TP는 다른 지갑으로 이동이 불가능해요.</li>
        </ol>
      </section>
    </div>
  `;
}

// 입력 중에는 전체 render 없이 반대쪽 값·예상·버튼만 갱신한다(포커스 유지).
function syncExchangeForm() {
  if (state.exMode === "tp") {
    const tp = Number(String(state.exTp).replace(/,/g, ""));
    const safe = Number.isFinite(tp) && tp > 0 ? tp : 0;
    let tott = safe ? tpToTott(safe) : 0;
    if (tott > state.balance && safe <= Math.floor(state.balance * tpPerTott())) tott = state.balance;
    state.exTott = tott ? String(Number(tott.toFixed(6))) : "";
  } else {
    const { tp } = exchangeAmounts();
    state.exTp = tp ? tpText(tp) : "";
  }
  const { tott, tp } = exchangeAmounts();
  const set = (selector, text) => {
    const node = app.querySelector(selector);
    if (node) node.firstChild.textContent = text;
  };
  const button = app.querySelector("[data-ex-confirm]");
  if (button) button.disabled = !exchangeReady();
  const hint = app.querySelector("[data-ex-hint]");
  if (hint) {
    const text = exchangeHint();
    hint.lastElementChild.textContent = text;
    hint.classList.toggle("warn", tott > 0 && !exchangeReady());
    hint.classList.toggle("is-empty", !text);
  }
  set("[data-ex-get]", `+ ${tpText(tp)} `);
  set("[data-ex-after-tp]", `${tpText(state.tp + tp)} `);
}

function setExchangeTott(amount) {
  const value = Math.max(0, Math.min(state.balance, Number(amount) || 0));
  state.exTott = value ? String(Number(value.toFixed(6))) : "";
  // TP 표기는 내림: 반올림해 올리면 보유 TOTT보다 많은 TP가 적혀 "최대"가 보유량을 넘는 것처럼 보인다
  state.exTp = value ? tpText(Math.floor(value * tpPerTott())) : "";
}

function runExchange() {
  if (!exchangeReady()) return false;
  const { tott, tp } = exchangeAmounts();
  state.balance = Number((state.balance - tott).toFixed(6));
  currentWallet().balance = state.balance;
  state.tp += tp;
  state.exchanges.unshift({
    id: `EX_${Date.now()}`,
    at: new Date().toISOString(),
    wallet: currentWallet().id,
    tott,
    tp,
    tpAfter: state.tp,
  });
  persistWallet();
  state.exTott = "";
  state.exTp = "";
  return true;
}

// 교환 완료 화면: 결제 시트로 바로 돌아가지 않고 받은 TP·남은 TOTT·환율을 먼저 보여 준다.
function exchangeDone() {
  const done = state.exDone;
  if (!done) return exchangeForm();
  const wallet = walletById(done.wallet) || currentWallet();
  const at = new Date(done.at);
  const when = `${at.getFullYear()}.${pad2(at.getMonth() + 1)}.${pad2(at.getDate())} ${pad2(at.getHours())}:${pad2(at.getMinutes())}`;
  const action = state.walletReturn
    ? `<button class="primary ex-confirm" type="button" data-ex-return>결제로 돌아가기</button>`
    : `<button class="primary ex-confirm" type="button" data-nav="wallet">지갑으로 가기</button>`;
  return `
    <header class="bar light-bar">
      <button data-back="wallet" aria-label="지갑">←</button>
      <h1>교환 완료</h1>
      ${menuButton()}
    </header>
    <div class="scroll light ex-form ex-done">
      <div class="ex-done-head">
        <span class="ex-done-mark" aria-hidden="true">${icon("check")}</span>
        <h2>교환이 완료됐어요</h2>
        <p>${tottText(done.tott)} TOTT를 ${tpText(done.tp)} TP로 바꿨어요.</p>
      </div>
      <section class="ex-card ex-preview">
        <div class="ex-line"><span>받은 TP</span><strong class="green ex-inline">+ ${tpText(done.tp)} <span class="coin-mark tp" aria-hidden="true">TP</span></strong></div>
        <div class="ex-line"><span>보유 TP</span><strong class="ex-inline">${tpText(done.tpAfter)} <span class="coin-mark tp" aria-hidden="true">TP</span></strong></div>
        <div class="ex-line ex-group"><span>사용한 TOTT</span><strong class="ex-inline">${tottText(done.tott)} <small>TOTT</small></strong></div>
        <div class="ex-line"><span>남은 TOTT</span><strong class="ex-inline">${tottText(done.balanceAfter)} <small>TOTT</small></strong></div>
      </section>
      <section class="ex-card ex-done-meta">
        <div class="ex-line"><span>적용 환율</span><strong>${esc(done.rate)}</strong></div>
        <div class="ex-line"><span>지갑</span><strong>${esc(wallet.name || "")}</strong></div>
        <div class="ex-line"><span>교환 시각</span><strong>${when}</strong></div>
      </section>
      <p class="ex-done-note">${icon("info")}<span>교환된 TP는 다시 TOTT로 바꿀 수 없어요.</span></p>
      ${action}
      <button class="ex-done-more" type="button" data-nav="exchange-history">거래 내역 보기</button>
    </div>
  `;
}

// 지갑·교환에서 결제 시트로 돌아간다(슬라이드 18 "연결 후 현재 결제 화면으로 돌아옵니다").
function returnToSheet() {
  const back = state.walletReturn;
  state.walletReturn = null;
  if (!back) {
    state.screen = "wallet";
    return;
  }
  state.productId = back.productId;
  state.sheet = back.sheet;
  state.screen = "detail";
  state.tab = "home";
}

let clockTimer = 0;

function armClock() {
  window.clearInterval(clockTimer);
  if (!document.querySelector("[data-clock]")) return;
  clockTimer = window.setInterval(() => {
    const node = document.querySelector("[data-clock]");
    if (!node) {
      window.clearInterval(clockTimer);
      return;
    }
    node.textContent = clockText();
  }, 1000);
}

// ---- 이용 가이드 (슬라이드 25) ----

// 이용 가이드 4장. 그림 대신 실제 화면 요소(타일·결제 시트·포장·보유 카드 격자)를 CSS로 움직인다.
// 가이드 시청 보상(슬라이드 24 "필수! 시청 이후 보상"). 기획서에 금액이 없어 임시로 1,000 TP. 첫 완주 한 번만 준다.
const GUIDE_REWARD_TP = 1000;

const GUIDE_PAGES = [
  {
    demo: "pick",
    title: "앨범을 고르고 뽑기",
    body: "목록에서 앨범을 고르고 수량을 선택한 뒤\n마음에 드는 카드를 한 개 골라 주세요.",
  },
  {
    demo: "pay",
    title: "TP로 결제하기",
    body: "지갑이 연결되어 있지 않다면 먼저 연결해 주세요.\n지갑에서 TOTT를 TP로 바꾼 뒤 결제해요.",
  },
  {
    demo: "open",
    title: "포장을 밀어 열기",
    body: "포장을 손가락으로 밀어 열어 주세요.\n나온 카드는 드래그해 앞뒤를 볼 수 있어요.",
  },
  {
    demo: "album",
    title: "보유 카드에 보관",
    body: "뽑은 카드는 보유 카드에서 언제든 볼 수 있어요.\n같은 카드는 장수로 함께 표시돼요.",
  },
];

function fingerIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8h8.5a1.5 1.5 0 0 1 0 3h-7.5"></path><path d="M13.5 11h2a1.5 1.5 0 0 1 0 3h-2.5"></path><path d="M14.5 14a1.5 1.5 0 0 1 0 3h-1.5"></path><path d="M13.5 17a1.5 1.5 0 1 1 0 3h-4.5a6 6 0 0 1 -6 -6v-2v.208a6 6 0 0 1 2.7 -5.012l.3 -.196q .718 -.468 5.728 -3.286a1.5 1.5 0 0 1 2.022 .536c.44 .734 .325 1.674 -.28 2.28l-1.47 1.47"></path></svg>`;
}

function demoScene(kind) {
  const finger = `<span class="demo-finger" aria-hidden="true">${fingerIcon()}</span>`;
  if (kind === "pick") {
    // 목록에서 앨범을 누르면 포장 5개가 부채꼴로 펼쳐지고, 그중 하나를 고른다.
    return `
      <div class="demo demo-pick" aria-hidden="true">
        <div class="demo-screen demo-list">
          <span class="demo-list-head">NEW</span>
          <div class="demo-tiles">
            <span class="demo-tile t1"><img src="/assets/covers/jump.jpg" alt="" /><b>JUMP</b><small>2,500 TP</small></span>
            <span class="demo-tile t2"><img src="/assets/covers/crazy.jpg" alt="" /><b>CRAZY</b><small>2,500 TP</small></span>
          </div>
        </div>
        <div class="demo-screen demo-deck">
          <span class="demo-deck-hint">한 장을 선택하세요</span>
          ${[0, 1, 2, 3, 4].map((index) => `<img class="demo-deck-card d${index}" src="${DECK_PACK}" alt="" />`).join("")}
        </div>
        ${finger}
      </div>`;
  }
  if (kind === "pay") {
    // 지갑 연결이 먼저다. 연결 시트 → 연결 뒤 결제 시트 순으로 보여 준다.
    return `
      <div class="demo demo-pay" aria-hidden="true">
        <img class="demo-bg" src="/assets/covers/jump.jpg" alt="" />
        <div class="demo-sheet demo-sheet-wallet">
          <i class="demo-grab"></i>
          <b class="demo-need">지갑 연결이 필요해요</b>
          <small>포토카드는 TP로 결제해요.<br>지갑을 연결하면 결제를 계속할 수 있어요.</small>
          <span class="demo-btn">지갑 연결하기</span>
        </div>
        <div class="demo-sheet demo-sheet-pay">
          <i class="demo-grab"></i>
          <span class="demo-linked"><i>✓</i>지갑 연결됨 · TOTT → TP 교환 가능</span>
          <div><span>현재가격</span><b>2,500 TP</b></div>
          <div><span>보유</span><b>50,000 TP</b></div>
          <div><span>차감 후 남은 잔액</span><b>47,500 TP</b></div>
          <span class="demo-btn">결제하기</span>
        </div>
        ${finger}
      </div>`;
  }
  if (kind === "open") {
    const overs = [1, 2, 3, 4].map((index) => `<img class="demo-over o${index}" src="tears/method-1/over-${index}.png?v=1" alt="" />`).join("");
    return `
      <div class="demo demo-open" aria-hidden="true">
        <div class="demo-pack">
          <img class="demo-base" src="tears/base.png?v=1" alt="" />
          ${overs}
          <img class="demo-shell" src="tears/over-5.png?v=3" alt="" />
        </div>
        <span class="demo-card"><img src="${photo("67.jpg")}" alt="" /><span class="prism"></span></span>
        ${finger}
      </div>`;
  }
  const fronts = ["67.jpg", "69.jpg", "71.jpg", "01.jpg", "10.jpg", "20.jpg"];
  return `
    <div class="demo demo-album" aria-hidden="true">
      <div class="demo-chips"><b>전체</b><span>BLACKPINK</span><span>LE SSERAFIM</span></div>
      <div class="demo-grid">
        ${fronts.map((file, index) => `<span style="--d:${index * 0.3}s"><img src="${photo(file)}" alt="" />${index === 0 ? `<i>2장</i>` : ""}</span>`).join("")}
      </div>
    </div>`;
}

function guidePages() {
  return `
    <div class="guide-rail" data-guide-rail>
      ${GUIDE_PAGES.map((page, index) => `
        <section class="guide-page" data-guide-page="${index}">
          <span class="guide-step">${index + 1} / ${GUIDE_PAGES.length}</span>
          ${demoScene(page.demo)}
          <h2>${esc(page.title)}</h2>
          <p>${esc(page.body)}</p>
        </section>`).join("")}
    </div>
    <div class="guide-dots" data-guide-dots>${GUIDE_PAGES.map((_, index) => `<i class="${index === state.guidePage ? "on" : ""}"></i>`).join("")}</div>`;
}

// 첫 진입에서는 마지막 장까지 봐야 '시작하기'가 켜지고 건너뛸 수 없다. 다시 볼 때는 언제든 닫는다.
function guide(firstRun) {
  const last = state.guidePage >= GUIDE_PAGES.length - 1;
  const action = firstRun
    ? (state.guideSeen
      ? `<button class="primary" type="button" data-guide-start>시작하기</button>`
      : `<button class="primary" type="button" data-guide-next>다음</button>`)
    : (last
      ? `<button class="primary" type="button" data-guide-close>확인</button>`
      : `<button class="primary" type="button" data-guide-next>다음</button>`);
  const rewardLeft = !loadOnboard().guideRewardAt;
  const note = firstRun
    ? (state.guideSeen
      ? (rewardLeft ? `<p class="guide-note">시청 완료! 시작하기를 누르면 ${tpText(GUIDE_REWARD_TP)} TP 보상을 받아요.</p>` : "")
      : `<p class="guide-note">${rewardLeft ? `이용 가이드 끝까지 확인하고 ${tpText(GUIDE_REWARD_TP)} TP 받으세요.` : "가이드를 끝까지 확인해야 서비스를 이용할 수 있어요."}</p>`)
    : "";
  const header = firstRun
    ? `<header class="bar"><h1>포토카드 이용 가이드</h1></header>`
    : `
      <header class="bar">
        <button data-back="home" aria-label="홈">←</button>
        <h1>포토카드 이용 가이드</h1>
        ${menuButton()}
      </header>`;
  return `
    ${header}
    <div class="guide-body">
      ${guidePages()}
    </div>
    <div class="buy guide-foot">
      ${note}
      ${action}
    </div>
  `;
}

function armGuide() {
  const rail = document.querySelector("[data-guide-rail]");
  if (!rail || rail.dataset.bound) return;
  rail.dataset.bound = "1";
  const width = () => rail.clientWidth || 1;
  if (state.guidePage > 0) rail.scrollLeft = width() * state.guidePage;
  let timer = 0;
  rail.addEventListener("scroll", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const index = Math.max(0, Math.min(GUIDE_PAGES.length - 1, Math.round(rail.scrollLeft / width())));
      const reachedEnd = index === GUIDE_PAGES.length - 1;
      const changed = index !== state.guidePage || (reachedEnd && !state.guideSeen);
      state.guidePage = index;
      if (reachedEnd) state.guideSeen = true;
      if (changed) render();
    }, 60);
  }, { passive: true });
}

function nextGuidePage() {
  const rail = document.querySelector("[data-guide-rail]");
  const next = Math.min(GUIDE_PAGES.length - 1, state.guidePage + 1);
  if (!rail) {
    state.guidePage = next;
    if (next === GUIDE_PAGES.length - 1) state.guideSeen = true;
    render();
    return;
  }
  rail.scrollTo({ left: rail.clientWidth * next, behavior: "smooth" });
}

// ---- 첫 진입 (슬라이드 3~6) ----

// 스플래시: 검은 우주 배경 위에 무지개 궤도, 골드 엠블럼, 미스터리 포장, 떠다니는 포토카드(2026-10-23 시안).
function splash() {
  // 떠다니는 카드: 실물 포토카드 한 장과 유리 느낌의 "?" 카드들
  // 실루엣 카드: 사진 대신 여자·남자 가수 실루엣만 보여준다
  const silhouette = (cls, who) => who === "f"
    ? `<span class="mys-card sil ${cls}"><svg viewBox="0 0 60 92" aria-hidden="true"><path d="M30 10C20 10 15 19 15 31c0 8-2 16-5 25l4 2c4-8 5-15 5-19 2 4 6 7 11 7s9-3 11-7c0 4 1 11 5 19l4-2c-3-9-5-17-5-25 0-12-5-21-15-21z"/><path d="M24 45v11C14 59 6 68 6 92h48c0-24-8-33-18-36V45z"/></svg><small>TOMATOK</small></span>`
    : `<span class="mys-card sil ${cls}"><svg viewBox="0 0 60 92" aria-hidden="true"><circle cx="30" cy="27" r="12.5"/><path d="M24 36v14C12 53 4 64 4 92h52c0-28-8-39-20-42V36z"/></svg><small>TOMATOK</small></span>`;
  const mystery = (cls) => `<span class="mys-card back ${cls}"><b>?</b><i class="mys-q-star"></i><small>TOMATOK</small></span>`;
  const sparks = [1, 2, 3, 4, 5, 6].map((index) => `<i class="mys-spark s${index}"></i>`).join("");
  return `
    <div class="splash splash-mystery">
      <div class="mys-stage" aria-hidden="true">
        <div class="mys-stars a"></div>
        <div class="mys-stars b"></div>
        <div class="mys-stars c"></div>
        <img class="mys-orbit" src="/assets/splash/orbit.png?v=1" alt="" draggable="false" />
        ${mystery("c3 far")}
        ${mystery("c4 far")}
        ${silhouette("c1", "f")}
        ${mystery("c2")}
        ${silhouette("c5", "m")}
        <div class="mys-pack"><div class="mys-pack-float"><img class="mys-pack-front" src="${DECK_PACK}" alt="" draggable="false" /><img class="mys-pack-back" src="${DECK_BACK}" alt="" draggable="false" /><img class="mys-tear t1" src="tears/method-1/over-1.png?v=1" alt="" draggable="false" /><img class="mys-tear t2" src="tears/method-1/over-2.png?v=1" alt="" draggable="false" /><i class="mys-gloss"></i></div></div>
        ${sparks}
        <img class="mys-emblem" src="/assets/splash/emblem-chrome.png?v=1" alt="TOMATOK PHOTOCARD" draggable="false" />
        <i class="mys-emblem-shine"></i>
      </div>
      <button class="primary splash-go" type="button" data-boot-next="push">시작하기</button>
      <p class="splash-foot">ⓒ Copyright, ${new Date().getFullYear()} <b>NEEDSPERSAND</b></p>
    </div>`;
}

function consentWhen(iso) {
  const date = iso ? new Date(iso) : new Date();
  return `${date.getFullYear()}년 ${pad2(date.getMonth() + 1)}월 ${pad2(date.getDate())}일 ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// 첫 진입 팝업(슬라이드 4~6)은 토마톡 기본 모달과 같은 바텀시트로 띄운다.
function bootSheet({ kicker, iconName, badge, title, body, primary, secondary, extra = "" }) {
  const mark = badge
    ? `<span class="boot-badge ${badge === "x" ? "no" : "ok"}" aria-hidden="true">${icon(badge)}</span>`
    : "";
  return `
    <div class="sheet-bg boot-bg">
      <div class="sheet boot-sheet">
        <span class="sheet-grab"></span>
        <p class="boot-kicker">${esc(kicker)}</p>
        <span class="boot-icon" aria-hidden="true">${icon(iconName)}${mark}</span>
        <h2 class="boot-title">${title}</h2>
        ${body ? `<p class="boot-copy">${body}</p>` : ""}
        ${extra}
        ${primary}
        ${secondary}
      </div>
    </div>`;
}

function bootModal() {
  const saved = loadOnboard();
  if (state.boot === "push") {
    return bootSheet({
      kicker: "PUSH 알림",
      iconName: "bell",
      title: "‘토마톡’에서<br>PUSH 알림을 보내고자 합니다.",
      body: "새 상품과 뽑기 소식을 알려드려요.",
      primary: `<button type="button" class="primary" data-push="yes">허용</button>`,
      secondary: `<button type="button" class="boot-link" data-push="no">허용 안 함</button>`,
    });
  }
  if (state.boot === "marketing") {
    return bootSheet({
      kicker: "마케팅 수신 동의",
      iconName: "megaphone",
      title: "‘TOMATOK’ 마케팅 수신<br>동의를 하시겠습니까?",
      body: "이벤트와 혜택 안내를 받아요.",
      primary: `<button type="button" class="primary" data-marketing="yes">허용</button>`,
      secondary: `<button type="button" class="boot-link" data-marketing="no">허용 안 함</button>`,
    });
  }
  if (state.boot === "reward") {
    return bootSheet({
      kicker: "이용자 가이드 보상",
      iconName: "coins",
      badge: "check",
      title: `가이드 시청 완료!<br>${tpText(GUIDE_REWARD_TP)} TP를 드렸어요.`,
      body: "지급된 TP는 지갑에서 확인하고<br>포토카드 뽑기에 바로 쓸 수 있어요.",
      extra: `
        <dl class="boot-facts boot-consent">
          <div><dt>보상</dt><dd>+ ${tpText(GUIDE_REWARD_TP)} TP</dd></div>
          <div><dt>보유 TP</dt><dd>${tpText(state.tp)} TP</dd></div>
        </dl>`,
      primary: `<button type="button" class="primary" data-boot-next="done">확인</button>`,
      secondary: "",
    });
  }
  if (state.boot === "consent") {
    const agreed = Boolean(saved.marketing);
    return bootSheet({
      kicker: "마케팅 Push 알림 동의 안내",
      iconName: "bell",
      badge: agreed ? "check" : "x",
      title: agreed ? "마케팅 Push 수신이 완료됐어요." : "마케팅 Push 거부 처리가 완료됐어요.",
      body: "Push 알림 동의 상태는 우측 상단 메뉴<br>마이 페이지 &gt; 환경설정 &gt; 내 기본정보 설정에서<br>변경 하실 수 있습니다.",
      extra: `
        <dl class="boot-facts boot-consent">
          <div><dt>전송자</dt><dd>TOMATOK</dd></div>
          <div><dt>처리 일시</dt><dd>${esc(consentWhen(saved.decidedAt))}</dd></div>
          <div><dt>처리 내용</dt><dd>${agreed ? "수신 완료" : "거부 처리 완료"}</dd></div>
        </dl>`,
      primary: `<button type="button" class="primary" data-boot-next="guide">확인</button>`,
      secondary: "",
    });
  }
  return "";
}

function bootView() {
  if (state.boot === "guide") return guide(true);
  if (state.boot === "reward") return home() + bootModal();
  return splash() + bootModal();
}

function render() {
  const item = product(state.productId);
  let view = home();
  if (state.boot !== "done") view = bootView();
  else if (state.screen === "detail" && item) view = detail(item);
  else if (state.screen === "card") view = ownedDetail();
  else if (state.screen === "open" && state.openPhase === "deck") view = cardDeck();
  else if (state.screen === "open" && state.openPhase === "pack") view = sealedPack();
  else if (state.screen === "open" && state.openPhase === "spread") view = cardSpread();
  else if (state.screen === "open" && state.openPhase === "motion") view = openMotion();
  else if (state.screen === "result" || state.screen === "open") view = result();
  else if (state.screen === "wished") view = wished();
  else if (state.screen === "purchases") view = purchases();
  else if (state.screen === "guide") view = guide(false);
  else if (state.screen === "wallet") view = wallet();
  else if (state.screen === "wallet-manage") view = walletManage();
  else if (state.screen === "exchange-history") view = exchangeHistory();
  else if (state.screen === "exchange-done") view = exchangeDone();
  else if (state.screen === "exchange-form") view = exchangeForm();
  else if (state.screen === "fill") view = fillForm();
  else if (state.screen === "receive") view = receivePage();
  else if (state.tab === "track" || state.screen === "track") view = state.shipmentId ? shipmentDetail() : tracking();
  else if (state.tab === "album") view = album();
  else if (state.tab === "ship" || state.screen === "ship") view = ship();
  else if (state.screen === "artists") view = artistsPage();
  else if (state.screen === "artist") view = artistPage();
  else if (state.screen === "notice") view = notices();
  else if (state.screen === "settings") view = settings();
  else if (SUPPORT_PAGES[state.screen]) view = supportPage(state.screen);
  else if (state.screen === "inquiry") view = inquiryPage();
  app.innerHTML = view + drawer() + sheet() + walletSheet() + walletModal() + walletRenameModal() + cartModal() + resultBoxModal() + (state.toast ? `<p class="toast">${esc(state.toast)}</p>` : "");
  blurFronts();
  protectFronts();
  startBanner();
  startMidBanner();
  paintBoard();
  mountPostcode();
  armMotion();
  armDeck();
  armOpenCut();
  armSpread();
  armResultCarousel();
  armWalletRail();
  armWalletDrag();
  armClock();
  armGuide();
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
  const openOk = event.target.closest("[data-open-ok]");
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
  const albumSearchOpen = event.target.closest("[data-album-search]");
  const albumSearchClose = event.target.closest("[data-album-search-close]");
  const consentHit = event.target.closest("[data-consent]");
  const wish = event.target.closest("[data-wish]");
  const share = event.target.closest("[data-share]");
  const menu = event.target.closest("[data-menu]");
  const shipmentHit = event.target.closest("[data-shipment]");
  const trackCopy = event.target.closest("[data-track-copy]");
  const trackStatus = event.target.closest("[data-track-status]");
  const openSkip = event.target.closest("[data-open-skip]");
  const resultClose = event.target.closest("[data-result-close]");
  const soon = event.target.closest("[data-soon]");
  const bootNext = event.target.closest("[data-boot-next]");
  const pushPick = event.target.closest("[data-push]");
  const marketingPick = event.target.closest("[data-marketing]");
  const guideNext = event.target.closest("[data-guide-next]");
  const guideStart = event.target.closest("[data-guide-start]");
  const guideClose = event.target.closest("[data-guide-close]");
  const exPct = event.target.closest("[data-ex-pct]");
  const exMode = event.target.closest("[data-ex-mode]");
  const walletPickBtn = event.target.closest("[data-wallet-pick]");
  const walletPickItem = event.target.closest("[data-wallet-pick-item]");
  const fillPct = event.target.closest("[data-fill-pct]");
  const fillConfirm = event.target.closest("[data-fill-confirm]");
  const exConfirm = event.target.closest("[data-ex-confirm]");
  const exReturn = event.target.closest("[data-ex-return]");
  const faqCat = event.target.closest("[data-faq-cat]");
  const inqWrite = event.target.closest("[data-inq-write]");
  const inqOpen = event.target.closest("[data-inq-open]");
  const inqCat = event.target.closest("[data-inq-cat]");
  const inqSubmit = event.target.closest("[data-inq-submit]");
  const inqBack = event.target.closest("[data-inq-back]");
  const inqDelete = event.target.closest("[data-inq-delete]");
  const exRefresh = event.target.closest("[data-ex-refresh]");
  const exDateClear = event.target.closest("[data-ex-date-clear]");
  const goExchange = event.target.closest("[data-go-exchange]");
  const goFill = event.target.closest("[data-go-fill]");
  const goReceive = event.target.closest("[data-go-receive]");
  const walletLink = event.target.closest("[data-wallet-link]");
  const walletCopy = event.target.closest("[data-wallet-copy]");
  const walletCurrency = event.target.closest("[data-wallet-currency]");
  const ledgerFilter = event.target.closest("[data-ledger-filter]");
  const walletDot = event.target.closest("[data-wallet-dot]");
  const walletMenu = event.target.closest("[data-wallet-menu]");
  const walletMain = event.target.closest("[data-wallet-main]");
  const walletRename = event.target.closest("[data-wallet-rename]");
  const walletUnlink = event.target.closest("[data-wallet-unlink]");
  const walletRelink = event.target.closest("[data-wallet-relink]");
  const renameSave = event.target.closest("[data-rename-save]");
  const renameCancel = event.target.closest("[data-rename-cancel]");
  const walletAdd = event.target.closest("[data-wallet-add]");
  const historyPicker = event.target.closest("[data-history-picker]");
  const historyWalletPick = event.target.closest("[data-history-wallet]");
  const historyDay = event.target.closest("[data-history-day]");
  if (openOk) {
    if (state.openPhase !== "spread" && state.reveal.length > 1 && state.revealIndex < state.reveal.length - 1) {
      // 5장: 다음 포장을 고르러 돌아간다(연 카드는 위에 쌓인다)
      state.revealIndex += 1;
      beginOpen();
      return;
    }
    finishOpen();
  } else if (openSkip) {
    // SKIP과 개봉 화면의 ←: 남은 연출을 모두 건너뛰고 결과로 간다(Q12·Q13 기본값).
    if (state.screen !== "open") return;
    state.revealIndex = 0;
    finishOpen();
  } else if (resultClose) {
    // 닫기: 그 상품의 구매 화면(상세)으로 돌아간다(Q15 기본값).
    state.sheet = null;
    state.screen = "detail";
    state.tab = "home";
  } else if (walletDot) {
    scrollWalletRail(Number(walletDot.dataset.walletDot));
    return;
  } else if (walletMenu) {
    state.walletSheet = walletMenu.dataset.walletMenu;
  } else if (walletMain) {
    setMainWallet(walletMain.dataset.walletMain);
    state.walletSheet = null;
    toast("대표 지갑으로 설정했어요.");
  } else if (walletRename) {
    state.renameText = walletById(walletRename.dataset.walletRename)?.name || "";
    state.walletRename = walletRename.dataset.walletRename;
    state.walletSheet = null;
  } else if (walletUnlink) {
    const target = walletById(walletUnlink.dataset.walletUnlink);
    if (target) target.connected = false;
    syncBalance();
    persistWallet();
    state.walletSheet = null;
    toast("지갑 연결을 해제했어요.");
  } else if (walletRelink) {
    const target = walletById(walletRelink.dataset.walletRelink);
    if (target) target.connected = true;
    persistWallet();
    state.walletSheet = null;
    toast("지갑을 다시 연결했어요.");
  } else if (renameSave) {
    const name = String(state.renameText || "").trim();
    const target = walletById(state.walletRename);
    if (!name) {
      toast("지갑 이름을 입력해 주세요.");
    } else {
      if (target) target.name = name;
      persistWallet();
      state.walletRename = null;
      toast("이름을 바꿨어요.");
    }
  } else if (renameCancel || (state.walletRename && walletBackdrop)) {
    state.walletRename = null;
  } else if (walletAdd) {
    addMockWallet();
    toast("지갑을 추가했어요. (mock)");
  } else if (historyPicker) {
    state.historyPicker = !state.historyPicker;
  } else if (historyWalletPick) {
    state.historyWallet = historyWalletPick.dataset.historyWallet;
    state.historyPicker = false;
    state.historyOpen = null;
  } else if (historyDay) {
    const day = historyDay.dataset.historyDay;
    const open = historyOpenDays(historyGroups());
    state.historyOpen = open.includes(day) ? open.filter((item) => item !== day) : [...open, day];
  } else if (soon) {
    state.menuOpen = false;
    toast(`${soon.dataset.soon} 기능은 준비 중이에요.`);
  } else if (bootNext) {
    state.boot = bootNext.dataset.bootNext;
    if (state.boot === "guide") {
      state.guidePage = 0;
      state.guideSeen = false;
    }
  } else if (pushPick) {
    saveOnboard({ push: pushPick.dataset.push === "yes", decidedAt: new Date().toISOString() });
    state.boot = "marketing";
  } else if (marketingPick) {
    saveOnboard({ marketing: marketingPick.dataset.marketing === "yes", decidedAt: new Date().toISOString() });
    state.boot = "consent";
  } else if (guideNext) {
    nextGuidePage();
    return;
  } else if (guideStart) {
    if (!state.guideSeen) return;
    const now = new Date().toISOString();
    const reward = !loadOnboard().guideRewardAt;
    saveOnboard(reward ? { done: true, guideSeenAt: now, guideRewardAt: now } : { done: true, guideSeenAt: now });
    if (reward) {
      state.tp += GUIDE_REWARD_TP;
      persistWallet();
    }
    state.boot = reward ? "reward" : "done";
    state.screen = "home";
    state.tab = "home";
  } else if (guideClose) {
    state.screen = "home";
    state.tab = "home";
  } else if (goExchange) {
    // 결제 시트 → 지갑 교환 페이지 → 교환 뒤 시트로 복귀
    state.walletReturn = { productId: state.productId, sheet: state.sheet };
    state.sheet = null;
    state.exTott = "";
    state.exTp = "";
    state.screen = "exchange-form";
  } else if (goReceive) {
    // TOTT가 없을 때: 받기 화면(주소·복사). 결제에서 왔다면 돌아갈 시트를 기억한다.
    if (state.sheet) state.walletReturn = { productId: state.productId, sheet: state.sheet };
    state.sheet = null;
    state.screen = "receive";
  } else if (goFill) {
    // TOTT가 없을 때: 채우기 → 채운 뒤 교환 화면으로 → 교환 뒤 결제 시트로(결제에서 왔다면)
    if (state.sheet) state.walletReturn = { productId: state.productId, sheet: state.sheet };
    state.sheet = null;
    state.fillReturn = "exchange-form";
    state.fillSol = "";
    state.screen = "fill";
  } else if (walletLink) {
    state.walletConnected = true;
    persistWallet();
    returnToSheet();
  } else if (walletCopy) {
    if (navigator.clipboard) navigator.clipboard.writeText(walletCopy.dataset.walletCopy).catch(() => {});
    toast("지갑 주소를 복사했어요.");
  } else if (walletCurrency) {
    state.walletCurrency = walletCurrency.dataset.walletCurrency;
  } else if (ledgerFilter) {
    state.ledgerFilter = ledgerFilter.dataset.ledgerFilter;
    state.historyOpen = null;
  } else if (exPct) {
    setExchangeTott(state.balance * (Number(exPct.dataset.exPct) / 100));
  } else if (exMode) {
    state.exMode = exMode.dataset.exMode === "tp" ? "tp" : "tott";
  } else if (walletPickBtn) {
    state.walletPick = !state.walletPick;
  } else if (walletPickItem) {
    pickWallet(walletPickItem.dataset.walletPickItem);
  } else if (fillPct) {
    setFillSol(currentWallet().sol * (Number(fillPct.dataset.fillPct) / 100));
  } else if (fillConfirm) {
    if (fillConfirm.disabled) return;
    const { tott } = fillAmounts();
    if (!runFill()) return;
    toast(`${tottText(tott)} TOTT를 채웠어요.`);
    if (state.fillReturn === "exchange-form") {
      state.exTott = "";
      state.exTp = "";
      state.screen = "exchange-form";
    } else {
      state.screen = "wallet";
    }
    state.fillReturn = null;
  } else if (exConfirm) {
    if (exConfirm.disabled || !runExchange()) return;
    // 완료 화면에서 받은 TP·남은 TOTT를 보여 준 뒤 결제 시트(또는 지갑)로 돌아간다
    state.exDone = { ...state.exchanges[0], balanceAfter: state.balance, rate: exchangeRateLine() };
    state.screen = "exchange-done";
  } else if (exReturn) {
    returnToSheet();
  } else if (faqCat) {
    state.faqCat = faqCat.dataset.faqCat;
  } else if (inqWrite) {
    state.inqView = "write";
    state.inqCat = INQUIRY_CATS[0];
    state.inqTitle = "";
    state.inqBody = "";
  } else if (inqOpen) {
    state.inqView = inqOpen.dataset.inqOpen;
  } else if (inqCat) {
    state.inqCat = inqCat.dataset.inqCat;
  } else if (inqBack) {
    state.inqView = "list";
  } else if (inqDelete) {
    saveInquiries(loadInquiries().filter((item) => item.id !== inqDelete.dataset.inqDelete));
    state.inqView = "list";
    toast("문의를 삭제했어요.");
  } else if (inqSubmit) {
    const title = String(state.inqTitle || "").trim();
    const body = String(state.inqBody || "").trim();
    if (!title || !body) return;
    const list = loadInquiries();
    list.unshift({ id: `INQ_${Date.now()}`, cat: state.inqCat || INQUIRY_CATS[0], title, body, at: new Date().toISOString(), answer: null, answeredAt: null });
    saveInquiries(list);
    state.inqView = "list";
    state.inqTitle = "";
    state.inqBody = "";
    toast("문의가 등록됐어요.");
  } else if (exRefresh) {
    fetchRates().then((ok) => {
      if (!ok) return;
      const line = app.querySelector("[data-ex-rate]");
      if (line) line.firstChild.textContent = `${exchangeRateLine()} `;
      const fillLine = app.querySelector("[data-fill-rate]");
      if (fillLine) fillLine.firstChild.textContent = `${fillRateLine()} `;
      if (state.screen === "fill") syncFillForm();
    });
    toast("시세를 새로 불러왔어요.");
  } else if (exDateClear) {
    state.exDate = "";
    state.historyOpen = null;
  } else if (drawerOpen) {
    state.menuOpen = true;
  } else if (drawerClose) {
    state.menuOpen = false;
    state.menuGroups = { mypage: false, artist: false, support: false };
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
    state.menuGroups = { mypage: false, artist: false, support: false };
    state.sheet = null;
    state.shipmentId = "";
    state.pickMode = false;
    state.picked = [];
    state.albumArtist = "all";
    state.albumSearch = false;
    state.albumQuery = "";
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
    } else if (name === "products") {
      // 탭바 '상품'과 결과의 '다른 상품 보기'는 전체 아티스트로 간다(Q1 기본값).
      resetCatalog();
      state.profile = "";
      state.tab = "home";
      state.screen = "artists";
      state.searchOpen = false;
      state.query = "";
    } else if (name === "wallet" || name === "wallet-manage" || name === "exchange-form" || name === "exchange-history" || name === "fill" || name === "receive") {
      state.tab = "home";
      state.screen = name;
      if (name === "fill") state.fillSol = "";
      if (name === "wallet") state.walletReturn = null;
      if (name === "exchange-form") {
        state.exTott = "";
        state.exTp = "";
        state.exMode = "tott";
      }
      state.walletPick = false;
      if (name === "exchange-history") {
        state.exDate = "";
        state.ledgerFilter = "all";
        state.historyWallet = currentWallet().id;
        state.historyPicker = false;
        state.historyOpen = null;
      }
    } else if (name === "guide") {
      state.guidePage = 0;
      state.guideSeen = false;
      state.tab = "home";
      state.screen = "guide";
    } else if (name === "purchases") {
      state.tab = "mypage";
      state.screen = "purchases";
    } else if (name === "album") {
      state.tab = "album";
      state.screen = "album";
      state.focusStatus = null;
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
    } else if (name === "inquiry") {
      state.tab = "home";
      state.screen = "inquiry";
      state.inqView = "list";
    } else if (name === "settings" || SUPPORT_PAGES[name]) {
      state.tab = "home";
      state.screen = name;
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
    } else if (to === "album" || to === "ship" || to === "track") {
      state.screen = to;
      state.tab = to === "album" ? "album" : "mypage";
    } else if (to === "wallet") {
      state.screen = "wallet";
      state.tab = "home";
    } else if (to === "wallet-return") {
      returnToSheet();
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
    if (count === 5 && !canDrawFive(buying)) return;
    state.sheet = count;
  } else if (pay) {
    const buying = product(state.productId);
    const count = Number(pay.dataset.pay);
    if (saleWord(buying)) return;
    if (count === 5 && !canDrawFive(buying)) return;
    if (!state.walletConnected) return;
    if (state.tp < buying.price * count) {
      toast("TP가 부족해요. 토마톡 지갑에서 TOTT를 TP로 교환해 주세요.");
      render();
      return;
    }
    draw(buying, count);
  } else if (unseal) {
    state.openPhase = "motion";
    state.motionArmed = false;
    state.screen = "open";
  } else if (next) {
    state.revealIndex += 1;
    beginOpen();
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
  } else if (albumSearchOpen) {
    state.albumSearch = true;
  } else if (albumSearchClose) {
    state.albumSearch = false;
    state.albumQuery = "";
  } else if (consentHit) {
    // 환경설정 > 내 기본정보 설정: PUSH·마케팅 동의를 켜고 끈다.
    const key = consentHit.dataset.consent;
    const next = !loadOnboard()[key];
    saveOnboard({ [key]: next, decidedAt: new Date().toISOString() });
    toast(key === "push" ? (next ? "PUSH 알림을 받아요." : "PUSH 알림을 받지 않아요.") : (next ? "마케팅 수신에 동의했어요." : "마케팅 수신을 거부했어요."));
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
    // 지갑 연결(mock): 연결된 것으로 저장하고, 열려 있던 결제 시트가 결제 상태로 다시 그려진다.
    state.walletModal = false;
    state.walletConnected = true;
    persistWallet();
    toast("토마톡 지갑을 연결했어요.");
  } else if (walletClose || (state.walletModal && walletBackdrop)) {
    state.walletModal = false;
  } else if (state.cartModal && walletBackdrop) {
    state.cartModal = false;
  } else if (sheetClose || event.target.classList.contains("sheet-bg")) {
    state.sheet = null;
    state.walletModal = false;
    state.walletSheet = null;
  } else {
    return;
  }
  const focusSearch = Boolean(searchOpenBtn);
  const focusCatalog = Boolean(catalogSearch);
  render();
  if (cardHit) app.querySelector(".scroll")?.scrollTo(0, 0);
  if (focusSearch) app.querySelector("[data-field=query]")?.focus();
  if (focusCatalog) app.querySelector("[data-field=catalogQuery]")?.focus();
  if (walletRename) app.querySelector(".rename-input")?.focus();
});

app.addEventListener("change", (event) => {
  if (event.target.matches("[data-country]")) {
    state.country = event.target.value;
    render();
    return;
  }
  if (event.target.matches("[data-field=exDate]")) {
    state.exDate = event.target.value;
    state.historyOpen = null;
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
  if (field === "exAmount") {
    if (state.exMode === "tp") state.exTp = event.target.value;
    else state.exTott = event.target.value;
    syncExchangeForm();
    return;
  }
  if (field === "inqTitle" || field === "inqBody") {
    const button = app.querySelector("[data-inq-submit]");
    if (button) button.disabled = !(String(state.inqTitle || "").trim() && String(state.inqBody || "").trim());
    return;
  }
  if (field === "fillSol") {
    syncFillForm();
    return;
  }
  if (field === "exDate") return; // change 이벤트에서 다시 그린다.
  if (field === "query" || field === "catalogQuery" || field === "albumQuery") {
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
  if (event.target.closest("#app") && !event.target.closest("input, textarea")) event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
  if (event.target.closest("#app img, #app video, #app .fly-card")) event.preventDefault();
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
startRates();
