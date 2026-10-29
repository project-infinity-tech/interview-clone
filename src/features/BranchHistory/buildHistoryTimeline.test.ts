import { describe, expect, it } from 'bun:test';
import { buildHistoryTimeline, type HistoryTimelineItem } from './buildHistoryTimeline';
import { type PassingLines, RailShapes } from './TimelineRail';
import type { HistoryEntry, MigrationMarker } from './types';

/**
 * Newest first, each ten units older than the one before: `.` a savepoint, `#` a shadowed one, `m` a
 * migration. Ids are the position in the pattern, so the expected order reads straight off it.
 */
const history = (pattern: string) => {
  const entries: HistoryEntry[] = [];
  const migrations: MigrationMarker[] = [];
  Array.from(pattern).forEach((char, index) => {
    const at = (pattern.length - index) * 10;
    if (char === 'm') {
      migrations.push({ migrationId: `m${index}`, version: index, appliedAtMs: at });
      return;
    }
    entries.push({
      id: `e${index}`,
      title: `e${index}`,
      description: undefined,
      type: 'manual',
      createdAt: at,
      isShadowed: char === '#',
      isRestorable: true,
    });
  });
  return { entries, migrations };
};

const describeLines = ({ trunk, branch }: PassingLines) => {
  if (branch) {
    return 'trunk+branch';
  }
  return trunk ? 'trunk' : 'none';
};

/** Savepoints by id, markers by the ids they cover and the lines that pass them. */
const summarize = (timeline: HistoryTimelineItem[]) =>
  timeline.map((item) =>
    item.kind === 'savepoint'
      ? item.entry.id
      : `${item.migrations.map(({ migrationId }) => migrationId).join('+')} ${describeLines(item.passingLines)}`,
  );

const build = (pattern: string) => {
  const { entries, migrations } = history(pattern);
  return buildHistoryTimeline(entries, migrations);
};

describe('buildHistoryTimeline', () => {
  it('places each migration between the savepoints either side of it in time', () => {
    expect(summarize(build('.m..m.'))).toEqual(['e0', 'm1 trunk', 'e2', 'e3', 'm4 trunk', 'e5']);
  });

  it('orders migrations newest first whatever order they arrive in', () => {
    const { entries, migrations } = history('m.m');
    expect(summarize(buildHistoryTimeline(entries, migrations.toReversed()))).toEqual(['m0 trunk', 'e1', 'm2 none']);
  });

  // The line comes down into the list from the current-version marker, so it runs through a marker
  // above the newest savepoint, but has nothing to reach below the oldest.
  it('runs the trunk past a marker only while there is an older savepoint below it', () => {
    expect(summarize(build('m..m'))).toEqual(['m0 trunk', 'e1', 'e2', 'm3 none']);
  });

  it('draws no line past a marker when there are no savepoints', () => {
    expect(summarize(build('m'))).toEqual(['m0 none']);
  });

  it('shares one marker between migrations with no savepoint between them', () => {
    expect(summarize(build('.mmm.m.'))).toEqual(['e0', 'm1+m2+m3 trunk', 'e4', 'm5 trunk', 'e6']);
    expect(summarize(build('mm'))).toEqual(['m0+m1 none']);
  });

  // A failed migration uses up its version without a marker, which leaves a gap in the versions.
  it('shares one marker across a gap in the versions', () => {
    const { entries, migrations } = history('.mm.');
    const gapped = migrations.map((migration, index) => ({ ...migration, version: [5, 3][index] }));
    expect(summarize(buildHistoryTimeline(entries, gapped))).toEqual(['e0', 'm1+m2 trunk', 'e3']);
  });

  it('keeps a shared marker newest first whatever order its migrations arrive in', () => {
    const { entries, migrations } = history('.mmm.');
    expect(summarize(buildHistoryTimeline(entries, migrations.toReversed()))).toEqual(['e0', 'm1+m2+m3 trunk', 'e4']);
  });

  it('runs the branch past a shared marker inside a shadowed run', () => {
    expect(summarize(build('.#mm#.'))).toEqual(['e0', 'e1', 'm2+m3 trunk+branch', 'e4', 'e5']);
  });

  it('runs the branch past a marker inside a shadowed run, and not one at its edge', () => {
    expect(summarize(build('.#m#.'))).toEqual(['e0', 'e1', 'm2 trunk+branch', 'e3', 'e4']);
    expect(summarize(build('.m##m.'))).toEqual(['e0', 'm1 trunk', 'e2', 'e3', 'm4 trunk', 'e5']);
  });

  it('keeps a shadowed run in one piece across a marker inside it', () => {
    const shapes = build('.#m#.').flatMap((item) => (item.kind === 'savepoint' ? [item.railShape] : []));
    expect(shapes).toEqual([RailShapes.Trunk, RailShapes.BranchStart, RailShapes.BranchEnd, RailShapes.End]);
  });

  it('keeps an unaccepted savepoint above every migration', () => {
    const { entries, migrations } = history('m.');
    const pending = { ...entries[0], id: 'pending', createdAt: undefined };
    expect(summarize(buildHistoryTimeline([pending, ...entries], migrations))).toEqual(['pending', 'm0 trunk', 'e1']);
  });
});
