import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ScreenBackground } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { getProfile, saveProfile } from '../../../storage/mmkv';
import type { SettingsEditParamList } from '../../../navigation/types';
import { EditNavBar } from './EditNavBar';

type Props = NativeStackScreenProps<SettingsEditParamList, 'EditIceStyle'>;

export function EditIceStyleScreen({ navigation }: Props) {
  const profile = getProfile()!;
  const [selected, setSelected] = useState<'glacier' | 'frost'>(
    profile.iceProfileDefault ?? 'glacier',
  );

  const handleSave = () => {
    saveProfile({ ...profile, iceProfileDefault: selected });
    navigation.goBack();
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <EditNavBar title="Ice style" onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <Text style={styles.h2}>Pick your ice.</Text>

          <View style={styles.row}>
            {(['glacier', 'frost'] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.card, selected === p && styles.cardSelected]}
                onPress={() => setSelected(p)}
                activeOpacity={0.8}
              >
                <IceCube progress={0} state="idle" iceProfile={p} size={96} />
                <Text style={styles.cardTitle}>{p === 'glacier' ? 'Glacier' : 'Frost'}</Text>
                <Text style={styles.cardSub}>{p === 'glacier' ? 'Clear & cool' : 'Soft & matte'}</Text>
              </TouchableOpacity>
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
  container: { flex: 1, paddingHorizontal: Spacing.screenH, paddingTop: 8, paddingBottom: 32, gap: 24 },
  spacer: { flex: 1 },
  h2: { ...TextStyles.h2 },
  row: { flexDirection: 'row', gap: 14, alignItems: 'stretch' },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardWhiteSelected,
  },
  cardTitle: { fontFamily: 'Outfit-SemiBold', fontSize: 16, color: Colors.ink },
  cardSub: { ...TextStyles.cardSubtitle },
});
