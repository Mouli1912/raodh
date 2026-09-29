import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      header,
      headerAction,
      footer,
      padding = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'bg-surface border border-border rounded-card shadow-card overflow-hidden',
          className
        )}
        {...props}
      >
        {header && (
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-surface">
            <div className="font-semibold text-text text-sm flex items-center gap-2">
              {header}
            </div>
            {headerAction && (
              <div className="flex items-center gap-2">{headerAction}</div>
            )}
          </div>
        )}
        <div className={paddingStyles[padding]}>{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-border bg-surface-muted flex items-center justify-between text-xs text-text-muted">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';
