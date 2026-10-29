import { type FC, type MouseEvent, type ReactNode, useEffect, useState } from 'react';
import { Icon, type IconName } from './Icon';
import './components.css';

export type MenuItem =
  | { type: 'action'; id: string; icon: IconName; caption: string; onClick: () => void }
  | { type: 'divider'; id: string };

interface Position {
  x: number;
  y: number;
}

interface MenuPopoverProps {
  items: MenuItem[];
  position: Position;
  onClose: () => void;
}

const MenuPopover: FC<MenuPopoverProps> = ({ items, position, onClose }) => {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="menu-backdrop" onClick={onClose} onContextMenu={(event) => event.preventDefault()}>
      <ul
        className="menu"
        role="menu"
        style={{ left: position.x, top: position.y }}
        onClick={(event) => event.stopPropagation()}
      >
        {items.map((item) =>
          item.type === 'divider' ? (
            <li key={item.id} className="menu-divider" role="separator" />
          ) : (
            <li key={item.id}>
              <button
                type="button"
                role="menuitem"
                className="menu-item"
                onClick={() => {
                  onClose();
                  item.onClick();
                }}
              >
                <Icon name={item.icon} size="sm" />
                {item.caption}
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
};

/** Opens the menu where the user right-clicked. Render `menu` somewhere inside the row. */
export const useRightClickMenu = (items: MenuItem[]): { onContextMenu: (event: MouseEvent) => void; menu: ReactNode } => {
  const [position, setPosition] = useState<Position | null>(null);

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
  };

  const menu = position && <MenuPopover items={items} position={position} onClose={() => setPosition(null)} />;
  return { onContextMenu, menu };
};

interface KebabMenuProps {
  items: MenuItem[];
  dataTestId?: string;
}

export const KebabMenu: FC<KebabMenuProps> = ({ items, dataTestId }) => {
  const [position, setPosition] = useState<Position | null>(null);

  const open = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.bottom + 4 });
  };

  return (
    <>
      <button type="button" className="icon-button" aria-label="More actions" onClick={open} data-testid={dataTestId}>
        <Icon name="Kebab" />
      </button>
      {position && <MenuPopover items={items} position={position} onClose={() => setPosition(null)} />}
    </>
  );
};
