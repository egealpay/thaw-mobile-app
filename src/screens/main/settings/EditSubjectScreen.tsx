import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenBackground } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { getProfile, saveProfile } from '../../../storage/mmkv';
import type { SettingsEditParamList } from '../../../navigation/types';
import { EditNavBar } from './EditNavBar';

type Props = NativeStackScreenProps<SettingsEditParamList, 'EditSubject'>;

const CATEGORIES = ['Exam', 'Project', 'Interview', 'Certification', 'Other'];

export function EditSubjectScreen({ navigation }: Props) {
  const profile = getProfile()!;
  const [subject, setSubject] = useState(profile.deadline?.label ?? '');
  const [category, setCategory] = useState('Exam');

  const handleSave = () => {
    if (!subject.trim()) return;
    saveProfile({
      ...profile,
      deadline: { ...(profile.deadline ?? { date: '' }), label: subject.trim() },
    });
    navigation.goBack();
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <EditNavBar title="Preparing for" onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.h2}>What are you preparing for?</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Organic Chemistry final"
              placeholderTextColor={Colors.faint}
              value={subject}
              onChangeText={setSubject}
              returnKeyType="done"
              autoFocus
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CATEGORY</Text>
              <View style={styles.chips}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.chip, category === cat && styles.chipSelected]}
                  >
                    <Text style={[styles.chipLabel, category === cat && styles.chipLabelSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <PrimaryButton label="Save" onPress={handleSave} disabled={!subject.trim()} />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: Spacing.screenH, paddingBottom: 32, gap: 16 },
  scroll: { paddingTop: 8, gap: 24 },
  h2: { ...TextStyles.h2 },
  input: {
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: Colors.ink,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  section: { gap: 10 },
  sectionLabel: { ...TextStyles.sectionLabel },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Spacing.radiusChip,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipLabel: { fontFamily: 'Outfit-Medium', fontSize: 14, color: Colors.body },
  chipLabelSelected: { color: Colors.white },
});
