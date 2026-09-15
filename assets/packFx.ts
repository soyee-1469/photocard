export const fx = {
  packClosed: require('./fx/pack_closed.png'),
  packBodyTorn: require('./fx/pack_body_torn.png'),
  packTopTorn: require('./fx/pack_top_torn.png'),
  cardFront: require('./fx/card_front.png'),
  cardBack: require('./fx/card_back.png'),
  emberBurst: require('./fx/ember_burst.png'),
};

export const photoPool = [
  require('./photos/01.jpg'),
  require('./photos/02.jpg'),
  require('./photos/03.jpg'),
  require('./photos/04.jpg'),
  require('./photos/05.jpg'),
  require('./photos/06.jpg'),
  require('./photos/07.jpg'),
] as const;

export function pickPhoto() {
  return photoPool[Math.floor(Math.random() * photoPool.length)];
}
