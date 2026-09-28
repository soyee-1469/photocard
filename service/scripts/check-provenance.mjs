#!/usr/bin/env node
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROVENANCE_PATH = resolve(process.cwd(), 'PROVENANCE.md');
const ROOT_PATH = resolve(process.cwd(), '..');
const SERVICE_PATH = process.cwd();

const files = [
  { service: 'src/theme/tokens.ts', root: 'theme.ts', 
    rootHash: '6af9703d2150b06f8af918f6deda6a3c0eb5c80f75e4fa38c6f59424efec7715',
    serviceHash: '6af9703d2150b06f8af918f6deda6a3c0eb5c80f75e4fa38c6f59424efec7715' },
  { service: 'src/vendor/PhotoCard.tsx', root: 'components/PhotoCard.tsx', 
    rootHash: 'b848d74df7d84532d2f99e39ea0910a2802716e9e841f455c11e2f9cacbd34c4',
    serviceHash: '6e17c04e5a9b6aab558c991ed711e10121ac5675e5c861acab8fa19c2ec38f68' },
  { service: 'src/vendor/EmberGlow.tsx', root: 'components/EmberGlow.tsx', 
    rootHash: '8b6bb5c5c9d31c88e1fab6c4f339fc032e2c16fab9af07e7effb317bb08ac0ee',
    serviceHash: 'd88282bf6dbb6e3f83833bbffd3d06fbcaed37da7dd147037342c1851de6b013' },
  { service: 'src/vendor/SparkField.tsx', root: 'components/SparkField.tsx', 
    rootHash: '4bcc1559e337e3b68d508e58801b080c1659d667a7122cad9557211bbf875085',
    serviceHash: '4bcc1559e337e3b68d508e58801b080c1659d667a7122cad9557211bbf875085' },
];

let driftDetected = false;

console.log('복사본 드리프트 검사 중...\n');

for (const file of files) {
  const rootPath = resolve(ROOT_PATH, file.root);
  const servicePath = resolve(SERVICE_PATH, file.service);
  
  // 원본 파일 체크
  try {
    const rootContent = readFileSync(rootPath);
    const rootHash = createHash('sha256').update(rootContent).digest('hex');
    
    if (rootHash !== file.rootHash) {
      console.error(`❌ 원본 드리프트: ${file.root}`);
      console.error(`   기록: ${file.rootHash.substring(0, 12)}...`);
      console.error(`   현재: ${rootHash.substring(0, 12)}...`);
      driftDetected = true;
    }
  } catch (err) {
    console.error(`❌ 오류: ${file.root} 원본 파일을 읽을 수 없습니다.`);
    driftDetected = true;
  }
  
  // 복사본 파일 체크
  try {
    const serviceContent = readFileSync(servicePath);
    const serviceHash = createHash('sha256').update(serviceContent).digest('hex');
    
    if (serviceHash !== file.serviceHash) {
      console.error(`❌ 복사본 드리프트: ${file.service}`);
      console.error(`   기록: ${file.serviceHash.substring(0, 12)}...`);
      console.error(`   현재: ${serviceHash.substring(0, 12)}...`);
      driftDetected = true;
    }
  } catch (err) {
    console.error(`❌ 오류: ${file.service} 복사본 파일을 읽을 수 없습니다.`);
    driftDetected = true;
  }
}

if (!driftDetected) {
  console.log('✅ 모든 원본과 복사본이 기록된 해시와 일치합니다.');
  process.exit(0);
} else {
  console.log('\n⚠️  드리프트가 감지되었습니다. PROVENANCE.md를 검토하세요.');
  process.exit(1);
}
