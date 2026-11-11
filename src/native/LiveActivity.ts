import { NativeModules, Platform } from 'react-native';

const mod = Platform.OS === 'ios' ? NativeModules.LiveActivityModule : null;

export const LiveActivity = {
  /** Shows the lock-screen activity. iOS counts down on its own from here on. */
  start(subject: string, targetSeconds: number, remainingSeconds: number): void {
    mod?.startActivity(subject, targetSeconds, remainingSeconds);
  },
  /** Call only when the timer's course changes (pause, resume, reconcile) — not every tick. */
  update(remainingSeconds: number, isPaused: boolean): void {
    mod?.updateActivity(remainingSeconds, isPaused);
  },
  end(): void {
    mod?.endActivity();
  },
  /** True if the app's last trip to the background was a screen lock rather than an app switch. */
  async consumeLastBackgroundWasLock(): Promise<boolean> {
    if (!mod) return false;
    try {
      return Boolean(await mod.consumeLastBackgroundWasLock());
    } catch {
      return false;
    }
  },
};
