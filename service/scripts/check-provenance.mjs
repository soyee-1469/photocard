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
  // 사진 에셋
  { service: 'assets/photos/01.jpg', root: null, serviceHash: 'fe324faa5788cb141efdaf1fd5f9b5534aea85004543ab66b6d57f1c135fd67a' },
  { service: 'assets/photos/02.jpg', root: null, serviceHash: 'e675e221d9822cd4145381f695000ff07d1916cba06b8926bdbc4ec251adc93b' },
  { service: 'assets/photos/03.jpg', root: null, serviceHash: 'f3906e344ba35d4e88d98643aaaaa64ad6fc4b8255308fcb3802e232ec986624' },
  { service: 'assets/photos/04.jpg', root: null, serviceHash: '5733f521948b17ad43238a39b0ac9d17e225395f92932c6c1320855fcec702c7' },
  { service: 'assets/photos/05.jpg', root: null, serviceHash: '64670e3befe95b7d2fb136f4a5e62b097b229f6fb96290aee4071d512e9bcbb0' },
  { service: 'assets/photos/06.jpg', root: null, serviceHash: '46b9fcc168a8e5f07b6bf7a94cbc4b90d44c003c5b8fe740553257b375f82685' },
  { service: 'assets/photos/07.jpg', root: null, serviceHash: 'd67691d9b24d3ba07e6a5e825718f6b9eaf55515c9b7983163f73c8d40df1435' },
  // FX 에셋
  { service: 'assets/fx/card_back.png', root: null, serviceHash: '5b5f41a0bfe4bd3548bd84822016116123c130436a844c2d64c06bb9132d40fa' },
  { service: 'assets/fx/card_front.png', root: null, serviceHash: '4427fe2634cc734dda7b7617df10de3c98fc93a5e2287b2a31381b2a24f8d6da' },
  { service: 'assets/fx/ember_burst.png', root: null, serviceHash: '224d9b7f2c91300a8ae216d7f22786776ffa796f3fac9b095ecea87c2e6f0455' },
  { service: 'assets/fx/inner_glow.png', root: null, serviceHash: '0788a5d322f12da138da4574c6b7928c2ab0e9cd9def0b6c1de8d2e9c04bd941' },
  { service: 'assets/fx/light_flash.png', root: null, serviceHash: '637a946ac11d5c90fce7ebd6541e84633266b9021ef0dec2821ec470ab81714b' },
  { service: 'assets/fx/pack_body_torn.png', root: null, serviceHash: '524df31234474e9ced258a8ce0d35c8b69464084754942275b364e3fee5c9b65' },
  { service: 'assets/fx/pack_closed.png', root: null, serviceHash: '740010a9bd1dedd99277307f045015f517383785eb70d13aee1fbe342b9c7771' },
  { service: 'assets/fx/pack_top_2.png', root: null, serviceHash: 'c91672c89b448f6cbd3a499fe196ebbd1229c948feee0de80dfe9d36e3165053' },
  { service: 'assets/fx/pack_top_3.png', root: null, serviceHash: 'f73d8f9b2fdf4e175d8c8a521592c36d28568f022710460a1a041301a3a96d85' },
  { service: 'assets/fx/pack_top_4.png', root: null, serviceHash: 'b79ef3a3d0a729bd0ec763180a8ca521a5671baf0803b2ebfc198fa310535c09' },
  { service: 'assets/fx/particles.png', root: null, serviceHash: 'd1434ed2bba464002cfb960a1ccb2738f95654986daa3534dd500eee087864e9' },
  { service: 'assets/fx/ring_effect.png', root: null, serviceHash: '43ef72e1df3728eb0e16454bfd9e4a4af6c30ca7740f766177ef754679ff0edf' },
  { service: 'assets/fx/sparkles.png', root: null, serviceHash: 'df7cea37cf8be64d43897763bab6f457475a7eb0800b4ff3698bb1113ece6ded' },
  { service: 'assets/fx/sparkle_trail.png', root: null, serviceHash: '3d2cee31ac2b3299a3d13b35ec9860a236fbcf423166b4166aef58c2fc6f02bc' },
];

let driftDetected = false;

console.log('복사본 드리프트 검사 중...\n');

for (const file of files) {
  // 원본이 없는 경우 (사진/FX 에셋) 복사본만 체크
  if (!file.root) {
    const servicePath = resolve(SERVICE_PATH, file.service);
    try {
      const serviceContent = readFileSync(servicePath);
      const serviceHash = createHash('sha256').update(serviceContent).digest('hex');

      if (serviceHash !== file.serviceHash) {
        console.error(`❌ 에셋 변조: ${file.service}`);
        console.error(`   기록: ${file.serviceHash.substring(0, 12)}...`);
        console.error(`   현재: ${serviceHash.substring(0, 12)}...`);
        driftDetected = true;
      }
    } catch (err) {
      console.error(`❌ 오류: ${file.service} 에셋 파일을 읽을 수 없습니다.`);
      driftDetected = true;
    }
    continue;
  }

  const rootPath = resolve(ROOT_PATH, file.root);
  const servicePath = resolve(SERVICE_PATH, file.service);

  // 원본 파일 체크
  try {
    const rootPath = resolve(ROOT_PATH, file.root);
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
