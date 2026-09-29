import React from 'react';
import clsx from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'muted' | 'memory' | 'white';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  };

  const colorMap = {
    primary: 'border-primary border-t-transparent',
    muted: 'border-text-muted border-t-transparent',
    memory: 'border-memory border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'rounded-full animate-spin',
        sizeMap[size],
        colorMap[color],
        className
      )}
    />
  );
};
