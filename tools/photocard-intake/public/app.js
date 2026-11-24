"use strict";
let state = null;
const picked = new Set();          // 짝 없는 스캔에서 고른 파일
const formDraft = new Map();       // 짝 id → 입력 중인 값
const lookups = new Map();         // 짝 id → 인터넷 조회 결과
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const img = (name, size = 480) => `/api/image?src=scan&name=${encodeURIComponent(name)}&size=${size}`;

async function api(path, body) {
  const r = await fetch(path, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {});
  const j = await r.json();
  if (j && j.ok === false) throw new Error(j.error || "실패");
  return j;
}
async function load() { state = await api("/api/state"); render(); }

// ---------- 상단 상태 ----------
function renderStatus() {
  const el = $("#status"); const parts = []; let busy = false;
  if (state.helper.building) { parts.push("분석기 컴파일 중"); busy = true; }
  else if (state.helper.error) parts.push("분석기 오류: " + state.helper.error.slice(0, 80));
  if (state.refJob.running) { parts.push(`기존 카드 이미지 분석 ${state.refJob.done}/${state.refJob.total}`); busy = true; }
  else parts.push(`기존 카드 이미지 ${state.referenceCount}/${state.referenceTotal}장 준비`);
  if (state.scanJob.running) { parts.push(`스캔 분석 ${state.scanJob.done}/${state.scanJob.total}`); busy = true; }
  if (state.scanJob.error) parts.push(state.scanJob.error);
  el.textContent = parts.join(" · "); el.classList.toggle("busy", busy);
  if (busy) setTimeout(load, 1200);
}

