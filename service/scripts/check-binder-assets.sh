#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "바인더 에셋 검사 시작..."

# 새로운 이미지 파일이 추가되었는지 확인
NEW_IMAGES=$(git diff --name-only --diff-filter=A origin/cursor/photocard-service-a-eaa7 | grep -E '\.(png|jpg|jpeg|webp|svg)$' || true)
if [ -n "$NEW_IMAGES" ]; then
  echo "❌ 새 이미지 파일 발견:"
  echo "$NEW_IMAGES"
  exit 1
fi

# card_front.png 참조가 있는지 확인
if git grep -q "card_front\.png" service/src/features/binder/ 2>/dev/null; then
  echo "❌ card_front.png 참조 발견"
  exit 1
fi

echo "✅ 바인더 에셋 검사 통과"
