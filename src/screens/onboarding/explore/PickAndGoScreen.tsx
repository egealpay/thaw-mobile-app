import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ScreenBackground, SecondaryButton } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PickAndGo'>;

const LENGTHS = [
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
  { label: '50 min', seconds: 3000 },
];

export function PickAndGoScreen({ navigation }: Props) {
  const [ice, setIce] = useState<'glacier' | 'frost'>('glacier');
  const [length, setLength] = useState(1500);
  const { update, build } = useContext(OnboardingContext);

  const handleStart = () => {
    update({
      path: 'explore',
      iceProfileDefault: ice,
      defaultSessionLength: length,
      strictness: 'gentle',
    });
    const profile = build();
    navigation.navigate('FirstSession', { profile });
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.eyebrow}>NO SETUP NEEDED</Text>
          <Text style={styles.h2}>Pick an ice and a length. Just go.</Text>
          <Text style={styles.body}>We'll learn your profile as you use it.</Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ICE</Text>
            <View style={styles.iceRow}>
              {(['glacier', 'frost'] as const).map(profile => (
                <TouchableOpacity
                  key={profile}
                  style={[styles.iceCard, ice === profile && styles.iceCardSelected]}
                  onPress={() => setIce(profile)}
                >
                  <IceCube progress={0} state="idle" iceProfile={profile} size={72} />
                  <Text style={styles.iceLabel}>
                    {profile === 'glacier' ? 'Glacier' : 'Frost'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LENGTH</Text>
            <View style={styles.lengthRow}>
              {LENGTHS.map(l => (
                <TouchableOpacity
                  key={l.seconds}
                  style={[styles.lengthPill, length === l.seconds && styles.lengthPillSelected]}
                  onPress={() => setLength(l.seconds)}
                >
                  <Text style={[styles.lengthLabel, length === l.seconds && styles.lengthLabelSelected]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Start melting" onPress={handleStart} />
            <SecondaryButton
              label="Set up a profile instead"
              onPress={() => navigation.navigate('PathFork')}
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
    paddingTop: 40,
    paddingBottom: 32,
    gap: 24,
  },
  eyebrow: { ...TextStyles.eyebrow },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  section: { gap: 12 },
  sectionLabel: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.muted,
  },
  iceRow: { flexDirection: 'row', gap: 12 },
  iceCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  iceCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardWhiteSelected,
  },
  iceLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: Colors.ink,
  },
  lengthRow: { flexDirection: 'row', gap: 10 },
  lengthPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  lengthPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  lengthLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: Colors.body,
  },
  lengthLabelSelected: { color: Colors.white },
  actions: { gap: 8, marginTop: 'auto' },
});
