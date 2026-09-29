'use client';

import React from 'react';
import clsx from 'clsx';
import { TimelineEvent, TimelineEventKind } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Clock } from 'lucide-react';

export interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const dotColorMap: Record<TimelineEventKind, string> = {
    alert: 'bg-red-600 ring-red-100',
    deploy: 'bg-sky-600 ring-sky-100',
    triage: 'bg-violet-600 ring-violet-100',
    feedback: 'bg-indigo-600 ring-indigo-100',
    action: 'bg-slate-500 ring-slate-100',
    resolution: 'bg-emerald-600 ring-emerald-100',
  };

  const kindLabelMap: Record<TimelineEventKind, string> = {
    alert: 'Alert',
    deploy: 'Deploy',
    triage: 'Triage',
    feedback: 'Feedback',
    action: 'Action',
    resolution: 'Resolution',
  };

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-muted" />
          <span>Incident Timeline</span>
        </div>
      }
      padding="md"
    >
      <div className="relative pl-5 space-y-5">
        {/* Continuous vertical connector line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border-strong" />

        {events.map((event, idx) => (
          <div
            key={event.id || idx}
            className="relative flex items-start gap-3 text-xs transition-opacity duration-300 animate-fadeIn"
          >
            {/* 10px dot with outer ring */}
            <div
              className={clsx(
                'absolute -left-5 mt-1 w-2.5 h-2.5 rounded-full ring-4 shrink-0',
                dotColorMap[event.kind]
              )}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[11px] text-text-muted font-medium">
                  {event.at}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-muted border border-border text-text-muted">
                  {kindLabelMap[event.kind]}
                </span>
              </div>
              <p className="text-text font-normal leading-relaxed break-words">
                {event.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
