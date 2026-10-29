import { type FC, useState } from 'react';
import { CreateSavepointControl } from './CreateSavepointControl';
import { HistoryEntryRow } from './HistoryEntryRow';
import { resolveRailShapes } from './resolveRailShapes';
import type { HistoryEntry } from './types';
import './BranchHistory.css';

interface BranchHistoryContentProps {
  entries: HistoryEntry[];
  onRename: (entryId: string, title: string) => void;
  onDescribe: (entryId: string, description: string | null) => void;
  onRestore: (entry: HistoryEntry) => void;
  onDelete: (entryId: string) => void;
}

export const BranchHistoryContent: FC<BranchHistoryContentProps> = ({
  entries,
  onRename,
  onDescribe,
  onRestore,
  onDelete,
}) => {
  // Held for the panel's lifetime so every row's relative timestamp is measured against the same
  // instant, rather than each row drifting as it renders.
  const [now] = useState(() => Date.now());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const railShapes = resolveRailShapes(entries);

  const toggle = (entryId: string) => {
    setExpandedId((current) => (current === entryId ? null : entryId));
  };

  return (
    <div className="history-body">
      <div className="history-spine">
        {/* With no savepoints there's nothing below for the line to lead into. */}
        {entries.length > 0 && <div className="history-spine-line" />}
        <div className="history-current-version">
          <span className="history-live-marker" />
          <span className="history-current-version-label">Current Version</span>
          <CreateSavepointControl />
        </div>
      </div>

      <div className="history-list">
        {entries.map((entry, index) => (
          <HistoryEntryRow
            key={entry.id}
            entry={entry}
            railShape={railShapes[index]}
            expanded={expandedId === entry.id}
            now={now}
            onToggle={toggle}
            onRename={onRename}
            onDescribe={onDescribe}
            onRestore={onRestore}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
