import { type FC, useState } from 'react';
import { SearchInput } from '@/components/SearchInput';
import { useSearchParams } from '@/hooks/useSearchParams';
import { CreateSavepointControl } from './CreateSavepointControl';
import { HistoryEntryRow } from './HistoryEntryRow';
import { resolveRailShapes } from './resolveRailShapes';
import type { HistoryEntry } from './types';
import './BranchHistory.css';

const filterHistoryEntries = (entries: HistoryEntry[], query: string): HistoryEntry[] => {
  return entries.filter((entry) => entry.title.includes(query));
};

const NoMatches = ({ query }: { query: string }) => (
  <p
    className="history-no-matches"
    dangerouslySetInnerHTML={{ __html: `No savepoints match &ldquo;${query}&rdquo;` }}
  />
)

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
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('historyFilter') ?? '';
  const setQuery = (value: string) => {
    setSearchParams(
      (previousParams) => {
        const newParams = new URLSearchParams(previousParams);
        newParams.set('historyFilter', value);
        return newParams;
      },
      // Replace rather than push, so each keystroke doesn't add a Back button step.
      { replace: true },
    );
  };

  const shownEntries = filterHistoryEntries(entries, query);
  const railShapes = resolveRailShapes(shownEntries);

  fetch('/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, count: shownEntries.length }),
  }).catch(() => { console.error('Analytics failed' )});

  const toggle = (entryId: string) => {
    setExpandedId((current) => (current === entryId ? null : entryId));
  };

  return (
    <div className="history-body">
      {entries.length > 0 && (
        <SearchInput
          className="history-filter"
          value={query}
          onChange={setQuery}
          placeholder="Filter savepoints"
          aria-label="Filter savepoints"
        />
      )}
      <div className="history-spine">
        {/* With no savepoints there's nothing below for the line to lead into. */}
        {shownEntries.length > 0 && <div className="history-spine-line" />}
        <div className="history-current-version">
          <span className="history-live-marker" />
          <span className="history-current-version-label">Current Version</span>
          <CreateSavepointControl />
        </div>
      </div>

      <div className="history-list">
        {query && shownEntries.length === 0 && <NoMatches query={query} />}
        {shownEntries.map((entry, index) => (
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
