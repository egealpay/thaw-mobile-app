import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ScreenBackground, SecondaryButton } from '../../components';
import { Colors, Spacing, TextStyles } from '../../constants';
import type { SessionStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SessionStackParamList, 'Paused'>;

export function PausedScreen({ route, navigation }: Props) {
  const { meltProgress, iceProfile, strictness } = route.params;

  return (
    <ScreenBackground variant="paused">
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.cubeArea}>
            <IceCube
              progress={meltProgress}
              state="paused"
              iceProfile={iceProfile}
              size={130}
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.h2}>Your ice is waiting.</Text>
            <Text style={styles.body}>
              {strictness === 'strict'
                ? 'You have 10 seconds. After that your ice starts refreezing.'
                : 'Nothing melts until you\'re back. No penalty.'}
            </Text>
          </View>

          <View style={styles.spacer} />

          <View style={styles.actions}>
            <PrimaryButton
              label="Resume melting"
              onPress={() => navigation.goBack()}
              variant="white"
            />
            <SecondaryButton
              label="End session"
              onPress={() =>
                navigation.navigate('ActiveSession', { endSession: true } as any)
              }
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
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 24,
  },
  spacer: { flex: 1 },
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
  actions: { width: '100%', gap: 8 },
});
