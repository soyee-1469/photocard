import { type CardDef } from '../services/api/types';
import { type FrameId, type RarityId } from '../theme/tokens';

const photos = [
  require('../../assets/photos/01.jpg'),
  require('../../assets/photos/02.jpg'),
  require('../../assets/photos/03.jpg'),
  require('../../assets/photos/04.jpg'),
  require('../../assets/photos/05.jpg'),
  require('../../assets/photos/06.jpg'),
  require('../../assets/photos/07.jpg'),
];

const cardBack = require('../../assets/fx/card_back.png');

const frames: FrameId[] = ['ivory', 'noir', 'rose', 'lilac'];
const rarities: RarityId[] = ['common', 'common', 'common', 'common', 'common', 'rare', 'rare', 'rare', 'epic', 'legend'];

function generateCards(productId: string, albumId: string, artistId: string, count: number, startNum: number = 1): CardDef[] {
  const cards: CardDef[] = [];
  for (let i = 0; i < count; i++) {
    const num = startNum + i;
    cards.push({
      id: `${productId}-card-${num}`,
      productId,
      artistId,
      albumId,
      number: num,
      title: `No.${num}`,
      rarity: rarities[i % rarities.length],
      front: photos[i % photos.length],
      back: cardBack,
      frameId: frames[i % frames.length],
    });
  }
  return cards;
}

export const cards: CardDef[] = [
  ...generateCards('prod-01', 'album-a1', 'artist-a', 10, 1),
  ...generateCards('prod-02', 'album-a2', 'artist-a', 10, 1),
  ...generateCards('prod-03', 'album-b1', 'artist-b', 12, 1),
  ...generateCards('prod-04', 'album-c1', 'artist-c', 8, 1),
  ...generateCards('prod-05', 'album-c2', 'artist-c', 10, 1),
  ...generateCards('prod-06', 'album-d1', 'artist-d', 10, 1),
  ...generateCards('prod-07', 'album-a1', 'artist-a', 2, 11),
  ...generateCards('prod-08', 'album-b1', 'artist-b', 2, 13),
];

export function getCardById(id: string): CardDef | undefined {
  return cards.find((c) => c.id === id);
}

export function getCardsByProduct(productId: string): CardDef[] {
  return cards.filter((c) => c.productId === productId);
}

export function getCardsByArtist(artistId: string): CardDef[] {
  return cards.filter((c) => c.artistId === artistId);
}
