#!/bin/bash
set -e

echo "범위 검사: service/ 밖의 변경 사항 확인 중..."

# main 브랜치와 비교
CHANGED_FILES=$(git diff --name-only origin/main...HEAD)

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
