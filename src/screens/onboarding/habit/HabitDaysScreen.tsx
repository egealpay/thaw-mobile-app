import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DaySquares, PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'HabitDays'>;

export function HabitDaysScreen({ navigation }: Props) {
  const [selected, setSelected] = useState([true, false, true, false, true, false, false]);
  const { update, setDerivedBy } = useContext(OnboardingContext);

  const count = selected.filter(Boolean).length;

  const handleContinue = () => {
    update({ weeklyTargetDays: count });
    setDerivedBy('weeklyTargetDays', 'days/week you chose (B2)');
    navigation.navigate('FocusSpan');
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.4} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.textBlock}>
            <Text style={styles.h2}>How many days a week is realistic?</Text>
            <Text style={styles.body}>
              Start small — a streak you can keep beats one you'll break.
            </Text>
          </View>

          <DaySquares selected={selected} onChange={setSelected} />

          <View style={styles.infoNote}>
            <Text style={styles.noteText}>
              Your streak counts a day done when you hit your goal. Miss a day? It just pauses — no guilt.
            </Text>
          </View>

          <PrimaryButton label="Continue" onPress={handleContinue} disabled={count === 0} />
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
    gap: 24,
    justifyContent: 'space-between',
  },
  textBlock: { gap: 10 },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  infoNote: {
    backgroundColor: 'rgba(90,166,230,0.12)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(90,166,230,0.2)',
  },
  noteText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: Colors.body,
    lineHeight: 20,
  },
});
