import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DaySquares, PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DaysPerWeek'>;

export function DaysPerWeekScreen({ navigation }: Props) {
  const [selected, setSelected] = useState([true, true, true, true, true, false, false]);
  const { update, setDerivedBy } = useContext(OnboardingContext);

  const count = selected.filter(Boolean).length;

  const handleContinue = () => {
    update({ weeklyTargetDays: count, studyDays: selected });
    setDerivedBy('weeklyTargetDays', `${count} days a week — you chose this`);
    navigation.navigate('FocusSpan');
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.36} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.textBlock}>
            <Text style={styles.h2}>How many days a week can you study?</Text>
            <Text style={styles.body}>Be honest — your streak goal builds from this.</Text>
          </View>

          <DaySquares selected={selected} onChange={setSelected} />

          <View style={styles.spacer} />
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={count === 0}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  textBlock: { gap: 10 },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  spacer: { flex: 1 },
});
