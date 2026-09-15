import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { PackCinematic, packStageSize, CINEMATIC_MS } from './components/PackCinematic';
import { pickPhoto } from './assets/packFx';
import { colors, rarities, rollRarity, type RarityId } from './theme';

type Phase = 'idle' | 'sealed' | 'opening' | 'revealed';

async function haptic(kind: 'draw' | 'open' | 'reveal') {
  if (Platform.OS === 'web') {
    return;
  }
  const Haptics = await import('expo-haptics');
  if (kind === 'draw') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else if (kind === 'open') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } else {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

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
  const [cardImage, setCardImage] = useState<ImageSourcePropType | null>(null);
  const clock = useRef(new Animated.Value(0)).current;
  const busy = phase === 'opening';
  const tone = rarities[rarity];

  async function drawCard(next = rollRarity()) {
    if (busy) {
      return;
    }
    await haptic('draw');
    clock.setValue(0);
    setRarity(next);
    setCardImage(pickPhoto());
    setPhase('sealed');
  }

  async function openPack() {
    if (phase !== 'sealed') {
      return;
    }
    await haptic('open');
    setPhase('opening');
    clock.setValue(0);
    Animated.timing(clock, {
      toValue: CINEMATIC_MS,
      duration: CINEMATIC_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(async () => {
      setPhase('revealed');
      await haptic('reveal');
    });
  }

  const action =
    phase === 'idle'
      ? { label: '포토카드 뽑기', onPress: () => drawCard() }
      : phase === 'sealed'
        ? { label: '오픈하기', onPress: openPack }
        : phase === 'revealed'
          ? { label: '다시 뽑기', onPress: () => drawCard() }
          : null;

  return (
    <LinearGradient colors={['#19130F', '#0C0908']} style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>COLLECTIBLE PACK</Text>
          <Text style={styles.title}>갖고 싶은 한 장</Text>
          <Text style={styles.subtitle}>
            팩을 뽑아 오픈해 보세요.{'\n'}윗면이 찢기고, 카드가 올라왔다가 앞에서 뒤집힙니다.
          </Text>

          <View style={[styles.stage, { height: packStageSize.height }]}>
            <PackCinematic
              clock={clock}
              imageSource={cardImage}
              rarity={rarity}
              revealed={phase === 'revealed'}
            />
          </View>

          {phase === 'revealed' ? (
            <View style={styles.banner}>
              <Text style={[styles.badge, { color: tone.glow }]}>{tone.badge}</Text>
              <Text style={[styles.rarityName, { color: tone.glow }]}>{tone.label}</Text>
              <Text style={styles.rarityLine}>{tone.line}</Text>
            </View>
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
                <Text style={styles.chipLabel}>{rarities[id].badge}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 36 },
  kicker: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    color: colors.paper,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.7,
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
    overflow: 'visible',
  },
  banner: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    minHeight: 64,
  },
  badge: {
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '800',
  },
  rarityName: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
  },
  rarityLine: {
    marginTop: 6,
    color: 'rgba(246,239,230,0.7)',
    fontSize: 13,
  },
  raritySpacer: {
    height: 16,
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
    fontWeight: '700',
    letterSpacing: 1,
  },
});
