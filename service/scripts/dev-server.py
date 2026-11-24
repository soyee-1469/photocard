#!/usr/bin/env python3
"""로컬 미리보기용 정적 서버. HTML/JS/CSS는 캐시하지 않는다 (모바일 사파리 대비)."""
from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]  # photocard/


class NoCacheHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **getattr(SimpleHTTPRequestHandler, "extensions_map", {}),
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".css": "text/css",
        ".webp": "image/webp",
        ".json": "application/json",
    }

    def end_headers(self) -> None:
        path = (self.path or "").split("?", 1)[0].lower()
        if path.endswith((".html", "/", ".js", ".css", ".json")) or path.endswith("/app") or path.endswith("/app/"):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        else:
            self.send_header("Cache-Control", "public, max-age=60")
        super().end_headers()

    def log_message(self, fmt: str, *args) -> None:
        # 짧게
        print("%s - %s" % (self.address_string(), fmt % args))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    handler = partial(NoCacheHandler, directory=str(ROOT))
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"serving {ROOT} on http://{args.host}:{args.port}/  (no-cache html/js/css)")
    print(f"phone: http://<lan-ip>:{args.port}/service/app/?v=431")
    server.serve_forever()


if __name__ == "__main__":
    main()
