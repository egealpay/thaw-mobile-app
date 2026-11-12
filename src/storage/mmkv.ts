import { createMMKV } from 'react-native-mmkv';
import type { FocusProfile, SettingsBlob } from '../types';
import { DEFAULT_SETTINGS } from '../types';

export const storage = createMMKV();

const PROFILE_KEY = 'focusProfile';
const SETTINGS_KEY = 'settings';

export function getProfile(): FocusProfile | null {
  const raw = storage.getString(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FocusProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: FocusProfile): void {
  storage.set(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  storage.remove(PROFILE_KEY);
}

export function getSettings(): SettingsBlob {
  const raw = storage.getString(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as SettingsBlob;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SettingsBlob): void {
  storage.set(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearAll(): void {
  storage.clearAll();
}
