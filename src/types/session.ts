import type { IceProfile } from './melt';

export type SessionOutcome = 'complete' | 'abandoned';
export type SessionSource = 'manual' | 'scheduled';
export type Strictness = 'gentle' | 'strict';

export interface SessionRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  targetDuration: number;
  focusedDuration: number;
  outcome: SessionOutcome;
  distractionCount: number;
  iceProfileId: IceProfile;
  strictness: Strictness;
  source: SessionSource;
}
