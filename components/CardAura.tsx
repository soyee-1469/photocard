import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FIELD = 520;

const RAYS = [
  { deg: -16, delay: 0, duration: 3800, width: 56, length: 250 },
  { deg: 6, delay: 420, duration: 4300, width: 34, length: 220 },
  { deg: 28, delay: 160, duration: 3600, width: 64, length: 260 },
  { deg: 52, delay: 780, duration: 4800, width: 30, length: 200 },
  { deg: 78, delay: 220, duration: 4000, width: 48, length: 236 },
  { deg: 104, delay: 640, duration: 3500, width: 58, length: 248 },
  { deg: 132, delay: 80, duration: 5200, width: 28, length: 196 },
  { deg: 158, delay: 540, duration: 4100, width: 50, length: 228 },
  { deg: 186, delay: 900, duration: 3900, width: 40, length: 214 },
  { deg: 214, delay: 280, duration: 4500, width: 62, length: 255 },
  { deg: 242, delay: 700, duration: 3400, width: 32, length: 208 },
  { deg: 272, delay: 40, duration: 4400, width: 54, length: 242 },
  { deg: 304, delay: 360, duration: 4000, width: 44, length: 222 },
  { deg: 334, delay: 980, duration: 4700, width: 36, length: 230 },
];

const BLOOM = [
  { size: 2.05, alpha: 0.16 },
  { size: 1.86, alpha: 0.14 },
  { size: 1.68, alpha: 0.13 },
  { size: 1.52, alpha: 0.12 },
  { size: 1.38, alpha: 0.11 },
  { size: 1.24, alpha: 0.1 },
  { size: 1.12, alpha: 0.1 },
  { size: 1.0, alpha: 0.09 },
  { size: 0.9, alpha: 0.08 },
];

type CardAuraProps = {
  color: string;
  strength: Animated.AnimatedInterpolation<number> | Animated.Value;
  cardWidth: number;
  cardHeight: number;
  zIndex?: number;
};

export function CardAura({ color, strength, cardWidth, cardHeight, zIndex = 1 }: CardAuraProps) {
  const breath = useLoop(4800);
  const washPulse = useLoop(6800, 400);

  const bloomOp = Animated.multiply(
    strength,
    breath.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }),
  );
  const bloomScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const washOp = Animated.multiply(
    strength,
    washPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] }),
  );
  const washScale = washPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.12],
  });

  const base = cardWidth + 40;

  return (
    <View pointerEvents="none" style={[styles.stage, { zIndex }]}>
      <Animated.View style={[styles.wash, { opacity: washOp, transform: [{ scale: washScale }] }]}>
        <View style={[styles.washOrb, { backgroundColor: fade(color, 0.38) }]} />
        <View style={[styles.washInner, { backgroundColor: fade('#FFF7EA', 0.22) }]} />
      </Animated.View>

      <Animated.View style={[styles.rayField, { opacity: strength }]}>
        {RAYS.map((ray) => (
          <BloomRay key={ray.deg} color={color} {...ray} />
        ))}
      </Animated.View>

      <Animated.View
        style={[
          styles.halo,
          {
            width: base * 1.9,
            height: cardHeight * 1.9,
            opacity: bloomOp,
            transform: [{ scale: bloomScale }],
          },
        ]}
      >
        {BLOOM.map((ring) => (
          <View
            key={ring.size}
            style={[
              styles.orb,
              {
                width: base * ring.size,
                height: cardHeight * ring.size,
                backgroundColor: fade(color, ring.alpha),
              },
            ]}
          />
        ))}
        <View
          style={[
            styles.orb,
            {
              width: cardWidth * 0.72,
              height: cardHeight * 0.62,
              backgroundColor: fade('#FFF6E4', 0.28),
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

function BloomRay({
  color,
  deg,
  delay,
  duration,
  width,
  length,
}: {
  color: string;
  deg: number;
  delay: number;
  duration: number;
  width: number;
  length: number;
}) {
  const pulse = useLoop(duration, delay);
  const opacity = pulse.interpolate({
    inputRange: [0, 0.42, 1],
    outputRange: [0.08, 0.78, 0.1],
  });
  const scaleY = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.42, 1.22],
  });

  return (
    <Animated.View
      style={[
        styles.ray,
        {
          width,
          height: length,
          marginLeft: -width / 2,
          top: FIELD / 2 - length,
          opacity,
          transform: [{ rotate: `${deg}deg` }, { scaleY }],
        },
      ]}
    >
      <LinearGradient
        colors={['transparent', fade(color, 0.05), fade(color, 1), fade(color, 0.2)]}
        locations={[0, 0.08, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fill}
      />
    </Animated.View>
  );
}

const PACK_RAYS = [
  { deg: -42, width: 36, length: 210 },
  { deg: -24, width: 22, length: 186 },
  { deg: -8, width: 48, length: 230 },
  { deg: 7, width: 28, length: 198 },
  { deg: 22, width: 40, length: 220 },
  { deg: 38, width: 20, length: 176 },
  { deg: -58, width: 16, length: 160 },
  { deg: 54, width: 18, length: 168 },
];

export function PackBurst({
  color,
  strength,
}: {
  color: string;
  strength: Animated.AnimatedInterpolation<number> | Animated.Value;
}) {
  const mist = fade(color, 0.5);
  const core = fade('#FFF8EE', 0.4);

  return (
    <View pointerEvents="none" style={styles.packBurst}>
      <Animated.View style={[styles.packWash, { opacity: strength }]}>
        <View style={[styles.packWashOrb, { backgroundColor: mist }]} />
        <View style={[styles.packCore, { backgroundColor: core }]} />
      </Animated.View>
      <Animated.View style={[styles.packRayField, { opacity: strength }]}>
        {PACK_RAYS.map((ray) => (
          <View
            key={ray.deg}
            style={[
              styles.packRay,
              {
                width: ray.width,
                height: ray.length,
                marginLeft: -ray.width / 2,
                transform: [{ rotate: `${ray.deg}deg` }],
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', fade(color, 0), fade(color, 0.95), fade(color, 0.12)]}
              locations={[0, 0.1, 0.48, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.fill}
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function fade(hex: string, alpha: number) {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function useLoop(duration: number, delay = 0) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: duration * 1.15,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, duration, value]);

  return value;
}

const styles = StyleSheet.create({
  stage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wash: {
    position: 'absolute',
    width: FIELD,
    height: FIELD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  washOrb: {
    width: FIELD,
    height: FIELD,
    borderRadius: FIELD / 2,
  },
  washInner: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  rayField: {
    position: 'absolute',
    width: FIELD,
    height: FIELD,
  },
  ray: {
    position: 'absolute',
    left: '50%',
    overflow: 'hidden',
    borderRadius: 90,
    transformOrigin: 'center bottom',
  },
  fill: {
    flex: 1,
  },
  halo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  packBurst: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  packWash: {
    position: 'absolute',
    top: 20,
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packWashOrb: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  packCore: {
    position: 'absolute',
    top: 36,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.55,
  },
  packRayField: {
    position: 'absolute',
    top: 0,
    width: 320,
    height: 280,
  },
  packRay: {
    position: 'absolute',
    left: '50%',
    top: 28,
    overflow: 'hidden',
    borderRadius: 80,
    transformOrigin: 'center bottom',
  },
});
