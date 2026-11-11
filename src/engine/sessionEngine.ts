import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { FocusProfile, MeltState, SessionRecord } from '../types';
import {
  createInitialMeltState,
  GRACE_SECONDS,
  meltReducer,
} from './meltReducer';
import { insertSession } from '../storage/db';
import { LiveActivity } from '../native/LiveActivity';

function generateId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useSessionEngine(profile: FocusProfile | null, targetSeconds?: number) {
  const duration = targetSeconds ?? (profile?.defaultSessionLength ?? 1500);
  const iceProfile = profile?.iceProfileDefault ?? 'glacier';
  const strictness = profile?.strictness ?? 'gentle';
  const subject = profile?.deadline?.label ?? 'Free session';

  const [meltState, setMeltState] = useState<MeltState>(() =>
    createInitialMeltState(generateId(), duration, iceProfile),
  );

  const stateRef = useRef(meltState);
  stateRef.current = meltState;

  const gracTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // True between AppState 'background' and the next 'active'
  const inBackgroundRef = useRef(false);
  const prevStateNameRef = useRef(meltState.state);

  const dispatch = useCallback((event: Parameters<typeof meltReducer>[1]) => {
    setMeltState(prev => {
      const next = meltReducer(prev, event);
      stateRef.current = next;
      return next;
    });
  }, []);

  // Live Activity: iOS renders the countdown itself, so only push changes of course
  // (start, pause, resume, reconcile after returning) — never per tick.
  useEffect(() => {
    const prev = prevStateNameRef.current;
    const cur = meltState.state;
    prevStateNameRef.current = cur;
    if (prev === cur) return;

    if (cur === 'complete' || cur === 'idle') {
      LiveActivity.end();
      return;
    }
    // While backgrounded the native module owns the display (lock keeps counting,
    // app switch freezes it).
    if (inBackgroundRef.current) return;

    const remaining = Math.max(0, meltState.targetDuration - meltState.elapsedFocused);
    if (prev === 'idle' && cur === 'melting') {
      LiveActivity.start(subject, meltState.targetDuration, remaining);
    } else {
      LiveActivity.update(remaining, cur !== 'melting');
    }
  }, [meltState.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick loop while melting
  useEffect(() => {
    if (meltState.state === 'melting') {
      tickIntervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK', now: Date.now() });
      }, 1000);
    } else if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
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
    // 'inactive' (Control Center, notification shade, call banner) is ignored: the user
    // hasn't left. Only a real trip to the background counts.
    const sub = AppState.addEventListener('change', async (status: AppStateStatus) => {
      const now = Date.now();
      if (status === 'background') {
        if (inBackgroundRef.current) return;
        inBackgroundRef.current = true;
        dispatch({ type: 'BACKGROUND', now });
        if (strictness === 'strict' && !gracTimerRef.current) {
          gracTimerRef.current = setTimeout(() => {
            gracTimerRef.current = null;
            dispatch({ type: 'REFREEZE_START', now: Date.now() });
          }, GRACE_SECONDS * 1000);
        }
      } else if (status === 'active') {
        if (!inBackgroundRef.current) return;
        if (gracTimerRef.current) {
          clearTimeout(gracTimerRef.current);
          gracTimerRef.current = null;
        }
        // Screen lock isn't a distraction; an app switch is.
        const locked = await LiveActivity.consumeLastBackgroundWasLock();
        inBackgroundRef.current = false;
        dispatch({ type: 'FOREGROUND', now, strictness, locked });
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
    dispatch({ type: 'ABANDON', now: Date.now() }); // → idle, which ends the Live Activity
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
