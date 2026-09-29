'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import clsx from 'clsx';

export interface SampleDataBadgeProps {
  className?: string;
}

export const SampleDataBadge: React.FC<SampleDataBadgeProps> = ({ className }) => {
  return (
    <Tooltip content="Illustrative values from mock mode, not measured results.">
      <span
        className={clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-muted text-text-muted border border-border cursor-help select-none shrink-0',
          className
        )}
      >
        <Info className="w-3 h-3 text-text-faint shrink-0" />
        <span>Sample data</span>
      </span>
    </Tooltip>
  );
};
