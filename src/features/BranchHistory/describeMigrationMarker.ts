import type { MigrationMarkerGroup } from './types';

/**
 * The marker's label: the lowest to highest version it covers. A failed migration uses up its version
 * without getting a marker, so a range can span one, reading as the versions the database moved through.
 */
export const describeMigrationMarker = (migrations: MigrationMarkerGroup): string => {
  const versions = migrations.map(({ version }) => version);
  const lowest = Math.min(...versions);
  const highest = Math.max(...versions);
  return lowest === highest ? `Database v${lowest}` : `Database v${lowest}–v${highest}`;
};
