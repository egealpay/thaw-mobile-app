import { NativeModules, Platform } from 'react-native';

const mod = Platform.OS === 'ios' ? NativeModules.LiveActivityModule : null;

export const LiveActivity = {
  start(subject: string, targetSeconds: number, remainingSeconds: number, meltProgress: number): void {
    mod?.startActivity(subject, targetSeconds, remainingSeconds, meltProgress);
  },
  update(remainingSeconds: number, meltProgress: number, isPaused: boolean): void {
    mod?.updateActivity(remainingSeconds, meltProgress, isPaused);
  },
  end(): void {
    mod?.endActivity();
  },
};
