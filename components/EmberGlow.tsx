import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

import { fx } from '../assets/packFx';

type EmberGlowProps = {
  strength: Animated.AnimatedInterpolation<number> | Animated.Value;
};

export function EmberGlow({ strength }: EmberGlowProps) {
  const pulseA = useRef(new Animated.Value(0)).current;
  const pulseB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseA, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulseA, {
          toValue: 0,
          duration: 560,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    const b = Animated.loop(
      Animated.sequence([
        Animated.delay(180),
        Animated.timing(pulseB, {
          toValue: 1,
          duration: 640,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulseB, {
          toValue: 0,
          duration: 720,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [pulseA, pulseB]);

  const opA = Animated.multiply(
    strength,
    pulseA.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] }),
  );
  const opB = Animated.multiply(
    strength,
    pulseB.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.75] }),
  );
  const scaleA = pulseA.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const scaleB = pulseB.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.12] });

  return (
    <View pointerEvents="none" style={styles.fill}>
      <Animated.View style={[styles.layer, { opacity: opB, transform: [{ scale: scaleB }] }]}>
        <Image source={fx.emberBurst} style={styles.img} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={[styles.layer, { opacity: opA, transform: [{ scale: scaleA }] }]}>
        <Image source={fx.emberBurst} style={styles.img} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: '135%',
    height: '90%',
  },
});
