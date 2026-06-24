import type { SessionRecord } from '../types';

export interface StreakResult {
  current: number;
  longest: number;
}

export interface DailyProgressResult {
  minutesDone: number;
  goalMinutes: number;
  complete: boolean;
  progressFraction: number;
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function focusedMinutesForDay(sessions: SessionRecord[], dayMs: number): number {
  const dayStart = startOfDay(dayMs);
  const dayEnd = dayStart + 86400000;
  return sessions
    .filter(s => s.outcome === 'complete' && s.startedAt >= dayStart && s.startedAt < dayEnd)
    .reduce((sum, s) => sum + s.focusedDuration, 0) / 60;
}

export function computeStreak(
  sessions: SessionRecord[],
  dailyGoalMinutes: number,
): StreakResult {
  const now = Date.now();
  let current = 0;
  let longest = 0;
  let streak = 0;
  let day = startOfDay(now);

  // Walk backwards day by day
  for (let i = 0; i < 365; i++) {
    const minutes = focusedMinutesForDay(sessions, day);
    if (minutes >= dailyGoalMinutes) {
      streak++;
      if (current === 0 && i === 0) current = streak;
    } else {
      // Allow today to be incomplete without breaking streak
      if (i === 0) {
        day -= 86400000;
        continue;
      }
      longest = Math.max(longest, streak);
      if (current === 0) current = streak;
      break;
    }
    day -= 86400000;
  }
  longest = Math.max(longest, streak);
  if (current === 0) current = streak;
  return { current, longest };
}

export function computeDailyProgress(
  sessions: SessionRecord[],
  dailyGoalMinutes: number,
  dateMs: number = Date.now(),
): DailyProgressResult {
  const minutesDone = focusedMinutesForDay(sessions, dateMs);
  const progressFraction = Math.min(minutesDone / dailyGoalMinutes, 1);
  return {
    minutesDone: Math.round(minutesDone),
    goalMinutes: dailyGoalMinutes,
    complete: minutesDone >= dailyGoalMinutes,
    progressFraction,
  };
}
