import { Animated, Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { PhotoCard } from './PhotoCard';
import { EmberGlow } from './EmberGlow';
import { fx } from '../assets/packFx';
import { CARD_RATIO, type RarityId } from '../theme';

const PACK_W = 248;
const CLOSED_SRC_W = 501;
const CLOSED_SRC_H = 1013;
const BODY_SRC_W = 546;
const BODY_SRC_H = 1013;
const TOP_SRC_W = 698;
const TOP_SRC_H = 116;
const CLOSED_H = Math.round((PACK_W * CLOSED_SRC_H) / CLOSED_SRC_W);
const BODY_H = Math.round((PACK_W * BODY_SRC_H) / BODY_SRC_W);
const TOP_H = Math.round((PACK_W * TOP_SRC_H) / TOP_SRC_W);
const CLOSED_BOTTOM_PAD = Math.round((CLOSED_H * 2) / CLOSED_SRC_H);
const BODY_BOTTOM_PAD = Math.round((BODY_H * 2) / BODY_SRC_H);
const BODY_TOP_PAD = Math.round((BODY_H * 2) / BODY_SRC_H);
const TOP_BOTTOM_PAD = Math.round((TOP_H * 2) / TOP_SRC_H);
const STAGE_W = 340;
const STAGE_H = CLOSED_H + 48;
const PACK_LEFT = (STAGE_W - PACK_W) / 2;
const PACK_TOP = Math.round((STAGE_H - CLOSED_H) / 2);
const BODY_TOP = PACK_TOP + CLOSED_H - CLOSED_BOTTOM_PAD - BODY_H + BODY_BOTTOM_PAD;
const TOP_OVERLAP = Math.round(TOP_H * 0.5);
const TOP_TOP = BODY_TOP + TOP_OVERLAP - TOP_H + TOP_BOTTOM_PAD;
const CARD_W = 240;
const CARD_H = CARD_W / CARD_RATIO;
const SLEEVE_W = 188;
const SLEEVE_H = SLEEVE_W / CARD_RATIO;
const PACK_SIDE_INSET = Math.round((PACK_W * 22) / BODY_SRC_W);
const MOUTH_TOP = BODY_TOP + BODY_TOP_PAD;
const MOUTH_H = Math.round((BODY_H * 90) / BODY_SRC_H);
const PEEL_SRC_W = 708;
const PEEL_SRC_H = 385;
const PEEL_W = Math.round((PEEL_SRC_W * PACK_W) / TOP_SRC_W);
const PEEL_H = Math.round((PEEL_SRC_H * PACK_W) / TOP_SRC_W);
const PEEL_LEFT = PACK_LEFT + PACK_W - PEEL_W;
const PEEL_PAD_TOP = Math.round((PEEL_H * 19) / PEEL_SRC_H);
const PEEL_TOP = TOP_TOP - PEEL_PAD_TOP - 10;

const TEAR = 640;
const T2 = TEAR;
const T3 = T2 + 2000;
const T4 = T3 + 110;
const DROP = T4 + 80;
const LAUNCH = DROP + 40;
const PEAK = LAUNCH + 370;
const RISE = LAUNCH + 470;
const LAND = LAUNCH + 970;
const FLIP = LAUNCH + 1330;
const POP = FLIP + 930;
export const CINEMATIC_MS = LAUNCH + 3100;
const END = CINEMATIC_MS;

const SPARKS = Array.from({ length: 11 }, (_, i) => {
  const ang = (Math.PI * 2 * i) / 11 + 0.28;
  const dist = 88 + (i % 4) * 20;
  return {
    x: Math.cos(ang) * dist,
    y: Math.sin(ang) * dist,
    size: 28 + (i % 3) * 8,
    delay: i * 22,
  };
});

type PackCinematicProps = {
  clock: Animated.Value;
  imageSource: ImageSourcePropType | null;
  rarity: RarityId;
  revealed: boolean;
};

export function PackCinematic({ clock, imageSource, rarity, revealed }: PackCinematicProps) {

  const shake = clock.interpolate({
    inputRange: [0, 140, 250, 360, 470, 560, TEAR, END],
    outputRange: ['0deg', '0deg', '6.5deg', '-6deg', '3.4deg', '-1.2deg', '0deg', '0deg'],
  });
  const shakeX = clock.interpolate({
    inputRange: [0, 140, 250, 360, 470, 560, TEAR, END],
    outputRange: [0, 0, 8, -8, 4, -1.5, 0, 0],
  });

  const closedOpacity = clock.interpolate({
    inputRange: [0, TEAR - 1, TEAR, END],
    outputRange: [1, 1, 0, 0],
  });
  const tornOpacity = clock.interpolate({
    inputRange: [0, TEAR - 1, TEAR, END],
    outputRange: [0, 0, 1, 1],
  });

  const top2Op = clock.interpolate({
    inputRange: [0, TEAR - 1, TEAR, T3, T3 + 70, END],
    outputRange: [0, 0, 1, 1, 0, 0],
  });
  const top3Op = clock.interpolate({
    inputRange: [0, T3 - 60, T3, T4, T4 + 60, END],
    outputRange: [0, 0, 1, 1, 0, 0],
  });
  const top4Op = clock.interpolate({
    inputRange: [0, T4 - 60, T4, DROP + 420, DROP + 720, END],
    outputRange: [0, 0, 1, 1, 0, 0],
  });
  const top4Y = clock.interpolate({
    inputRange: [0, DROP, DROP + 90, DROP + 240, DROP + 430, DROP + 660, END],
    outputRange: [0, 0, 14, 72, 200, 370, 430],
  });
  const top4X = clock.interpolate({
    inputRange: [0, DROP, DROP + 300, DROP + 660, END],
    outputRange: [0, 0, 12, 30, 38],
  });
  const top4Rot = clock.interpolate({
    inputRange: [0, DROP, DROP + 180, DROP + 560, END],
    outputRange: ['-2deg', '-2deg', '12deg', '28deg', '34deg'],
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
    inputRange: [
      0,
      FLIP,
      FLIP + 100,
      FLIP + 200,
      FLIP + 300,
      FLIP + 400,
      FLIP + 500,
      FLIP + 600,
      FLIP + 700,
      FLIP + 800,
      FLIP + 900,
      FLIP + 930,
      FLIP + 1100,
      END,
    ],
    outputRange: [1, 1, 0.08, 1, 0.08, 1, 0.08, 1, 0.08, 1, 0.08, 0.08, 1, 1],
  });
  const backOp = clock.interpolate({
    inputRange: [0, FLIP + 910, FLIP + 930, END],
    outputRange: [1, 1, 0, 0],
  });
  const frontOp = clock.interpolate({
    inputRange: [0, FLIP + 910, FLIP + 930, END],
    outputRange: [0, 0, 1, 1],
  });

  const burstOp = clock.interpolate({
    inputRange: [0, POP - 1, POP, POP + 90, POP + 380, POP + 640, END],
    outputRange: [0, 0, 0.95, 1, 0.4, 0, 0],
  });
  const burstScale = clock.interpolate({
    inputRange: [0, POP, POP + 160, POP + 520, END],
    outputRange: [0.55, 0.55, 1.08, 1.22, 1.24],
  });
  const ringOp = clock.interpolate({
    inputRange: [0, POP, POP + 70, POP + 360, POP + 680, END],
    outputRange: [0, 0, 1, 0.55, 0, 0],
  });
  const ringScale = clock.interpolate({
    inputRange: [0, POP, POP + 120, POP + 520, END],
    outputRange: [0.62, 0.62, 1.05, 1.32, 1.36],
  });
  const sparks = SPARKS.map((spark) => {
    const start = POP + spark.delay;
    return {
      ...spark,
      op: clock.interpolate({
        inputRange: [0, start, start + 80, start + 420, END],
        outputRange: [0, 0, 1, 0, 0],
      }),
      x: clock.interpolate({
        inputRange: [0, start, start + 420, END],
        outputRange: [0, 0, spark.x, spark.x],
      }),
      y: clock.interpolate({
        inputRange: [0, start, start + 420, END],
        outputRange: [0, 0, spark.y, spark.y],
      }),
      sc: clock.interpolate({
        inputRange: [0, start, start + 140, start + 420, END],
        outputRange: [0.4, 0.4, 1, 0.7, 0.7],
      }),
    };
  });

  return (
    <Animated.View style={[styles.stage, { transform: [{ translateX: shakeX }, { rotate: shake }] }]}>
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

      <Animated.Image
        source={fx.packTop2}
        resizeMode="contain"
        style={[styles.peel, { opacity: top2Op }]}
      />
      <Animated.Image
        source={fx.packTop3}
        resizeMode="contain"
        style={[styles.peel, { opacity: top3Op }]}
      />
      <Animated.Image
        source={fx.packTop4}
        resizeMode="contain"
        style={[
          styles.peel,
          {
            opacity: top4Op,
            transform: [{ translateX: top4X }, { translateY: top4Y }, { rotate: top4Rot }],
          },
        ]}
      />

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

      <View pointerEvents="none" style={styles.popBack}>
        <Animated.Image
          source={fx.popBurst}
          resizeMode="contain"
          style={[
            styles.popBurst,
            { opacity: burstOp, transform: [{ scale: burstScale }] },
          ]}
        />
      </View>
      <View pointerEvents="none" style={styles.popFront}>
        <Animated.Image
          source={fx.popRing}
          resizeMode="contain"
          style={[
            styles.popRing,
            { opacity: ringOp, transform: [{ scale: ringScale }] },
          ]}
        />
        {sparks.map((spark, i) => (
          <Animated.Image
            key={i}
            source={fx.popSpark}
            resizeMode="contain"
            style={[
              styles.popSpark,
              {
                width: spark.size,
                height: spark.size,
                opacity: spark.op,
                transform: [
                  { translateX: spark.x },
                  { translateY: spark.y },
                  { scale: spark.sc },
                ],
              },
            ]}
          />
        ))}
      </View>
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
    top: BODY_TOP + 28,
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
    left: PACK_LEFT + PACK_SIDE_INSET,
    top: MOUTH_TOP,
    width: PACK_W - PACK_SIDE_INSET * 2,
    height: MOUTH_H,
    zIndex: 2,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  peel: {
    position: 'absolute',
    left: PEEL_LEFT,
    top: PEEL_TOP,
    width: PEEL_W,
    height: PEEL_H,
    zIndex: 8,
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
  popBack: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 18,
  },
  popFront: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 22,
  },
  popBurst: {
    width: 420,
    height: 420,
  },
  popRing: {
    width: 300,
    height: 300,
  },
  popSpark: {
    position: 'absolute',
  },
});
