#!/bin/bash
set -e

PR_NUMBER=${1:-"latest"}
BASE_URL="/photocard/service"

echo "GitHub Pages 배포 준비..."
echo "PR 번호: $PR_NUMBER"

# 웹 빌드
echo "웹 export 실행 중..."
npm run export

# gh-pages 브랜치 확인 또는 생성
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
  echo "gh-pages 브랜치 생성 중..."
  git checkout --orphan gh-pages
  git rm -rf .
  echo "# GitHub Pages for photocard service" > README.md
  git add README.md
  git commit -m "Initial gh-pages branch"
  git push origin gh-pages
  git checkout cursor/photocard-service-a-eaa7
fi

# 임시 디렉토리 생성
TEMP_DIR=$(mktemp -d)
echo "임시 디렉토리: $TEMP_DIR"

# gh-pages 브랜치 체크아웃
git worktree add "$TEMP_DIR" gh-pages

# 배포 디렉토리 생성
TARGET_DIR="$TEMP_DIR/service"
if [ "$PR_NUMBER" != "latest" ]; then
  TARGET_DIR="$TEMP_DIR/service/pr-$PR_NUMBER"
fi

mkdir -p "$TARGET_DIR"

# dist 내용 복사
echo "빌드 결과 복사 중..."
cp -r dist/* "$TARGET_DIR/"

# 404.html 생성 (SPA 새로고침 대응)
cp "$TARGET_DIR/index.html" "$TARGET_DIR/404.html"

# .nojekyll 추가 (gh-pages 루트에)
touch "$TEMP_DIR/.nojekyll"

# 커밋 및 푸시
cd "$TEMP_DIR"
git add .
if git diff --cached --quiet; then
  echo "변경 사항 없음"
else
  git commit -m "Deploy service PR-$PR_NUMBER"
  git push origin gh-pages
  echo "✅ 배포 완료!"
  if [ "$PR_NUMBER" != "latest" ]; then
    echo "URL: https://soyee-1469.github.io/photocard/service/pr-$PR_NUMBER/"
  else
    echo "URL: https://soyee-1469.github.io/photocard/service/"
  fi
fi

# 정리
cd -
git worktree remove "$TEMP_DIR"
rm -rf "$TEMP_DIR"

echo "참고: GitHub Pages 소스를 'gh-pages' 브랜치로 설정해야 합니다."
echo "저장소 Settings > Pages > Source > Branch: gh-pages"
