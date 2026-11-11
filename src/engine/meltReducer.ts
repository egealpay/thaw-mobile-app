import type { MeltState } from '../types';
import type { Strictness } from '../types';

// Fraction of meltRate that is lost per second while refreezing
export const REFREEZE_RATE_MULTIPLIER = 0.5;
export const GRACE_SECONDS = 10;

export type MeltEvent =
  | { type: 'START'; now: number }
  | { type: 'TICK'; now: number }
  | { type: 'PAUSE'; now: number }
  | { type: 'RESUME'; now: number }
  | { type: 'BACKGROUND'; now: number }
  // locked: the app was backgrounded because the screen was locked (not an app switch)
  | { type: 'FOREGROUND'; now: number; strictness: Strictness; locked?: boolean }
  | { type: 'REFREEZE_START'; now: number }
  | { type: 'ABANDON'; now: number }
  | { type: 'RESET' };

export function meltReducer(state: MeltState, event: MeltEvent): MeltState {
  switch (event.type) {
    case 'START': {
      if (state.state !== 'idle') return state;
      return {
        ...state,
        state: 'melting',
        startedAt: event.now,
        lastTickAt: event.now,
      };
    }

    case 'TICK': {
      if (state.state !== 'melting') return state;
      const delta = (event.now - state.lastTickAt) / 1000;
      const newElapsed = state.elapsedFocused + delta;
      const newProgress = Math.min(newElapsed / state.targetDuration, 1);
      const isComplete = newElapsed >= state.targetDuration;
      return {
        ...state,
        state: isComplete ? 'complete' : 'melting',
        elapsedFocused: Math.min(newElapsed, state.targetDuration),
        meltProgress: newProgress,
        lastTickAt: event.now,
      };
    }

    case 'PAUSE': {
      if (state.state !== 'melting') return state;
      return { ...state, state: 'paused', pauseReason: 'user', lastTickAt: event.now };
    }

    case 'RESUME': {
      if (state.state !== 'paused') return state;
      return { ...state, state: 'melting', pauseReason: undefined, lastTickAt: event.now };
    }

    case 'BACKGROUND': {
      if (state.state !== 'melting') return state;
      return { ...state, state: 'paused', pauseReason: 'background', lastTickAt: event.now };
    }

    case 'FOREGROUND': {
      // Only reconcile pauses caused by leaving the app. A manual pause stays paused.
      const awayPause =
        (state.state === 'paused' || state.state === 'refreezing') &&
        state.pauseReason === 'background';
      if (!awayPause) return state;

      const delta = (event.now - state.lastTickAt) / 1000;

      if (event.locked) {
        // Screen lock is not a distraction: the ice kept melting the whole time.
        const newElapsed = Math.min(state.elapsedFocused + delta, state.targetDuration);
        return {
          ...state,
          state: newElapsed >= state.targetDuration ? 'complete' : 'melting',
          elapsedFocused: newElapsed,
          meltProgress: Math.min(newElapsed / state.targetDuration, 1),
          pauseReason: undefined,
          lastTickAt: event.now,
        };
      }

      if (event.strictness === 'gentle') {
        // No penalty, no credit — just resume
        return { ...state, state: 'melting', pauseReason: undefined, lastTickAt: event.now };
      }

      // Strict: apply grace, then refreeze for remaining
      const refreezeSeconds = Math.max(0, delta - GRACE_SECONDS);
      const refreezeLoss = refreezeSeconds * state.meltRate * REFREEZE_RATE_MULTIPLIER;
      const newProgress = Math.max(0, state.meltProgress - refreezeLoss);
      const newElapsed = newProgress * state.targetDuration;
      const newDistractions = refreezeSeconds > 0
        ? state.distractionCount + 1
        : state.distractionCount;

      return {
        ...state,
        state: 'melting',
        meltProgress: newProgress,
        elapsedFocused: newElapsed,
        distractionCount: newDistractions,
        pauseReason: undefined,
        lastTickAt: event.now,
      };
    }

    case 'REFREEZE_START': {
      if (state.state !== 'paused' || state.pauseReason !== 'background') return state;
      // Preserve lastTickAt from BACKGROUND so FOREGROUND measures the full away time
      return { ...state, state: 'refreezing' };
    }

    case 'ABANDON': {
      return { ...state, state: 'idle', pauseReason: undefined, lastTickAt: event.now };
    }

    case 'RESET': {
      return { ...state, state: 'idle', pauseReason: undefined, lastTickAt: Date.now() };
    }

    default:
      return state;
  }
}

export function createInitialMeltState(
  sessionId: string,
  targetDurationSeconds: number,
  iceProfile: MeltState['iceProfile'],
): MeltState {
  const now = Date.now();
  return {
    sessionId,
    state: 'idle',
    meltProgress: 0,
    targetDuration: targetDurationSeconds,
    elapsedFocused: 0,
    meltRate: 1 / targetDurationSeconds,
    iceProfile,
    distractionCount: 0,
    startedAt: now,
    lastTickAt: now,
  };
}
