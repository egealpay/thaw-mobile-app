import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ScreenBackground } from '../../components';
import { Colors, Spacing, TextStyles } from '../../constants';
import type { SessionStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SessionStackParamList, 'Refreeze'>;

export function RefreezeScreen({ navigation }: Props) {
  const [lostPct, setLostPct] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setLostPct(Math.round(elapsed * 0.5));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScreenBackground variant="refreeze">
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.eyebrow}>STRICT MODE</Text>

          <View style={styles.cubeArea}>
            <IceCube
              progress={0.4}
              state="refreezing"
              iceProfile="glacier"
              size={130}
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.h2}>Your ice is refreezing.</Text>
            <Text style={styles.body}>
              Come back to Thaw to stop the freeze. Every second away is progress lost.
            </Text>
          </View>

          <View style={styles.chip}>
            <Text style={styles.chipText}>−{lostPct}% and counting</Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Back to focus"
              onPress={() => navigation.navigate('ActiveSession', {} as any)}
              variant="white"
            />
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
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  eyebrow: { ...TextStyles.eyebrow, color: Colors.accentMid2 },
  cubeArea: { alignItems: 'center' },
  textBlock: { alignItems: 'center', gap: 12 },
  h2: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 26,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  body: {
    ...TextStyles.body,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chipText: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 15,
    color: Colors.white,
  },
  actions: { width: '100%' },
});
