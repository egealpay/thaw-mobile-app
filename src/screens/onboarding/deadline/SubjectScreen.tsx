import React, { useContext, useState } from 'react';
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
import { PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Subject'>;

const CATEGORIES = ['Exam', 'Project', 'Interview', 'Certification', 'Other'];

export function SubjectScreen({ navigation }: Props) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Exam');
  const { update, setDerivedBy } = useContext(OnboardingContext);

  const handleContinue = () => {
    update({ deadline: { label: subject, date: '' } });
    setDerivedBy('deadline.label', `"${subject}" — you set this`);
    navigation.navigate('DeadlineDate');
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.18} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.textBlock}>
              <Text style={styles.h2}>What are you preparing for?</Text>
              <Text style={styles.body}>Name it so your sessions feel like progress.</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="e.g. Organic Chemistry final"
              placeholderTextColor={Colors.faint}
              value={subject}
              onChangeText={setSubject}
              returnKeyType="done"
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Category</Text>
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

          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!subject.trim()}
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
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 32,
    gap: 16,
  },
  scroll: {
    paddingTop: 24,
    gap: 24,
  },
  textBlock: { gap: 10 },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
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
  sectionLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: Colors.muted,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Spacing.radiusChip,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: Colors.body,
  },
  chipLabelSelected: { color: Colors.white },
});
