import { type Savepoint, useHistoryStore } from '@/store/historyStore';
import { findLineageSegments, isShadowed, type LineageSegment } from '@/store/lineage';
import type { HistoryEntry } from './types';

const toHistoryEntry = (savepoint: Savepoint, lineage: LineageSegment[]): HistoryEntry => ({
  id: savepoint.id,
  title: savepoint.name,
  description: savepoint.description,
  type: savepoint.type,
  createdAt: savepoint.acceptedAt,
  isShadowed: isShadowed(savepoint.acceptedAt, lineage),
  isRestorable: true,
});

/** unaccepted savepoints go to the top. */
const newestFirst = (a: HistoryEntry, b: HistoryEntry): number => {
  if (a.createdAt === undefined || b.createdAt === undefined) {
    return Number(a.createdAt !== undefined) - Number(b.createdAt !== undefined);
  }
  return b.createdAt - a.createdAt;
};

export const useSavepointsList = (): HistoryEntry[] => {
  const savepoints = useHistoryStore((state) => state.savepoints);
  const resets = useHistoryStore((state) => state.resets);
  const lineage = findLineageSegments(resets);

  return savepoints
    .filter((savepoint) => !savepoint.removed)
    .map((savepoint) => toHistoryEntry(savepoint, lineage))
    .sort(newestFirst);
};
