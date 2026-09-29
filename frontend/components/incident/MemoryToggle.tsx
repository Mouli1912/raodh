'use client';

import React from 'react';
import clsx from 'clsx';
import { BrainCircuit } from 'lucide-react';

export interface MemoryToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export const MemoryToggle: React.FC<MemoryToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2 select-none">
      <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
        <BrainCircuit className={clsx('w-3.5 h-3.5', enabled ? 'text-memory' : 'text-text-faint')} />
        <span>Memory</span>
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle precedent memory"
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={clsx(
          'relative inline-flex h-7 w-16 items-center rounded-full p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          enabled ? 'bg-memory' : 'bg-slate-300'
        )}
      >
        <span
          className={clsx(
            'absolute text-[10px] font-mono font-bold uppercase transition-opacity duration-150',
            enabled
              ? 'left-2 text-white opacity-100'
              : 'right-2 text-slate-700 opacity-100'
          )}
        >
          {enabled ? 'ON' : 'OFF'}
        </span>

        <span
          className={clsx(
            'inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-150',
            enabled ? 'translate-x-9' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
