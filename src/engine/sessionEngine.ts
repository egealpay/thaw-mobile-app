import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { FocusProfile, MeltState, SessionRecord } from '../types';
import {
  createInitialMeltState,
  GRACE_SECONDS,
  meltReducer,
} from './meltReducer';
import { insertSession } from '../storage/db';

function generateId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useSessionEngine(profile: FocusProfile | null, targetSeconds?: number) {
  const duration = targetSeconds ?? (profile?.defaultSessionLength ?? 1500);
  const iceProfile = profile?.iceProfileDefault ?? 'glacier';
  const strictness = profile?.strictness ?? 'gentle';

  const [meltState, setMeltState] = useState<MeltState>(() =>
    createInitialMeltState(generateId(), duration, iceProfile),
  );

  const stateRef = useRef(meltState);
  stateRef.current = meltState;

  const gracTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dispatch = useCallback((event: Parameters<typeof meltReducer>[1]) => {
    setMeltState(prev => {
      const next = meltReducer(prev, event);
      stateRef.current = next;
      return next;
    });
  }, []);

  // Tick loop while melting
  useEffect(() => {
    if (meltState.state === 'melting') {
      tickIntervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK', now: Date.now() });
      }, 1000);
    } else {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    }
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [meltState.state, dispatch]);

  // Persist completed session
  useEffect(() => {
    if (meltState.state === 'complete') {
      const record: SessionRecord = {
        id: meltState.sessionId,
        startedAt: meltState.startedAt,
        endedAt: Date.now(),
        targetDuration: meltState.targetDuration,
        focusedDuration: meltState.elapsedFocused,
        outcome: 'complete',
        distractionCount: meltState.distractionCount,
        iceProfileId: meltState.iceProfile,
        strictness,
        source: 'manual',
      };
      insertSession(record);
    }
  }, [meltState.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // AppState listener
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      const now = Date.now();
      if (status === 'background' || status === 'inactive') {
        dispatch({ type: 'BACKGROUND', now });
        if (strictness === 'strict') {
          gracTimerRef.current = setTimeout(() => {
            dispatch({ type: 'REFREEZE_START', now: Date.now() });
          }, GRACE_SECONDS * 1000);
        }
      } else if (status === 'active') {
        if (gracTimerRef.current) {
          clearTimeout(gracTimerRef.current);
          gracTimerRef.current = null;
        }
        dispatch({ type: 'FOREGROUND', now, strictness });
      }
    });
    return () => sub.remove();
  }, [strictness, dispatch]);

  const start = useCallback(() => {
    dispatch({ type: 'START', now: Date.now() });
  }, [dispatch]);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE', now: Date.now() });
  }, [dispatch]);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME', now: Date.now() });
  }, [dispatch]);

  const abandon = useCallback(() => {
    const s = stateRef.current;
    if (s.state !== 'idle' && s.state !== 'complete') {
      const record: SessionRecord = {
        id: s.sessionId,
        startedAt: s.startedAt,
        endedAt: Date.now(),
        targetDuration: s.targetDuration,
        focusedDuration: s.elapsedFocused,
        outcome: 'abandoned',
        distractionCount: s.distractionCount,
        iceProfileId: s.iceProfile,
        strictness,
        source: 'manual',
      };
      insertSession(record);
    }
    dispatch({ type: 'ABANDON', now: Date.now() });
  }, [dispatch, strictness]);

  const reset = useCallback(
    (newTargetSeconds?: number) => {
      const newDuration = newTargetSeconds ?? duration;
      setMeltState(createInitialMeltState(generateId(), newDuration, iceProfile));
    },
    [duration, iceProfile],
  );

  return { meltState, start, pause, resume, abandon, reset };
}
