import { Animated, Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { PhotoCard } from './PhotoCard';
import { EmberGlow } from './EmberGlow';
import { SparkField } from './SparkField';
import { fx } from '../assets/packFx';
import { CARD_RATIO, rarities, type RarityId } from '../theme';

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
const STAGE_H = CLOSED_H + 120;
const PACK_LEFT = (STAGE_W - PACK_W) / 2;
const PACK_TOP = Math.round((STAGE_H - CLOSED_H) / 2) - 24;
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

/** 2 → 3 머무른 뒤 4로 바뀌고, 4가 휘며 아래로 떨어짐 */
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
/** 앞면이 열리는 순간 팡팡 */
const POP = FLIP + 200;
export const CINEMATIC_MS = LAUNCH + 3100;
const END = CINEMATIC_MS;

const POP_SPARKS = Array.from({ length: 14 }, (_, i) => {
  const ang = (Math.PI * 2 * i) / 14 + 0.2;
  const dist = 70 + (i % 5) * 28;
  return {
    x: Math.cos(ang) * dist,
    y: Math.sin(ang) * dist - 20,
    size: 22 + (i % 4) * 10,
    delay: (i % 5) * 28,
    spin: i % 2 === 0 ? '18deg' : '-24deg',
  };
});

type PackCinematicProps = {
  clock: Animated.Value;
  imageSource: ImageSourcePropType | null;
  rarity: RarityId;
  revealed: boolean;
};

export function PackCinematic({ clock, imageSource, rarity, revealed }: PackCinematicProps) {
  const tone = rarities[rarity];

  const shake = clock.interpolate({
    inputRange: [0, 140, 250, 360, 470, 560, TEAR, END],
    outputRange: ['0deg', '0deg', '6.5deg', '-6deg', '3.4deg', '-1.2deg', '0deg', '0deg'],
  });
  const shakeX = clock.interpolate({
    inputRange: [0, 140, 250, 360, 470, 560, TEAR, END],
    outputRange: [0, 0, 8, -8, 4, -1.5, 0, 0],
  });

  const sparkActive = clock.interpolate({
    inputRange: [0, TEAR - 50, TEAR + 600, DROP, DROP + 500, END],
    outputRange: [0, 0, 1, 1, 0.85, 0.85],
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
  // 4번 조각: 살짝 휜 뒤 아래로 떨어짐
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
  const top4Bend = clock.interpolate({
    inputRange: [0, T4, DROP, DROP + 160, END],
    outputRange: ['0deg', '0deg', '-18deg', '-8deg', '-8deg'],
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
  const cardRotate = clock.interpolate({
    inputRange: [0, RISE, RISE + 80, RISE + 160, LAND, LAND + 40, LAND + 80, END],
    outputRange: ['0deg', '0deg', '-2.5deg', '1.8deg', '-1.2deg', '0.6deg', '0deg', '0deg'],
  });
  const cardShift = clock.interpolate({
    inputRange: [0, RISE, RISE + 80, RISE + 160, LAND, LAND + 40, LAND + 80, END],
    outputRange: [0, 0, -6, 4, -2, 1, 0, 0],
  });

  const flipRotateY = clock.interpolate({
    inputRange: [0, FLIP, FLIP + 430, END],
    outputRange: ['180deg', '180deg', '540deg', '540deg'],
  });
  const backOp = clock.interpolate({
    inputRange: [0, FLIP + 180, FLIP + 215, END],
    outputRange: [1, 1, 0, 0],
  });
  const frontOp = clock.interpolate({
    inputRange: [0, FLIP + 180, FLIP + 215, END],
    outputRange: [0, 0, 1, 1],
  });

  const flashOp = clock.interpolate({
    inputRange: [0, POP - 1, POP, POP + 70, POP + 220, END],
    outputRange: [0, 0, 1, 0.55, 0, 0],
  });
  const flashScale = clock.interpolate({
    inputRange: [0, POP, POP + 180, END],
    outputRange: [0.55, 0.55, 1.35, 1.4],
  });

  const burstOp = clock.interpolate({
    inputRange: [0, POP, POP + 50, POP + 280, POP + 560, END],
    outputRange: [0, 0, 1, 0.55, 0, 0],
  });
  const burstScale = clock.interpolate({
    inputRange: [0, POP, POP + 120, POP + 420, END],
    outputRange: [0.45, 0.45, 1.15, 1.45, 1.5],
  });

  const ringOp = clock.interpolate({
    inputRange: [0, POP + 20, POP + 90, POP + 320, POP + 620, END],
    outputRange: [0, 0, 1, 0.5, 0, 0],
  });
  const ringScale = clock.interpolate({
    inputRange: [0, POP + 20, POP + 160, POP + 520, END],
    outputRange: [0.4, 0.4, 1.2, 1.7, 1.8],
  });

  const confettiOp = clock.interpolate({
    inputRange: [0, POP + 40, POP + 120, POP + 380, POP + 700, END],
    outputRange: [0, 0, 1, 0.6, 0, 0],
  });
  const confettiScale = clock.interpolate({
    inputRange: [0, POP + 40, POP + 280, END],
    outputRange: [0.6, 0.6, 1.25, 1.3],
  });

  const popSparks = POP_SPARKS.map((spark) => {
    const start = POP + spark.delay;
    return {
      ...spark,
      op: clock.interpolate({
        inputRange: [0, start, start + 60, start + 380, END],
        outputRange: [0, 0, 1, 0, 0],
      }),
      tx: clock.interpolate({
        inputRange: [0, start, start + 380, END],
        outputRange: [0, 0, spark.x, spark.x],
      }),
      ty: clock.interpolate({
        inputRange: [0, start, start + 380, END],
        outputRange: [0, 0, spark.y, spark.y],
      }),
      sc: clock.interpolate({
        inputRange: [0, start, start + 100, start + 380, END],
        outputRange: [0.35, 0.35, 1.15, 0.55, 0.55],
      }),
    };
  });

  return (
    <Animated.View style={[styles.stage, { transform: [{ translateX: shakeX }, { rotate: shake }] }]}>
      <Animated.View style={styles.emberSlot}>
        <EmberGlow strength={emberOp} />
      </Animated.View>

      <Animated.View style={[styles.sparkSlot, { opacity: sparkActive }]}>
        <SparkField active={true} color={tone.glow} count={18} />
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
            transform: [
              { perspective: 900 },
              { rotateX: top4Bend },
              { translateX: top4X },
              { translateY: top4Y },
              { rotate: top4Rot },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.cardSlot,
          {
            opacity: cardOp,
            transform: [
              { translateY: cardY },
              { translateX: cardShift },
              { rotate: cardRotate },
              { scale: cardScale },
            ],
          },
        ]}
      >
        <Animated.View
          style={[styles.flipBox, { transform: [{ perspective: 1200 }, { rotateY: flipRotateY }] }]}
        >
          <Animated.View style={[styles.face, { opacity: backOp }]}>
            <Image source={fx.cardBack} style={styles.faceImg} resizeMode="contain" />
          </Animated.View>
          <Animated.View style={[styles.face, styles.faceFront, { opacity: frontOp }]}>
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

      {/* 앞면 공개 순간 팡팡 */}
      <View pointerEvents="none" style={styles.popLayer}>
        <Animated.Image
          source={fx.lightFlash}
          resizeMode="contain"
          style={[
            styles.popFlash,
            { opacity: flashOp, transform: [{ scale: flashScale }] },
          ]}
        />
        <Animated.Image
          source={fx.emberBurst}
          resizeMode="contain"
          style={[
            styles.popBurst,
            { opacity: burstOp, transform: [{ scale: burstScale }] },
          ]}
        />
        <Animated.Image
          source={fx.ring}
          resizeMode="contain"
          style={[
            styles.popRing,
            { opacity: ringOp, transform: [{ scale: ringScale }] },
          ]}
        />
        <Animated.Image
          source={fx.particles}
          resizeMode="contain"
          style={[
            styles.popConfetti,
            { opacity: confettiOp, transform: [{ scale: confettiScale }] },
          ]}
        />
        {popSparks.map((spark, i) => (
          <Animated.Image
            key={i}
            source={fx.sparkles}
            resizeMode="contain"
            style={[
              styles.popSpark,
              {
                width: spark.size,
                height: spark.size,
                opacity: spark.op,
                transform: [
                  { translateX: spark.tx },
                  { translateY: spark.ty },
                  { rotate: spark.spin },
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
  sparkSlot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: STAGE_W,
    height: STAGE_H,
    zIndex: 22,
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
    backfaceVisibility: 'hidden',
  },
  faceFront: {
    // front sits on top after flip
  },
  faceImg: {
    width: CARD_W,
    height: CARD_H,
  },
  popLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  popFlash: {
    position: 'absolute',
    width: STAGE_W * 1.15,
    height: STAGE_H * 0.7,
  },
  popBurst: {
    position: 'absolute',
    width: 280,
    height: 280,
  },
  popRing: {
    position: 'absolute',
    width: 260,
    height: 260,
  },
  popConfetti: {
    position: 'absolute',
    width: 300,
    height: 300,
  },
  popSpark: {
    position: 'absolute',
  },
});
