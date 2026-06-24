import {
  createInitialMeltState,
  GRACE_SECONDS,
  meltReducer,
  REFREEZE_RATE_MULTIPLIER,
} from '../src/engine/meltReducer';

const TARGET = 600; // 10-minute session for tests
const NOW = 1000000;

function makeState() {
  return createInitialMeltState('test-session', TARGET, 'glacier');
}

describe('meltReducer', () => {
  it('starts in idle state', () => {
    const s = makeState();
    expect(s.state).toBe('idle');
    expect(s.meltProgress).toBe(0);
    expect(s.elapsedFocused).toBe(0);
  });

  it('IDLE → MELTING on START', () => {
    const s = meltReducer(makeState(), { type: 'START', now: NOW });
    expect(s.state).toBe('melting');
    expect(s.lastTickAt).toBe(NOW);
  });

  it('TICK advances progress linearly', () => {
    let s = meltReducer(makeState(), { type: 'START', now: NOW });
    s = meltReducer(s, { type: 'TICK', now: NOW + 60000 }); // 60s later
    expect(s.elapsedFocused).toBeCloseTo(60);
    expect(s.meltProgress).toBeCloseTo(60 / TARGET);
    expect(s.state).toBe('melting');
  });

  it('TICK transitions to complete when elapsed >= target', () => {
    let s = meltReducer(makeState(), { type: 'START', now: NOW });
    s = meltReducer(s, { type: 'TICK', now: NOW + TARGET * 1000 });
    expect(s.state).toBe('complete');
    expect(s.meltProgress).toBe(1);
  });

  it('PAUSE stops melting', () => {
    let s = meltReducer(makeState(), { type: 'START', now: NOW });
    s = meltReducer(s, { type: 'TICK', now: NOW + 30000 });
    s = meltReducer(s, { type: 'PAUSE', now: NOW + 30000 });
    expect(s.state).toBe('paused');
    expect(s.elapsedFocused).toBeCloseTo(30);
  });

  it('RESUME continues from paused', () => {
    let s = meltReducer(makeState(), { type: 'START', now: NOW });
    s = meltReducer(s, { type: 'TICK', now: NOW + 30000 });
    s = meltReducer(s, { type: 'PAUSE', now: NOW + 30000 });
    s = meltReducer(s, { type: 'RESUME', now: NOW + 35000 });
    expect(s.state).toBe('melting');
  });

  it('FOREGROUND with Gentle: no penalty, no credit, just resumes', () => {
    let s = meltReducer(makeState(), { type: 'START', now: NOW });
    s = meltReducer(s, { type: 'TICK', now: NOW + 60000 });
    const progressBefore = s.meltProgress;
    // Simulate 2 min background
    s = meltReducer(s, { type: 'BACKGROUND', now: NOW + 60000 });
    s = meltReducer(s, { type: 'FOREGROUND', now: NOW + 180000, strictness: 'gentle' });
    expect(s.state).toBe('melting');
    expect(s.meltProgress).toBeCloseTo(progressBefore);
  });

  it('FOREGROUND with Strict within grace: no penalty', () => {
    let s = meltReducer(makeState(), { type: 'START', now: NOW });
    s = meltReducer(s, { type: 'TICK', now: NOW + 60000 });
    const progressBefore = s.meltProgress;
    s = meltReducer(s, { type: 'BACKGROUND', now: NOW + 60000 });
    // Return within grace (5s)
    s = meltReducer(s, { type: 'FOREGROUND', now: NOW + 65000, strictness: 'strict' });
    expect(s.state).toBe('melting');
    expect(s.meltProgress).toBeCloseTo(progressBefore);
    expect(s.distractionCount).toBe(0);
  });

  it('FOREGROUND with Strict past grace: refreeze decreases progress', () => {
    let s = meltReducer(makeState(), { type: 'START', now: NOW });
    s = meltReducer(s, { type: 'TICK', now: NOW + 60000 });
    const progressBefore = s.meltProgress;
    s = meltReducer(s, { type: 'BACKGROUND', now: NOW + 60000 });
    // Return 30s after background (20s past grace)
    s = meltReducer(s, { type: 'FOREGROUND', now: NOW + 90000, strictness: 'strict' });
    expect(s.state).toBe('melting');
    expect(s.meltProgress).toBeLessThan(progressBefore);
    expect(s.distractionCount).toBe(1);
    // Expected refreeze: 20s * meltRate * REFREEZE_RATE_MULTIPLIER
    const expectedLoss = 20 * (1 / TARGET) * REFREEZE_RATE_MULTIPLIER;
    expect(s.meltProgress).toBeCloseTo(progressBefore - expectedLoss, 5);
  });

  it('meltProgress clamps to 0 even with large refreeze', () => {
    let s = meltReducer(makeState(), { type: 'START', now: NOW });
    s = meltReducer(s, { type: 'BACKGROUND', now: NOW });
    // Background for 10,000 seconds in Strict mode — should clamp to 0
    s = meltReducer(s, { type: 'FOREGROUND', now: NOW + 10000000, strictness: 'strict' });
    expect(s.meltProgress).toBeGreaterThanOrEqual(0);
  });

  it('ABANDON resets to idle', () => {
    let s = meltReducer(makeState(), { type: 'START', now: NOW });
    s = meltReducer(s, { type: 'TICK', now: NOW + 60000 });
    s = meltReducer(s, { type: 'ABANDON', now: NOW + 60000 });
    expect(s.state).toBe('idle');
  });

  it('meltRate is correct for TARGET duration', () => {
    const s = makeState();
    expect(s.meltRate).toBeCloseTo(1 / TARGET);
  });

  it('GRACE_SECONDS constant matches expected value', () => {
    expect(GRACE_SECONDS).toBe(10);
  });
});
