import { describe, expect, test } from 'bun:test';
import { findLineageSegments, isShadowed } from './lineage';

describe('findLineageSegments', () => {
  test('with no restores, everything is live', () => {
    const segments = findLineageSegments([]);

    expect(segments).toEqual([{ startAcceptedAt: 0, endAcceptedAt: Number.POSITIVE_INFINITY }]);
    expect(isShadowed(5, segments)).toBe(false);
  });

  test('a restore hides everything between its target and the restore itself', () => {
    const segments = findLineageSegments([{ acceptedAt: 50, destinationAcceptedAt: 20 }]);

    expect(isShadowed(20, segments)).toBe(false);
    expect(isShadowed(30, segments)).toBe(true);
    expect(isShadowed(49, segments)).toBe(true);
    expect(isShadowed(60, segments)).toBe(false);
  });

  test('restoring to a hidden savepoint brings its part of history back', () => {
    const segments = findLineageSegments([
      { acceptedAt: 50, destinationAcceptedAt: 20 },
      { acceptedAt: 70, destinationAcceptedAt: 40 },
    ]);

    expect(isShadowed(30, segments)).toBe(false);
    expect(isShadowed(40, segments)).toBe(false);
    expect(isShadowed(45, segments)).toBe(true);
    expect(isShadowed(60, segments)).toBe(true);
    expect(isShadowed(80, segments)).toBe(false);
  });
});
