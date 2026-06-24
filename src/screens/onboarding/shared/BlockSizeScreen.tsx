import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, OptionCard, PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BlockSize'>;

const OPTIONS = [
  { name: 'quick' as const, label: 'Quick', subtitle: 'small cube', seconds: 900, size: 32 },
  { name: 'standard' as const, label: 'Standard', subtitle: 'a focused block', seconds: 1500, size: 44 },
  { name: 'deep' as const, label: 'Deep', subtitle: 'a big block', seconds: 3000, size: 58 },
];

export function BlockSizeScreen({ navigation }: Props) {
  const { draft, update, setDerivedBy } = useContext(OnboardingContext);
  const defaultSec = draft.defaultSessionLength ?? 1500;
  const closest = OPTIONS.reduce((prev, curr) =>
    Math.abs(curr.seconds - defaultSec) < Math.abs(prev.seconds - defaultSec) ? curr : prev,
  );
  const [selected, setSelected] = useState(closest.seconds);

  const handleContinue = () => {
    update({
      defaultSessionLength: selected,
      presets: OPTIONS.map(o => ({ name: o.name, seconds: o.seconds })),
    });
    const opt = OPTIONS.find(o => o.seconds === selected)!;
    setDerivedBy('defaultSessionLength', `you focus ~${Math.round(selected / 60)} min (${opt.label})`);
    navigation.navigate('DailyBlocks');
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.73} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.textBlock}>
            <Text style={styles.h2}>Set your default block.</Text>
            <Text style={styles.body}>
              Bigger cube, longer session. Change it any time.
            </Text>
          </View>

          <View style={styles.options}>
            {OPTIONS.map(opt => (
              <OptionCard
                key={opt.seconds}
                title={opt.label}
                subtitle={`${opt.subtitle} · ${opt.seconds / 60} min`}
                selected={selected === opt.seconds}
                onPress={() => setSelected(opt.seconds)}
                trailingContent={
                  <IceCube
                    progress={0}
                    state="idle"
                    iceProfile="glacier"
                    size={opt.size}
                  />
                }
              />
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
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  textBlock: { gap: 10 },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  options: { gap: 10 },
  spacer: { flex: 1 },
});
