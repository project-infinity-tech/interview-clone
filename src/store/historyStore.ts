import { create } from 'zustand';
import type { MigrationMarker, SavepointType } from '@/features/BranchHistory/types';
import type { BranchReset } from './lineage';

export interface Savepoint {
  id: string;
  name: string;
  description: string | undefined;
  type: SavepointType;
  /** When the server took it. Each one is later than the last, so it also gives the order. */
  acceptedAt: number;
  removed: boolean;
}

interface HistoryState {
  savepoints: Savepoint[];
  resets: BranchReset[];
  migrations: MigrationMarker[];
  lastAcceptedAt: number;
  createSavepoint: (savepoint: { type: SavepointType; name: string }) => void;
  updateSavepoint: (savepointId: string, changes: { name?: string; description?: string | null }) => void;
  removeSavepoint: (savepointId: string) => void;
  resetBranchToSavepoint: (savepointId: string) => void;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const makeSeedSavepoint = (name: string, ageMs: number, loadedAt: number): Savepoint => ({
  id: crypto.randomUUID(),
  name,
  description: undefined,
  type: 'manual',
  acceptedAt: loadedAt - ageMs,
  removed: false,
});

const createSeedSavepoints = (loadedAt: number): Savepoint[] => [
  makeSeedSavepoint('one', 3 * DAY, loadedAt),
  makeSeedSavepoint('two', DAY, loadedAt),
  makeSeedSavepoint('three', 2 * HOUR, loadedAt),
  makeSeedSavepoint('four', 20 * MINUTE, loadedAt),
];

/** Uses the clock, but always moves forward even if two things happen in the same millisecond. */
const nextAcceptedAt = (lastAcceptedAt: number): number => Math.max(Date.now(), lastAcceptedAt + 1);

const loadedAt = Date.now();

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  savepoints: createSeedSavepoints(loadedAt),
  resets: [],
  migrations: [],
  lastAcceptedAt: loadedAt,

  createSavepoint: ({ type, name }) =>
    set((state) => {
      const acceptedAt = nextAcceptedAt(state.lastAcceptedAt);
      const savepoint: Savepoint = {
        id: crypto.randomUUID(),
        name,
        description: undefined,
        type,
        acceptedAt,
        removed: false,
      };
      return { savepoints: [...state.savepoints, savepoint], lastAcceptedAt: acceptedAt };
    }),

  updateSavepoint: (savepointId, { name, description }) =>
    set((state) => ({
      savepoints: state.savepoints.map((savepoint) =>
        savepoint.id === savepointId
          ? {
              ...savepoint,
              ...(name === undefined ? undefined : { name }),
              ...(description === undefined ? undefined : { description: description ?? undefined }),
            }
          : savepoint,
      ),
    })),

  removeSavepoint: (savepointId) =>
    set((state) => ({
      savepoints: state.savepoints.map((savepoint) =>
        savepoint.id === savepointId ? { ...savepoint, removed: true } : savepoint,
      ),
    })),

  // Saves a "before restoring" savepoint at the head, then the reset, so the restore can be undone.
  resetBranchToSavepoint: (savepointId) => {
    const { savepoints, resets, lastAcceptedAt } = get();
    const target = savepoints.find((savepoint) => savepoint.id === savepointId);
    if (target === undefined) {
      throw new Error(`Savepoint ${savepointId} does not exist, so it cannot be restored`);
    }

    const preRestoreAcceptedAt = nextAcceptedAt(lastAcceptedAt);
    const resetAcceptedAt = preRestoreAcceptedAt + 1;
    const preRestore: Savepoint = {
      id: crypto.randomUUID(),
      name: `Before restoring "${target.name}"`,
      description: undefined,
      type: 'preRestore',
      acceptedAt: preRestoreAcceptedAt,
      removed: false,
    };

    set({
      savepoints: [...savepoints, preRestore],
      resets: [...resets, { acceptedAt: resetAcceptedAt, destinationAcceptedAt: target.acceptedAt }],
      lastAcceptedAt: resetAcceptedAt,
    });
  },
}));
