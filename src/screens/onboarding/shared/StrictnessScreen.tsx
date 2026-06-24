import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FrostedCard, PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';
import type { Strictness } from '../../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Strictness'>;

export function StrictnessScreen({ navigation }: Props) {
  const { draft, update, setDerivedBy } = useContext(OnboardingContext);
  const defaultStrictness: Strictness = draft.path === 'deadline' ? 'strict' : 'gentle';
  const [selected, setSelected] = useState<Strictness>(defaultStrictness);

  const handleContinue = () => {
    update({ strictness: selected });
    const why = selected === 'strict'
      ? 'keeps a deadline honest'
      : 'default for the Habit path';
    setDerivedBy('strictness', why);
    navigation.navigate('BlockSize');
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.64} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.textBlock}>
            <Text style={styles.h2}>How strict should it be?</Text>
            <Text style={styles.body}>
              {draft.path === 'deadline'
                ? 'With a deadline, a little pressure helps. You can change this anytime.'
                : 'Choose how the ice responds when you leave.'}
            </Text>
          </View>

          <View style={styles.cards}>
            <FrostedCard selected={selected === 'gentle'} style={styles.card} onPress={() => setSelected('gentle')}>
              <Text style={styles.cardTitle}>Gentle</Text>
              <Text style={styles.cardBody}>
                Leave the app and your ice just pauses. Come back whenever — no penalty.
              </Text>
            </FrostedCard>

            <FrostedCard selected={selected === 'strict'} style={styles.card} onPress={() => setSelected('strict')}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Strict</Text>
                {draft.path === 'deadline' && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardBody}>
                Leave for more than 10 seconds and your ice slowly{' '}
                <Text style={{ fontFamily: 'Outfit-SemiBold', color: Colors.ink }}>refreezes</Text>
                . The progress you lose is the focus you lost.
              </Text>
            </FrostedCard>
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
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  textBlock: { gap: 10 },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  cards: { gap: 12 },
  spacer: { flex: 1 },
  card: { gap: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...TextStyles.cardTitle },
  cardBody: { ...TextStyles.body, fontSize: 15 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  recommendedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recommendedText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 9,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
