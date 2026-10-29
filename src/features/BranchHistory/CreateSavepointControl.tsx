import type { FC } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useHistoryStore } from '@/store/historyStore';
import './BranchHistory.css';

/** Reads as a moment the user can place, which is the most an unnamed savepoint can offer. */
const nameFromTime = (now: Date): string =>
  now.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/**
 * Takes a savepoint at the current head, named after the time. It sits in the current-version row
 * because the head is the position it marks.
 */
export const CreateSavepointControl: FC = () => {
  const createSavepoint = useHistoryStore((state) => state.createSavepoint);

  return (
    <Button
      color="neutral"
      variant="ghost"
      size="sm"
      onClick={() => createSavepoint({ type: 'manual', name: nameFromTime(new Date()) })}
      data-testid="create-savepoint-button"
    >
      <span className="savepoint-button-label">
        <Icon name="Bookmark" size="sm" />
        Save
      </span>
    </Button>
  );
};
