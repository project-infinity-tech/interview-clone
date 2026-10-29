import { describe, expect, it } from 'bun:test';
import { resolveRailShapes } from './resolveRailShapes';
import { RailShapes } from './TimelineRail';
import type { HistoryEntry } from './types';

/** Newest first, `#` marking a shadowed row — the shape the list is actually rendered in. */
const rows = (pattern: string): HistoryEntry[] =>
  Array.from(pattern, (char, index) => ({
    id: `e${index}`,
    title: `e${index}`,
    description: undefined,
    type: 'manual' as const,
    createdAt: (pattern.length - index) * 10,
    isShadowed: char === '#',
    isRestorable: true,
  }));

describe('resolveRailShapes', () => {
  it('runs the line through every row and caps it at the oldest', () => {
    expect(resolveRailShapes(rows('...'))).toEqual([RailShapes.Trunk, RailShapes.Trunk, RailShapes.End]);
  });

  // The line descends from the current-version marker above the list, so even a lone row carries
  // it in from above — it only has to stop it going out the bottom.
  it('caps a single row without starting a line of its own', () => {
    expect(resolveRailShapes(rows('.'))).toEqual([RailShapes.End]);
  });

  it('draws nothing for an empty list', () => {
    expect(resolveRailShapes([])).toEqual([]);
  });

  it('branches a run of shadowed rows off the trunk and back into it', () => {
    expect(resolveRailShapes(rows('.##.'))).toEqual([
      RailShapes.Trunk,
      RailShapes.BranchStart,
      RailShapes.BranchEnd,
      RailShapes.End,
    ]);
  });

  it('holds a longer run on the branch in between', () => {
    expect(resolveRailShapes(rows('.###.'))).toEqual([
      RailShapes.Trunk,
      RailShapes.BranchStart,
      RailShapes.Branch,
      RailShapes.BranchEnd,
      RailShapes.End,
    ]);
  });

  it('gives a one-row run a shape that begins and rejoins at the same node', () => {
    expect(resolveRailShapes(rows('.#.'))).toEqual([RailShapes.Trunk, RailShapes.BranchOnly, RailShapes.End]);
  });

  // A rollback of a rollback. Reading from neighbors is what makes each run get its own branch
  // without any extra bookkeeping.
  it('gives each separate run its own branch', () => {
    expect(resolveRailShapes(rows('.#.#.'))).toEqual([
      RailShapes.Trunk,
      RailShapes.BranchOnly,
      RailShapes.Trunk,
      RailShapes.BranchOnly,
      RailShapes.End,
    ]);
  });

  it('keeps multi-row runs apart when a live row sits between them', () => {
    expect(resolveRailShapes(rows('.##.##.'))).toEqual([
      RailShapes.Trunk,
      RailShapes.BranchStart,
      RailShapes.BranchEnd,
      RailShapes.Trunk,
      RailShapes.BranchStart,
      RailShapes.BranchEnd,
      RailShapes.End,
    ]);
  });

  it('branches a run that reaches the oldest row, leaving the trunk uncapped', () => {
    expect(resolveRailShapes(rows('.##'))).toEqual([RailShapes.Trunk, RailShapes.BranchStart, RailShapes.BranchEnd]);
  });
});
