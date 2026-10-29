import type { HistoryEntry, SavepointType } from './types';

const TYPE_LABELS: Record<SavepointType, string> = {
  manual: 'Savepoint',
  deployment: 'App Published',
  preRestore: 'Before Restore',
  preAiAction: 'Before AI Change',
};

/**
 * The row's second line: what took this savepoint.
 *
 * Says nothing about a savepoint a later restore rolled past — the row's fade carries that for now.
 */
export const describeSavepointType = (entry: HistoryEntry): string => TYPE_LABELS[entry.type];
