import { createContext } from 'react';
import type { FocusProfile } from '../types';

interface OnboardingContextValue {
  draft: Partial<FocusProfile>;
  update: (patch: Partial<FocusProfile>) => void;
  setDerivedBy: (field: string, why: string) => void;
  build: () => FocusProfile;
}

export const OnboardingContext = createContext<OnboardingContextValue>({
  draft: {},
  update: () => {},
  setDerivedBy: () => {},
  build: () => ({
    path: 'explore',
    defaultSessionLength: 1500,
    presets: [],
    strictness: 'gentle',
    iceProfileDefault: 'glacier',
    studyWindow: { startTime: '19:30' },
    dailyGoal: { type: 'minutes', value: 25 },
    weeklyTargetDays: 5,
    derivedBy: {},
  }),
});
