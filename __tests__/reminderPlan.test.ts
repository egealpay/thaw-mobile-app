import { effectiveReminderMinutes, planReminders } from '../src/notifications/reminderPlan';

// Wednesday 11 Nov 2026, 12:00 local time
const WED_NOON = new Date(2026, 10, 11, 12, 0).getTime();
const at = (day: number, h: number, m: number) => new Date(2026, 10, day, h, m).getTime();

const MON_WED_FRI = [true, false, true, false, true, false, false];
const QUIET_OFF = { enabled: false, start: '22:00', end: '08:00' };

describe('planReminders', () => {
  it('schedules the next occurrence of each study day', () => {
    const plans = planReminders({
      reminderTime: '19:30',
      studyDays: MON_WED_FRI,
      quietHours: QUIET_OFF,
      goalMetToday: false,
      now: WED_NOON,
    });
    const byId = Object.fromEntries(plans.map(p => [p.id, p.timestamp]));
    expect(plans).toHaveLength(3);
    expect(byId['thaw-reminder-0']).toBe(at(16, 19, 30)); // next Monday
    expect(byId['thaw-reminder-2']).toBe(at(11, 19, 30)); // today
    expect(byId['thaw-reminder-4']).toBe(at(13, 19, 30)); // Friday
  });

  it("skips today's reminder once the daily goal is met", () => {
    const plans = planReminders({
      reminderTime: '19:30',
      studyDays: MON_WED_FRI,
      quietHours: QUIET_OFF,
      goalMetToday: true,
      now: WED_NOON,
    });
    expect(plans.find(p => p.id === 'thaw-reminder-2')!.timestamp).toBe(at(18, 19, 30));
  });

  it("moves today's reminder to next week if the time has passed", () => {
    const plans = planReminders({
      reminderTime: '09:00',
      studyDays: MON_WED_FRI,
      quietHours: QUIET_OFF,
      goalMetToday: false,
      now: WED_NOON,
    });
    expect(plans.find(p => p.id === 'thaw-reminder-2')!.timestamp).toBe(at(18, 9, 0));
  });

  it('falls back to every day when study days are missing or empty', () => {
    const base = { reminderTime: '19:30', quietHours: QUIET_OFF, goalMetToday: false, now: WED_NOON };
    expect(planReminders(base)).toHaveLength(7);
    expect(planReminders({ ...base, studyDays: [false, false, false, false, false, false, false] })).toHaveLength(7);
  });

  it('never fires in the past', () => {
    const plans = planReminders({
      reminderTime: '12:00',
      quietHours: QUIET_OFF,
      goalMetToday: false,
      now: WED_NOON,
    });
    plans.forEach(p => expect(p.timestamp).toBeGreaterThan(WED_NOON));
  });
});

describe('effectiveReminderMinutes', () => {
  it('moves a reminder inside quiet hours to when they end (window wraps midnight)', () => {
    const quiet = { enabled: true, start: '22:00', end: '08:00' };
    expect(effectiveReminderMinutes({ reminderTime: '23:15', quietHours: quiet })).toBe(8 * 60);
    expect(effectiveReminderMinutes({ reminderTime: '06:00', quietHours: quiet })).toBe(8 * 60);
    expect(effectiveReminderMinutes({ reminderTime: '19:30', quietHours: quiet })).toBe(19 * 60 + 30);
  });

  it('ignores quiet hours when they are off', () => {
    expect(effectiveReminderMinutes({ reminderTime: '23:15', quietHours: QUIET_OFF })).toBe(23 * 60 + 15);
  });
});
