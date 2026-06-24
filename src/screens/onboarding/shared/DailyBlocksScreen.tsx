import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OptionCard, PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { Colors, TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DailyBlocks'>;

function RecommendedTag() {
  return (
    <View style={tagStyles.pill}>
      <Text style={tagStyles.label}>Recommended</Text>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  pill: {
    backgroundColor: 'rgba(42,108,191,0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
});

export function DailyBlocksScreen({ navigation }: Props) {
  const { draft, update, setDerivedBy } = useContext(OnboardingContext);
  const sessionMin = Math.ceil((draft.defaultSessionLength ?? 1500) / 60);
  const [blocks, setBlocks] = useState(2);

  const OPTIONS = [1, 2, 3, 4].map(n => ({
    blocks: n,
    label: n === 1 ? '1 block' : `${n} blocks`,
    subtitle: `${n * sessionMin} min / day`,
  }));

  const handleContinue = () => {
    const minutes = blocks * sessionMin;
    update({ dailyGoal: { type: 'minutes', value: minutes } });
    setDerivedBy('dailyGoal', `${blocks} block${blocks > 1 ? 's' : ''} × ${sessionMin} min`);
    navigation.navigate('FocusProfileReveal');
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.79} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.textBlock}>
            <Text style={styles.h2}>How many blocks a day?</Text>
            <Text style={styles.body}>
              Sets your daily goal. You can always adjust it later.
            </Text>
          </View>

          <View style={styles.options}>
            {OPTIONS.map(opt => (
              <OptionCard
                key={opt.blocks}
                title={opt.label}
                subtitle={opt.subtitle}
                selected={blocks === opt.blocks}
                onPress={() => setBlocks(opt.blocks)}
                trailingContent={opt.blocks === 2 ? <RecommendedTag /> : undefined}
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
