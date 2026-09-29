'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';

const STAGES = [
  'Recalling similar incidents',
  'Checking recent deploys',
  'Reasoning',
  'Ranking',
];

export interface TriageStepperProps {
  onComplete?: () => void;
}

export const TriageStepper: React.FC<TriageStepperProps> = ({ onComplete }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <Card padding="md" className="border-primary/30 bg-primary-soft/30 shadow-sm">
      <div
        aria-live="polite"
        className="space-y-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <Spinner size="sm" color="memory" />
            <span className="text-sm font-semibold text-text">
              Triaging alert with team memory...
            </span>
          </div>
          <span className="font-mono text-xs text-text-muted">
            Stage {Math.min(currentStage + 1, STAGES.length)} of {STAGES.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {STAGES.map((stage, idx) => {
            const isDone = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={stage}
                className={clsx(
                  'flex items-center gap-2.5 p-2 rounded-btn border text-xs transition-colors duration-150',
                  isDone
                    ? 'bg-white text-emerald-800 border-emerald-200'
                    : isCurrent
                    ? 'bg-white text-primary font-medium border-primary shadow-xs'
                    : 'bg-surface/50 text-text-faint border-border'
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Spinner size="sm" color="primary" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className="truncate">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
