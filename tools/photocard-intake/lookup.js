// 인터넷 조회: MusicBrainz + Wikidata (키 없는 공개 DB). 결과는 data/lookup.json에 7일 캐시.
"use strict";
const fs = require("fs");
const path = require("path");

const UA = "photocard-intake/1.0 (local tool)";
const TTL = 7 * 24 * 3600 * 1000;
let cacheFile = null, cache = {};
function init(file) { cacheFile = file; try { cache = JSON.parse(fs.readFileSync(file, "utf8")); } catch { cache = {}; } }
function save() { if (cacheFile) fs.writeFileSync(cacheFile, JSON.stringify(cache)); }

// MusicBrainz는 초당 1회만 허용한다. 요청을 줄 세운다.
let chain = Promise.resolve(); let lastMb = 0;
function getJson(url) {
  const hit = cache[url];
  if (hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.body);
  const run = async () => {
    if (url.includes("musicbrainz.org")) { const wait = 1100 - (Date.now() - lastMb); if (wait > 0) await new Promise((r) => setTimeout(r, wait)); lastMb = Date.now(); }
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`${res.status} ${url.split("?")[0]}`);
    const body = await res.json();
    cache[url] = { at: Date.now(), body }; save();
    return body;
  };
  chain = chain.then(run, run);
  return chain;
}

const hasHangul = (s) => /[가-힣]/.test(String(s || ""));
const norm = (s) => String(s || "").toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "");
const KPOP = /korean|k-pop|kpop|boy group|girl group|idol|singer|rapper|한국|가수|그룹|아이돌/i;

async function mbArtistDetail(id) {
  const a = await getJson(`https://musicbrainz.org/ws/2/artist/${id}?inc=artist-rels+release-groups+aliases&fmt=json`);
  const raw = (a.aliases || []).filter((x) => x.name);
  const aliases = raw.map((x) => x.name);
  const koAlias = raw.find((x) => x.locale === "ko" && x.primary && hasHangul(x.name)) || raw.find((x) => x.locale === "ko" && x.type === "Artist name" && hasHangul(x.name)) || raw.find((x) => hasHangul(x.name));
  const ko = hasHangul(a.name) ? a.name : koAlias?.name || "";
  const rels = a.relations || [];
  const members = rels.filter((r) => r.type === "member of band" && r.direction === "backward").map((r) => ({ name: r.artist.name, current: !r.ended }));
  const bands = rels.filter((r) => r.type === "member of band" && r.direction === "forward").map((r) => r.artist.name);
  const albums = (a["release-groups"] || [])
    .filter((g) => ["Album", "EP", "Single"].includes(g["primary-type"]) && !(g["secondary-types"] || []).length)
    .sort((x, y) => String(x["first-release-date"] || "").localeCompare(String(y["first-release-date"] || "")))
    .map((g) => ({ title: g.title, type: g["primary-type"], date: g["first-release-date"] || "" }));
  const seen = new Set();
  return {
    source: "MusicBrainz", mbid: a.id, name: a.name, ko, kind: a.type === "Person" ? "solo" : "group", country: a.country || "",
    aliases: aliases.filter((x) => x !== a.name && x !== ko),
    members: members.filter((m) => { const k = norm(m.name); if (seen.has(k)) return false; seen.add(k); return true; }),
    groupName: bands[0] || "",
    albums,
    url: `https://musicbrainz.org/artist/${a.id}`,
  };
}

async function wikidataSearch(query) {
  const out = [];
  for (const lang of [hasHangul(query) ? "ko" : "en", "ko"]) {
    const j = await getJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=${lang}&format=json&limit=5`);
    for (const s of j.search || []) if (KPOP.test(s.description || "") && !out.some((o) => o.id === s.id)) out.push({ id: s.id, label: s.label, description: s.description || "" });
    if (out.length) break;
  }
  return out;
}

async function lookup(query) {
  const q = String(query || "").trim();
  if (q.replace(/\s/g, "").length < 2) return { query: q, artists: [], note: "검색어가 너무 짧습니다" };
  const found = new Map(); // mbid → { evidence: [] }
  const note = (id, text) => { const f = found.get(id) || { evidence: [] }; if (!f.evidence.includes(text)) f.evidence.push(text); found.set(id, f); };
  // 1) 가수 이름으로
  try {
    const j = await getJson(`https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(q)}&fmt=json&limit=6`);
    for (const a of j.artists || []) {
      if (a.score < 90) continue;
      if (a.country && a.country !== "KR" && a.country !== "JP") continue;
      note(a.id, `MusicBrainz 가수 검색 "${q}" → ${a.name}${a.country ? ` (${a.country})` : ""} 일치도 ${a.score}`);
    }
  } catch (e) { /* 아래에서 이어서 시도 */ }
  // 2) 앨범 제목으로
  try {
    const j = await getJson(`https://musicbrainz.org/ws/2/release/?query=release:${encodeURIComponent(`"${q}"`)}&fmt=json&limit=10`);
    for (const r of j.releases || []) {
      if (norm(r.title) !== norm(q)) continue;
      for (const c of r["artist-credit"] || []) if (c.artist?.id) note(c.artist.id, `MusicBrainz 앨범 "${r.title}" → ${c.artist.name}`);
    }
  } catch (e) { /* 계속 */ }
  // 3) Wikidata (한국 가수인지 설명으로 확인)
  let wiki = [];
  try { wiki = await wikidataSearch(q); } catch (e) { /* 계속 */ }
  // 상세 조회 (최대 3명)
  const artists = [];
  for (const [id, f] of [...found.entries()].slice(0, 3)) {
    try {
      const d = await mbArtistDetail(id);
      if (d.country && d.country !== "KR" && d.country !== "JP" && !wiki.length) continue;
      const w = wiki.find((x) => norm(x.label) === norm(d.name) || norm(x.label) === norm(d.ko) || d.aliases.some((al) => norm(al) === norm(x.label)));
      if (w) f.evidence.push(`Wikidata ${w.id}: ${w.description}`);
      artists.push({ ...d, evidence: f.evidence, wikidata: w?.id || "" });
    } catch (e) { f.evidence.push(`상세 조회 실패: ${e.message}`); }
  }
  // MusicBrainz에 없고 Wikidata에만 있으면 이름만이라도 돌려준다
  for (const w of wiki) {
    if (artists.some((a) => a.wikidata === w.id)) continue;
    artists.push({ source: "Wikidata", name: w.label, ko: hasHangul(w.label) ? w.label : "", kind: /group|그룹/i.test(w.description) ? "group" : "solo", members: [], albums: [], aliases: [], groupName: "", evidence: [`Wikidata ${w.id}: ${w.description}`], wikidata: w.id, url: `https://www.wikidata.org/wiki/${w.id}` });
  }
  return { query: q, artists, at: Date.now() };
}

module.exports = { init, lookup };
