import React, { useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FrostedCard, PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { daysUntil, formatMinutes } from '../../../utils/formatters';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FocusProfileReveal'>;

interface RevealRow {
  field: string;
  label: string;
  value: string;
  why: string;
  editScreen: keyof OnboardingStackParamList;
}

export function FocusProfileRevealScreen({ navigation }: Props) {
  const { draft, setDerivedBy, build } = useContext(OnboardingContext);

  const days = draft.deadline?.date ? daysUntil(draft.deadline.date) : null;

  const rows: RevealRow[] = [
    draft.deadline && {
      field: 'goal',
      label: 'Goal',
      value: draft.deadline.label,
      why: days != null ? `▸ ${days} days to go — you set ${draft.deadline.date}` : '▸ your deadline',
      editScreen: 'Subject',
    },
    {
      field: 'defaultSessionLength',
      label: 'Default block',
      value: formatMinutes(draft.defaultSessionLength ?? 1500),
      why: `▸ ${draft.derivedBy?.defaultSessionLength ?? 'your chosen length'}`,
      editScreen: 'FocusSpan',
    },
    {
      field: 'strictness',
      label: 'Strictness',
      value: draft.strictness === 'strict' ? 'Strict · refreeze' : 'Gentle · pause freely',
      why: `▸ ${draft.derivedBy?.strictness ?? 'your preference'}`,
      editScreen: 'Strictness',
    },
    {
      field: 'dailyGoal',
      label: 'Daily goal',
      value: `${draft.dailyGoal?.value ?? Math.ceil((draft.defaultSessionLength ?? 1500) / 60) * 2} min · ${draft.weeklyTargetDays ?? 5} days a week`,
      why: `▸ ${draft.derivedBy?.weeklyTargetDays ?? 'based on your schedule'}`,
      editScreen: 'DaysPerWeek',
    },
  ].filter(Boolean) as RevealRow[];

  const handleContinue = () => {
    navigation.navigate('Notifications');
  };

  return (
    <ScreenBackground variant="reveal">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.82} onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.eyebrow}>YOUR FOCUS PROFILE</Text>
          <Text style={styles.h2}>Here's what we set up.</Text>
          <Text style={styles.body}>
            Every default traces back to an answer. Tap any to change it.
          </Text>

          <View style={styles.cards}>
            {rows.map(row => (
              <FrostedCard key={row.field} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>{row.label}</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate(row.editScreen as any)}
                    hitSlop={8}
                  >
                    <Text style={styles.editIcon}>✎</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardValue}>{row.value}</Text>
                <Text style={styles.whyLine}>{row.why}</Text>
              </FrostedCard>
            ))}
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Looks right →" onPress={handleContinue} />
            <Text style={styles.hint}>You can edit all of this in Settings</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 32,
    gap: 16,
  },
  eyebrow: { ...TextStyles.eyebrow },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  cards: { gap: 10 },
  card: { gap: 6 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editIcon: {
    fontSize: 16,
    color: Colors.muted,
  },
  cardValue: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 20,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  whyLine: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: Colors.primary,
  },
  actions: { gap: 10 },
  hint: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
  },
});
