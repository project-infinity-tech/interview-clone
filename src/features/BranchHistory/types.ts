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
