import { type Banner } from '../services/api/types';

export const banners: Banner[] = [
  {
    id: 'banner-01',
    image: require('../../assets/photos/01.jpg'),
    title: '신규 출시 - ARTIST A 포토카드팩',
    action: { type: 'product', productId: 'prod-01' },
  },
  {
    id: 'banner-02',
    image: require('../../assets/photos/03.jpg'),
    title: 'ARTIST B 스페셜 에디션 한정 판매',
    action: { type: 'product', productId: 'prod-03' },
  },
  {
    id: 'banner-03',
    image: require('../../assets/photos/06.jpg'),
    title: '포토카드 이용 안내',
    action: { type: 'guide' },
  },
];
