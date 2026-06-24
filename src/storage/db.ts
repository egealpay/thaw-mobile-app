import { open } from '@op-engineering/op-sqlite';
import type { DB } from '@op-engineering/op-sqlite';
import type { SessionRecord } from '../types';

const DB_NAME = 'thaw.sqlite';

let db: DB | null = null;

export function getDb(): DB {
  if (!db) {
    db = open({ name: DB_NAME });
    initSchema();
  }
  return db;
}

function initSchema() {
  getDb().executeSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      startedAt INTEGER NOT NULL,
      endedAt INTEGER NOT NULL,
      targetDuration INTEGER NOT NULL,
      focusedDuration INTEGER NOT NULL,
      outcome TEXT NOT NULL,
      distractionCount INTEGER NOT NULL DEFAULT 0,
      iceProfileId TEXT NOT NULL,
      strictness TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual'
    )
  `);
}

export function insertSession(record: SessionRecord): void {
  getDb().executeSync(
    'INSERT OR REPLACE INTO sessions VALUES (?,?,?,?,?,?,?,?,?,?)',
    [
      record.id,
      record.startedAt,
      record.endedAt,
      record.targetDuration,
      record.focusedDuration,
      record.outcome,
      record.distractionCount,
      record.iceProfileId,
      record.strictness,
      record.source,
    ],
  );
}

export function getAllSessions(): SessionRecord[] {
  const result = getDb().executeSync(
    'SELECT * FROM sessions ORDER BY startedAt DESC',
  );
  return (result.rows ?? []) as unknown as SessionRecord[];
}

export function getSessionsForDay(dateMs: number): SessionRecord[] {
  const dayStart = startOfDay(dateMs);
  const dayEnd = dayStart + 86400000;
  const result = getDb().executeSync(
    'SELECT * FROM sessions WHERE startedAt >= ? AND startedAt < ? ORDER BY startedAt DESC',
    [dayStart, dayEnd],
  );
  return (result.rows ?? []) as unknown as SessionRecord[];
}

export function getSessionsForWeek(): SessionRecord[] {
  const weekStart = startOfDay(Date.now() - 6 * 86400000);
  const result = getDb().executeSync(
    'SELECT * FROM sessions WHERE startedAt >= ? ORDER BY startedAt DESC',
    [weekStart],
  );
  return (result.rows ?? []) as unknown as SessionRecord[];
}

export function getRecentSessions(limit = 5): SessionRecord[] {
  const result = getDb().executeSync(
    'SELECT * FROM sessions WHERE outcome = ? ORDER BY startedAt DESC LIMIT ?',
    ['complete', limit],
  );
  return (result.rows ?? []) as unknown as SessionRecord[];
}

export function deleteAllSessions(): void {
  getDb().executeSync('DELETE FROM sessions');
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
