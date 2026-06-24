import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import LinearGradientRN from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components';
import { Colors, Spacing, TextStyles } from '../../constants';
import { getAllSessions, getSessionsForWeek } from '../../storage/db';
import { getProfile } from '../../storage/mmkv';
import { computeStreak } from '../../engine/streak';
import { daysUntil } from '../../utils/formatters';
import type { SessionRecord } from '../../types';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function WeeklyBarsChart({ sessions }: { sessions: SessionRecord[] }) {
  const chartW = 280;
  const chartH = 110;
  const barW = 28;
  const gap = (chartW - barW * 7) / 8;
  const today = new Date().getDay(); // 0=Sun
  const dayIndex = (d: number) => (d === 0 ? 6 : d - 1); // Mon=0…Sun=6
  const todayIdx = dayIndex(today);

  const minutesByDay = Array(7).fill(0);
  sessions.forEach(s => {
    if (s.outcome !== 'complete') return;
    const day = new Date(s.startedAt).getDay();
    minutesByDay[dayIndex(day)] += s.focusedDuration / 60;
  });

  const maxMins = Math.max(...minutesByDay, 1);

  return (
    <Svg width={chartW} height={chartH + 24}>
      <Defs>
        <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.accentMid} stopOpacity={1} />
          <Stop offset="1" stopColor={Colors.primary} stopOpacity={1} />
        </LinearGradient>
      </Defs>

      {DAY_LABELS.map((label, i) => {
        const hasData = minutesByDay[i] > 0;
        const isToday = todayIdx === i;
        const barH = hasData
          ? Math.max(14, (minutesByDay[i] / maxMins) * chartH)
          : 4; // short stub for empty days
        const x = gap + i * (barW + gap);
        const y = chartH - barH;

        return (
          <React.Fragment key={i}>
            <Rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={hasData ? 7 : 2}
              fill={hasData ? 'url(#barGrad)' : Colors.track}
            />
            <SvgText
              x={x + barW / 2}
              y={chartH + 18}
              textAnchor="middle"
              fontSize={isToday ? 12 : 11}
              fontFamily={isToday ? 'Outfit-SemiBold' : 'Outfit-Regular'}
              fill={isToday ? Colors.primary : Colors.faint2}
            >
              {label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// Deadline countdown ring — shows days remaining in center, ring = elapsed progress
function DeadlineRing({ daysLeft, totalDays, size = 70 }: { daysLeft: number; totalDays: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const elapsed = totalDays > 0 ? Math.max(0, Math.min(1, 1 - daysLeft / totalDays)) : 0;
  const strokeDashoffset = circumference * (1 - elapsed);

  return (
    <View style={ringStyles.wrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={Colors.track} strokeWidth={strokeWidth} fill="transparent"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={Colors.primary} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[ringStyles.inner, { width: size, height: size }]}>
        <Text style={ringStyles.value}>{daysLeft}</Text>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  wrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  inner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 20, color: Colors.ink },
});

export function StatsScreen() {
  const [profile, setProfile] = useState(getProfile());
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [weekSessions, setWeekSessions] = useState<SessionRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      setProfile(getProfile());
      setSessions(getAllSessions());
      setWeekSessions(getSessionsForWeek());
    }, []),
  );

  if (!profile) return null;

  const streak = computeStreak(sessions, profile.dailyGoal.value);
  const totalMinutes = sessions
    .filter(s => s.outcome === 'complete')
    .reduce((sum, s) => sum + s.focusedDuration / 60, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const weekMinutes = weekSessions
    .filter(s => s.outcome === 'complete')
    .reduce((sum, s) => sum + s.focusedDuration / 60, 0);

  const rawDeadlineDays = profile.deadline?.date ? daysUntil(profile.deadline.date) : null;
  const deadlineDays = rawDeadlineDays !== null && Number.isFinite(rawDeadlineDays) ? rawDeadlineDays : null;

  // Estimate total deadline span: deadline date vs. a fixed 90-day window or actual distance
  // Use the deadline date distance from now as a fraction; assume profile was created recently
  // so totalDays = deadlineDays + 7 (conservative: 1 week already elapsed)
  const totalDeadlineDays = deadlineDays !== null ? deadlineDays + 7 : 1;

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.h2}>Your progress</Text>

          {/* Top tiles */}
          <View style={styles.tilesRow}>
            <View style={[styles.tile, styles.tileGradientWrap]}>
              <LinearGradientRN
                colors={[Colors.accentLight, Colors.primary]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.tileValueWhite}>{streak.current}</Text>
              <Text style={styles.tileLabelWhite}>day streak</Text>
            </View>
            <View style={[styles.tile, styles.tileFrosted]}>
              <Text style={styles.tileValue}>{totalHours}h</Text>
              <Text style={styles.tileLabel}>focused total</Text>
            </View>
          </View>

          {/* Weekly bars */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>THIS WEEK</Text>
              <Text style={styles.weekTotal}>
                {Math.floor(weekMinutes / 60)}h {Math.round(weekMinutes % 60)}m
              </Text>
            </View>
            <WeeklyBarsChart sessions={weekSessions} />
          </View>

          {/* Deadline countdown */}
          {profile.deadline && deadlineDays !== null && (
            <View style={styles.card}>
              <View style={styles.deadlineRow}>
                <DeadlineRing daysLeft={deadlineDays} totalDays={totalDeadlineDays} size={72} />
                <View style={styles.deadlineText}>
                  <Text style={styles.deadlineTitle}>{profile.deadline.label}</Text>
                  <Text style={styles.deadlineSub}>
                    {deadlineDays} {deadlineDays === 1 ? 'day' : 'days'} left · on track for your goal
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.screenH,
    gap: 14,
    paddingBottom: 32,
  },
  h2: { ...TextStyles.h2 },
  tilesRow: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1,
    borderRadius: Spacing.radiusCard,
    padding: 20,
    gap: 4,
  },
  tileGradientWrap: {
    overflow: 'hidden',
  },
  tileFrosted: {
    backgroundColor: Colors.cardWhiteSelected,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tileValueWhite: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 36,
    color: Colors.white,
  },
  tileValue: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 36,
    color: Colors.ink,
  },
  tileLabelWhite: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  tileLabel: { fontFamily: 'Outfit-Regular', fontSize: 13, color: Colors.muted },
  card: {
    backgroundColor: Colors.cardWhiteSelected,
    borderRadius: Spacing.radiusCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: { ...TextStyles.sectionLabel },
  weekTotal: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 15,
    color: Colors.ink,
  },
  deadlineRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  deadlineText: { flex: 1, gap: 4 },
  deadlineTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 15,
    color: Colors.ink,
  },
  deadlineSub: { fontFamily: 'Outfit-Regular', fontSize: 13, color: Colors.muted },
});
