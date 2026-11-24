// 포토카드 스캔 정리·재고 관리 도구. Mac 로컬 전용, 외부 패키지 없음.
// 실행: node tools/photocard-intake/server.js  → http://localhost:4178
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { spawn, spawnSync, execFile } = require("child_process");
const lookup = require("./lookup");

const ROOT = __dirname;
const PROJECT = path.resolve(ROOT, "..", "..");
const DATA = path.join(ROOT, "data");
const PUBLIC = path.join(ROOT, "public");
const HELPER_SRC = path.join(ROOT, "helper", "vision.swift");
const HELPER_BIN = path.join(ROOT, "bin", "vision");
const PORT = Number(process.env.PORT || 4178);
const DEFAULT_FOLDER = path.join(process.env.HOME || "", "포토카드 스캔");
const IMAGE_EXT = /\.(jpe?g|png|tiff?|heic|bmp)$/i;

for (const d of ["", "thumbs", "cards", "export"]) fs.mkdirSync(path.join(DATA, d), { recursive: true });

// ---------- 작은 JSON 저장소 ----------
function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}
function writeJson(file, value) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}
const FILES = {
  settings: path.join(DATA, "settings.json"),
  analysis: path.join(DATA, "analysis.json"),
  reference: path.join(DATA, "reference.json"),
  intake: path.join(DATA, "intake.json"),
  inventory: path.join(DATA, "inventory.json"),
  identified: path.join(DATA, "identified.json"), // 스캔 파일명(앞면) → 직접 식별한 가수·앨범·멤버와 근거
  lookup: path.join(DATA, "lookup.json"),
};
const settings = readJson(FILES.settings, { folder: DEFAULT_FOLDER });
const analysisCache = readJson(FILES.analysis, {});   // key: path|mtime|size → 분석 결과
const referenceCache = readJson(FILES.reference, {}); // key: 상대경로|mtime → 분석 결과
const intake = readJson(FILES.intake, { pairs: [], done: {}, ignored: [], split: [] });
intake.split ||= [];
const inventory = readJson(FILES.inventory, { cards: [], artists: [], nextNo: {} });
lookup.init(FILES.lookup);
// 매번 읽는다. 파일을 손으로 고쳐도 새로고침만 하면 반영된다.
function identifiedHints() { const h = readJson(FILES.identified, {}); delete h["_설명"]; return h; }

// ---------- 관리자 카탈로그(data.js)를 그대로 읽는다. 관리자 코드는 건드리지 않는다 ----------
function loadCatalog() {
  const src = fs.readFileSync(path.join(PROJECT, "service", "register", "data.js"), "utf8");
  const ctx = {};
  vm.runInNewContext(`${src}\n;__out = { ARTISTS, ALIASES, ARTIST_I18N, SEED, HOLDING_ID, VERSIONS, EVENT_TYPES, RARITIES };`, ctx);
  const out = ctx.__out;
  const albums = {};
  out.SEED.forEach((p) => { if (p.album) (albums[p.artistId] ||= new Set()).add(p.album); });
  const referenceImages = [];
  out.SEED.forEach((p) => p.cards.forEach((c) => {
    referenceImages.push({ face: "front", rel: c.front, packId: p.id, artistId: p.artistId, album: p.album, member: c.member, no: c.no });
    referenceImages.push({ face: "back", rel: c.back, packId: p.id, artistId: p.artistId, album: p.album, member: c.member, no: c.no });
  }));
  return {
    artists: out.ARTISTS.map((a) => ({
      ...a,
      aliases: out.ALIASES[a.id] || [],
      ko: out.ARTIST_I18N[a.id]?.ko || a.name,
      en: out.ARTIST_I18N[a.id]?.en || a.name,
      albums: [...(albums[a.id] || [])],
      source: "admin",
    })),
    holdingId: out.HOLDING_ID,
    versions: out.VERSIONS,
    eventTypes: out.EVENT_TYPES,
    rarities: out.RARITIES,
    referenceImages,
  };
}
let catalog = loadCatalog();

function allArtists() {
  // 관리자 가수 + 이 도구에서 직접 입력한 가수
  const map = new Map(catalog.artists.map((a) => [a.id, { ...a, albums: [...a.albums] }]));
  inventory.artists.forEach((a) => {
    const prev = map.get(a.id);
    if (prev) {
      // 관리자 가수에 이 도구에서 더한 멤버·앨범·별칭을 합친다
      a.albums?.forEach((al) => { if (!prev.albums.includes(al)) prev.albums.push(al); });
      a.members?.forEach((m) => { if (!prev.members.includes(m)) prev.members.push(m); });
      a.aliases?.forEach((al) => { if (!prev.aliases.includes(al)) prev.aliases.push(al); });
    } else map.set(a.id, { ...a, source: "intake" });
  });
  inventory.cards.forEach((c) => {
    const a = map.get(c.artistId);
    if (a && c.album && !a.albums.includes(c.album)) a.albums.push(c.album);
    if (a && c.member && c.member !== "단체" && !a.members.includes(c.member)) a.members.push(c.member);
  });
  return [...map.values()];
}

