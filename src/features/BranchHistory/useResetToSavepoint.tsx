import { type ReactNode, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useHistoryStore } from '@/store/historyStore';
import type { HistoryEntry } from './types';

const describeRestore = (entry: HistoryEntry) => ({
  title: `Restore to "${entry.title}"?`,
  message:
    'Everything done since this savepoint will be undone. The database and any data in it stay untouched. ' +
    'Other users working on the project may lose un-synced work. ' +
    'You can un-do this at any time from the History pane.',
  affirmativeLabel: 'Restore',
});

/** Asks first, then restores. Render `confirmDialog` somewhere on the page. */
export const useResetToSavepoint = (): {
  resetToSavepoint: (entry: HistoryEntry) => void;
  confirmDialog: ReactNode;
} => {
  const resetBranchToSavepoint = useHistoryStore((state) => state.resetBranchToSavepoint);
  const [pendingEntry, setPendingEntry] = useState<HistoryEntry | null>(null);

  const confirm = () => {
    if (pendingEntry) {
      resetBranchToSavepoint(pendingEntry.id);
    }
    setPendingEntry(null);
  };

  const confirmDialog = pendingEntry && (
    <ConfirmDialog {...describeRestore(pendingEntry)} onConfirm={confirm} onCancel={() => setPendingEntry(null)} />
  );

  return { resetToSavepoint: setPendingEntry, confirmDialog };
};
