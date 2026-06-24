import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenBackground, Toggle } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { getProfile, saveProfile } from '../../../storage/mmkv';
import { daysUntil } from '../../../utils/formatters';
import type { RootStackParamList } from '../../../navigation/types';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

function RowArrow() {
  return (
    <Svg width={16} height={12} viewBox="0 0 16 12">
      <Path
        d="M1 6H15M10 1L15 6L10 11"
        stroke={Colors.faint2}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Two-line row used in GOAL section: small hint on top, bold value below
function GoalRow({
  hint,
  value,
  onPress,
}: {
  hint: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.goalContent}>
        <Text style={styles.goalHint}>{hint}</Text>
        <Text style={styles.goalValue}>{value}</Text>
      </View>
      {onPress && <RowArrow />}
    </TouchableOpacity>
  );
}

// Single-line row: label left, blue value + chevron right
function Row({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, onPress && styles.rowValueBlue]}>{value}</Text>
        {onPress && <RowArrow />}
      </View>
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function formatDeadlineDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function formatStudyDays(n: number): string {
  if (n >= 7) return 'Every day';
  if (n === 6) return 'Mon–Sat';
  if (n === 5) return 'Mon–Fri';
  if (n === 4) return 'Mon–Thu';
  if (n === 3) return '3 days / week';
  return `${n} days / week`;
}

export function SettingsProfileScreen() {
  const navigation = useNavigation<RootNav>();
  const [profile, setProfile] = useState(getProfile());
  const [strictness, setStrictness] = useState(profile?.strictness ?? 'gentle');

  // Refresh profile whenever this screen comes back into focus (after an edit)
  useFocusEffect(
    useCallback(() => {
      const p = getProfile();
      setProfile(p);
      setStrictness(p?.strictness ?? 'gentle');
    }, []),
  );

  if (!profile) return null;

  const handleStrictnessToggle = (val: boolean) => {
    const next = val ? 'strict' : 'gentle';
    setStrictness(next);
    saveProfile({ ...profile, strictness: next });
  };

  const rawDays = profile.deadline?.date ? daysUntil(profile.deadline.date) : null;
  const deadlineDays = rawDays !== null && Number.isFinite(rawDays) ? rawDays : null;

  const deadlineValueStr =
    profile.deadline && deadlineDays !== null
      ? `${formatDeadlineDate(profile.deadline.date)} · ${deadlineDays} ${deadlineDays === 1 ? 'day' : 'days'} left`
      : profile.deadline?.date ?? '—';

  const sessionMin = Math.round((profile.defaultSessionLength ?? 1500) / 60);
  const studyDaysStr = formatStudyDays(profile.weeklyTargetDays ?? 5);

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.h2}>Focus Profile</Text>
          <Text style={styles.subtitle}>Everything from onboarding, editable.</Text>

          {profile.deadline && (
            <Section title="GOAL">
              <GoalRow
                hint="Preparing for"
                value={profile.deadline.label}
                onPress={() => navigation.navigate('SettingsEdit', { screen: 'EditSubject' })}
              />
              <View style={styles.divider} />
              <GoalRow
                hint="Deadline"
                value={deadlineValueStr}
                onPress={() => navigation.navigate('SettingsEdit', { screen: 'EditDeadline' })}
              />
            </Section>
          )}

          <Section title="SESSION">
            <Row
              label="Default block"
              value={`${sessionMin} min`}
              onPress={() => navigation.navigate('SettingsEdit', { screen: 'EditBlockSize' })}
            />
            <View style={styles.divider} />
            <Row
              label="Ice style"
              value={profile.iceProfileDefault === 'glacier' ? 'Glacier' : 'Frost'}
              onPress={() => navigation.navigate('SettingsEdit', { screen: 'EditIceStyle' })}
            />
            <View style={styles.divider} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.rowLabel}>Strict mode</Text>
                <Text style={styles.toggleSub}>Ice refreezes if you leave</Text>
              </View>
              <Toggle
                value={strictness === 'strict'}
                onChange={handleStrictnessToggle}
              />
            </View>
          </Section>

          <Section title="RHYTHM">
            <Row
              label="Daily goal"
              value={`${profile.dailyGoal.value} min`}
              onPress={() => navigation.navigate('SettingsEdit', { screen: 'EditDailyGoal' })}
            />
            <View style={styles.divider} />
            <Row
              label="Study days"
              value={studyDaysStr}
              onPress={() => navigation.navigate('SettingsEdit', { screen: 'EditStudyDays' })}
            />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.screenH,
    gap: 20,
    paddingBottom: 40,
  },
  h2: { ...TextStyles.h2 },
  subtitle: { ...TextStyles.body, marginTop: -8 },

  section: { gap: 8 },
  sectionLabel: { ...TextStyles.sectionLabel },
  sectionCard: {
    backgroundColor: Colors.cardWhiteSelected,
    borderRadius: Spacing.radiusCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: Colors.track, marginHorizontal: 18 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  // Goal section: two-line
  goalContent: { gap: 2 },
  goalHint: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: Colors.muted,
  },
  goalValue: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 16,
    color: Colors.ink,
    letterSpacing: -0.2,
  },

  // Session/Rhythm: single-line
  rowLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: Colors.ink,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: Colors.muted,
  },
  rowValueBlue: {
    color: Colors.primary,
  },

  // Toggle row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  toggleText: { gap: 2 },
  toggleSub: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: Colors.muted,
  },
});
