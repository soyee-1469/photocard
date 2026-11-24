#!/usr/bin/env python3
"""재고조사표 스냅샷 + 스캔 폴더 → assets/photocards + service/shared/stock-catalog.js"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCAN = ROOT / "포토카드 스캔"
PC = ROOT / "assets" / "photocards"
SNAP = Path(__file__).resolve().parent / "_snapshots" / "stock-inventory.json"
OUT = ROOT / "service" / "shared" / "stock-catalog.js"
WEB_MAX_PX = 1000  # 상세·결과 화면용. 600dpi 원본은 저장소에 넣지 않는다.
COVERS = "/assets/covers"

# 재고표 `앨범/버전` 자유 텍스트 → 앨범/특전 유닛. 그룹별로 위에서부터 첫 매칭.
# eventType: album | pob | fansign | japan | unknown. badge/eventName은 손님에게 보이는 특전 표기.
UNIT_RULES = {
    "CORTIS": [
        ("스크래치 카드", dict(id="cortis-greengreen-scratch", name="GREENGREEN 스크래치 카드(미개봉)", eventType="album", badge="", eventName="", covers=[f"{COVERS}/CORTIS/01_CORTIS_GREENGREEN_cover.jpg"])),
        ("에버라인", dict(id="cortis-greengreen-everline-ld", name="GREENGREEN 럭키드로우 특전", eventType="pob", badge="럭키드로우", eventName="에버라인", covers=[])),
        ("사운드웨이브", dict(id="cortis-greengreen-soundwave-ld", name="GREENGREEN 럭키드로우 특전", eventType="pob", badge="럭키드로우", eventName="사운드웨이브", covers=[])),
        ("특전", dict(id="cortis-greengreen-pob", name="GREENGREEN 특전", eventType="pob", badge="특전", eventName="판매처 미확인", covers=[])),
        ("GREENGREEN", dict(id="cortis-greengreen", name="GREENGREEN", eventType="album", badge="", eventName="", covers=[f"{COVERS}/CORTIS/01_CORTIS_GREENGREEN_cover.jpg"])),
    ],
    "SEVENTEEN": [
        ("HAPPY BURSTDAY (정규5집) 특전", dict(id="seventeen-happy-burstday-pob", name="HAPPY BURSTDAY 특전", eventType="pob", badge="특전", eventName="판매처 미확인", covers=[])),
        ("HAPPY_BURSTDAY", dict(id="seventeen-happy-burstday", name="HAPPY BURSTDAY", eventType="album", badge="", eventName="", covers=[f"{COVERS}/SEVENTEEN/02_SEVENTEEN_HAPPY_BURSTDAY_cover.jpg"])),
        ("CARAT LAND", dict(id="seventeen-carat-land-2025", name="SEVENTEEN in CARAT LAND 2025", eventType="fansign", badge="팬미팅", eventName="", covers=[f"{COVERS}/SEVENTEEN/04_SEVENTEEN_CARAT_LAND_poster.jpg"])),
        ("WORLD TOUR [NEW_]", dict(id="seventeen-new-tour", name="WORLD TOUR [NEW]", eventType="album", badge="", eventName="", covers=[f"{COVERS}/SEVENTEEN/03_SEVENTEEN_NEW_poster.jpg"])),
    ],
    "TWICE": [
        ("IN INCHEON 특전", dict(id="twice-this-is-for-incheon-pob", name="THIS IS FOR WORLD TOUR IN INCHEON 특전", eventType="pob", badge="특전", eventName="팬즈샵", covers=[])),
        ("IN INCHEON", dict(id="twice-this-is-for-incheon", name="THIS IS FOR WORLD TOUR IN INCHEON", eventType="album", badge="", eventName="", covers=[f"{COVERS}/TWICE/06_TWICE_THIS_IS_FOR_TOUR_poster.jpg"])),
        ("위드뮤 예판 특전", dict(id="twice-this-is-for-withmuu-pob", name="THIS IS FOR 예판 특전", eventType="pob", badge="예판특전", eventName="위드뮤", covers=[])),
        ("THIS IS FOR", dict(id="twice-this-is-for", name="THIS IS FOR", eventType="album", badge="", eventName="", covers=[f"{COVERS}/TWICE/05_TWICE_THIS_IS_FOR_cover.jpg"])),
    ],
    "BLACKPINK": [
        ("GOYANG", dict(id="blackpink-deadline-goyang-md", name="DEADLINE WORLD TOUR IN GOYANG MD 특전", eventType="pob", badge="MD 특전", eventName="고양 콘서트", covers=[f"{COVERS}/BLACKPINK/08_BLACKPINK_DEADLINE_GOYANG_poster.jpg"])),
        ("드레스 전신", dict(id="blackpink-deadline-pob-dress", name="DEADLINE 특전 (드레스)", eventType="pob", badge="특전", eventName="판매처 미확인", covers=[])),
        ("시기 셀카", dict(id="blackpink-deadline-pob-selfie", name="DEADLINE 특전 (셀카)", eventType="pob", badge="특전", eventName="판매처 미확인", covers=[])),
        ("DEADLINE", dict(id="blackpink-deadline", name="DEADLINE", eventType="album", badge="", eventName="", covers=[f"{COVERS}/BLACKPINK/07_BLACKPINK_DEADLINE_cover.jpg"])),
    ],
    "BTS": [
        ("사운드웨이브 예판 특전", dict(id="bts-arirang-soundwave-pob", name="ARIRANG 예판 특전", eventType="pob", badge="예판특전", eventName="사운드웨이브", covers=[])),
        ("검정 뒷면", dict(id="bts-arirang-rooted-in-music", name="ARIRANG (Rooted in Music ver.)", eventType="album", badge="", eventName="", covers=[f"{COVERS}/BTS/09_BTS_ARIRANG_Rooted_in_Music_cover.jpg"])),
        ("흰 뒷면", dict(id="bts-arirang-gyeongbokgung", name="ARIRANG (경복궁 ver.)", eventType="album", badge="", eventName="", covers=[f"{COVERS}/BTS/09_BTS_ARIRANG_cover.jpg"])),
        ("VT x BTS", dict(id="bts-vt-collab", name="VT x BTS", eventType="unknown", badge="콜라보", eventName="VT코스메틱", covers=[])),
    ],
}


def clean_name(value) -> str:
    """손님에게 보이는 이름에서 확신도 표시('?', '(추정)')를 뺀다. 재고표 원문은 그대로 둔다."""
    text = str(value or "")
    text = re.sub(r"\s*\(추정\)", "", text)
    return text.replace("?", "").strip()


def unit_for(group: str, album_text: str, is_pob: bool) -> tuple[int, dict]:
    """시트 `구분`이 특전일 때만 특전(pob) 유닛에 매칭. 일반 행은 설명에 '특전'이 있어도 앨범 유닛으로."""
    for order, (needle, unit) in enumerate(UNIT_RULES.get(group, [])):
        if (unit["eventType"] == "pob") != is_pob:
            continue
        if needle in album_text:
            return order, unit
    return 99, dict(id=f"{group.lower()}-unknown", name=album_text or "미분류", eventType="unknown", badge="", eventName="", covers=[])

GROUP_META = {
    "CORTIS": dict(
        id="cortis-random",
        artistId="cortis",
        artist="CORTIS",
        groupPhoto="/assets/groups/CORTIS_group.jpg",
        sheets=50,
        kinds=21,
        price=3500,
        covers=["/assets/covers/CORTIS/01_CORTIS_GREENGREEN_cover.jpg"],
        extra=[],
    ),
    "SEVENTEEN": dict(
        id="seventeen-random",
        artistId="seventeen",
        artist="SEVENTEEN",
        groupPhoto="/assets/groups/SEVENTEEN_group.jpg",
        sheets=50,
        kinds=46,
        price=3900,
        covers=[
            "/assets/covers/SEVENTEEN/02_SEVENTEEN_HAPPY_BURSTDAY_cover.jpg",
            "/assets/covers/SEVENTEEN/03_SEVENTEEN_NEW_poster.jpg",
            "/assets/covers/SEVENTEEN/04_SEVENTEEN_CARAT_LAND_poster.jpg",
        ],
        extra=["/assets/covers/SEVENTEEN/03_SEVENTEEN_NEW_JAPAN_poster.jpg"],
    ),
    "TWICE": dict(
        id="twice-random",
        artistId="twice",
        artist="TWICE",
        groupPhoto="/assets/groups/TWICE_group.jpg",
        sheets=50,
        kinds=47,
        price=3300,
        covers=[
            "/assets/covers/TWICE/05_TWICE_THIS_IS_FOR_cover.jpg",
            "/assets/covers/TWICE/05_TWICE_THIS_IS_FOR_DELUXE_cover.jpg",
            "/assets/covers/TWICE/06_TWICE_THIS_IS_FOR_TOUR_poster.jpg",
        ],
        extra=[],
    ),
    "BLACKPINK": dict(
        id="blackpink-random",
        artistId="blackpink",
        artist="BLACKPINK",
        groupPhoto="/assets/groups/BLACKPINK_group.jpg",
        sheets=50,
        kinds=22,
        price=8900,
        covers=[
            "/assets/covers/BLACKPINK/07_BLACKPINK_DEADLINE_cover.jpg",
            "/assets/covers/BLACKPINK/07_BLACKPINK_DEADLINE_JENNIE_cover.jpg",
            "/assets/covers/BLACKPINK/08_BLACKPINK_DEADLINE_GOYANG_poster.jpg",
        ],
        extra=[
            "/assets/covers/BLACKPINK/07_BLACKPINK_DEADLINE_BLACK_cover.jpg",
            "/assets/covers/BLACKPINK/07_BLACKPINK_DEADLINE_JISOO_cover.jpg",
            "/assets/covers/BLACKPINK/07_BLACKPINK_DEADLINE_LISA_cover.jpg",
            "/assets/covers/BLACKPINK/07_BLACKPINK_DEADLINE_ROSE_cover.jpg",
        ],
    ),
    "BTS": dict(
        id="bts-random",
        artistId="bts",
        artist="BTS",
        groupPhoto="/assets/groups/BTS_group.jpg",
        sheets=50,
        kinds=25,
        price=4000,
        covers=[
            "/assets/covers/BTS/09_BTS_ARIRANG_Rooted_in_Korea_cover.jpg",
            "/assets/covers/BTS/09_BTS_ARIRANG_cover.jpg",
            "/assets/covers/BTS/09_BTS_ARIRANG_Living_Legend_cover.jpg",
        ],
        extra=["/assets/covers/BTS/09_BTS_ARIRANG_Rooted_in_Music_cover.jpg"],
    ),
}


def sync_assets(referenced: set[str]) -> None:
    """카탈로그가 가리키는 스캔만 웹용 크기로 줄여 assets/photocards에 둔다. 나머지는 지운다."""
    PC.mkdir(parents=True, exist_ok=True)
    for f in list(PC.iterdir()):
        if f.is_file() and f.name not in referenced:
            f.unlink()
    for name in sorted(referenced):
        src, dest = SCAN / name, PC / name
        if not src.exists() or dest.exists():
            continue
        subprocess.run(
            ["sips", "-Z", str(WEB_MAX_PX), "--setProperty", "formatOptions", "72", str(src), "--out", str(dest)],
            check=True, capture_output=True,
        )


def build_catalog() -> None:
    products = json.loads(SNAP.read_text(encoding="utf-8"))
    scan_files = {p.name for p in SCAN.glob("P*.jpg")}
    by_code: dict[str, dict] = {}
    for name in scan_files:
        m = re.match(r"(P\d{3})_", name)
        if not m:
            continue
        code = m.group(1)
        by_code.setdefault(code, {"fronts": [], "backs": []})
        if "_1앞" in name:
            by_code[code]["fronts"].append(name)
        elif "_2뒤" in name:
            by_code[code]["backs"].append(name)
    for code in by_code:
        by_code[code]["fronts"].sort()
        by_code[code]["backs"].sort()

    catalog_products = []
    for row in products:
        code = row["제품번호"]
        group = row["그룹"]
        qty = int(row["수량"] or 0)
        sheet_fronts = [x.strip() for x in (row.get("해당 스캔 앞면 파일들") or "").split(",") if x.strip()]
        discovered = by_code.get(code, {}).get("fronts", [])
        fronts = [f for f in sheet_fronts if f in scan_files] or discovered
        if not fronts:
            continue
        front = fronts[0]
        back = front.replace("_1앞.jpg", "_2뒤.jpg")
        if back not in scan_files:
            backs = by_code.get(code, {}).get("backs", [])
            back = backs[0] if backs else ""
        unit_order, unit = unit_for(group, row.get("앨범/버전") or "", (row.get("구분") or "") == "특전")
        catalog_products.append(
            {
                "unitOrder": unit_order,
                "unit": unit,
                "group": group,
                "member": clean_name(row.get("멤버")),
                "album": clean_name(row.get("앨범/버전")),
                "qty": qty,
                "front": front,
                "back": back,
                "stockFiles": fronts,
                "code": code,
            }
        )

    shelf_groups = []
    stock_products = []
    album_units = []
    referenced: set[str] = set()
    for group, meta in GROUP_META.items():
        # 특전(pob)은 랜덤 상품에서 뺀다(2026-11-24 결정). 나중에 별도 상품으로 더 비싸게 구성한다.
        # 유닛 목록(ALBUM_UNITS)에는 남겨 두어 그때 그대로 쓴다.
        group_cards = [c for c in catalog_products if c["group"] == group]
        cards = [c for c in group_cards if c["unit"]["eventType"] != "pob"]
        for c in group_cards:
            unit = c["unit"]
            if unit["eventType"] == "pob" and all(u["id"] != unit["id"] for u in album_units):
                album_units.append({"artistId": meta["artistId"], **unit, "cardCount": 0})
        # 상세 순서: 수록 앨범 → 팬미팅/기타 → 특전. 같은 종류면 이름순, 그 안에서 제품번호순.
        type_rank = {"album": 0, "fansign": 1, "japan": 1, "unknown": 1, "pob": 2}
        cards.sort(key=lambda c: (type_rank.get(c["unit"]["eventType"], 1), c["unit"]["name"], c["code"]))
        pack_cards = []
        unit_ids: list[str] = []
        unit_count: dict[str, int] = {}
        for i, c in enumerate(cards, 1):
            unit = c["unit"]
            if unit["id"] not in unit_ids:
                unit_ids.append(unit["id"])
                album_units.append({"artistId": meta["artistId"], **unit, "cardCount": 0})
            unit_count[unit["id"]] = unit_count.get(unit["id"], 0) + 1
            referenced.update(x for x in (c["front"], c["back"]) if x)
            pack_cards.append(
                {
                    "no": str(i).zfill(2),
                    "member": c["member"],
                    "front": c["front"],
                    "back": c["back"],
                    "rarity": "NORMAL",
                    "stock": c["qty"],
                    "unitId": unit["id"],
                    "album": unit["name"],  # 손님에게는 유닛 표시명(재고표 원문의 밑줄·괄호 없음)
                    "code": c["code"],
                    "stockFiles": c["stockFiles"],
                }
            )
        for u in album_units:
            if u["id"] in unit_count:
                u["cardCount"] = unit_count[u["id"]]
        shelf_groups.append(
            {
                "id": meta["id"],
                "artistId": meta["artistId"],
                "artist": meta["artist"],
                "sheets": meta["sheets"],
                "kinds": len(pack_cards),  # 특전 제외 종수. GROUP_META 값은 참고용.
                "price": meta["price"],
                "groupPhoto": meta["groupPhoto"],
                "covers": meta["covers"],
                "extra": meta["extra"],
            }
        )
        stock_products.append(
            {
                "id": meta["id"],
                "artist": meta["artist"],
                "artistId": meta["artistId"],
                "album": meta["artist"],
                "displayName": f"{meta['artist']} Photocard",
                "eventType": "album",
                "eventName": "",
                "cover": meta["covers"][0],
                "price": meta["price"],
                "home": True,
                "albumIds": unit_ids,
                "cards": pack_cards,
            }
        )

    def dumps(obj):
        return json.dumps(obj, ensure_ascii=False, indent=2)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "/* generated from 재고조사표 + 스캔 폴더. do not edit by hand */\n"
        "const SHELF_SLOT_COUNT = 3;\n"
        'const CARD_FRONT_FX = "/assets/fx/card_front.png";\n'
        'const CARD_BACK_FX = "/assets/fx/card_back.png";\n'
        f"const SHELF_GROUPS = {dumps(shelf_groups)};\n"
        "const SHELF_PRODUCT_IDS = new Set(SHELF_GROUPS.map((group) => group.id));\n"
        f"const ALBUM_UNITS = {dumps(album_units)};\n"
        f"const STOCK_PRODUCTS = {dumps(stock_products)};\n",
        encoding="utf-8",
    )
    sync_assets(referenced)
    print("assets", len(list(PC.glob("P*.jpg"))), "units", len(album_units), "cards", sum(len(p["cards"]) for p in stock_products), "->", OUT)


if __name__ == "__main__":
    build_catalog()
