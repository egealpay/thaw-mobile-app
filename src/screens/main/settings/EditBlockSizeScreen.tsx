import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, OptionCard, PrimaryButton, ScreenBackground } from '../../../components';
import { TextStyles } from '../../../constants';
import { getProfile, saveProfile } from '../../../storage/mmkv';
import type { SettingsEditParamList } from '../../../navigation/types';
import { EditNavBar } from './EditNavBar';

type Props = NativeStackScreenProps<SettingsEditParamList, 'EditBlockSize'>;

const OPTIONS = [
  { label: 'Quick', subtitle: 'small cube · 15 min', seconds: 900, size: 32 },
  { label: 'Standard', subtitle: 'a focused block · 25 min', seconds: 1500, size: 44 },
  { label: 'Deep', subtitle: 'a big block · 50 min', seconds: 3000, size: 58 },
];

export function EditBlockSizeScreen({ navigation }: Props) {
  const profile = getProfile()!;
  const [selected, setSelected] = useState(profile.defaultSessionLength ?? 1500);

  const handleSave = () => {
    saveProfile({ ...profile, defaultSessionLength: selected });
    navigation.goBack();
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <EditNavBar title="Default block" onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <Text style={styles.h2}>Set your default block.</Text>

          <View style={styles.options}>
            {OPTIONS.map(opt => (
              <OptionCard
                key={opt.seconds}
                title={opt.label}
                subtitle={opt.subtitle}
                selected={selected === opt.seconds}
                onPress={() => setSelected(opt.seconds)}
                trailingContent={
                  <IceCube progress={0} state="idle" iceProfile="glacier" size={opt.size} />
                }
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
