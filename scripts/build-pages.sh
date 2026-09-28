#!/bin/bash
set -e

PR_NUM=$1

if [ -z "$PR_NUM" ]; then
  echo "사용법: bash scripts/build-pages.sh <PR번호>"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "PR #$PR_NUM 빌드 시작..."

# baseUrl 업데이트
TEMP_APP_JSON=$(mktemp)
cat service/app.json | jq ".expo.experiments.baseUrl = \"/photocard/service/pr-$PR_NUM\"" > "$TEMP_APP_JSON"
mv "$TEMP_APP_JSON" service/app.json

# 빌드
cd service
npx expo export --platform web

# gh-pages 브랜치로 전환
cd ..
git fetch origin gh-pages
git checkout gh-pages || git checkout -b gh-pages

# pr-N 디렉토리 업데이트
mkdir -p service/pr-$PR_NUM
cp -r service/dist/* service/pr-$PR_NUM/

# version.json 생성
CURRENT_SHA=$(git rev-parse HEAD)
echo "{\"sha\":\"$CURRENT_SHA\",\"pr\":$PR_NUM,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > service/pr-$PR_NUM/version.json

# 커밋 및 푸시
git add service/pr-$PR_NUM
git commit -m "deploy: PR #$PR_NUM 배포 ($CURRENT_SHA)" || echo "변경 사항 없음"
git push origin gh-pages

echo "✅ https://soyee-1469.github.io/photocard/service/pr-$PR_NUM/ 배포 완료"

# 원래 브랜치로 돌아가기
git checkout -
