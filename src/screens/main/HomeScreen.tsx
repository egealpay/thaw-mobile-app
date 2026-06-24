import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Rect } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoalRing, PrimaryButton, ScreenBackground } from '../../components';
import { Colors, Spacing, TextStyles } from '../../constants';
import { getAllSessions } from '../../storage/db';
import { getProfile } from '../../storage/mmkv';
import { computeDailyProgress, computeStreak } from '../../engine/streak';
import { daysUntil, greetingForHour } from '../../utils/formatters';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import type { SessionRecord } from '../../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Groups completed sessions into displayable rows (up to 2 day-groups)
function groupRecentSessions(sessions: SessionRecord[]) {
  const now = new Date();
  const groups: { label: string; minutes: number; isToday: boolean }[] = [];

  for (let i = 0; i < 7 && groups.length < 2; i++) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = sessions.filter(
      s => s.outcome === 'complete' && s.startedAt >= dayStart.getTime() && s.startedAt <= dayEnd.getTime(),
    );
    if (daySessions.length === 0) continue;

    const minutes = Math.round(daySessions.reduce((sum, s) => sum + s.focusedDuration, 0) / 60);

    let label: string;
    if (i === 0) {
      if (daySessions.length === 1) {
        const hour = new Date(daySessions[0].startedAt).getHours();
        label = hour < 12 ? 'Morning block' : hour < 17 ? 'Afternoon block' : 'Evening block';
      } else {
        label = `Today · ${daySessions.length} blocks`;
      }
    } else if (i === 1) {
      label = daySessions.length === 1 ? 'Yesterday' : `Yesterday · ${daySessions.length} blocks`;
    } else {
      const name = dayStart.toLocaleDateString('en-US', { weekday: 'long' });
      label = daySessions.length === 1 ? name : `${name} · ${daySessions.length} blocks`;
    }

    groups.push({ label, minutes, isToday: i === 0 });
  }

  return groups;
}

// Small white diamond icon for the start button
// 10×10 rect rotated 45° has bounding box ≈14.1px, safely inside 18px SVG.
function DiamondIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Rect
        x={4}
        y={4}
        width={10}
        height={10}
        rx={2.5}
        fill="rgba(255,255,255,0.92)"
        transform="rotate(45, 9, 9)"
      />
    </Svg>
  );
}

// Deadline strip icon: frosted rounded-square container + rotated diamond inside
function DeadlineIcon() {
  return (
    <View style={deadlineIconS.wrap}>
      <View style={deadlineIconS.diamond} />
    </View>
  );
}

const deadlineIconS = StyleSheet.create({
  wrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamond: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: Colors.white,
    transform: [{ rotate: '45deg' }],
  },
});

export function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState(getProfile());
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      setProfile(getProfile());
      setSessions(getAllSessions());
    }, []),
  );

  if (!profile) return null;

  const dailyProgress = computeDailyProgress(sessions, profile.dailyGoal.value);
  const streak = computeStreak(sessions, profile.dailyGoal.value);
  const recentGroups = groupRecentSessions(sessions);
  const rawDeadlineDays = profile.deadline?.date ? daysUntil(profile.deadline.date) : null;
  const deadlineDays = rawDeadlineDays !== null && Number.isFinite(rawDeadlineDays)
    ? rawDeadlineDays
    : null;
  const blocksToGo =
    deadlineDays !== null && deadlineDays > 0
      ? Math.ceil(
          (profile.dailyGoal.value * ((profile.weeklyTargetDays ?? 5) / 7) * deadlineDays) /
            ((profile.defaultSessionLength ?? 1500) / 60),
        )
      : null;

  const minutesLeft = Math.max(0, profile.dailyGoal.value - dailyProgress.minutesDone);

  const handleStart = () => {
    navigation.navigate('Session', {
      profile,
      targetSeconds: profile.defaultSessionLength,
    });
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greetingForHour()}</Text>
              <Text style={styles.tagline}>Let's chip away.</Text>
            </View>
            <View style={styles.streakChip}>
              <Text style={styles.streakChipText}>▲ {streak.current} day streak</Text>
            </View>
          </View>

          {/* Daily goal card */}
          <View style={styles.goalCard}>
            <GoalRing
              progress={dailyProgress.progressFraction}
              minutesDone={dailyProgress.minutesDone}
              goalMinutes={profile.dailyGoal.value}
              size={110}
            />
            <View style={styles.goalText}>
              <Text style={styles.goalLabel}>TODAY'S GOAL</Text>
              {dailyProgress.complete ? (
                <Text style={styles.goalBody}>Goal complete! Great work today.</Text>
              ) : (
                <Text style={styles.goalBody}>
                  One more{' '}
                  <Text style={styles.goalBold}>{minutesLeft}-minute</Text>
                  {' '}block and today is done.
                </Text>
              )}
            </View>
          </View>

          {/* Deadline strip */}
          {profile.deadline && deadlineDays !== null && (
            <View style={styles.deadlineStrip}>
              <LinearGradient
                colors={[Colors.accentLight, Colors.primary]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <DeadlineIcon />
              <View style={styles.deadlineText}>
                <Text style={styles.deadlineTitle}>{profile.deadline.label}</Text>
                <Text style={styles.deadlineSub}>
                  {deadlineDays === 0
                    ? 'Due today · give it everything'
                    : `${deadlineDays} ${deadlineDays === 1 ? 'day' : 'days'} left · ~${blocksToGo ?? '—'} focus blocks to go`}
                </Text>
              </View>
            </View>
          )}

          {/* Recent sessions */}
          {recentGroups.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT</Text>
              {recentGroups.map((g, i) => (
                <View key={i} style={styles.recentCard}>
                  <Text style={styles.recentLabel}>{g.label}</Text>
                  <Text style={[styles.recentTime, g.isToday && styles.recentTimeToday]}>
                    {g.minutes} min
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* CTA pinned at bottom */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            label="Start a block"
            onPress={handleStart}
            leftIcon={<DiamondIcon />}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.screenH,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 16,
    paddingTop: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: Colors.muted,
  },
  tagline: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 28,
    color: Colors.ink,
    marginTop: 2,
  },
  streakChip: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: 4,
  },
  streakChipText: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },

  // Goal card
  goalCard: {
    backgroundColor: Colors.cardWhiteSelected,
    borderRadius: Spacing.radiusCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  goalText: { flex: 1, gap: 6 },
  goalLabel: { ...TextStyles.sectionLabel },
  goalBody: { ...TextStyles.body, fontSize: 15 },
  goalBold: { fontFamily: 'Outfit-Bold', color: Colors.ink },

  // Deadline strip — plain View so layout grows with content; gradient is absoluteFill behind
  deadlineStrip: {
    borderRadius: Spacing.radiusCard,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deadlineText: { flex: 1, gap: 3 },
  deadlineTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 15,
    color: Colors.white,
  },
  deadlineSub: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // Recent
  section: { gap: 8 },
  sectionTitle: { ...TextStyles.sectionLabel },
  recentCard: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: Colors.ink,
  },
  recentTime: {
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    color: Colors.muted,
  },
  recentTimeToday: {
    color: Colors.primary,
    fontFamily: 'Outfit-SemiBold',
  },
});
