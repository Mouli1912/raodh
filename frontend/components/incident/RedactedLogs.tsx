'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface RedactedLogsProps {
  logs?: string;
}

export const RedactedLogs: React.FC<RedactedLogsProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!logs) return null;

  return (
    <div className="border border-border rounded-btn overflow-hidden bg-surface">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-surface-muted border-b border-border flex items-center justify-between text-xs font-semibold text-text hover:bg-slate-200/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-text-muted" />
          <span>Logs</span>
          <Badge
            variant="info"
            size="sm"
            icon={<ShieldCheck className="w-3 h-3 text-sky-600" />}
          >
            Redacted
          </Badge>
        </div>
        <div className="text-text-muted flex items-center gap-1">
          <span className="text-[11px] font-normal font-mono">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 bg-surface-muted max-h-40 overflow-y-auto font-mono text-xs text-text leading-relaxed select-text space-y-1">
          {logs.split('\n').map((line, idx) => (
            <div key={idx} className="break-all whitespace-pre-wrap">
              {line.includes('[ERROR]') ? (
                <span className="text-red-700">{line}</span>
              ) : line.includes('[WARN]') ? (
                <span className="text-amber-700">{line}</span>
              ) : line.includes('[ALERT]') ? (
                <span className="text-red-600 font-semibold">{line}</span>
              ) : (
                <span className="text-slate-700">{line}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