// ---------- Vision 분석기 ----------
let helperState = { ready: fs.existsSync(HELPER_BIN), building: false, error: "" };
function ensureHelper() {
  const srcTime = fs.statSync(HELPER_SRC).mtimeMs;
  const binTime = fs.existsSync(HELPER_BIN) ? fs.statSync(HELPER_BIN).mtimeMs : 0;
  if (binTime > srcTime) { helperState.ready = true; return; }
  helperState = { ready: false, building: true, error: "" };
  console.log("분석기 컴파일 중 (처음 한 번, 30초쯤)...");
  fs.mkdirSync(path.dirname(HELPER_BIN), { recursive: true });
  const r = spawnSync("swiftc", ["-O", "-framework", "Vision", "-framework", "CoreGraphics", "-framework", "ImageIO", HELPER_SRC, "-o", HELPER_BIN], { encoding: "utf8" });
  if (r.status !== 0) { helperState = { ready: false, building: false, error: r.stderr || "swiftc 실패" }; console.error(helperState.error); return; }
  helperState = { ready: true, building: false, error: "" };
  console.log("분석기 준비 완료");
}

function analyzeFiles(files, onEach) {
  // files: 절대 경로 배열. 한 프로세스에 여러 장을 넘기고 한 줄씩 받는다.
  return new Promise((resolve) => {
    if (!files.length) return resolve([]);
    const proc = spawn(HELPER_BIN, files);
    let buf = ""; const out = [];
    proc.stdout.on("data", (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 1);
        if (!line.trim()) continue;
        try { const r = JSON.parse(line); out.push(r); onEach?.(r); } catch (e) { console.error("분석 결과 파싱 실패", e.message); }
      }
    });
    proc.stderr.on("data", (d) => process.stderr.write(d));
    proc.on("close", () => resolve(out));
  });
}

// ---------- 기준 이미지(기존 카드) 분석 ----------
const refJob = { running: false, done: 0, total: 0 };
async function buildReference() {
  if (refJob.running || !helperState.ready) return;
  const want = [];
  for (const ref of catalog.referenceImages) {
    const abs = path.join(PROJECT, ref.rel);
    if (!fs.existsSync(abs)) continue;
    const key = `${ref.rel}|${Math.round(fs.statSync(abs).mtimeMs)}`;
    if (!referenceCache[key]) want.push({ key, abs });
  }
  refJob.running = true; refJob.done = 0; refJob.total = want.length;
  const byPath = new Map(want.map((w) => [w.abs, w.key]));
  for (let i = 0; i < want.length; i += 8) {
    await analyzeFiles(want.slice(i, i + 8).map((w) => w.abs), (r) => {
      referenceCache[byPath.get(r.path)] = slim(r); refJob.done += 1;
    });
    writeJson(FILES.reference, referenceCache);
  }
  refJob.running = false;
}
function slim(r) { const { path: _p, ...rest } = r; return rest; }
function referenceList() {
  const out = [];
  for (const ref of catalog.referenceImages) {
    const abs = path.join(PROJECT, ref.rel);
    if (!fs.existsSync(abs)) continue;
    const key = `${ref.rel}|${Math.round(fs.statSync(abs).mtimeMs)}`;
    const a = referenceCache[key];
    if (a?.print?.length) out.push({ ...ref, analysis: a });
  }
  return out;
}

// ---------- 스캔 폴더 ----------
const scanJob = { running: false, done: 0, total: 0, error: "" };
function listScanFiles() {
  const folder = settings.folder;
  if (!folder || !fs.existsSync(folder)) return [];
  return fs.readdirSync(folder)
    .filter((n) => IMAGE_EXT.test(n) && !n.startsWith("."))
    .map((name) => { const abs = path.join(folder, name); const st = fs.statSync(abs); return { name, abs, mtime: st.mtimeMs, size: st.size }; })
    .sort((a, b) => a.mtime - b.mtime || a.name.localeCompare(b.name, undefined, { numeric: true }));
}
function cacheKey(f) { return `${f.abs}|${Math.round(f.mtime)}|${f.size}`; }
async function refreshScans() {
  if (scanJob.running) return;
  if (!helperState.ready) { scanJob.error = "분석기가 아직 준비되지 않았습니다"; return; }
  const files = listScanFiles().filter((f) => !analysisCache[cacheKey(f)]);
  scanJob.running = true; scanJob.done = 0; scanJob.total = files.length; scanJob.error = "";
  const keyByPath = new Map(files.map((f) => [f.abs, cacheKey(f)]));
  try {
    for (let i = 0; i < files.length; i += 6) {
      await analyzeFiles(files.slice(i, i + 6).map((f) => f.abs), (r) => { analysisCache[keyByPath.get(r.path)] = slim(r); scanJob.done += 1; });
      writeJson(FILES.analysis, analysisCache);
    }
  } catch (e) { scanJob.error = e.message; }
  scanJob.running = false;
}

