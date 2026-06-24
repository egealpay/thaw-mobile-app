import type { NavigatorScreenParams } from '@react-navigation/native';
import type { FocusProfile } from '../types';

export type OnboardingStackParamList = {
  ColdOpen: undefined;
  MiniMeltDemo: undefined;
  PathFork: undefined;
  // Deadline
  Subject: undefined;
  DeadlineDate: undefined;
  DaysPerWeek: undefined;
  // Habit
  StudyTime: undefined;
  HabitDays: undefined;
  // Explore
  PickAndGo: undefined;
  // Shared
  FocusSpan: undefined;
  PickIce: undefined;
  Strictness: undefined;
  BlockSize: undefined;
  DailyBlocks: undefined;
  FocusProfileReveal: undefined;
  Notifications: undefined;
  FirstSession: { profile: FocusProfile };
};

export type SessionStackParamList = {
  ActiveSession: { targetSeconds?: number; profile: FocusProfile; endSession?: boolean };
  Paused: { meltProgress: number; iceProfile: 'glacier' | 'frost'; strictness: 'gentle' | 'strict' };
  Refreeze: undefined;
  SessionComplete: { focusedMinutes: number; streak: number; todayMinutes: number };
};

export type MainTabParamList = {
  Home: undefined;
  Stats: undefined;
  Settings: undefined;
};

export type SettingsStackParamList = {
  SettingsProfile: undefined;
  DataReminders: undefined;
};

export type SettingsEditParamList = {
  EditSubject: undefined;
  EditDeadline: undefined;
  EditBlockSize: undefined;
  EditIceStyle: undefined;
  EditDailyGoal: undefined;
  EditStudyDays: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainApp: undefined;
  Session: { targetSeconds?: number; profile: FocusProfile };
  SettingsEdit: NavigatorScreenParams<SettingsEditParamList>;
};
