import { type RailShape, RailShapes } from './TimelineRail';
import type { HistoryEntry } from './types';

/**
 * Picks the rail drawing for each row from its neighbors. Entries arrive newest first, so a
 * shadowed run is contiguous: it leaves the trunk at its newest row and rejoins at its oldest.
 * Working from neighbors rather than from the reset positions themselves means several separate
 * runs — a rollback of a rollback — each get their own branch.
 */
export const resolveRailShapes = (entries: HistoryEntry[]): RailShape[] =>
  entries.map((entry, index) => {
    if (!entry.isShadowed) {
      // No "start" shape: the line already descends from the current-version marker above the
      // list, so the newest row carries it through like any other. Only the oldest caps it.
      return index === entries.length - 1 ? RailShapes.End : RailShapes.Trunk;
    }

    const startsRun = !entries[index - 1]?.isShadowed;
    const endsRun = !entries[index + 1]?.isShadowed;

    if (startsRun && endsRun) {
      return RailShapes.BranchOnly;
    }
    if (startsRun) {
      return RailShapes.BranchStart;
    }
    return endsRun ? RailShapes.BranchEnd : RailShapes.Branch;
  });
