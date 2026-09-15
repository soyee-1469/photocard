import { Animated, Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { PhotoCard } from './PhotoCard';
import { EmberGlow } from './EmberGlow';
import { fx } from '../assets/packFx';
import { CARD_RATIO, type RarityId } from '../theme';

const PACK_W = 248;
const CLOSED_H = Math.round((PACK_W * 525) / 340);
const BODY_H = Math.round((PACK_W * 390) / 340);
const TOP_H = Math.round((PACK_W * 140) / 340);
const CLOSED_BOTTOM_PAD = Math.round((CLOSED_H * 17) / 525);
const BODY_BOTTOM_PAD = Math.round((BODY_H * 9) / 390);
const BODY_TOP_PAD = Math.round((BODY_H * 11) / 390);
const TOP_BOTTOM_PAD = Math.round((TOP_H * 12) / 140);
const STAGE_W = 340;
const STAGE_H = CLOSED_H + 48;
const PACK_LEFT = (STAGE_W - PACK_W) / 2;
const PACK_TOP = Math.round((STAGE_H - CLOSED_H) / 2);
const BODY_TOP = PACK_TOP + CLOSED_H - CLOSED_BOTTOM_PAD - BODY_H + BODY_BOTTOM_PAD;
const TOP_TOP = BODY_TOP + BODY_TOP_PAD - TOP_H + TOP_BOTTOM_PAD;
const CARD_W = 240;
const CARD_H = CARD_W / CARD_RATIO;
const SLEEVE_W = 188;
const SLEEVE_H = SLEEVE_W / CARD_RATIO;

const TEAR = 450;
const LAUNCH = 1750;
const PEAK = 2120;
const RISE = 2220;
const LAND = 2720;
const FLIP = 3080;
export const CINEMATIC_MS = 4200;
const END = CINEMATIC_MS;

type PackCinematicProps = {
  clock: Animated.Value;
  imageSource: ImageSourcePropType | null;
  rarity: RarityId;
  revealed: boolean;
};

export function PackCinematic({ clock, imageSource, rarity, revealed }: PackCinematicProps) {

  const shake = clock.interpolate({
    inputRange: [0, 90, 200, 320, 430, END],
    outputRange: ['0deg', '0.7deg', '-0.6deg', '0.35deg', '0deg', '0deg'],
  });

  const closedOpacity = clock.interpolate({
    inputRange: [0, TEAR - 1, TEAR, END],
    outputRange: [1, 1, 0, 0],
  });
  const tornOpacity = clock.interpolate({
    inputRange: [0, TEAR - 1, TEAR, END],
    outputRange: [0, 0, 1, 1],
  });

  const topOpacity = clock.interpolate({
    inputRange: [0, TEAR - 1, TEAR, LAUNCH, PEAK, END],
    outputRange: [0, 0, 1, 1, 0, 0],
  });
  const topOpen = clock.interpolate({
    inputRange: [0, TEAR, TEAR + 520, END],
    outputRange: ['0deg', '0deg', '180deg', '180deg'],
  });

  const emberOp = clock.interpolate({
    inputRange: [0, TEAR - 1, TEAR + 80, LAUNCH, PEAK, END],
    outputRange: [0, 0, 1, 1, 0.15, 0],
  });

  const sleeveOp = clock.interpolate({
    inputRange: [0, LAUNCH, PEAK - 40, PEAK, END],
    outputRange: [1, 1, 0.4, 0, 0],
  });
  const sleeveY = clock.interpolate({
    inputRange: [0, LAUNCH, PEAK, END],
    outputRange: [0, 0, -250, -250],
  });

  const cardOp = clock.interpolate({
    inputRange: [0, RISE - 1, RISE, LAND, END],
    outputRange: [0, 0, 1, 1, 1],
  });
  const cardY = clock.interpolate({
    inputRange: [0, RISE, LAND, END],
    outputRange: [260, 260, 0, 0],
  });
  const cardScale = clock.interpolate({
    inputRange: [0, RISE, LAND, END],
    outputRange: [0.92, 0.92, 1, 1],
  });

  const flipScaleX = clock.interpolate({
    inputRange: [0, FLIP, FLIP + 170, FLIP + 200, FLIP + 430, END],
    outputRange: [1, 1, 0.08, 0.08, 1, 1],
  });
  const backOp = clock.interpolate({
    inputRange: [0, FLIP + 180, FLIP + 200, END],
    outputRange: [1, 1, 0, 0],
  });
  const frontOp = clock.interpolate({
    inputRange: [0, FLIP + 180, FLIP + 200, END],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <Animated.View style={[styles.stage, { transform: [{ rotate: shake }] }]}>
      <Animated.View style={styles.emberSlot}>
        <EmberGlow strength={emberOp} />
      </Animated.View>

      <Animated.View style={[styles.sleeve, { opacity: sleeveOp, transform: [{ translateY: sleeveY }] }]}>
        <Image source={fx.cardBack} style={styles.sleeveImg} resizeMode="contain" />
      </Animated.View>

      <Animated.Image
        source={fx.packClosed}
        resizeMode="contain"
        style={[styles.packArt, { opacity: closedOpacity }]}
      />

      <Animated.View style={[styles.body, { opacity: tornOpacity }]}>
        <Image source={fx.packBodyTorn} style={styles.packFill} resizeMode="contain" />
      </Animated.View>

      <Animated.View
        style={[
          styles.top,
          {
            opacity: topOpacity,
            transform: [{ perspective: 900 }, { rotateY: topOpen }],
          },
        ]}
      >
        <Image source={fx.packTopTorn} style={styles.topImg} resizeMode="contain" />
      </Animated.View>

      <Animated.View
        style={[
          styles.cardSlot,
          {
            opacity: cardOp,
            transform: [{ translateY: cardY }, { scale: cardScale }],
          },
        ]}
      >
        <Animated.View style={[styles.flipBox, { transform: [{ scaleX: flipScaleX }] }]}>
          <Animated.View style={[styles.face, { opacity: backOp }]}>
            <Image source={fx.cardBack} style={styles.faceImg} resizeMode="contain" />
          </Animated.View>
          <Animated.View style={[styles.face, { opacity: frontOp }]}>
            {imageSource ? (
              <PhotoCard
                imageSource={imageSource}
                frameId={rarity === 'legend' ? 'noir' : rarity === 'epic' ? 'lilac' : 'ivory'}
                caption=""
                width={CARD_W}
                interactive={revealed}
                rarity={rarity}
              />
            ) : (
              <Image source={fx.cardFront} style={styles.faceImg} resizeMode="contain" />
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

export const packStageSize = { width: STAGE_W, height: STAGE_H };

const styles = StyleSheet.create({
  stage: {
    width: STAGE_W,
    height: STAGE_H,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  packArt: {
    position: 'absolute',
    left: PACK_LEFT,
    top: PACK_TOP,
    width: PACK_W,
    height: CLOSED_H,
    zIndex: 4,
  },
  body: {
    position: 'absolute',
    left: PACK_LEFT,
    top: BODY_TOP,
    width: PACK_W,
    height: BODY_H,
    zIndex: 4,
  },
  packFill: {
    width: PACK_W,
    height: BODY_H,
  },
  sleeve: {
    position: 'absolute',
    left: PACK_LEFT + (PACK_W - SLEEVE_W) / 2,
    top: BODY_TOP + 28 - Math.round(BODY_H * 0.2),
    width: SLEEVE_W,
    height: SLEEVE_H,
    zIndex: 1,
  },
  sleeveImg: {
    width: SLEEVE_W,
    height: SLEEVE_H,
  },
  emberSlot: {
    position: 'absolute',
    left: PACK_LEFT,
    top: BODY_TOP,
    width: PACK_W,
    height: BODY_H,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  top: {
    position: 'absolute',
    left: PACK_LEFT,
    top: TOP_TOP,
    width: PACK_W,
    height: TOP_H,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    transformOrigin: 'right center',
  },
  topImg: {
    width: '100%',
    height: '100%',
  },
  cardSlot: {
    position: 'absolute',
    zIndex: 20,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipBox: {
    width: CARD_W,
    height: CARD_H,
  },
  face: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceImg: {
    width: CARD_W,
    height: CARD_H,
  },
});
