import type { FC } from 'react';
import { Button } from './Button';
import './components.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  affirmativeLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({ title, message, affirmativeLabel, onConfirm, onCancel }) => (
  <div className="dialog-backdrop" onClick={onCancel}>
    <div className="dialog" role="dialog" aria-modal aria-label={title} onClick={(event) => event.stopPropagation()}>
      <h3 className="dialog-title">{title}</h3>
      <p className="dialog-message">{message}</p>
      <div className="dialog-actions">
        <Button color="neutral" variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button color="primary" variant="filled" size="md" onClick={onConfirm} autoFocus>
          {affirmativeLabel}
        </Button>
      </div>
    </div>
  </div>
);
