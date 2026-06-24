import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OptionCard, PrimaryButton, ProgressHeader, ScreenBackground } from '../../components';
import { TextStyles } from '../../constants';
import { OnboardingContext } from '../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PathFork'>;

const OPTIONS = [
  {
    path: 'deadline' as const,
    title: 'Studying for something',
    subtitle: 'A test, deadline, or project',
  },
  {
    path: 'habit' as const,
    title: 'Building a focus habit',
    subtitle: 'Show up a little every day',
  },
  {
    path: 'explore' as const,
    title: 'Just curious',
    subtitle: 'Saw it somewhere, want to try',
  },
];

export function PathForkScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<'deadline' | 'habit' | 'explore' | null>(null);
  const { update } = useContext(OnboardingContext);

  const handleContinue = () => {
    if (!selected) return;
    update({ path: selected });
    if (selected === 'deadline') navigation.navigate('Subject');
    else if (selected === 'habit') navigation.navigate('StudyTime');
    else navigation.navigate('PickAndGo');
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.09} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.textBlock}>
            <Text style={styles.h2}>What brings you to Thaw?</Text>
            <Text style={styles.body}>We'll tune your first session to match.</Text>
          </View>

          <View style={styles.options}>
            {OPTIONS.map(opt => (
              <OptionCard
                key={opt.path}
                title={opt.title}
                subtitle={opt.subtitle}
                selected={selected === opt.path}
                onPress={() => setSelected(opt.path)}
              />
            ))}
          </View>

          <View style={styles.spacer} />
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!selected}
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
  options: { gap: 12 },
  spacer: { flex: 1 },
});