// ---------- 판정 ----------
function l2(a, b) { let s = 0; for (let i = 0; i < a.length; i += 1) { const d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); }
// 같은 카드를 두 번 스캔하면 거리 0.25쯤, 같은 가수 다른 카드 0.5~0.8, 무관하면 1.0 이상
function similarity(d) { return Math.max(0, Math.min(1, 1 - (d - 0.2) / 0.9)); }

function classifySide(a, refs) {
  // 얼굴이 있으면 앞면, 단색이면 뒷면. 기존 카드와의 유사도도 한 표.
  const why = []; let front = 0, back = 0;
  if (a.faces > 0) { front += 3; why.push(`얼굴 ${a.faces}개 감지`); } else { back += 1; why.push("얼굴 없음"); }
  if (a.stddev < 20) { back += 2; why.push(`단색에 가까움(편차 ${a.stddev})`); }
  else if (a.stddev > 35) { front += 1; why.push(`색 변화 큼(편차 ${a.stddev})`); }
  if (a.edge > 8) { front += 1; } else if (a.edge < 4) { back += 1; }
  if (a.faces === 0 && a.lines?.length) { back += 1; why.push(`글자만 있음: ${a.lines.map((l) => l.text).join(" / ").slice(0, 40)}`); }
  if (a.print?.length && refs.length) {
    let best = null;
    for (const r of refs) { const d = l2(a.print, r.analysis.print); if (!best || d < best.d) best = { d, face: r.face }; }
    if (best && best.d < 0.9) { if (best.face === "front") front += 1; else back += 1; why.push(`기존 카드 ${best.face === "front" ? "앞면" : "뒷면"}과 비슷함`); }
  }
  const side = front > back ? "front" : "back";
  return { side, confidence: Math.abs(front - back), why };
}

function normalizeText(s) { return String(s || "").toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, ""); }
function bigrams(s) { const out = new Set(); for (let i = 0; i < s.length - 1; i += 1) out.add(s.slice(i, i + 2)); return out; }
function dice(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const A = bigrams(a), B = bigrams(b); let hit = 0;
  for (const g of A) if (B.has(g)) hit += 1;
  return (2 * hit) / (A.size + B.size);
}
function textMatch(lines, term) {
  const t = normalizeText(term); if (t.length < 2) return 0;
  let best = 0;
  for (const l of lines) {
    const n = normalizeText(l.text);
    if (!n) continue;
    if (n.includes(t) || (t.length >= 4 && t.includes(n) && n.length >= 3)) best = Math.max(best, 0.95);
    else best = Math.max(best, dice(n, t));
    for (const w of l.text.split(/\s+/)) best = Math.max(best, dice(normalizeText(w), t) * 0.95);
  }
  return best;
}

