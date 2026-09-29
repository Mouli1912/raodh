import React from 'react';
import clsx from 'clsx';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-8 text-center rounded-card bg-surface border border-dashed border-border',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-surface-muted border border-border flex items-center justify-center text-text-muted mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-semibold text-text mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-text-muted max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
