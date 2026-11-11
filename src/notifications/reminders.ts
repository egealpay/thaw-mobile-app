import notifee, {
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
  type NotificationSettings,
} from '@notifee/react-native';
import { getAllSessions } from '../storage/db';
import { getProfile, getSettings, saveSettings } from '../storage/mmkv';
import { computeDailyProgress } from '../engine/streak';
import { planReminders, REMINDER_ID_PREFIX } from './reminderPlan';

const CHANNEL_ID = 'reminders';

function isGranted(s: NotificationSettings): boolean {
  return (
    s.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    s.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

/** Asks for permission. Resolves true if notifications may be shown. */
export async function requestReminderPermission(): Promise<boolean> {
  try {
    return isGranted(await notifee.requestPermission());
  } catch {
    return false;
  }
}

/**
 * Makes the scheduled reminders match the current profile + settings.
 * Idempotent: safe to call on every app foreground and after any change.
 */
export async function syncReminders(): Promise<void> {
  try {
    const ours = (await notifee.getTriggerNotificationIds()).filter(id =>
      id.startsWith(REMINDER_ID_PREFIX),
    );
    if (ours.length) await notifee.cancelTriggerNotifications(ours);

    const profile = getProfile();
    const settings = getSettings();
    if (!profile || !settings.notificationsEnabled) return;
    if (!isGranted(await notifee.getNotificationSettings())) return;

    const channelId = await notifee.createChannel({ id: CHANNEL_ID, name: 'Daily Reminders' });
    const goalMetToday = computeDailyProgress(getAllSessions(), profile.dailyGoal.value).complete;

    const body = profile.deadline?.label
      ? `Time for a focus block toward ${profile.deadline.label}.`
      : 'Your ice is waiting. One focus block?';

    const plans = planReminders({
      reminderTime: settings.reminderTime,
      studyDays: profile.studyDays,
      quietHours: {
        enabled: settings.quietHoursEnabled,
        start: settings.quietHoursStart,
        end: settings.quietHoursEnd,
      },
      goalMetToday,
      now: Date.now(),
    });

    for (const plan of plans) {
      await notifee.createTriggerNotification(
        {
          id: plan.id,
          title: 'Thaw',
          body,
          android: { channelId, pressAction: { id: 'default' } },
        },
        { type: TriggerType.TIMESTAMP, timestamp: plan.timestamp, repeatFrequency: RepeatFrequency.WEEKLY },
      );
    }
  } catch {
    // Reminders are best-effort; never break the app over them.
  }
}

/** Turns reminders on (asking for permission if needed). Resolves false if permission was denied. */
export async function enableReminders(reminderTime?: string): Promise<boolean> {
  const granted = await requestReminderPermission();
  if (!granted) return false;
  const settings = getSettings();
  saveSettings({
    ...settings,
    notificationsEnabled: true,
    reminderTime: reminderTime ?? settings.reminderTime,
  });
  await syncReminders();
  return true;
}

export async function disableReminders(): Promise<void> {
  saveSettings({ ...getSettings(), notificationsEnabled: false });
  await syncReminders();
}
