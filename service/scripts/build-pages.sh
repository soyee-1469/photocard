#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "사용법: $0 <PR 번호>"
  echo "예: $0 7"
  exit 1
fi

PR_NUM="$1"
TARGET_DIR="service/pr-${PR_NUM}"
BASE_URL="/photocard/service/pr-${PR_NUM}"

echo "PR-${PR_NUM} 배포 준비 중..."
echo "baseUrl: ${BASE_URL}"

# app.json 백업 및 baseUrl 주입
cp app.json app.json.backup
node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('app.json', 'utf8'));
config.expo.experiments = config.expo.experiments || {};
config.expo.experiments.baseUrl = '${BASE_URL}';
fs.writeFileSync('app.json', JSON.stringify(config, null, 2));
"

# 웹 빌드
echo "웹 빌드 실행 중..."
npm run export

# 커밋 SHA를 version.json에 저장
COMMIT_SHA=$(git rev-parse HEAD)
echo "{\"commit\":\"$COMMIT_SHA\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > dist/version.json
echo "버전 정보 저장: $COMMIT_SHA"

# app.json 복원
mv app.json.backup app.json

# 404.html을 dist에 복사
if [ -f "public/404.html" ]; then
  # 404.html의 baseUrl도 치환
  sed "s|const baseUrl = '/photocard/service';|const baseUrl = '${BASE_URL}';|" public/404.html > dist/404.html
  echo "404.html 복사 완료 (baseUrl: ${BASE_URL})"
fi

# .nojekyll 추가
touch dist/.nojekyll

# worktree로 gh-pages 브랜치 처리
TEMP_DIR=$(mktemp -d)
echo "임시 디렉토리: ${TEMP_DIR}"

git worktree add "${TEMP_DIR}" gh-pages 2>/dev/null || git worktree add -B gh-pages "${TEMP_DIR}" origin/gh-pages

# 기존 PR 디렉토리 제거 후 새로 복사
rm -rf "${TEMP_DIR}/${TARGET_DIR}"
mkdir -p "${TEMP_DIR}/${TARGET_DIR}"
cp -r dist/* "${TEMP_DIR}/${TARGET_DIR}/"

cd "${TEMP_DIR}"

git add -A
if git diff --cached --quiet; then
  echo "변경 사항 없음"
else
  git commit -m "Deploy service PR-${PR_NUM}"
  git push origin gh-pages
  echo "✅ GitHub Pages 배포 완료: ${TARGET_DIR}"
fi

cd -
git worktree remove "${TEMP_DIR}" --force 2>/dev/null || rm -rf "${TEMP_DIR}"

echo ""
echo "참고: GitHub Pages 소스를 'gh-pages' 브랜치로 설정해야 합니다."
echo "저장소 Settings > Pages > Source > Branch: gh-pages"
echo ""
echo "배포 URL: https://soyee-1469.github.io${BASE_URL}/"