function buildCandidates(frontA, backA, refs, artists, excludeCardId, hint) {
  const cands = new Map(); // key artistId|album → 후보
  const add = (key, base, score, evidence) => {
    const c = cands.get(key) || { ...base, score: 0, evidence: [] };
    c.score += score; c.evidence.push(evidence); cands.set(key, c);
  };
  const artistName = (id) => artists.find((a) => a.id === id)?.name || id;
  // 이 도구에서 등록한 카드도 기준 이미지로 쓴다. 한 장 등록하면 다음 장부터 후보에 나온다.
  const mine = [];
  for (const c of inventory.cards) {
    if (c.deleted || c.id === excludeCardId) continue;
    if (c.print?.front) mine.push({ face: "front", img: `/api/image?src=card&id=${c.id}&face=front&size=160`, packId: c.code, artistId: c.artistId, album: c.album, member: c.member, no: c.no, analysis: { print: c.print.front } });
    if (c.print?.back) mine.push({ face: "back", img: `/api/image?src=card&id=${c.id}&face=back&size=160`, packId: c.code, artistId: c.artistId, album: c.album, member: c.member, no: c.no, analysis: { print: c.print.back } });
  }
  refs = [...refs.map((r) => ({ ...r, img: `/api/image?src=ref&rel=${encodeURIComponent(r.rel)}&size=160` })), ...mine];
  const kindOf = (id) => artists.find((a) => a.id === id)?.kind || "group";
  const groupOf = (id) => artists.find((a) => a.id === id)?.groupId || "";

  // 1) 기존 카드 이미지 대조
  const sims = [];
  for (const face of ["front", "back"]) {
    const a = face === "front" ? frontA : backA;
    if (!a?.print?.length) continue;
    for (const r of refs) {
      if (r.face !== face) continue;
      const d = l2(a.print, r.analysis.print);
      sims.push({ face, d, sim: similarity(d), ref: r });
    }
  }
  sims.sort((x, y) => x.d - y.d);
  const similar = sims.filter((s) => s.sim >= 0.4).slice(0, 6).map((s) => ({ face: s.face, sim: Math.round(s.sim * 100), img: s.ref.img, packId: s.ref.packId, artistId: s.ref.artistId, artistName: artistName(s.ref.artistId), album: s.ref.album, member: s.ref.member, no: s.ref.no }));
  for (const s of sims.slice(0, 6)) {
    if (s.sim < 0.45) continue;
    const r = s.ref;
    add(`${r.artistId}|${r.album}`, { artistId: r.artistId, artistName: artistName(r.artistId), kind: kindOf(r.artistId), groupId: groupOf(r.artistId), album: r.album, member: s.face === "front" ? r.member : "" },
      s.sim * (s.face === "front" ? 1 : 0.6),
      `${s.face === "front" ? "앞면" : "뒷면"}이 기존 카드 ${r.packId} #${r.no}${r.member ? ` (${r.member})` : ""}과 ${Math.round(s.sim * 100)}% 유사`);
  }

  // 2) 양면 OCR 글자 대조
  const lines = [...(frontA?.lines || []).map((l) => ({ ...l, face: "앞면" })), ...(backA?.lines || []).map((l) => ({ ...l, face: "뒷면" }))];
  for (const a of artists) {
    const names = [a.name, a.ko, a.en, ...(a.aliases || [])].filter(Boolean);
    let best = 0, hitName = "";
    for (const n of names) { const m = textMatch(lines, n); if (m > best) { best = m; hitName = n; } }
    if (best >= 0.6) add(`${a.id}|`, { artistId: a.id, artistName: a.name, kind: a.kind, groupId: a.groupId || "", album: "", member: "" }, best, `OCR 글자가 가수 이름 "${hitName}"과 ${Math.round(best * 100)}% 일치`);
    for (const al of a.albums || []) {
      const m = textMatch(lines, al);
      if (m >= 0.6) add(`${a.id}|${al}`, { artistId: a.id, artistName: a.name, kind: a.kind, groupId: a.groupId || "", album: al, member: "" }, m, `OCR 글자가 앨범 "${al}"과 ${Math.round(m * 100)}% 일치`);
    }
    for (const mem of a.members || []) {
      const m = textMatch(lines, mem);
      if (m >= 0.75) add(`${a.id}|`, { artistId: a.id, artistName: a.name, kind: a.kind, groupId: a.groupId || "", album: "", member: mem }, m * 0.8, `OCR 글자가 멤버 "${mem}"과 ${Math.round(m * 100)}% 일치`);
    }
  }

  // 3) 이미 등록한 카드와 같은 카드인지
  const same = [];
  for (const c of inventory.cards) {
    if (c.deleted || c.id === excludeCardId || !c.print?.front) continue;
    const df = frontA?.print?.length ? l2(frontA.print, c.print.front) : 9;
    const db = backA?.print?.length && c.print.back ? l2(backA.print, c.print.back) : 9;
    if (df < 0.35) same.push({ id: c.id, code: c.code, artistName: artistName(c.artistId), album: c.album, member: c.member, stock: c.stock, simFront: Math.round(similarity(df) * 100), simBack: db < 9 ? Math.round(similarity(db) * 100) : null });
  }
  same.sort((x, y) => y.simFront - x.simFront);

  // 4) 직접 식별한 정보(data/identified.json). 근거·출처를 달고 맨 위 후보로 올린다.
  if (hint?.artistId) {
    const a = artists.find((x) => x.id === hint.artistId);
    const key = `${hint.artistId}|${hint.album || ""}`;
    add(key, { artistId: hint.artistId, artistName: a?.name || hint.artistId, kind: a?.kind || "group", groupId: a?.groupId || "", album: hint.album || "", member: hint.member || "" }, 1.3, `직접 식별 (확신 ${hint.confidence || "보통"})`);
    const c = cands.get(key);
    c.member = hint.member || c.member; c.album = hint.album || c.album;
    for (const e of hint.evidence || []) c.evidence.push(e);
    Object.assign(c, { identified: true, version: hint.version || "", eventType: hint.eventType || "", memo: hint.memo || "", sources: hint.sources || [] });
  }

  const list = [...cands.values()].sort((x, y) => y.score - x.score).slice(0, 6);
  const best = sims.length ? Math.round(sims[0].sim * 100) : null;
  return { candidates: list, similar, bestSimilar: best, same, ocr: lines.map((l) => ({ face: l.face, text: l.text, conf: Math.round(l.conf * 100) })) };
}

function keywordsFrom(frontA, backA) {
  const words = new Set();
  for (const l of [...(frontA?.lines || []), ...(backA?.lines || [])]) {
    if (l.conf < 0.5) continue; // 확신 낮은 글자는 검색어로 쓰지 않는다
    const t = l.text.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
    if (t.replace(/\s/g, "").length >= 3) words.add(t);
  }
  return [...words].slice(0, 6);
}

