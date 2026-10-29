/** A restore. Everything after `destinationAcceptedAt` and before `acceptedAt` is rolled back. */
export interface BranchReset {
  acceptedAt: number;
  destinationAcceptedAt: number;
}

/** A live span of history, both ends included. */
export interface LineageSegment {
  startAcceptedAt: number;
  endAcceptedAt: number;
}

/**
 * Walks back from the head. Each restore starts a new span and jumps back to the point it restored to.
 * The gaps between the spans are the shadowed parts. Returned oldest first.
 */
export const findLineageSegments = (resets: BranchReset[]): LineageSegment[] => {
  const segments: LineageSegment[] = [];
  let endAcceptedAt = Number.POSITIVE_INFINITY;

  while (true) {
    const end = endAcceptedAt;
    const newestReset = resets
      .filter((reset) => reset.acceptedAt <= end)
      .reduce<BranchReset | undefined>(
        (newest, reset) => (newest === undefined || reset.acceptedAt > newest.acceptedAt ? reset : newest),
        undefined,
      );

    segments.push({ startAcceptedAt: newestReset?.acceptedAt ?? 0, endAcceptedAt: end });
    if (newestReset === undefined) {
      return segments.reverse();
    }
    endAcceptedAt = newestReset.destinationAcceptedAt;
  }
};

export const isShadowed = (acceptedAt: number, segments: LineageSegment[]): boolean =>
  !segments.some((segment) => acceptedAt >= segment.startAcceptedAt && acceptedAt <= segment.endAcceptedAt);
