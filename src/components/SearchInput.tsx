import type { FC, KeyboardEvent, Ref } from 'react';
import { Icon } from './Icon';
import './components.css';

interface SearchInputProps {
  ref?: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  'aria-label'?: string;
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  onKeyDown,
  className = '',
  'aria-label': ariaLabel,
  ref,
}) => (
  <div className={`search-input ${className}`}>
    <div className="search-input-wrapper">
      <Icon name="Search" color="primary" />
      <input
        ref={ref}
        className="search-input-field"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </div>
  </div>
);