// ---------- 현재 상태 조립 ----------
function buildState() {
  const refs = referenceList();
  const artists = allArtists();
  const files = listScanFiles();
  const items = files.map((f) => {
    const a = analysisCache[cacheKey(f)];
    const done = intake.done[f.name];
    const item = { name: f.name, mtime: f.mtime, size: f.size, analyzed: Boolean(a), done: done || null, ignored: intake.ignored.includes(f.name) };
    if (a) {
      item.side = classifySide(a, refs);
      item.faces = a.faces; item.stddev = a.stddev;
      item.ocr = (a.lines || []).map((l) => ({ text: l.text, conf: Math.round(l.conf * 100) }));
      item.error = a.ok ? "" : a.error;
    }
    return item;
  });
  const byName = new Map(items.map((i) => [i.name, i]));
  const used = new Set();
  const pairs = [];
  // 직접 확정한 짝
  for (const p of intake.pairs) {
    if (!byName.has(p.front) || !byName.has(p.back)) continue;
    used.add(p.front); used.add(p.back);
    pairs.push({ id: p.id, front: p.front, back: p.back, manual: true, note: "직접 확정한 짝" });
  }
  // 자동 짝: 스캔 순서대로 앞면 다음에 뒷면이 오면 묶는다 (양면 스캐너 순서)
  const free = items.filter((i) => i.analyzed && !i.done && !i.ignored && !used.has(i.name) && !intake.split.includes(i.name));
  const split = items.filter((i) => i.analyzed && !i.done && !i.ignored && !used.has(i.name) && intake.split.includes(i.name));
  for (let i = 0; i < free.length; i += 1) {
    const a = free[i], b = free[i + 1];
    if (used.has(a.name) || !b) continue;
    if (a.side.side === "front" && b.side.side === "back") { pairs.push({ id: `auto:${a.name}:${b.name}`, front: a.name, back: b.name, manual: false, note: "스캔 순서 앞면→뒷면" }); used.add(a.name); used.add(b.name); }
    else if (a.side.side === "back" && b.side.side === "front") { pairs.push({ id: `auto:${b.name}:${a.name}`, front: b.name, back: a.name, manual: false, note: "스캔 순서가 뒷면→앞면이라 뒤집어 묶음" }); used.add(a.name); used.add(b.name); }
  }
  const unpaired = [...free.filter((i) => !used.has(i.name)), ...split].map((i) => i.name);
  // 짝마다 후보 계산
  const hints = identifiedHints();
  const fullPairs = pairs.map((p) => {
    const fa = analysisCache[cacheKey(files.find((f) => f.name === p.front))];
    const ba = analysisCache[cacheKey(files.find((f) => f.name === p.back))];
    const c = buildCandidates(fa, ba, refs, artists, null, hints[p.front] || hints[p.back]);
    const warn = [];
    if (fa && fa.faces === 0 && fa.stddev < 20) warn.push("앞면으로 묶인 면이 단색입니다. 앞뒷면이 바뀌었는지 확인");
    if (ba && ba.faces > 0) warn.push("뒷면으로 묶인 면에 얼굴이 있습니다. 앞뒷면이 바뀌었는지 확인");
    return { ...p, ...c, keywords: keywordsFrom(fa, ba), warn };
  });
  return {
    settings, helper: helperState, refJob, scanJob,
    referenceCount: refs.length, referenceTotal: catalog.referenceImages.filter((r) => fs.existsSync(path.join(PROJECT, r.rel))).length,
    items, pairs: fullPairs, unpaired,
    catalog: { artists, holdingId: catalog.holdingId, versions: catalog.versions, eventTypes: catalog.eventTypes, rarities: catalog.rarities },
    inventory: { cards: inventory.cards.filter((c) => !c.deleted).map(({ print: _p, ...c }) => c) },
  };
}

