import { resolveRailShapes } from './resolveRailShapes';
import type { PassingLines, RailShape } from './TimelineRail';
import type { HistoryEntry, MigrationMarker, MigrationMarkerGroup } from './types';

export type HistoryTimelineItem =
  | { kind: 'savepoint'; entry: HistoryEntry; railShape: RailShape }
  | { kind: 'migrations'; migrations: MigrationMarkerGroup; passingLines: PassingLines };

/** An unaccepted savepoint has no time yet, but it is the newest thing on the branch. */
const isNewerThan = (entry: HistoryEntry, migration: MigrationMarker): boolean =>
  entry.createdAt === undefined || entry.createdAt >= migration.appliedAtMs;

/**
 * A marker takes its lines from the savepoints either side: the trunk runs on wherever there is an older
 * savepoint below for it to reach, and a branch only between two shadowed ones.
 */
const resolvePassingLines = (newer: HistoryEntry | undefined, older: HistoryEntry | undefined): PassingLines => ({
  trunk: older !== undefined,
  branch: newer?.isShadowed === true && older?.isShadowed === true,
});

/**
 * Interleaves migrations with the savepoints, newest first. Both are placed by when they happened, so a
 * restore — which shadows savepoints but never a migration — leaves each marker where it was. Migrations
 * with no savepoint between them share one marker, newest first within it.
 */
export const buildHistoryTimeline = (entries: HistoryEntry[], migrations: MigrationMarker[]): HistoryTimelineItem[] => {
  const railShapes = resolveRailShapes(entries);
  const timeline: HistoryTimelineItem[] = [];
  let placedEntries = 0;

  const placeNextEntry = () => {
    timeline.push({ kind: 'savepoint', entry: entries[placedEntries], railShape: railShapes[placedEntries] });
    placedEntries++;
  };

  for (const migration of migrations.toSorted((a, b) => b.appliedAtMs - a.appliedAtMs)) {
    while (placedEntries < entries.length && isNewerThan(entries[placedEntries], migration)) {
      placeNextEntry();
    }
    const previous = timeline.at(-1);
    if (previous?.kind === 'migrations') {
      previous.migrations.push(migration);
      continue;
    }
    timeline.push({
      kind: 'migrations',
      migrations: [migration],
      passingLines: resolvePassingLines(entries[placedEntries - 1], entries[placedEntries]),
    });
  }
  while (placedEntries < entries.length) {
    placeNextEntry();
  }

  return timeline;
};
