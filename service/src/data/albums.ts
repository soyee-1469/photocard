import { type Album } from '../services/api/types';

export const albums: Album[] = [
  {
    id: 'album-a1',
    artistId: 'artist-a',
    title: 'ALBUM ONE',
    releasedAt: '2026-09-01',
    cover: require('../../assets/photos/01.jpg'),
  },
  {
    id: 'album-a2',
    artistId: 'artist-a',
    title: 'ALBUM TWO',
    releasedAt: '2026-08-15',
    cover: require('../../assets/photos/02.jpg'),
  },
  {
    id: 'album-b1',
    artistId: 'artist-b',
    title: 'SPECIAL EDITION',
    releasedAt: '2026-09-10',
    cover: require('../../assets/photos/03.jpg'),
  },
  {
    id: 'album-c1',
    artistId: 'artist-c',
    title: 'DEBUT ALBUM',
    releasedAt: '2026-07-20',
    cover: require('../../assets/photos/04.jpg'),
  },
  {
    id: 'album-c2',
    artistId: 'artist-c',
    title: 'SECOND CHAPTER',
    releasedAt: '2026-08-25',
    cover: require('../../assets/photos/05.jpg'),
  },
  {
    id: 'album-d1',
    artistId: 'artist-d',
    title: 'LIMITED COLLECTION',
    releasedAt: '2026-09-15',
    cover: require('../../assets/photos/06.jpg'),
  },
];