// ---------- 스캔 정리 ----------
function sideLabel(item) { return item.side?.side === "front" ? "앞면" : "뒷면"; }
function thumbCard(item, extraClass = "") {
  const why = item.side ? item.side.why.join(", ") : (item.analyzed ? "" : "분석 전");
  return `<div class="thumb ${extraClass} ${picked.has(item.name) ? "picked" : ""}" data-name="${esc(item.name)}" title="${esc(why)}">
    <img src="${img(item.name, 240)}" loading="lazy" />
    ${item.side ? `<span class="tag ${item.side.side}">${sideLabel(item)}${item.side.confidence <= 1 ? "?" : ""}</span>` : ""}
    <div class="name">${esc(item.name)}</div></div>`;
}
function artistOptions(selected) {
  const a = state.catalog.artists;
  return `<option value="">직접 입력 ↓</option>` + a.map((x) => `<option value="${esc(x.id)}" ${x.id === selected ? "selected" : ""}>${esc(x.name)}${x.kind === "solo" ? " (개인)" : ""}${x.source === "intake" ? " ·새" : ""}</option>`).join("");
}
// 후보를 폼에 넣는다. 직접 식별한 후보는 버전·행사·메모까지 같이 채운다.
function applyCand(d, c, i) {
  Object.assign(d, { cand: i, artistId: c.artistId, album: c.album || d.album, member: c.member || "" });
  if (c.identified) Object.assign(d, { version: c.version || d.version, eventType: c.eventType || d.eventType, memo: c.memo || d.memo });
}
function draftFor(pair) {
  if (!formDraft.has(pair.id)) {
    const d = { artistId: "", album: "", member: "", newArtistName: "", kind: "group", groupId: "", newMember: "", version: "unset", rarity: "NORMAL", stock: 1, eventType: "unknown", eventName: "", memo: "", cand: -1 };
    if (pair.candidates[0]) applyCand(d, pair.candidates[0], 0);
    formDraft.set(pair.id, d);
  }
  const d = formDraft.get(pair.id);
  // 나중에 후보가 생기면(다른 카드를 등록한 뒤) 아직 손대지 않은 폼에 첫 후보를 채운다
  if (d.cand === -1 && !d.artistId && !d.newArtistName && pair.candidates[0]) applyCand(d, pair.candidates[0], 0);
  return d;
}
// 인터넷 조회 결과 칸
function lookupOut(pairId) {
  const r = lookups.get(pairId);
  if (!r) return "";
  if (r.loading) return `<div class="muted">조회 중…</div>`;
  if (r.error) return `<div class="warn">조회 실패: ${esc(r.error)}</div>`;
  if (!r.artists?.length) return `<div class="muted">"${esc(r.query)}" 에 맞는 한국 가수를 MusicBrainz·Wikidata에서 못 찾았습니다. ${esc(r.note || "")}</div>`;
  return r.artists.map((a, i) => `<div class="found">
    <div><b>${esc(a.name)}</b>${a.ko && a.ko !== a.name ? ` (${esc(a.ko)})` : ""} · ${a.kind === "solo" ? "개인" : "그룹"}${a.groupName ? ` · ${esc(a.groupName)}` : ""} · <a target="_blank" href="${esc(a.url)}">${esc(a.source)}</a>
      <button class="btn small primary" data-add-artist="${i}">가수 목록에 넣기</button></div>
    ${a.members?.length ? `<div class="muted">멤버: ${a.members.map((m) => esc(m.name) + (m.current ? "" : "(전)")).join(", ")}</div>` : ""}
    ${a.albums?.length ? `<div class="muted">앨범: ${a.albums.map((al) => `${esc(al.title)}${al.date ? ` (${esc(al.date.slice(0, 7))})` : ""}`).join(" · ")}</div>` : ""}
    <ul>${(a.evidence || []).map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>`).join("");
}
function renderPair(pair) {
  const byName = new Map(state.items.map((i) => [i.name, i]));
  const f = byName.get(pair.front), b = byName.get(pair.back);
  const d = draftFor(pair);
  const artist = state.catalog.artists.find((a) => a.id === d.artistId);
  const members = artist ? artist.members : [];
  const albums = artist ? artist.albums : [];
  const blocked = !f || !b;
  const kw = pair.keywords.length ? pair.keywords : [];
  const q = encodeURIComponent((kw.join(" ") + " 포토카드").trim());
  const face = (item, label) => item ? `<div class="face"><img src="${img(item.name)}" data-full="${esc(item.name)}" />
      <div class="label">${label} <span class="muted">${esc(item.name)}</span></div>
      <div class="why">판정 ${sideLabel(item)}${item.side.confidence <= 1 ? " (불확실)" : ""} · ${esc(item.side.why.join(" · "))}</div></div>`
    : `<div class="face"><div class="empty">${label} 없음</div></div>`;
  return `<article class="pair ${blocked ? "blocked" : ""}" data-pair="${esc(pair.id)}">
    <div class="faces">
      ${face(f, "앞면")}${face(b, "뒷면")}
      <div class="face-actions">
        <button class="btn small" data-act="swap">앞뒤 바꾸기</button>
        <button class="btn small" data-act="unpair">짝 풀기</button>
        <span class="muted">${esc(pair.note)}</span>
      </div>
    </div>
    <div>
      ${pair.warn.map((w) => `<div class="warn">⚠ ${esc(w)}</div>`).join("")}
      ${pair.same.map((s) => `<div class="same"><b>이미 등록된 카드와 같아 보입니다</b> ${esc(s.artistName)} ${esc(s.album)} ${esc(s.member)} · ${esc(s.code)} · 앞면 ${s.simFront}%${s.simBack != null ? ` 뒷면 ${s.simBack}%` : ""} · 현재 재고 ${s.stock}
        <button class="btn small primary" data-act="add-stock" data-card="${esc(s.id)}">재고 +1 로 처리</button></div>`).join("")}
      <h3>후보 ${pair.candidates.length ? "" : '<span class="muted">· 일치하는 정보가 없습니다. 아래 키워드로 찾아보거나 직접 입력하세요</span>'}</h3>
      <div class="cands">
        ${pair.candidates.map((c, i) => `<label class="cand ${d.cand === i ? "on" : ""} ${c.identified ? "ident" : ""}" data-cand="${i}">
          <span class="score">${Math.round(Math.min(c.score, 1.5) / 1.5 * 100)}%</span>
          <span><span class="title">${esc(c.artistName)}${c.kind === "solo" ? " (개인)" : ""}${c.album ? ` · ${esc(c.album)}` : ""}${c.member ? ` · ${esc(c.member)}` : ""}</span>
          <ul>${c.evidence.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
          ${c.sources?.length ? `<div class="srcs">출처: ${c.sources.map((u) => `<a target="_blank" href="${esc(u)}">${esc(u.replace(/^https?:\/\//, "").split("/")[0])}</a>`).join(" ")}</div>` : ""}</span></label>`).join("")}
      </div>
      ${pair.similar.length ? `<div class="similar">${pair.similar.map((s) => `<div class="sim"><img src="${s.img}" title="${esc(s.packId)} #${esc(s.no)}" />${s.face === "front" ? "앞" : "뒤"} ${s.sim}%<br>${esc(s.artistName)}</div>`).join("")}</div>` : `<div class="muted">기존 카드 이미지와 비슷한 것 없음${pair.bestSimilar != null ? ` (가장 가까운 것 ${pair.bestSimilar}%)` : ""}</div>`}
      <div class="links">웹 검색:
        <a target="_blank" href="https://www.google.com/search?q=${q}">Google</a>
        <a target="_blank" href="https://www.google.com/search?tbm=isch&q=${q}">Google 이미지</a>
        <a target="_blank" href="https://search.naver.com/search.naver?query=${q}">네이버</a>
        <a target="_blank" href="https://namu.wiki/Search?q=${encodeURIComponent(kw.join(" "))}">나무위키</a>
        <span class="muted">${kw.length ? "키워드: " + esc(kw.join(" / ")) : "OCR 키워드 없음 (이미지 검색에 앞면 파일을 끌어다 놓으세요)"}</span>
      </div>
      <form class="lookup"><input name="q" value="${esc(kw[0] || "")}" placeholder="가수나 앨범 이름" /><button class="btn small">인터넷 조회</button><span class="muted">MusicBrainz·Wikidata (공개 DB)</span></form>
      <div class="lookup-out">${lookupOut(pair.id)}</div>
      <details class="ocr"><summary>OCR 원문 ${pair.ocr.length}줄</summary><pre>${pair.ocr.length ? pair.ocr.map((l) => `[${l.face} ${l.conf}%] ${esc(l.text)}`).join("\n") : "인식된 글자 없음"}</pre></details>
      <form class="reg">
        <label>가수 <select name="artistId">${artistOptions(d.artistId)}</select></label>
        <label>새 가수 이름 <input name="newArtistName" value="${esc(d.newArtistName)}" placeholder="목록에 없을 때" ${d.artistId ? "disabled" : ""} /></label>
        <label>활동 <select name="kind" ${d.artistId ? "disabled" : ""}><option value="group" ${d.kind === "group" ? "selected" : ""}>그룹</option><option value="solo" ${d.kind === "solo" ? "selected" : ""}>개인</option></select></label>
        <label>소속 그룹(개인일 때) <select name="groupId" ${d.artistId || d.kind !== "solo" ? "disabled" : ""}><option value="">없음</option>${state.catalog.artists.filter((a) => a.kind === "group").map((a) => `<option value="${esc(a.id)}" ${d.groupId === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></label>
        <label>앨범 <input name="album" list="albums-${esc(pair.id)}" value="${esc(d.album)}" /><datalist id="albums-${esc(pair.id)}">${albums.map((a) => `<option value="${esc(a)}">`).join("")}</datalist></label>
        <label>멤버 <select name="member"><option value="">${artist && artist.kind === "solo" ? "본인" : "미정"}</option>${members.map((m) => `<option value="${esc(m)}" ${d.member === m ? "selected" : ""}>${esc(m)}</option>`).join("")}<option value="단체" ${d.member === "단체" ? "selected" : ""}>단체</option></select></label>
        <label>새 멤버 이름 <input name="newMember" value="${esc(d.newMember)}" placeholder="목록에 없을 때" /></label>
        <label>행사 <select name="eventType">${state.catalog.eventTypes.map((e) => `<option value="${esc(e.id)}" ${d.eventType === e.id ? "selected" : ""}>${esc(e.label)}</option>`).join("")}</select></label>
        <label>버전 <select name="version">${state.catalog.versions.map((v) => `<option value="${esc(v.id)}" ${d.version === v.id ? "selected" : ""}>${esc(v.label)}</option>`).join("")}</select></label>
        <label>등급 <select name="rarity">${state.catalog.rarities.map((r) => `<option ${d.rarity === r ? "selected" : ""}>${r}</option>`).join("")}</select></label>
        <label>재고 <input name="stock" type="number" min="0" value="${esc(d.stock)}" /></label>
        <label>행사명 <input name="eventName" value="${esc(d.eventName)}" /></label>
        <label class="wide">메모 <input name="memo" value="${esc(d.memo)}" /></label>
        <div class="actions">
          <button type="submit" class="btn red" ${blocked ? "disabled" : ""}>${blocked ? "누락된 면이 있어 등록할 수 없음" : "이 카드 등록"}</button>
          <span class="msg"></span>
        </div>
      </form>
    </div></article>`;
}
function renderScan() {
  const pairsEl = $("#pairs");
  const items = state.items;
  const todo = items.filter((i) => !i.done && !i.ignored);
  $("#scan-count").textContent = todo.length;
  $("#folder").value = state.settings.folder;
  if (!items.length) pairsEl.innerHTML = `<div class="empty">폴더에 이미지가 없습니다. 스캔 후 「새로고침」을 누르세요.</div>`;
  else if (!state.pairs.length) pairsEl.innerHTML = todo.length ? `<div class="empty">${todo.some((i) => !i.analyzed) ? "분석 중입니다. 잠시 뒤 자동으로 갱신됩니다." : "자동으로 묶인 짝이 없습니다. 아래에서 직접 짝을 지어 주세요."}</div>` : `<div class="empty">정리할 스캔이 없습니다. 모두 등록했습니다.</div>`;
  else pairsEl.innerHTML = state.pairs.map(renderPair).join("");
  const byName = new Map(items.map((i) => [i.name, i]));
  const un = state.unpaired.map((n) => byName.get(n)).filter(Boolean);
  const pending = todo.filter((i) => !i.analyzed);
  $("#unpaired-count").textContent = un.length;
  $("#unpaired").innerHTML = un.map((i) => thumbCard(i)).join("") + pending.map((i) => thumbCard(i)).join("") + (state.items.filter((i) => i.ignored).map((i) => thumbCard(i, "ignored")).join(""));
  $("#unpaired-wrap").style.display = un.length || pending.length || state.items.some((i) => i.ignored) ? "" : "none";
  updatePairPick();
  const done = items.filter((i) => i.done);
  $("#done-count").textContent = done.length;
  $("#done").innerHTML = done.map((i) => `<div class="thumb" data-done="${esc(i.name)}" title="등록 취소 (더블클릭)"><img src="${img(i.name, 160)}" loading="lazy" /><span class="tag ${i.done.face}">${i.done.face === "front" ? "앞면" : "뒷면"}${i.done.stockOnly ? " 재고+" : ""}</span><div class="name">${esc(i.name)}</div></div>`).join("");
}
function updatePairPick() {
  const names = [...picked].filter((n) => state.items.some((i) => i.name === n));
  const byName = new Map(state.items.map((i) => [i.name, i]));
  const desc = names.map((n) => `${n} (${byName.get(n)?.side ? sideLabel(byName.get(n)) : "?"})`).join(" + ");
  $("#pair-pick").textContent = names.length ? desc + (names.length === 2 ? " → 먼저 고른 것이 앞면" : "") : "두 장을 고르세요. 먼저 고른 것이 앞면입니다.";
  $("#pair-btn").disabled = names.length !== 2;
}

// ---------- 재고 ----------
function renderStock() {
  const cards = state.inventory.cards;
  const q = ($("#stock-search").value || "").trim().toLowerCase();
  const artists = state.catalog.artists;
  const an = (id) => artists.find((a) => a.id === id)?.name || id;
  const list = cards.filter((c) => !q || [an(c.artistId), c.album, c.member, c.code, c.memo].join(" ").toLowerCase().includes(q));
  $("#stock-count").textContent = cards.length;
  const total = cards.reduce((n, c) => n + (Number(c.stock) || 0), 0);
  $("#stock-summary").innerHTML = `<span><b>${cards.length}</b>종</span><span><b>${total}</b>장</span><span><b>${cards.filter((c) => !Number(c.stock)).length}</b>종 재고 0</span><span><b>${new Set(cards.map((c) => c.artistId)).size}</b>가수</span>`;
  const groups = new Map();
  for (const c of list) { const k = `${c.artistId}|${c.album || ""}`; (groups.get(k) || groups.set(k, []).get(k)).push(c); }
  if (!list.length) { $("#stock-list").innerHTML = `<div class="empty">${cards.length ? "검색 결과가 없습니다." : "등록된 카드가 없습니다. 스캔 정리에서 등록하세요."}</div>`; return; }
  $("#stock-list").innerHTML = [...groups.entries()].map(([k, cs]) => {
    const [artistId, album] = k.split("|");
    return `<div class="group"><h2>${esc(an(artistId))} <small>${esc(album || "앨범 미정")} · ${cs.length}종 ${cs.reduce((n, c) => n + (Number(c.stock) || 0), 0)}장</small></h2>
      ${cs.sort((a, b) => a.no - b.no).map((c) => `<div class="stock-row ${Number(c.stock) ? "" : "zero"}" data-card="${esc(c.id)}">
        <img src="/api/image?src=card&id=${esc(c.id)}&face=front&size=160" data-full-card="${esc(c.id)}" data-face="front" />
        <img src="/api/image?src=card&id=${esc(c.id)}&face=back&size=160" data-full-card="${esc(c.id)}" data-face="back" />
        <div><div>#${esc(c.no)} ${esc(c.member || "")}</div><div class="code">${esc(c.code)}</div></div>
        <select name="artistId">${artistOptions(c.artistId).replace('<option value="">직접 입력 ↓</option>', "")}</select>
        <input name="member" value="${esc(c.member)}" placeholder="멤버" />
        <select name="version">${state.catalog.versions.map((v) => `<option value="${esc(v.id)}" ${c.version === v.id ? "selected" : ""}>${esc(v.label)}</option>`).join("")}</select>
        <select name="rarity">${state.catalog.rarities.map((r) => `<option ${c.rarity === r ? "selected" : ""}>${r}</option>`).join("")}</select>
        <div class="qty"><button class="btn small" data-delta="-1">−</button><input name="stock" type="number" min="0" value="${esc(c.stock)}" /><button class="btn small" data-delta="1">+</button></div>
        <input name="memo" value="${esc(c.memo || "")}" placeholder="메모" />
        <button class="btn small" data-act="delete">삭제</button>
      </div>`).join("")}</div>`;
  }).join("");
}

function render() { renderStatus(); renderScan(); renderStock(); }

// ---------- 이벤트 ----------
document.addEventListener("click", async (e) => {
  const tab = e.target.closest(".tab");
  if (tab) { document.querySelectorAll(".tab, .page").forEach((el) => el.classList.remove("is-on")); tab.classList.add("is-on"); $("#" + tab.dataset.tab).classList.add("is-on"); return; }
  const full = e.target.closest("[data-full]"); if (full) return lightbox(img(full.dataset.full, 0));
  const fullCard = e.target.closest("[data-full-card]"); if (fullCard) return lightbox(`/api/image?src=card&id=${fullCard.dataset.fullCard}&face=${fullCard.dataset.face}`);
  const th = e.target.closest("#unpaired .thumb");
  if (th) { const n = th.dataset.name; if (picked.has(n)) picked.delete(n); else { if (picked.size >= 2) picked.delete([...picked][0]); picked.add(n); } return renderScan(); }
  const cand = e.target.closest(".cand");
  if (cand) {
    const pairEl = cand.closest(".pair"); const pair = state.pairs.find((p) => p.id === pairEl.dataset.pair); const d = draftFor(pair);
    applyCand(d, pair.candidates[Number(cand.dataset.cand)], Number(cand.dataset.cand));
    return renderScan();
  }
  const addBtn = e.target.closest("[data-add-artist]");
  if (addBtn) {
    const pairEl = addBtn.closest(".pair"); const pair = state.pairs.find((p) => p.id === pairEl.dataset.pair);
    const a = lookups.get(pair.id)?.artists?.[Number(addBtn.dataset.addArtist)];
    try {
      const r = await api("/api/add-artist", a);
      const d = draftFor(pair); d.artistId = r.artist.id; d.cand = -1; d.member = "";
      await load();
    } catch (err) { alert(err.message); }
    return;
  }
  const act = e.target.closest("[data-act]");
  if (act) {
    const pairEl = act.closest(".pair"); const pair = pairEl && state.pairs.find((p) => p.id === pairEl.dataset.pair);
    const row = act.closest(".stock-row");
    try {
      if (act.dataset.act === "swap") await api("/api/swap", { id: pair.id, front: pair.front, back: pair.back });
      if (act.dataset.act === "unpair") await api("/api/unpair", { id: pair.id, front: pair.front, back: pair.back });
      if (act.dataset.act === "add-stock") { if (!confirm("같은 카드로 보고 재고를 1 올립니다. 이 스캔 두 장은 완료 처리됩니다.")) return; await api("/api/add-stock", { cardId: act.dataset.card, front: pair.front, back: pair.back }); }
      if (act.dataset.act === "delete" && row) { if (!confirm("이 카드를 재고에서 지웁니다. 스캔 원본은 남습니다.")) return; await api("/api/card", { id: row.dataset.card, delete: true }); }
      await load();
    } catch (err) { alert(err.message); }
    return;
  }
  const delta = e.target.closest("[data-delta]");
  if (delta) { const row = delta.closest(".stock-row"); try { await api("/api/card", { id: row.dataset.card, delta: Number(delta.dataset.delta) }); await load(); } catch (err) { alert(err.message); } }
});
document.addEventListener("dblclick", async (e) => {
  const d = e.target.closest("[data-done]");
  if (d && confirm(`${d.dataset.done} 의 등록 완료 표시를 지우고 다시 정리 목록에 올립니다. 등록된 카드는 재고 탭에서 따로 지우세요.`)) { await api("/api/undo-done", { names: [d.dataset.done] }); load(); }
});
document.addEventListener("change", async (e) => {
  const form = e.target.closest("form.reg");
  if (form) {
    const pair = state.pairs.find((p) => p.id === form.closest(".pair").dataset.pair); const d = draftFor(pair);
    d[e.target.name] = e.target.value;
    if (e.target.name === "artistId" || e.target.name === "kind") { if (e.target.name === "artistId") { d.member = ""; d.cand = -1; } renderScan(); }
    return;
  }
  const row = e.target.closest(".stock-row");
  if (row && e.target.name) { try { await api("/api/card", { id: row.dataset.card, [e.target.name]: e.target.value }); await load(); } catch (err) { alert(err.message); } }
});
document.addEventListener("submit", async (e) => {
  const lk = e.target.closest("form.lookup");
  if (lk) {
    e.preventDefault();
    const pair = state.pairs.find((p) => p.id === lk.closest(".pair").dataset.pair);
    const q = $("input", lk).value.trim();
    lookups.set(pair.id, { loading: true }); renderScan();
    try { lookups.set(pair.id, await api(`/api/lookup?q=${encodeURIComponent(q)}`)); }
    catch (err) { lookups.set(pair.id, { error: err.message }); }
    return renderScan();
  }
  const form = e.target.closest("form.reg"); if (!form) return;
  e.preventDefault();
  const pair = state.pairs.find((p) => p.id === form.closest(".pair").dataset.pair);
  const body = Object.fromEntries(new FormData(form).entries());
  const msg = $(".msg", form);
  try {
    const r = await api("/api/register", { ...body, front: pair.front, back: pair.back });
    msg.className = "msg ok"; msg.textContent = `등록됨 ${r.card.code}`;
    formDraft.delete(pair.id);
    await load();
  } catch (err) { msg.className = "msg err"; msg.textContent = err.message; }
});
$("#refresh").onclick = async () => { await api("/api/settings", { folder: $("#folder").value }); await api("/api/refresh"); load(); };
$("#folder").onchange = async () => { await api("/api/settings", { folder: $("#folder").value }); load(); };
$("#pick").onclick = async () => { const r = await api("/api/pick-folder", {}); if (r.ok) { await api("/api/refresh"); load(); } };
$("#open-folder").onclick = () => api("/api/open", { what: "folder" });
$("#open-data").onclick = () => api("/api/open", { what: "data" });
$("#pair-btn").onclick = async () => { const [front, back] = [...picked]; try { await api("/api/pair", { front, back }); picked.clear(); load(); } catch (err) { alert(err.message); } };
$("#export").onclick = async () => { try { const r = await api("/api/export", {}); alert(`내보냈습니다: ${r.packs}팩 ${r.cards}장\n${r.dir}`); } catch (err) { alert(err.message); } };
$("#stock-search").oninput = renderStock;
function lightbox(src) { let lb = $(".lightbox"); if (!lb) { lb = document.createElement("div"); lb.className = "lightbox"; lb.innerHTML = "<img />"; lb.onclick = () => lb.classList.remove("on"); document.body.appendChild(lb); } $("img", lb).src = src; lb.classList.add("on"); }
load();
