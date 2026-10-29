import type { FC, ReactNode } from 'react';
import './BranchHistory.css';

/**
 * Where a row sits on the rail. Reading downward is going back in time, so a branch joins the trunk at its
 * oldest end.
 */
export const RailShapes = {
  /** On the active lineage, line through. */
  Trunk: 'trunk',
  /** Oldest row: the line stops at the node. */
  End: 'end',
  /** Newest shadowed row of a run — the branch begins at this node, nothing above it. */
  BranchStart: 'branchStart',
  /** Inside a shadowed run. */
  Branch: 'branch',
  /** Oldest shadowed row of a run — the branch rejoins the trunk it forked from. */
  BranchEnd: 'branchEnd',
  /** A shadowed run one row long: begins at its node and rejoins below it. */
  BranchOnly: 'branchOnly',
} as const;
export type RailShape = (typeof RailShapes)[keyof typeof RailShapes];

/**
 * Rule a shadowed run off from the plain rows around it. Inset shadows rather than borders, so the rail
 * lines paint over them unbroken and a row keeps the height its node is centered against.
 */
export const RUN_TOP_EDGE = 'inset 0 1px 0 var(--color-neutral-200)';
export const RUN_BOTTOM_EDGE = 'inset 0 -1px 0 var(--color-neutral-200)';

/** Wide enough for a node plate on the branch to clear both the trunk and the title. */
export const RAIL_WIDTH = 40;
/** Height of a row's header — the rail's node is centered on it. */
export const ROW_HEADER_HEIGHT = 54;

/**
 * Left edge of the line. The lines are 1px divs at integer offsets so they stay crisp, which means
 * a line at `x` actually occupies `x`→`x+1` and its true center is half a pixel further right.
 * Anything centered *on* a line has to use the center, or it sits visibly off to the left.
 */
export const TRUNK_X = 15;
const BRANCH_X = 27;
export const TRUNK_CENTER = TRUNK_X + 0.5;
const BRANCH_CENTER = BRANCH_X + 0.5;
const NODE_Y = ROW_HEADER_HEIGHT / 2;
const CURVE_HEIGHT = 14;

const FULL_HEIGHT = '100%';
const ABOVE_NODE = `${NODE_Y}px`;
const BELOW_NODE = `calc(100% - ${NODE_Y}px)`;

const BRANCH_SHAPES: RailShape[] = [
  RailShapes.BranchStart,
  RailShapes.Branch,
  RailShapes.BranchEnd,
  RailShapes.BranchOnly,
];

interface LineProps {
  x: number;
  top: number;
  height: string;
}

const Line: FC<LineProps> = ({ x, top, height }) => <div className="rail-line" style={{ left: x, top, height }} />;

/**
 * The quarter-turn taking the branch back into the trunk it forked from, below the node.
 */
const RejoinCurve: FC = () => (
  <svg className="rail-curve" width={RAIL_WIDTH} height={CURVE_HEIGHT} style={{ top: NODE_Y }} aria-hidden>
    <path
      d={`M ${BRANCH_CENTER} 0 V ${CURVE_HEIGHT / 2} Q ${BRANCH_CENTER} ${CURVE_HEIGHT} ${TRUNK_CENTER} ${CURVE_HEIGHT}`}
      fill="none"
      stroke="currentColor"
    />
  </svg>
);

interface TimelineRailProps {
  shape: RailShape;
  /** The node glyph for this row — the savepoint's icon, or a plain dot. */
  children: ReactNode;
}

export const TimelineRail: FC<TimelineRailProps> = ({ shape, children }) => {
  const onBranch = BRANCH_SHAPES.includes(shape);
  const endsBranch = shape === RailShapes.BranchEnd || shape === RailShapes.BranchOnly;

  return (
    <div className="rail" style={{ width: RAIL_WIDTH }}>
      <Line x={TRUNK_X} top={0} height={shape === RailShapes.End ? ABOVE_NODE : FULL_HEIGHT} />

      {endsBranch && <RejoinCurve />}

      {/* A branch's newest row has no line above its node — the glyph is where it stops.
          A one-row run needs no line at all: the node meets the rejoin curve directly. */}
      {shape === RailShapes.BranchStart && <Line x={BRANCH_X} top={NODE_Y} height={BELOW_NODE} />}
      {shape === RailShapes.Branch && <Line x={BRANCH_X} top={0} height={FULL_HEIGHT} />}
      {shape === RailShapes.BranchEnd && <Line x={BRANCH_X} top={0} height={ABOVE_NODE} />}

      <div className="rail-node" style={{ left: onBranch ? BRANCH_CENTER : TRUNK_CENTER, top: NODE_Y }}>
        {children}
      </div>
    </div>
  );
};

/** The rail lines that carry on past a row with no node of its own. */
export interface PassingLines {
  trunk: boolean;
  branch: boolean;
}

export const PassingRailLines: FC<PassingLines> = ({ trunk, branch }) => (
  <div className="passing-rail" style={{ width: RAIL_WIDTH }} aria-hidden>
    {trunk && <Line x={TRUNK_X} top={0} height={FULL_HEIGHT} />}
    {branch && <Line x={BRANCH_X} top={0} height={FULL_HEIGHT} />}
  </div>
);
