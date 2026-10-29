import type { FC } from 'react';
import { PaneWindow } from '@/components/PaneWindow';
import { useHistoryStore } from '@/store/historyStore';
import { BranchHistoryContent } from './BranchHistoryContent';
import { useMigrationMarkers } from './useMigrationMarkers';
import { useResetToSavepoint } from './useResetToSavepoint';
import { useSavepointsList } from './useSavepointsList';

export const BranchHistoryPane: FC = () => {
  const entries = useSavepointsList();
  const migrations = useMigrationMarkers();
  const updateSavepoint = useHistoryStore((state) => state.updateSavepoint);
  const deleteSavepoint = useHistoryStore((state) => state.removeSavepoint);
  const renameSavepoint = (entryId: string, title: string) => updateSavepoint(entryId, { name: title });
  const describeSavepoint = (entryId: string, description: string | null) =>
    updateSavepoint(entryId, { description });
  const { resetToSavepoint, confirmDialog } = useResetToSavepoint();

  return (
    <PaneWindow title="History">
      <BranchHistoryContent
        entries={entries}
        migrations={migrations}
        onRename={renameSavepoint}
        onDescribe={describeSavepoint}
        onRestore={resetToSavepoint}
        onDelete={deleteSavepoint}
      />
      {confirmDialog}
    </PaneWindow>
  );
};
