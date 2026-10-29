import type { ButtonHTMLAttributes, FC } from 'react';
import './components.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color: 'primary' | 'neutral';
  variant: 'filled' | 'ghost';
  size: 'sm' | 'md';
}

export const Button: FC<ButtonProps> = ({ color, variant, size, className = '', type = 'button', ...props }) => (
  <button
    type={type}
    className={`button button-${color} button-${variant} button-${size} ${className}`}
    {...props}
  />
);
