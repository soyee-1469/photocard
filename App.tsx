import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { PhotoCard } from './components/PhotoCard';
import { CARD_RATIO, colors, rarities, rollRarity, type RarityId } from './theme';

const SAMPLE = 'sample://gradient';
const native = Platform.OS !== 'web';
type Phase = 'idle' | 'sealed' | 'opening' | 'revealed';

export default function App() {
  return (
    <SafeAreaProvider>
      <DrawStudio />
    </SafeAreaProvider>
  );
}

function DrawStudio() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [rarity, setRarity] = useState<RarityId>('rare');

  const packIn = useRef(new Animated.Value(0)).current;
  const flap = useRef(new Animated.Value(0)).current;
  const wrapper = useRef(new Animated.Value(0)).current;
  const cardOut = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const cardWidth = 236;
  const cardHeight = cardWidth / CARD_RATIO;
  const busy = phase === 'opening';

  useEffect(() => {
    return () => pulseLoop.current?.stop();
  }, []);

  function resetMotion() {
    pulseLoop.current?.stop();
    packIn.setValue(0);
    flap.setValue(0);
    wrapper.setValue(0);
    cardOut.setValue(0);
    spin.setValue(0);
    glow.setValue(0);
    pulse.setValue(0);
  }

  function drawCard(next = rollRarity()) {
    if (busy) {
      return;
    }
    resetMotion();
    setRarity(next);
    setPhase('sealed');
    Animated.spring(packIn, {
      toValue: 1,
      friction: 7,
      tension: 64,
      useNativeDriver: native,
    }).start();
  }

  function openPack() {
    if (phase !== 'sealed') {
      return;
    }
    setPhase('opening');
    Animated.sequence([
      Animated.timing(flap, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: native,
      }),
      Animated.parallel([
        Animated.timing(wrapper, {
          toValue: 1,
          duration: 420,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: native,
        }),
        Animated.timing(cardOut, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: native,
        }),
      ]),
      Animated.timing(spin, {
        toValue: 1,
        duration: 880,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: native,
      }),
    ]).start(() => {
      setPhase('revealed');
      Animated.timing(glow, {
        toValue: 1,
        duration: 420,
        useNativeDriver: native,
      }).start();
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: native,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: native,
          }),
        ]),
      );
      pulseLoop.current.start();
    });
  }

  const packEnter = {
    opacity: packIn,
    transform: [
      {
        translateY: packIn.interpolate({
          inputRange: [0, 1],
          outputRange: [56, 0],
        }),
      },
      {
        scale: packIn.interpolate({
          inputRange: [0, 1],
          outputRange: [0.82, 1],
        }),
      },
    ],
  };

  const flapSpin = {
    transform: [
      { translateY: 46 },
      { perspective: 900 },
      {
        rotateX: flap.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-128deg'],
        }),
      },
      { translateY: -46 },
    ],
  };

  const wrapperOut = {
    opacity: wrapper.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    transform: [
      {
        translateY: wrapper.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 90],
        }),
      },
    ],
  };

  const cardMotion = {
    transform: [
      {
        translateY: cardOut.interpolate({
          inputRange: [0, 1],
          outputRange: [118, 0],
        }),
      },
      { perspective: 1000 },
      {
        rotateY: spin.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  const glowMotion = {
    opacity: Animated.multiply(
      glow,
      pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.38, 0.78],
      }),
    ),
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12],
        }),
      },
    ],
  };

  const action =
    phase === 'idle'
      ? { label: '포토카드 뽑기', onPress: () => drawCard() }
      : phase === 'sealed'
        ? { label: '오픈하기', onPress: openPack }
        : phase === 'revealed'
          ? { label: '다시 뽑기', onPress: () => drawCard() }
          : null;

  return (
    <LinearGradient colors={['#2A211C', '#14100E']} style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.kicker}>PACK OPEN</Text>
          <Text style={styles.title}>포토카드 뽑기</Text>
          <Text style={styles.subtitle}>
            봉인된 팩이 나타난 뒤 위를 찢으면{'\n'}카드가 쓕 나와 한 바퀴 돕니다
          </Text>

          <View style={[styles.stage, { height: cardHeight + 70 }]}>
            {phase !== 'idle' ? (
              <Animated.View style={[styles.packEnter, packEnter]}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.glow,
                    glowMotion,
                    { backgroundColor: rarities[rarity].glow, shadowColor: rarities[rarity].glow },
                  ]}
                />
                <View style={[styles.well, { width: cardWidth + 18, height: cardHeight + 28 }]}>
                  <Animated.View style={[styles.cardSlot, cardMotion]}>
                    <PhotoCard
                      imageUri={SAMPLE}
                      frameId={rarity === 'legend' ? 'noir' : rarity === 'epic' ? 'lilac' : 'ivory'}
                      caption={rarities[rarity].label}
                      width={cardWidth}
                      interactive={phase === 'revealed'}
                    />
                  </Animated.View>
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.wrapper, wrapperOut, { width: cardWidth + 18, height: cardHeight + 28 }]}
                  >
                    <LinearGradient
                      colors={['#3A2A24', '#1A1411']}
                      style={StyleSheet.absoluteFill}
                    />
                    <Animated.View style={[styles.flap, flapSpin]}>
                      <LinearGradient colors={['#5A4034', '#2C201C']} style={styles.flapFill}>
                        <View style={styles.seal}>
                          <Text style={styles.sealText}>SEALED</Text>
                        </View>
                        <View style={styles.tear}>
                          {Array.from({ length: 11 }).map((_, i) => (
                            <View key={i} style={[styles.tooth, i % 2 === 0 && styles.toothAlt]} />
                          ))}
                        </View>
                      </LinearGradient>
                    </Animated.View>
                    <Text style={styles.packMark}>PHOTOCARD PACK</Text>
                  </Animated.View>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>아직 봉인된 팩이 없어요</Text>
              </View>
            )}
          </View>

          {phase === 'revealed' ? (
            <Text style={[styles.rarityName, { color: rarities[rarity].glow }]}>
              {rarities[rarity].label}
            </Text>
          ) : (
            <View style={styles.raritySpacer} />
          )}

          {action ? (
            <Pressable
              onPress={action.onPress}
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            >
              <Text style={styles.primaryLabel}>{action.label}</Text>
            </Pressable>
          ) : (
            <View style={[styles.primary, styles.disabled]}>
              <Text style={styles.primaryLabel}>오픈 중…</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>등급 미리보기</Text>
          <View style={styles.row}>
            {(Object.keys(rarities) as RarityId[]).map((id) => (
              <Pressable
                key={id}
                onPress={() => drawCard(id)}
                style={[styles.chip, rarity === id && phase !== 'idle' && styles.chipOn]}
              >
                <View style={[styles.dot, { backgroundColor: rarities[id].glow }]} />
                <Text style={styles.chipLabel}>{rarities[id].label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  kicker: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    color: colors.paper,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 8,
    color: colors.mist,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  packEnter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    shadowOpacity: 0.9,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 0 },
  },
  well: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cardSlot: {
    zIndex: 1,
  },
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderRadius: 18,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  flap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 92,
    zIndex: 3,
  },
  flapFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seal: {
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  sealText: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: '700',
  },
  tear: {
    position: 'absolute',
    bottom: -7,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  tooth: {
    flex: 1,
    height: 14,
    backgroundColor: '#2C201C',
    transform: [{ rotate: '8deg' }],
  },
  toothAlt: {
    transform: [{ rotate: '-8deg' }],
    backgroundColor: '#3A2A24',
  },
  packMark: {
    color: 'rgba(246, 239, 230, 0.42)',
    letterSpacing: 3,
    fontSize: 10,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(246, 239, 230, 0.4)',
    fontSize: 14,
  },
  rarityName: {
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  raritySpacer: {
    height: 38,
  },
  primary: {
    backgroundColor: colors.gold,
    borderRadius: 16,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.55,
  },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    color: 'rgba(246, 239, 230, 0.55)',
    fontSize: 12,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(246, 239, 230, 0.05)',
  },
  chipOn: {
    backgroundColor: 'rgba(201, 160, 106, 0.18)',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chipLabel: {
    color: colors.paper,
    fontSize: 11,
    fontWeight: '600',
  },
});
