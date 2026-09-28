const artists = [
  { id: "a", name: "ARTIST A", color: "#3A3124", collections: 4 },
  { id: "b", name: "ARTIST B", color: "#243044", collections: 2 },
  { id: "c", name: "ARTIST C", color: "#3A2430", collections: 3 },
  { id: "d", name: "ARTIST D", color: "#24362C", collections: 2 },
];

const products = [
  { id: "summer", artistId: "a", title: "Random Photo Card", collection: "SUMMER COLLECTION", album: "ALBUM 01", price: 10, total: 20, rarity: { Normal: 12, Rare: 5, Epic: 2, Legendary: 1 }, isNew: true, popular: true },
  { id: "special", artistId: "a", title: "Special Edition", collection: "2026 SPECIAL", album: "SPECIAL", price: 20, total: 12, rarity: { Normal: 6, Rare: 3, Epic: 2, Legendary: 1 }, isNew: true, popular: false },
  { id: "album-01", artistId: "b", title: "Random Photo Card", collection: "ALBUM 01", album: "ALBUM 01", price: 10, total: 16, rarity: { Normal: 10, Rare: 4, Epic: 1, Legendary: 1 }, isNew: true, popular: true },
  { id: "album-02", artistId: "b", title: "Random Photo Card", collection: "ALBUM 02", album: "ALBUM 02", price: 15, total: 16, rarity: { Normal: 9, Rare: 4, Epic: 2, Legendary: 1 }, isNew: false, popular: true },
  { id: "night", artistId: "c", title: "Random Photo Card", collection: "NIGHT COLLECTION", album: "ALBUM 01", price: 15, total: 18, rarity: { Normal: 11, Rare: 4, Epic: 2, Legendary: 1 }, isNew: false, popular: true },
  { id: "film", artistId: "d", title: "Random Photo Card", collection: "FILM CUT", album: "SPECIAL", price: 10, total: 14, rarity: { Normal: 8, Rare: 4, Epic: 1, Legendary: 1 }, isNew: true, popular: false },
];

const owned = 12;
let balance = 52000;
let albumFilter = "전체";

const app = document.querySelector("#app");

function artist(id) {
  return artists.find((item) => item.id === id);
}

function product(id) {
  return products.find((item) => item.id === id);
}

function card(item) {
  return `<button class="product" data-go="#/product/${item.id}">
    <img src="images/pack.png" alt="" />
    <p>${item.collection}</p>
    <strong>${item.title}</strong>
    <b>${item.price} TOTT</b>
  </button>`;
}

function grid(items) {
  return `<div class="grid">${items.map(card).join("")}</div>`;
}

function home() {
  const fresh = products.filter((item) => item.isNew);
  const popular = products.filter((item) => item.popular);
  return `<header class="top"><h1>포토카드</h1>
    <button class="icon" data-note="검색은 다음 단계에서 연결됩니다">⌕</button>
    <button class="icon" data-note="마이 앨범은 다음 PR에서 공개 미리보기에 연결됩니다">▣</button></header>
    <main class="page">
      <section class="hero">
        <img src="images/pack.png" alt="" />
        <div><div class="kicker">NEW COLLECTION</div><strong>2026 SPECIAL PHOTO CARD</strong><div>기간 한정 컬렉션</div></div>
      </section>
      <h2>아티스트</h2>
      <div class="row">${artists.map((item) => `<button class="artist" style="background:${item.color}" data-go="#/artist/${item.id}"><strong>${item.name}</strong><small>${item.collections} Collections</small></button>`).join("")}</div>
      <h2>신규 포토카드</h2>
      ${grid(fresh)}
      <h2>인기 컬렉션</h2>
      ${grid(popular)}
      <button class="album" data-note="마이 앨범은 다음 PR에서 연결됩니다"><span><strong>마이 앨범</strong><br><small class="muted">보유한 포토카드</small></span><span>보유 ${owned}장</span></button>
    </main>`;
}

function artistPage(id) {
  const person = artist(id);
  if (!person) return home();
  const mine = products.filter((item) => item.artistId === id);
  const albums = ["전체", ...new Set(mine.map((item) => item.album))];
  const visible = mine.filter((item) => albumFilter === "전체" || item.album === albumFilter);
  return `<header class="top"><button class="icon" data-go="#/">←</button><h1>${person.name}</h1></header>
    <main class="page">
      <div class="chips">${albums.map((name) => `<button class="chip ${name === albumFilter ? "on" : ""}" data-album="${name}">${name}</button>`).join("")}</div>
      ${grid(visible)}
    </main>`;
}

function detail(id) {
  const item = product(id);
  if (!item) return home();
  const person = artist(item.artistId);
  const rows = Object.entries(item.rarity).map(([name, count]) => `<div>${name} ${count}</div>`).join("");
  const disabled = balance < item.price ? "disabled" : "";
  return `<header class="top"><button class="icon" data-go="#/artist/${item.artistId}">←</button><h1></h1></header>
    <main class="page">
      <img class="detail-photo" src="images/pack.png" alt="" />
      <p class="kicker">${person.name}</p>
      <h2 style="margin-top:6px">${item.collection}</h2>
      <div>${item.title}</div>
      <p class="muted">랜덤 포토카드 1장</p>
      <p>총 카드 수 ${item.total}종</p>
      <p class="muted">등급</p>
      ${rows}
      <p class="price">${item.price} TOTT</p>
      <p class="muted">보유 ${balance} TOTT</p>
    </main>
    <div class="bar"><button data-buy="${item.id}" ${disabled}>${item.price} TOTT · 1장 뽑기</button></div>
    <div id="sheet" class="sheet hidden"><article>
      <h2 style="margin-top:0">랜덤 포토카드 1장을 구매하시겠어요?</h2>
      <p>${item.collection}</p>
      <p class="price">${item.price} TOTT</p>
      <p class="muted">보유 ${balance} TOTT</p>
      <p class="muted">구매 후 ${balance - item.price} TOTT</p>
      <div class="actions">
        <button class="ghost" data-close>취소</button>
        <button class="buy" data-confirm="${item.id}">구매하기</button>
      </div>
    </article></div>`;
}

function render() {
  const hash = location.hash || "#/";
  const [, route, id] = hash.split("/");
  if (route === "artist" && id) app.innerHTML = artistPage(id);
  else if (route === "product" && id) app.innerHTML = detail(id);
  else {
    albumFilter = "전체";
    app.innerHTML = home();
  }
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-go], [data-album], [data-buy], [data-close], [data-confirm], [data-note]");
  if (!target) return;
  if (target.dataset.go) location.hash = target.dataset.go.slice(1);
  if (target.dataset.album) {
    albumFilter = target.dataset.album;
    render();
  }
  if (target.dataset.note) window.alert(target.dataset.note);
  if (target.dataset.buy) document.querySelector("#sheet").classList.remove("hidden");
  if (target.dataset.close) document.querySelector("#sheet").classList.add("hidden");
  if (target.dataset.confirm) {
    const item = product(target.dataset.confirm);
    balance -= item.price;
    window.alert("구매가 확정됐습니다. 카드 오픈 연출은 다음 PR에서 연결됩니다.");
    location.hash = "#/";
  }
});

window.addEventListener("hashchange", render);
render();
