import type { FC } from 'react';
import { describeMigrationMarker } from './describeMigrationMarker';
import { type PassingLines, PassingRailLines, RUN_BOTTOM_EDGE, RUN_TOP_EDGE } from './TimelineRail';
import type { MigrationMarkerGroup } from './types';
import './BranchHistory.css';

interface MigrationMarkerRowProps {
  migrations: MigrationMarkerGroup;
  passingLines: PassingLines;
}

export const MigrationMarkerRow: FC<MigrationMarkerRowProps> = ({ migrations, passingLines }) => (
  <div
    className="migration-row"
    style={{ boxShadow: passingLines.branch ? `${RUN_TOP_EDGE}, ${RUN_BOTTOM_EDGE}` : 'none' }}
    data-testid={`migration-marker-${migrations.at(-1)?.migrationId}`}
  >
    <PassingRailLines {...passingLines} />
    <span className="migration-label" title="View database change history">
      {describeMigrationMarker(migrations)}
    </span>
  </div>
);
