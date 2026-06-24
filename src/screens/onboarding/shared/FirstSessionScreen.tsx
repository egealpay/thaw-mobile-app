import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ScreenBackground, SecondaryButton } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { daysUntil, formatMinutes } from '../../../utils/formatters';
import { saveProfile } from '../../../storage/mmkv';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FirstSession'>;

export function FirstSessionScreen({ route, navigation }: Props) {
  const { profile } = route.params;

  const pillText = profile.deadline
    ? `${daysUntil(profile.deadline.date)} days to ${profile.deadline.label}`
    : profile.path === 'habit'
    ? 'Day 1 of your habit'
    : 'FREE SESSION';

  const metaText = [
    profile.iceProfileDefault === 'glacier' ? 'Glacier' : 'Frost',
    formatMinutes(profile.defaultSessionLength),
    profile.strictness === 'strict' ? 'Strict' : 'Gentle',
  ].join(' · ');

  const handleStart = () => {
    saveProfile(profile);
    // Navigate to session — will be handled by AppNavigator after profile is saved
    navigation.getParent()?.navigate('Session', {
      profile,
      targetSeconds: profile.defaultSessionLength,
    });
  };

  return (
    <ScreenBackground variant="start">
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{pillText}</Text>
          </View>

          <View style={styles.cubeArea}>
            <IceCube
              progress={0}
              state="idle"
              iceProfile={profile.iceProfileDefault}
              size={226}
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.h2}>
              {profile.path === 'habit' ? "Let's start small." : 'Ready when you are.'}
            </Text>
            <Text style={styles.meta}>{metaText}</Text>
          </View>

          <View style={styles.spacer} />
          <View style={styles.actions}>
            <PrimaryButton label="Start melting" onPress={handleStart} />
            <SecondaryButton
              label="Change setup"
              onPress={() => navigation.goBack()}
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
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(42,108,191,0.15)',
  },
  pillText: {
    ...TextStyles.pill,
    color: Colors.ink,
    fontSize: 14,
  },
  cubeArea: { alignItems: 'center' },
  textBlock: { alignItems: 'center', gap: 10 },
  h2: { ...TextStyles.h2, textAlign: 'center' },
  meta: {
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    color: Colors.muted,
  },
  actions: { width: '100%', gap: 8 },
});
