import type { FC, ReactNode } from 'react';
import { Icon } from './Icon';
import './components.css';

interface PaneWindowProps {
  title: string;
  children: ReactNode;
}

/** Looks like the editor's side pane. The collapse and close buttons do nothing. */
export const PaneWindow: FC<PaneWindowProps> = ({ title, children }) => (
  <section className="pane-window" data-testid="branch-history-pane">
    <header className="pane-window-header">
      <button type="button" className="pane-window-collapse" title="Collapse">
        <Icon name="ChevronUp" size="sm" />
      </button>
      <h2 className="pane-window-title">{title}</h2>
      <button type="button" className="icon-button" title="Close history">
        <Icon name="Close" size="sm" />
      </button>
    </header>
    <div className="pane-window-body">{children}</div>
  </section>
);
