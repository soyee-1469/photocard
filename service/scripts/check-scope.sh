#!/bin/bash
set -e

echo "범위 검사: service/ 밖의 변경 사항 확인 중..."

# base 브랜치 결정: 인자가 있으면 사용, 없으면 origin/main과의 merge-base
if [ -n "$1" ]; then
  BASE="$1"
else
  # detached HEAD에서도 동작하도록 merge-base 사용
  BASE=$(git merge-base HEAD origin/main 2>/dev/null || echo "origin/main")
fi

# 현재 브랜치와 base 비교
CHANGED_FILES=$(git diff --name-only "$BASE" HEAD 2>/dev/null || git diff --name-only origin/main HEAD)

if [ -z "$CHANGED_FILES" ]; then
  echo "✅ 통과: 변경 사항이 없습니다."
  exit 0
fi

# service/ 밖의 변경 사항 필터링
OUTSIDE_CHANGES=$(echo "$CHANGED_FILES" | grep -v "^service/" || true)

if [ -z "$OUTSIDE_CHANGES" ]; then
  echo "✅ 통과: 모든 변경 사항이 service/ 내부에 있습니다."
  exit 0
else
  echo "❌ 실패: service/ 밖에 변경 사항이 있습니다:"
  echo "$OUTSIDE_CHANGES"
  exit 1
fi
