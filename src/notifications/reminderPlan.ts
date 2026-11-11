/**
 * Pure scheduling math for the daily reminder — no native calls, so it can be unit tested.
 */

export interface ReminderPlanInput {
  /** "HH:MM", 24h */
  reminderTime: string;
  /** Mon=0 … Sun=6. Missing or all-false means every day. */
  studyDays?: boolean[];
  quietHours: { enabled: boolean; start: string; end: string };
  /** Today's daily goal is already met: skip today's nudge. */
  goalMetToday: boolean;
  now: number;
}

export interface PlannedReminder {
  id: string;
  /** First fire time (ms). Repeats weekly from here. */
  timestamp: number;
}

export const REMINDER_ID_PREFIX = 'thaw-reminder-';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function inQuietHours(min: number, start: number, end: number): boolean {
  if (start === end) return false;
  // Window may wrap past midnight (e.g. 22:00 → 08:00)
  return start < end ? min >= start && min < end : min >= start || min < end;
}

/** Effective reminder time in minutes after midnight; a time inside quiet hours moves to when they end. */
export function effectiveReminderMinutes(input: Pick<ReminderPlanInput, 'reminderTime' | 'quietHours'>): number {
  const t = toMinutes(input.reminderTime);
  const { enabled, start, end } = input.quietHours;
  if (enabled && inQuietHours(t, toMinutes(start), toMinutes(end))) return toMinutes(end);
  return t;
}

export function planReminders(input: ReminderPlanInput): PlannedReminder[] {
  const minutes = effectiveReminderMinutes(input);
  const days =
    input.studyDays && input.studyDays.length === 7 && input.studyDays.some(Boolean)
      ? input.studyDays
      : [true, true, true, true, true, true, true];

  const now = new Date(input.now);
  const plans: PlannedReminder[] = [];

  days.forEach((selected, monFirstIndex) => {
    if (!selected) return;
    const jsDay = (monFirstIndex + 1) % 7; // Date#getDay(): Sun=0 … Sat=6
    const fire = new Date(now);
    fire.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    fire.setDate(fire.getDate() + ((jsDay - now.getDay() + 7) % 7));

    let ts = fire.getTime();
    const isToday = fire.toDateString() === now.toDateString();
    if (ts <= input.now || (isToday && input.goalMetToday)) ts += WEEK_MS;

    plans.push({ id: `${REMINDER_ID_PREFIX}${monFirstIndex}`, timestamp: ts });
  });

  return plans;
}
