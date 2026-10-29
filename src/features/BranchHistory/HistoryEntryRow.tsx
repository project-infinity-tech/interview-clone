import { type FC, type MouseEvent, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { EditableMultilineText, EditableSingleLineText, type EditableTextRef } from '@/components/EditableText';
import { KebabMenu, type MenuItem, useRightClickMenu } from '@/components/Menu';
import { describeSavepointType } from './describeSavepointType';
import { formatSavepointTime } from './formatSavepointTime';
import { SavepointNode } from './SavepointNode';
import { type RailShape, RailShapes, RUN_BOTTOM_EDGE, RUN_TOP_EDGE, TimelineRail } from './TimelineRail';
import type { HistoryEntry } from './types';
import './BranchHistory.css';

/** Stands in wherever a time would go before the server has taken the savepoint. */
const PENDING_TIME_LABEL = 'saving…';

const DESCRIPTION_PREVIEW_SEPARATOR = ' · ';

const takenAtFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** The edges ruling a shadowed run off from the trunk rows around it, for a row's place in the run. */
const runEdges = (shape: RailShape): string => {
  switch (shape) {
    case RailShapes.BranchOnly:
      return `${RUN_TOP_EDGE}, ${RUN_BOTTOM_EDGE}`;
    case RailShapes.BranchStart:
      return RUN_TOP_EDGE;
    case RailShapes.BranchEnd:
      return RUN_BOTTOM_EDGE;
    default:
      return 'none';
  }
};

interface HistoryEntryRowProps {
  entry: HistoryEntry;
  railShape: RailShape;
  expanded: boolean;
  /** Measured once for the whole list, so rows don't drift against each other as they render. */
  now: number;
  onToggle: (entryId: string) => void;
  onRename: (entryId: string, title: string) => void;
  /** `null` clears the description. */
  onDescribe: (entryId: string, description: string | null) => void;
  onRestore: (entry: HistoryEntry) => void;
  onDelete: (entryId: string) => void;
}

export const HistoryEntryRow: FC<HistoryEntryRowProps> = ({
  entry,
  railShape,
  expanded,
  now,
  onToggle,
  onRename,
  onDescribe,
  onRestore,
  onDelete,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const titleRef = useRef<EditableTextRef>(null);
  // "Edit description" can be picked from a closed row, which has no editor yet.
  // The row opens, and the edit starts once the editor appears.
  const [isDescriptionEditPending, setIsDescriptionEditPending] = useState(false);

  // The title sits above the toggle, so it passes its own clicks on. Only the first click of a
  // double-click, so the row stays open under the rename rather than opening and shutting again.
  const toggleFromTitle = (event: MouseEvent) => {
    if (event.detail === 1 && !isRenaming) {
      onToggle(entry.id);
    }
  };

  const rename = (value: string) => {
    setIsRenaming(false);
    const title = value.trim();
    if (title !== '' && title !== entry.title) {
      onRename(entry.id, title);
    }
  };

  // Unlike a title, a description can be emptied: a blank one clears it.
  const describe = (value: string) => {
    const description = value.trim();
    if (description !== (entry.description ?? '')) {
      onDescribe(entry.id, description === '' ? null : description);
    }
  };

  const requestDescriptionEdit = () => {
    setIsDescriptionEditPending(true);
    if (!expanded) {
      onToggle(entry.id);
    }
  };

  const startPendingDescriptionEdit = (editor: EditableTextRef | null) => {
    if (editor && isDescriptionEditPending) {
      setIsDescriptionEditPending(false);
      editor.startEditing();
    }
  };

  // One list for both the kebab menu on an open row and the right-click menu anywhere on the row.
  const menuItems: MenuItem[] = [
    {
      type: 'action',
      id: 'rename',
      icon: 'PencilSquare',
      caption: 'Rename',
      onClick: () => titleRef.current?.startEditing(),
    },
    {
      type: 'action',
      id: 'edit-description',
      icon: 'PencilSquare',
      caption: 'Edit description',
      onClick: requestDescriptionEdit,
    },
    { type: 'divider', id: 'divider' },
    {
      type: 'action',
      id: 'delete',
      icon: 'Trash',
      caption: 'Delete',
      onClick: () => onDelete(entry.id),
    },
  ];
  const { onContextMenu, menu } = useRightClickMenu(menuItems);

  return (
    <div
      className={`entry-row ${entry.isShadowed ? 'is-shadowed' : ''}`}
      style={{ boxShadow: runEdges(railShape) }}
      onContextMenu={onContextMenu}
    >
      <TimelineRail shape={railShape}>
        <SavepointNode type={entry.type} shadowed={entry.isShadowed} />
      </TimelineRail>

      <div className="entry-header">
        <button
          type="button"
          className="entry-header-toggle"
          onClick={() => onToggle(entry.id)}
          aria-expanded={expanded}
          aria-label={entry.title}
        />
        <div className="entry-body">
          <div className={`entry-title ${entry.isShadowed ? 'is-shadowed' : ''}`} onClick={toggleFromTitle}>
            <EditableSingleLineText
              ref={titleRef}
              value={entry.title}
              onRename={rename}
              onRenameStart={() => setIsRenaming(true)}
              onRenameCancel={() => setIsRenaming(false)}
              data-testid={`savepoint-title-${entry.id}`}
            />
          </div>
          <div className="entry-subtitle">
            {describeSavepointType(entry)}
            {!expanded && entry.description !== undefined && (
              <>
                {DESCRIPTION_PREVIEW_SEPARATOR}
                <span className="entry-description-preview">{entry.description}</span>
              </>
            )}
          </div>
        </div>
        {!expanded && (
          <div className="entry-timestamp">
            {entry.createdAt === undefined ? PENDING_TIME_LABEL : formatSavepointTime(entry.createdAt, now)}
          </div>
        )}

        {expanded && (
          <div className="entry-header-actions">
            <KebabMenu items={menuItems} dataTestId={`savepoint-kebab-menu-${entry.id}`} />
            <Button
              className="entry-restore-button"
              color="primary"
              variant="filled"
              size="md"
              disabled={!entry.isRestorable}
              onClick={() => onRestore(entry)}
              data-testid={`restore-savepoint-${entry.id}`}
            >
              Restore
            </Button>
          </div>
        )}
      </div>

      <div className={`entry-fold-out ${expanded ? 'is-expanded' : ''}`} aria-hidden={!expanded}>
        <div className="entry-fold-out-clip">
          <div className="entry-fold-out-content">
            {expanded && (
              <EditableMultilineText
                className="entry-description"
                ref={startPendingDescriptionEdit}
                value={entry.description ?? ''}
                onRename={describe}
                placeholder="Add a description"
                data-testid={`savepoint-description-${entry.id}`}
              />
            )}
            <dl className="entry-facts">
              <dt>Taken</dt>
              <dd>{entry.createdAt === undefined ? PENDING_TIME_LABEL : takenAtFormat.format(entry.createdAt)}</dd>
            </dl>
          </div>
        </div>
      </div>
      {menu}
    </div>
  );
};
