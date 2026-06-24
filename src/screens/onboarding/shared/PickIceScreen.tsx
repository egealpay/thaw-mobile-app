import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PickIce'>;

export function PickIceScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<'glacier' | 'frost'>('glacier');
  const { update, setDerivedBy } = useContext(OnboardingContext);

  const handleContinue = () => {
    update({ iceProfileDefault: selected });
    setDerivedBy('iceProfileDefault', `you picked ${selected === 'glacier' ? 'Glacier' : 'Frost'} (S4a)`);
    navigation.navigate('Strictness');
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.55} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.textBlock}>
            <Text style={styles.h2}>Pick your ice.</Text>
            <Text style={styles.body}>Two to start. You'll unlock more later.</Text>
          </View>

          <View style={styles.row}>
            {(['glacier', 'frost'] as const).map(profile => (
              <TouchableOpacity
                key={profile}
                style={[styles.card, selected === profile && styles.cardSelected]}
                onPress={() => setSelected(profile)}
                activeOpacity={0.8}
              >
                <IceCube progress={0} state="idle" iceProfile={profile} size={96} />
                <Text style={styles.cardTitle}>
                  {profile === 'glacier' ? 'Glacier' : 'Frost'}
                </Text>
                <Text style={styles.cardSub}>
                  {profile === 'glacier' ? 'Clear & cool' : 'Soft & matte'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.spacer} />
          <PrimaryButton label="Continue" onPress={handleContinue} />
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
    paddingBottom: 32,
    paddingTop: 24,
    gap: 24,
  },
  spacer: { flex: 1 },
  textBlock: { gap: 10 },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  row: { flexDirection: 'row', gap: 14, alignItems: 'stretch' },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardWhiteSelected,
  },
  cardTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: Colors.ink,
  },
  cardSub: { ...TextStyles.cardSubtitle },
});
