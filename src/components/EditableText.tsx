import { type FC, type KeyboardEvent, type Ref, useImperativeHandle, useState } from 'react';
import './components.css';

export interface EditableTextRef {
  startEditing: () => void;
}

interface EditableSingleLineTextProps {
  ref?: Ref<EditableTextRef>;
  value: string;
  onRename: (value: string) => void;
  onRenameStart?: () => void;
  onRenameCancel?: () => void;
  'data-testid'?: string;
}

/** Shows text. Double-click it, or call `startEditing`, to type a new value. */
export const EditableSingleLineText: FC<EditableSingleLineTextProps> = ({
  ref,
  value,
  onRename,
  onRenameStart,
  onRenameCancel,
  'data-testid': testId,
}) => {
  const [draft, setDraft] = useState<string | null>(null);

  const startEditing = () => {
    setDraft(value);
    onRenameStart?.();
  };
  useImperativeHandle(ref, () => ({ startEditing }));

  const finish = () => {
    if (draft !== null) {
      setDraft(null);
      onRename(draft);
    }
  };

  const cancel = () => {
    setDraft(null);
    onRenameCancel?.();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      finish();
    } else if (event.key === 'Escape') {
      cancel();
    }
  };

  if (draft === null) {
    return (
      <span className="editable-text" onDoubleClick={startEditing} data-testid={testId}>
        {value}
      </span>
    );
  }

  return (
    <input
      className="editable-text-input"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={finish}
      onKeyDown={onKeyDown}
      onFocus={(event) => event.target.select()}
      autoFocus
      data-testid={testId}
    />
  );
};

interface EditableMultilineTextProps {
  ref?: Ref<EditableTextRef>;
  value: string;
  onRename: (value: string) => void;
  placeholder: string;
  className?: string;
  'data-testid'?: string;
}

/** Click to edit. Enter saves, Shift+Enter adds a new line, Escape gives up. */
export const EditableMultilineText: FC<EditableMultilineTextProps> = ({
  ref,
  value,
  onRename,
  placeholder,
  className = '',
  'data-testid': testId,
}) => {
  const [draft, setDraft] = useState<string | null>(null);

  const startEditing = () => setDraft(value);
  useImperativeHandle(ref, () => ({ startEditing }));

  const finish = () => {
    if (draft !== null) {
      setDraft(null);
      onRename(draft);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      finish();
    } else if (event.key === 'Escape') {
      setDraft(null);
    }
  };

  if (draft === null) {
    return (
      <div className={`editable-multiline ${className}`} onClick={startEditing} data-testid={testId}>
        {value === '' ? <span className="editable-placeholder">{placeholder}</span> : value}
      </div>
    );
  }

  return (
    <textarea
      className={`editable-multiline editable-multiline-input ${className}`}
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={finish}
      onKeyDown={onKeyDown}
      rows={3}
      autoFocus
      data-testid={testId}
    />
  );
};
