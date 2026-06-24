import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OptionCard, PrimaryButton, ScreenBackground } from '../../../components';
import { TextStyles } from '../../../constants';
import { getProfile, saveProfile } from '../../../storage/mmkv';
import type { SettingsEditParamList } from '../../../navigation/types';
import { EditNavBar } from './EditNavBar';

type Props = NativeStackScreenProps<SettingsEditParamList, 'EditDailyGoal'>;

export function EditDailyGoalScreen({ navigation }: Props) {
  const profile = getProfile()!;
  const sessionMin = Math.round((profile.defaultSessionLength ?? 1500) / 60);

  // Infer current blocks from dailyGoal
  const currentBlocks = Math.round((profile.dailyGoal?.value ?? sessionMin * 2) / sessionMin);
  const [blocks, setBlocks] = useState(Math.min(Math.max(currentBlocks, 1), 4));

  const OPTIONS = [1, 2, 3, 4].map(n => ({
    n,
    label: n === 1 ? '1 block' : `${n} blocks`,
    subtitle: `${n * sessionMin} min / day`,
  }));

  const handleSave = () => {
    saveProfile({
      ...profile,
      dailyGoal: { type: 'minutes', value: blocks * sessionMin },
    });
    navigation.goBack();
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <EditNavBar title="Daily goal" onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <Text style={styles.h2}>How many blocks a day?</Text>

          <View style={styles.options}>
            {OPTIONS.map(opt => (
              <OptionCard
                key={opt.n}
                title={opt.label}
                subtitle={opt.subtitle}
                selected={blocks === opt.n}
                onPress={() => setBlocks(opt.n)}
              />
            ))}
          </View>

          <View style={styles.spacer} />
          <PrimaryButton label="Save" onPress={handleSave} />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 8, paddingBottom: 32, gap: 24 },
  h2: { ...TextStyles.h2 },
  options: { gap: 10 },
  spacer: { flex: 1 },
});
