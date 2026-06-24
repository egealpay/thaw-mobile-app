import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DaySquares, PrimaryButton, ScreenBackground } from '../../../components';
import { TextStyles } from '../../../constants';
import { getProfile, saveProfile } from '../../../storage/mmkv';
import type { SettingsEditParamList } from '../../../navigation/types';
import { EditNavBar } from './EditNavBar';

type Props = NativeStackScreenProps<SettingsEditParamList, 'EditStudyDays'>;

function daysToSelection(n: number): boolean[] {
  // Fill weekdays first (Mon-Fri = indices 0-4), then Sat (5), then Sun (6)
  return [0, 1, 2, 3, 4, 5, 6].map(i => i < n);
}

export function EditStudyDaysScreen({ navigation }: Props) {
  const profile = getProfile()!;
  const [selected, setSelected] = useState(
    daysToSelection(profile.weeklyTargetDays ?? 5),
  );

  const count = selected.filter(Boolean).length;

  const handleSave = () => {
    saveProfile({ ...profile, weeklyTargetDays: count });
    navigation.goBack();
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <EditNavBar title="Study days" onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <Text style={styles.h2}>How many days a week?</Text>

          <DaySquares selected={selected} onChange={setSelected} />

          <View style={styles.spacer} />
          <PrimaryButton label="Save" onPress={handleSave} disabled={count === 0} />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 8, paddingBottom: 32, gap: 24 },
  h2: { ...TextStyles.h2 },
  spacer: { flex: 1 },
});
