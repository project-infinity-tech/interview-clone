export type SavepointType = 'manual' | 'deployment' | 'preRestore' | 'preAiAction';

/** One savepoint, shaped for the list. Built by `useSavepointsList` from the store. */
export interface HistoryEntry {
  id: string;
  title: string;
  description: string | undefined;
  type: SavepointType;
  /** Milliseconds, derived from the server-assigned position. Absent until the server accepts it. */
  createdAt: number | undefined;
  /** A reset rolled past this point. Restoring to it is how that reset gets undone. */
  isShadowed: boolean;
  /** A reset aims at the server-assigned position, so a savepoint is only a target once accepted. */
  isRestorable: boolean;
}

/** A ScramDB migration that succeeded. Restores leave the database alone, so one is never shadowed. */
export interface MigrationMarker {
  migrationId: string;
  version: number;
  /** Derived from the server-assigned position the migration landed at on this branch. */
  appliedAtMs: number;
}

/** The migrations one marker covers, newest first. Never empty, so a marker always has a version to show. */
export type MigrationMarkerGroup = [MigrationMarker, ...MigrationMarker[]];
