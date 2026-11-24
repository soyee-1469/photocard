/* 손님 앱과 관리자가 같이 쓰는 상수·헬퍼. 두 app.js보다 먼저 로드한다. */
const REGISTER_KEY = "photocard-register-v5";

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value) {
  const [year, month, day] = String(value || "").split("-");
  if (!year || !month || !day) return "";
  return `${year}. ${month}. ${day}.`;
}

function localizedName(ko, en, fallback) {
  const korean = (document.documentElement.lang || "ko").toLowerCase().startsWith("ko");
  const first = korean ? ko : en;
  const second = korean ? en : ko;
  return String(first || second || fallback || "").trim();
}

function aliasTokens(value) {
  return String(value || "").split(/[,，]/).map((item) => item.trim()).filter(Boolean);
}

function eventTitle(item) {
  return localizedName(item?.eventNameKo, item?.eventNameEn, item?.eventName);
}

const ARTIST_I18N = {
  cortis: { ko: "코르티스", en: "CORTIS", aliases: "cortis, 코르티스" },
  seventeen: { ko: "세븐틴", en: "SEVENTEEN", aliases: "세븐틴, svt" },
  twice: { ko: "트와이스", en: "TWICE", aliases: "트와이스" },
  blackpink: { ko: "블랙핑크", en: "BLACKPINK", aliases: "블랙핑크" },
  bts: { ko: "방탄소년단", en: "BTS", aliases: "방탄, BTS" },
};

const PROFILE_PHOTOS = {
  blackpink: "/assets/profiles/blackpink.jpg",
  bts: "/assets/profiles/bts.jpg",
};
