export type MeltStateName = 'idle' | 'melting' | 'paused' | 'refreezing' | 'complete';
export type IceProfile = 'glacier' | 'frost';

export interface MeltState {
  sessionId: string;
  state: MeltStateName;
  meltProgress: number;
  targetDuration: number;
  elapsedFocused: number;
  meltRate: number;
  iceProfile: IceProfile;
  distractionCount: number;
  startedAt: number;
  lastTickAt: number;
}