// ---------- 등록·재고 ----------
function slug(s) { return String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "") || "artist"; }
function nextNo(artistId, album) {
  const key = `${artistId}|${album || ""}`;
  const used = inventory.cards.filter((c) => !c.deleted && c.artistId === artistId && (c.album || "") === (album || "")).map((c) => Number(c.no) || 0);
  return (Math.max(0, ...used) + 1);
}
function makeCode(artistName, album, no) {
  // 관리자와 같은 규칙: 가수-앨범-0001
  const base = `${String(artistName || "미분류").replace(/\s+/g, "")}-${String(album || "NONE").replace(/\s+/g, "") || "NONE"}-${String(no).padStart(4, "0")}`;
  let code = base, extra = 2;
  const used = new Set(inventory.cards.map((c) => c.code));
  while (used.has(code)) { code = `${base}-${extra}`; extra += 1; }
  return code;
}
function resolveArtist(body) {
  const artists = allArtists();
  if (body.artistId && artists.find((a) => a.id === body.artistId)) {
    const a = artists.find((x) => x.id === body.artistId);
    if (body.newMember && body.newMember !== "단체" && !a.members.includes(body.newMember)) {
      const custom = inventory.artists.find((x) => x.id === a.id);
      if (custom) custom.members.push(body.newMember);
      else inventory.artists.push({ id: a.id, name: a.name, kind: a.kind, groupId: a.groupId || "", members: [body.newMember], aliases: [], albums: [] });
    }
    return a;
  }
  const name = String(body.newArtistName || "").trim();
  if (!name) throw new Error("가수를 고르거나 새 가수 이름을 입력하세요");
  const id = slug(name);
  const existing = artists.find((a) => a.id === id);
  if (existing) return existing;
  const artist = { id, name, kind: body.kind === "solo" ? "solo" : "group", groupId: body.groupId || "", members: body.newMember ? [body.newMember] : [], aliases: [], albums: [], source: "intake" };
  inventory.artists.push(artist);
  return artist;
}
// 인터넷 조회 결과를 가수 목록에 넣는다. 이름이 이미 있으면 멤버·앨범·별칭만 보탠다.
function addArtistFromLookup(body) {
  const name = String(body.name || "").trim();
  if (!name) throw new Error("가수 이름이 없습니다");
  const same = (x) => normalizeText(x);
  const names = [name, body.ko, ...(body.aliases || [])].filter(Boolean).map(same);
  const existing = allArtists().find((a) => [a.name, a.ko, a.en, ...(a.aliases || [])].filter(Boolean).some((n) => names.includes(same(n))));
  const members = (body.members || []).map((m) => (typeof m === "string" ? m : m.name)).filter(Boolean);
  const albums = (body.albums || []).map((al) => (typeof al === "string" ? al : al.title)).filter(Boolean);
  const aliases = (body.aliases || []).filter(Boolean);
  const id = existing ? existing.id : slug(body.ko || name);
  let custom = inventory.artists.find((a) => a.id === id);
  if (!custom) { custom = existing ? { id, members: [], aliases: [], albums: [] } : { id, name, ko: body.ko || "", en: name, kind: body.kind === "solo" ? "solo" : "group", groupId: "", members: [], aliases: [], albums: [] }; inventory.artists.push(custom); }
  for (const m of members) if (!custom.members.includes(m)) custom.members.push(m);
  for (const al of albums) if (!custom.albums.includes(al)) custom.albums.push(al);
  for (const al of aliases) if (!custom.aliases.includes(al)) custom.aliases.push(al);
  if (body.url) custom.note = `${body.source || "인터넷"}: ${body.url}`;
  writeJson(FILES.inventory, inventory);
  return allArtists().find((a) => a.id === id);
}
function copyScan(name, dest) {
  // 원본은 그대로 두고 복사만 한다
  fs.copyFileSync(path.join(settings.folder, name), dest);
}
function registerCard(body) {
  const { front, back } = body;
  if (!front || !back) throw new Error("앞면과 뒷면이 모두 있어야 등록할 수 있습니다");
  const files = listScanFiles();
  const ff = files.find((f) => f.name === front), bf = files.find((f) => f.name === back);
  if (!ff || !bf) throw new Error("스캔 파일을 찾을 수 없습니다. 새로고침 후 다시 시도하세요");
  if (intake.done[front] || intake.done[back]) throw new Error("이미 등록한 스캔입니다");
  const fa = analysisCache[cacheKey(ff)], ba = analysisCache[cacheKey(bf)];
  const artist = resolveArtist(body);
  const album = String(body.album || "").trim();
  const member = String(body.member || body.newMember || "").trim();
  if (artist.kind === "solo" && !member) { /* 개인은 본인 */ }
  const no = nextNo(artist.id, album);
  const id = `c${Date.now().toString(36)}${crypto.randomBytes(2).toString("hex")}`;
  const dir = path.join(DATA, "cards", id);
  fs.mkdirSync(dir, { recursive: true });
  const ext = (n) => (path.extname(n) || ".jpg").toLowerCase();
  copyScan(front, path.join(dir, `front${ext(front)}`));
  copyScan(back, path.join(dir, `back${ext(back)}`));
  const card = {
    id, no, code: makeCode(artist.name, album, no),
    artistId: artist.id, kind: artist.kind, groupId: artist.groupId || "", album,
    member: member || (artist.kind === "solo" ? artist.members[0] || artist.name : ""),
    eventType: body.eventType || "unknown", eventName: String(body.eventName || "").trim(),
    version: body.version || "unset", rarity: catalog.rarities.includes(body.rarity) ? body.rarity : "NORMAL",
    stock: Math.max(0, Number(body.stock) || 1), weight: 1, memo: String(body.memo || "").trim(),
    front: `front${ext(front)}`, back: `back${ext(back)}`,
    source: { front, back, folder: settings.folder },
    ocr: { front: (fa?.lines || []).map((l) => l.text), back: (ba?.lines || []).map((l) => l.text) },
    print: { front: fa?.print || null, back: ba?.print || null },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  inventory.cards.push(card);
  intake.done[front] = { cardId: id, face: "front" };
  intake.done[back] = { cardId: id, face: "back" };
  intake.pairs = intake.pairs.filter((p) => p.front !== front && p.back !== back);
  writeJson(FILES.inventory, inventory); writeJson(FILES.intake, intake);
  return card;
}
function addStockFromScan(body) {
  // 같은 카드가 이미 있으면 재고만 올리고 스캔은 완료 처리한다
  const card = inventory.cards.find((c) => c.id === body.cardId && !c.deleted);
  if (!card) throw new Error("카드를 찾을 수 없습니다");
  card.stock = (Number(card.stock) || 0) + 1; card.updatedAt = new Date().toISOString();
  for (const n of [body.front, body.back]) if (n) intake.done[n] = { cardId: card.id, face: n === body.front ? "front" : "back", stockOnly: true };
  intake.pairs = intake.pairs.filter((p) => p.front !== body.front && p.back !== body.back);
  writeJson(FILES.inventory, inventory); writeJson(FILES.intake, intake);
  return card;
}
function updateCard(body) {
  const card = inventory.cards.find((c) => c.id === body.id);
  if (!card) throw new Error("카드를 찾을 수 없습니다");
  if (body.delete) { card.deleted = true; }
  else {
    for (const k of ["album", "member", "version", "rarity", "memo", "eventType", "eventName", "code"]) if (k in body) card[k] = String(body[k] ?? "").trim();
    if ("stock" in body) card.stock = Math.max(0, Number(body.stock) || 0);
    if ("delta" in body) card.stock = Math.max(0, (Number(card.stock) || 0) + Number(body.delta));
    if ("weight" in body) card.weight = Math.max(0, Number(body.weight) || 1);
    if (body.artistId) { const a = allArtists().find((x) => x.id === body.artistId); if (a) { card.artistId = a.id; card.kind = a.kind; card.groupId = a.groupId || ""; } }
  }
  card.updatedAt = new Date().toISOString();
  writeJson(FILES.inventory, inventory);
  return card;
}
function exportInventory() {
  // 관리자 등록 포맷(팩 → 카드)으로 내보낸다. DB 초안의 cards 컬럼과 같은 필드.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = path.join(DATA, "export", stamp);
  fs.mkdirSync(path.join(dir, "photocards"), { recursive: true });
  const artists = allArtists();
  const packs = new Map();
  for (const c of inventory.cards.filter((x) => !x.deleted)) {
    const key = `${c.artistId}|${c.album || ""}|${c.eventType || "unknown"}`;
    const a = artists.find((x) => x.id === c.artistId);
    const p = packs.get(key) || { id: `${c.artistId}-${slug(c.album || "unknown")}`, artistId: c.artistId, kind: a?.kind || c.kind, album: c.album || "", eventType: c.eventType || "unknown", eventName: c.eventName || "", cover: "", price: 2500, status: "draft", home: false, cards: [] };
    const fileBase = `${c.code}`.replace(/[^\w가-힣-]+/g, "_");
    const frontName = `${fileBase}_front${path.extname(c.front)}`, backName = `${fileBase}_back${path.extname(c.back)}`;
    fs.copyFileSync(path.join(DATA, "cards", c.id, c.front), path.join(dir, "photocards", frontName));
    fs.copyFileSync(path.join(DATA, "cards", c.id, c.back), path.join(dir, "photocards", backName));
    p.cards.push({ no: String(c.no).padStart(2, "0"), member: c.member, front: `photocards/${frontName}`, back: `photocards/${backName}`, version: c.version, rarity: c.rarity, stock: c.stock, weight: c.weight || 1, code: c.code, management_code: c.code, memo: c.memo });
    packs.set(key, p);
  }
  const out = {
    exportedAt: new Date().toISOString(),
    artists: artists.filter((a) => a.source === "intake").map(({ source: _s, ...a }) => a),
    packs: [...packs.values()],
  };
  writeJson(path.join(dir, "packs.json"), out);
  return { dir, packs: out.packs.length, cards: out.packs.reduce((n, p) => n + p.cards.length, 0) };
}

// ---------- 썸네일 ----------
function thumbPath(abs, size) {
  const key = crypto.createHash("md5").update(`${abs}|${fs.statSync(abs).mtimeMs}|${size}`).digest("hex");
  return path.join(DATA, "thumbs", `${key}.jpg`);
}
function thumbnail(abs, size) {
  return new Promise((resolve, reject) => {
    const out = thumbPath(abs, size);
    if (fs.existsSync(out)) return resolve(out);
    execFile("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "80", "-Z", String(size), abs, "--out", out], (err) => (err ? reject(err) : resolve(out)));
  });
}

// ---------- HTTP ----------
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };
function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}
function readBody(req) {
  return new Promise((resolve) => { let b = ""; req.on("data", (d) => { b += d; }); req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch { resolve({}); } }); });
}
function safeScan(name) {
  const abs = path.join(settings.folder, path.basename(name));
  if (!abs.startsWith(settings.folder) || !fs.existsSync(abs)) throw new Error("파일 없음");
  return abs;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;
  try {
    if (p === "/api/state") return send(res, 200, buildState());
    // 인터넷 조회: MusicBrainz + Wikidata. 결과는 data/lookup.json에 7일 캐시
    if (p === "/api/lookup") return send(res, 200, await lookup.lookup(url.searchParams.get("q") || ""));
    if (p === "/api/image") {
      const src = url.searchParams.get("src"); const size = Number(url.searchParams.get("size") || 0);
      let abs;
      if (src === "scan") abs = safeScan(url.searchParams.get("name"));
      else if (src === "ref") { abs = path.join(PROJECT, url.searchParams.get("rel") || ""); if (!abs.startsWith(path.join(PROJECT, "assets"))) throw new Error("경로 오류"); }
      else if (src === "card") { const c = inventory.cards.find((x) => x.id === url.searchParams.get("id")); if (!c) throw new Error("카드 없음"); abs = path.join(DATA, "cards", c.id, url.searchParams.get("face") === "back" ? c.back : c.front); }
      else throw new Error("src 오류");
      const file = size ? await thumbnail(abs, size) : abs;
      res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "max-age=3600" });
      return fs.createReadStream(file).pipe(res);
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      if (p === "/api/settings") { if (body.folder) settings.folder = body.folder.replace(/\/$/, ""); writeJson(FILES.settings, settings); return send(res, 200, { ok: true, settings }); }
      if (p === "/api/pick-folder") {
        return execFile("osascript", ["-e", 'POSIX path of (choose folder with prompt "스캐너 저장 폴더를 고르세요")'], (err, out) => {
          if (err) return send(res, 200, { ok: false });
          settings.folder = out.trim().replace(/\/$/, ""); writeJson(FILES.settings, settings); send(res, 200, { ok: true, settings });
        });
      }
      if (p === "/api/refresh") { refreshScans(); return send(res, 200, { ok: true }); }
      if (p === "/api/reference") { buildReference(); return send(res, 200, { ok: true }); }
      if (p === "/api/pair") {
        if (!body.front || !body.back || body.front === body.back) throw new Error("앞면과 뒷면 파일을 각각 고르세요");
        safeScan(body.front); safeScan(body.back);
        intake.pairs = intake.pairs.filter((x) => ![x.front, x.back].some((n) => n === body.front || n === body.back));
        intake.split = intake.split.filter((n) => n !== body.front && n !== body.back);
        intake.pairs.push({ id: `manual:${Date.now()}`, front: body.front, back: body.back });
        writeJson(FILES.intake, intake); return send(res, 200, { ok: true });
      }
      if (p === "/api/unpair") {
        // 직접 짝은 지우고, 자동 짝은 두 파일을 자동 묶기에서 빼서 아래 목록으로 내린다
        intake.pairs = intake.pairs.filter((x) => x.id !== body.id);
        for (const n of [body.front, body.back]) if (n && !intake.split.includes(n)) intake.split.push(n);
        writeJson(FILES.intake, intake); return send(res, 200, { ok: true });
      }
      if (p === "/api/swap") {
        // 자동 짝의 앞뒷면을 바꿔 직접 짝으로 저장
        intake.pairs = intake.pairs.filter((x) => x.id !== body.id);
        intake.pairs.push({ id: `manual:${Date.now()}`, front: body.back, back: body.front });
        writeJson(FILES.intake, intake); return send(res, 200, { ok: true });
      }
      if (p === "/api/ignore") { if (!intake.ignored.includes(body.name)) intake.ignored.push(body.name); writeJson(FILES.intake, intake); return send(res, 200, { ok: true }); }
      if (p === "/api/unignore") { intake.ignored = intake.ignored.filter((n) => n !== body.name); writeJson(FILES.intake, intake); return send(res, 200, { ok: true }); }
      if (p === "/api/undo-done") {
        // 등록 취소: 완료 표시만 지운다. 카드는 재고 탭에서 따로 지운다.
        for (const n of body.names || []) delete intake.done[n];
        writeJson(FILES.intake, intake); return send(res, 200, { ok: true });
      }
      const pub = ({ print: _p, ...c }) => c; // 특징 벡터는 응답에서 뺀다
      if (p === "/api/register") return send(res, 200, { ok: true, card: pub(registerCard(body)) });
      if (p === "/api/add-stock") return send(res, 200, { ok: true, card: pub(addStockFromScan(body)) });
      if (p === "/api/card") return send(res, 200, { ok: true, card: pub(updateCard(body)) });
      if (p === "/api/export") { const r = exportInventory(); execFile("open", [r.dir]); return send(res, 200, { ok: true, ...r }); }
      if (p === "/api/open") { const t = body.what === "folder" ? settings.folder : body.what === "data" ? DATA : safeScan(body.name); execFile("open", [t]); return send(res, 200, { ok: true }); }
      if (p === "/api/add-artist") return send(res, 200, { ok: true, artist: addArtistFromLookup(body) });
      if (p === "/api/reload-catalog") { catalog = loadCatalog(); buildReference(); return send(res, 200, { ok: true }); }
      throw new Error("알 수 없는 요청");
    }
    // 정적 파일
    const file = path.join(PUBLIC, p === "/" ? "index.html" : p);
    if (!file.startsWith(PUBLIC) || !fs.existsSync(file)) return send(res, 404, "없음", "text/plain; charset=utf-8");
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    return fs.createReadStream(file).pipe(res);
  } catch (e) {
    return send(res, 400, { ok: false, error: e.message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`포토카드 스캔 정리: http://localhost:${PORT}`);
  console.log(`스캔 폴더: ${settings.folder}`);
  ensureHelper();
  buildReference();
});
