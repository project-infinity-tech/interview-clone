import type { FC } from 'react';
import { Icon } from '@/components/Icon';
import type { SavepointType } from './types';
import './BranchHistory.css';

interface SavepointNodeProps {
  type: SavepointType;
  shadowed: boolean;
}

/**
 * The glyph that sits on the rail for a savepoint. A `preRestore` is taken on the way into a
 * restore rather than asked for, so it stays a plain dot and the marked-for-a-reason ones keep the
 * plate.
 */
export const SavepointNode: FC<SavepointNodeProps> = ({ type, shadowed }) => {
  const color = shadowed ? 'tertiary' : 'secondary';
  const frameClass = `node-frame ${shadowed ? 'is-shadowed' : ''}`;

  switch (type) {
    case 'preRestore':
      return <div className={`node-dot ${shadowed ? 'is-shadowed' : ''}`} />;

    case 'manual':
      return (
        <div className={frameClass}>
          <Icon name="Bookmark" size="sm" color={color} />
        </div>
      );

    case 'preAiAction':
      return (
        <div className={frameClass}>
          <Icon name="Sparkles" size="sm" color={color} />
        </div>
      );

    case 'deployment':
      return (
        <div className={frameClass}>
          <Icon name="Rocket" size="sm" color={color} />
        </div>
      );
  }
};
