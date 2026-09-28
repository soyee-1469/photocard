#!/usr/bin/env node
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROVENANCE_PATH = resolve(process.cwd(), 'PROVENANCE.md');
const ROOT_PATH = resolve(process.cwd(), '..');

const files = [
  { service: 'src/theme/tokens.ts', root: 'theme.ts', hash: '6af9703d2150b06f8af918f6deda6a3c0eb5c80f75e4fa38c6f59424efec7715' },
  { service: 'src/vendor/PhotoCard.tsx', root: 'components/PhotoCard.tsx', hash: 'b848d74df7d84532d2f99e39ea0910a2802716e9e841f455c11e2f9cacbd34c4' },
  { service: 'src/vendor/EmberGlow.tsx', root: 'components/EmberGlow.tsx', hash: '8b6bb5c5c9d31c88e1fab6c4f339fc032e2c16fab9af07e7effb317bb08ac0ee' },
  { service: 'src/vendor/SparkField.tsx', root: 'components/SparkField.tsx', hash: '4bcc1559e337e3b68d508e58801b080c1659d667a7122cad9557211bbf875085' },
];

let driftDetected = false;

for (const file of files) {
  const rootPath = resolve(ROOT_PATH, file.root);
  try {
    const content = readFileSync(rootPath);
    const currentHash = createHash('sha256').update(content).digest('hex');
    
    if (currentHash !== file.hash) {
      console.warn(`⚠️  드리프트 감지: ${file.root}`);
      console.warn(`   기록: ${file.hash.substring(0, 12)}...`);
      console.warn(`   현재: ${currentHash.substring(0, 12)}...`);
      driftDetected = true;
    }
  } catch (err) {
    console.error(`❌ 오류: ${file.root} 파일을 읽을 수 없습니다.`);
    driftDetected = true;
  }
}

if (!driftDetected) {
  console.log('✅ 모든 복사본이 원본과 일치합니다.');
} else {
  console.log('\n⚠️  일부 원본 파일이 변경되었습니다. PROVENANCE.md를 검토하세요.');
}

process.exit(0);
