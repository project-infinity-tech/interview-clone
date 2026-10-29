import { useHistoryStore } from '@/store/historyStore';
import type { MigrationMarker } from './types';

/** The project's successful ScramDB migrations, as they landed on this branch. */
export const useMigrationMarkers = (): MigrationMarker[] => useHistoryStore((state) => state.migrations);
