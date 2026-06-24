import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ScreenBackground, SecondaryButton } from '../../components';
import { Colors, Spacing, TextStyles } from '../../constants';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'MiniMeltDemo'>;

const DEMO_SECONDS = 20;

export function MiniMeltDemoScreen({ navigation }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => {
        if (prev >= DEMO_SECONDS) {
          clearInterval(interval);
          return prev;
        }
        return prev + 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min(elapsed / DEMO_SECONDS, 1);
  const remaining = Math.max(0, Math.ceil(DEMO_SECONDS - elapsed));
  const iceState = progress >= 1 ? 'complete' : 'melting';

  const goNext = () => navigation.navigate('PathFork');

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.eyebrow}>LIVE DEMO</Text>

          <View style={styles.cubeArea}>
            <IceCube
              progress={progress}
              state={iceState}
              iceProfile="glacier"
              size={196}
            />
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>melting…</Text>
            <Text style={styles.progressTime}>0:{String(remaining).padStart(2, '0')} left</Text>
          </View>

          <View style={styles.trackBg}>
            <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.h2}>See? It just melts.</Text>
            <Text style={styles.body}>
              That's the whole idea. Stay with it, and your block thaws on its own.
            </Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="I'm in →" onPress={goNext} />
            <SecondaryButton label="Skip the intro" onPress={goNext} />
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenH,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  eyebrow: { ...TextStyles.eyebrow },
  cubeArea: { alignItems: 'center' },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: Colors.body,
  },
  progressTime: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  trackBg: {
    width: '100%',
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.track,
    overflow: 'hidden',
  },
  trackFill: {
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  textBlock: { alignItems: 'center', gap: 10 },
  h2: { ...TextStyles.h2, textAlign: 'center' },
  body: { ...TextStyles.body, textAlign: 'center' },
  actions: { width: '100%', gap: 8 },
});
