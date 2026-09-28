import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type SparkFieldProps = {
  active: boolean;
  color: string;
  count: number;
};

export function SparkField({ active, color, count }: SparkFieldProps) {
  const sparks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = -Math.PI * 0.82 + (Math.PI * 1.64 * i) / Math.max(count - 1, 1) + (i % 3) * 0.08;
        return {
          angle,
          distance: 78 + (i % 7) * 22,
          width: i % 3 === 0 ? 3 : 2,
          height: 7 + (i % 4) * 3,
          delay: (i % 10) * 28,
          duration: 520 + (i % 6) * 90,
          spin: i % 2 === 0 ? '28deg' : '-36deg',
        };
      }),
    [count],
  );

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {sparks.map((spark, i) => (
        <Spark key={`${count}-${i}`} {...spark} active={active} color={i % 2 === 0 ? color : '#FFE7C2'} />
      ))}
    </View>
  );
}

function Spark({
  active,
  angle,
  color,
  delay,
  distance,
  duration,
  height,
  spin,
  width,
}: {
  active: boolean;
  angle: number;
  color: string;
  delay: number;
  distance: number;
  duration: number;
  height: number;
  spin: string;
  width: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    if (!active) {
      return;
    }
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(progress, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [active, delay, duration, progress]);

  const x = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.cos(angle) * distance],
  });
  const y = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(angle) * distance - 36],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.08, 0.55, 1],
    outputRange: [0, 1, 0.7, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0.4, 1.15, 0.35],
  });

  return (
    <Animated.View
      style={[
        styles.spark,
        {
          width,
          height,
          backgroundColor: color,
          opacity,
          transform: [{ translateX: x }, { translateY: y }, { rotate: spin }, { scale }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 22,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {
    position: 'absolute',
    borderRadius: 8,
  },
});
