import { describe, expect, it } from 'bun:test';
import { describeMigrationMarker } from './describeMigrationMarker';
import type { MigrationMarker } from './types';

const migration = (version: number): MigrationMarker => ({
  migrationId: `m${version}`,
  version,
  appliedAtMs: version * 10,
});

describe('describeMigrationMarker', () => {
  it('names the version of a single migration', () => {
    expect(describeMigrationMarker([migration(3)])).toBe('Database v3');
  });

  it('spans consecutive versions from lowest to highest', () => {
    expect(describeMigrationMarker([migration(5), migration(4), migration(3)])).toBe('Database v3–v5');
  });

  it('fills the gap a failed migration leaves in the versions', () => {
    expect(describeMigrationMarker([migration(5), migration(3)])).toBe('Database v3–v5');
    expect(describeMigrationMarker([migration(9), migration(7), migration(4)])).toBe('Database v4–v9');
  });

  // A migration re-run after a failure lands after newer ones, so its version is out of order in time.
  it('spans lowest to highest whatever order the versions landed in', () => {
    expect(describeMigrationMarker([migration(3), migration(5), migration(4)])).toBe('Database v3–v5');
  });
});
