import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OptionCard, PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FocusSpan'>;

const OPTIONS = [
  { label: '10 min', subtitle: 'a quick sprint', seconds: 600 },
  { label: '25 min', subtitle: 'a focused block', seconds: 1500 },
  { label: '45 min', subtitle: 'deep work', seconds: 2700 },
  { label: '60+ min', subtitle: 'a long marathon', seconds: 3600 },
];

export function FocusSpanScreen({ navigation }: Props) {
  const { draft, update, setDerivedBy } = useContext(OnboardingContext);
  const defaultSec = draft.path === 'habit' ? 600 : 1500;
  const [selected, setSelected] = useState(defaultSec);

  const handleContinue = () => {
    update({ defaultSessionLength: selected });
    setDerivedBy('defaultSessionLength', `you focus ~${Math.round(selected / 60)} min before drifting`);
    navigation.navigate('PickIce');
  };

  const progress = draft.path === 'habit' ? 0.58 : 0.45;

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ProgressHeader progress={progress} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.textBlock}>
            <Text style={styles.h2}>How long can you focus before drifting?</Text>
            <Text style={styles.body}>
              {draft.path === 'habit'
                ? 'For a new habit, short and winnable is best.'
                : 'No wrong answer — we start here and adjust.'}
            </Text>
          </View>

          <View style={styles.options}>
            {OPTIONS.map(opt => (
              <OptionCard
                key={opt.label}
                title={opt.label}
                subtitle={opt.subtitle}
                selected={selected === opt.seconds}
                onPress={() => setSelected(opt.seconds)}
              />
            ))}
          </View>
        </View>

        <View style={styles.cta}>
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
    paddingHorizontal: 28,
    paddingTop: 24,
    gap: 20,
  },
  textBlock: { gap: 10 },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  options: { gap: 8 },
  cta: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
});
