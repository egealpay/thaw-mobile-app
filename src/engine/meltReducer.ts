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
  | { type: 'FOREGROUND'; now: number; strictness: Strictness }
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
      return { ...state, state: 'paused', lastTickAt: event.now };
    }

    case 'RESUME': {
      if (state.state !== 'paused') return state;
      return { ...state, state: 'melting', lastTickAt: event.now };
    }

    case 'BACKGROUND': {
      if (state.state !== 'melting') return state;
      return { ...state, state: 'paused', lastTickAt: event.now };
    }

    case 'FOREGROUND': {
      const delta = (event.now - state.lastTickAt) / 1000;

      if (state.state === 'paused' || state.state === 'refreezing') {
        if (event.strictness === 'gentle') {
          // No penalty, no credit — just resume
          return { ...state, state: 'melting', lastTickAt: event.now };
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
          lastTickAt: event.now,
        };
      }

      return { ...state, lastTickAt: event.now };
    }

    case 'REFREEZE_START': {
      if (state.state !== 'paused') return state;
      // Preserve lastTickAt from BACKGROUND so FOREGROUND measures the full away time
      return { ...state, state: 'refreezing' };
    }

    case 'ABANDON': {
      return { ...state, state: 'idle', lastTickAt: event.now };
    }

    case 'RESET': {
      return { ...state, state: 'idle', lastTickAt: Date.now() };
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
