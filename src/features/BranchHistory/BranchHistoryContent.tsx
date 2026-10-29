import { type FC, useState } from 'react';
import { buildHistoryTimeline } from './buildHistoryTimeline';
import { CreateSavepointControl } from './CreateSavepointControl';
import { HistoryEntryRow } from './HistoryEntryRow';
import { MigrationMarkerRow } from './MigrationMarkerRow';
import type { HistoryEntry, MigrationMarker } from './types';
import './BranchHistory.css';

interface BranchHistoryContentProps {
  entries: HistoryEntry[];
  migrations: MigrationMarker[];
  onRename: (entryId: string, title: string) => void;
  onDescribe: (entryId: string, description: string | null) => void;
  onRestore: (entry: HistoryEntry) => void;
  onDelete: (entryId: string) => void;
}

export const BranchHistoryContent: FC<BranchHistoryContentProps> = ({
  entries,
  migrations,
  onRename,
  onDescribe,
  onRestore,
  onDelete,
}) => {
  // Held for the panel's lifetime so every row's relative timestamp is measured against the same
  // instant, rather than each row drifting as it renders.
  const [now] = useState(() => Date.now());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const timeline = buildHistoryTimeline(entries, migrations);

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
        {timeline.map((item) => {
          if (item.kind === 'savepoint') {
            return (
              <HistoryEntryRow
                key={item.entry.id}
                entry={item.entry}
                railShape={item.railShape}
                expanded={expandedId === item.entry.id}
                now={now}
                onToggle={toggle}
                onRename={onRename}
                onDescribe={onDescribe}
                onRestore={onRestore}
                onDelete={onDelete}
              />
            );
          }
          // Newest first, so the oldest is last. Keyed by oldest so new migrations don't remount the row.
          const oldest = item.migrations.at(-1);
          if (!oldest) {
            return null;
          }
          return (
            <MigrationMarkerRow
              key={oldest.migrationId}
              migrations={item.migrations}
              passingLines={item.passingLines}
            />
          );
        })}
      </div>
    </div>
  );
};
