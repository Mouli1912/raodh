import React from 'react';
import clsx from 'clsx';

export type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'memory';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-medium rounded-full border transition-colors';

  const variants: Record<BadgeVariant, string> = {
    neutral: 'bg-surface-muted text-text-muted border-border',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    memory: 'bg-violet-50 text-violet-700 border-violet-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <span className="inline-flex items-center shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
