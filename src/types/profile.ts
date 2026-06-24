import type { IceProfile } from './melt';
import type { Strictness } from './session';

export type OnboardingPath = 'deadline' | 'habit' | 'explore';

export interface Preset {
  name: 'quick' | 'standard' | 'deep';
  seconds: number;
}

export interface StudyWindow {
  dayOfWeek?: number;
  startTime: string; // "HH:MM" 24h
}

export interface DailyGoal {
  type: 'minutes';
  value: number;
}

export interface Deadline {
  label: string;
  date: string; // ISO date string
}

export type DerivedBy = Record<string, string>;

export interface FocusProfile {
  path: OnboardingPath;
  defaultSessionLength: number; // seconds
  presets: Preset[];
  strictness: Strictness;
  iceProfileDefault: IceProfile;
  studyWindow: StudyWindow;
  dailyGoal: DailyGoal;
  weeklyTargetDays: number;
  deadline?: Deadline;
  derivedBy: DerivedBy;
}

export interface SettingsBlob {
  notificationsEnabled: boolean;
  reminderTime: string; // "HH:MM"
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  iCloudBackup: boolean;
}

export const DEFAULT_SETTINGS: SettingsBlob = {
  notificationsEnabled: false,
  reminderTime: '19:30',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  iCloudBackup: false,
};
