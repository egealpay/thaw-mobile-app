import { useCallback, useRef, useState } from 'react';
import type { FocusProfile, OnboardingPath } from '../types';

export type PartialProfile = Partial<FocusProfile> & { path?: OnboardingPath };

const PRESETS = [
  { name: 'quick' as const, seconds: 900 },
  { name: 'standard' as const, seconds: 1500 },
  { name: 'deep' as const, seconds: 3000 },
];

export function useOnboardingProfile() {
  const [draft, setDraft] = useState<PartialProfile>({
    presets: PRESETS,
    iceProfileDefault: 'glacier',
  });

  const update = useCallback((patch: Partial<FocusProfile>) => {
    setDraft(prev => ({ ...prev, ...patch }));
  }, []);

  const setDerivedBy = useCallback((field: string, why: string) => {
    setDraft(prev => ({
      ...prev,
      derivedBy: { ...(prev.derivedBy ?? {}), [field]: why },
    }));
  }, []);

  const build = useCallback((): FocusProfile => {
    const path = draft.path ?? 'explore';
    const defaultLength = draft.defaultSessionLength ?? 1500;
    const strictness = draft.strictness ?? (path === 'deadline' ? 'strict' : 'gentle');
    const dailyGoalValue = draft.dailyGoal?.value ?? (
      path === 'habit'
        ? Math.ceil(defaultLength / 60)
        : Math.ceil((defaultLength / 60) * 2)
    );

    return {
      path,
      defaultSessionLength: defaultLength,
      presets: draft.presets ?? PRESETS,
      strictness,
      iceProfileDefault: draft.iceProfileDefault ?? 'glacier',
      studyWindow: draft.studyWindow ?? { startTime: '19:30' },
      dailyGoal: draft.dailyGoal ?? { type: 'minutes', value: dailyGoalValue },
      weeklyTargetDays: draft.weeklyTargetDays ?? 5,
      deadline: draft.deadline,
      derivedBy: draft.derivedBy ?? {},
    };
  }, [draft]);

  return { draft, update, setDerivedBy, build };
}
