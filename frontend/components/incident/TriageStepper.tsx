'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { CheckCircle2, Circle, FastForward } from 'lucide-react';
import { STEP_DURATION_MS as DEFAULT_STEP_DURATION } from '@/lib/mock';
import clsx from 'clsx';

const BASE_STAGES = [
  { id: 'recall', label: 'Recalling similar incidents' },
  { id: 'deploys', label: 'Checking recent deploys' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'ranking', label: 'Ranking' },
];

export interface TriageStepperProps {
  memoryEnabled?: boolean;
  onComplete?: () => void;
}

export const TriageStepper: React.FC<TriageStepperProps> = ({
  memoryEnabled = true,
  onComplete,
}) => {
  const searchParams = useSearchParams();
  const isFast = searchParams.get('fast') === '1';
  const stepDuration = isFast ? 150 : DEFAULT_STEP_DURATION;

  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const advanceStage = (stage: number) => {
      if (stage >= BASE_STAGES.length) {
        if (onComplete) onComplete();
        return;
      }

      setCurrentStage(stage);

      // In Memory OFF mode, Stage 0 ("Recalling similar incidents") completes immediately (50ms)
      const duration = !memoryEnabled && stage === 0 ? 50 : stepDuration;

      timeoutId = setTimeout(() => {
        advanceStage(stage + 1);
      }, duration);
    };

    advanceStage(0);

    return () => clearTimeout(timeoutId);
  }, [memoryEnabled, stepDuration, onComplete]);

  return (
    <Card padding="md" className="border-primary/30 bg-primary-soft/30 shadow-sm">
      <div aria-live="polite" className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <Spinner size="sm" color="memory" />
            <span className="text-sm font-semibold text-text">
              {memoryEnabled
                ? 'Triaging alert with institutional memory...'
                : 'Triaging alert without memory (generic baseline)...'}
            </span>
          </div>
          <span className="font-mono text-xs text-text-muted">
            Stage {Math.min(currentStage + 1, BASE_STAGES.length)} of {BASE_STAGES.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {BASE_STAGES.map((stageObj, idx) => {
            const isDone = idx < currentStage;
            const isCurrent = idx === currentStage;
            const isSkipped = !memoryEnabled && stageObj.id === 'recall';

            let displayLabel = stageObj.label;
            if (isSkipped) {
              displayLabel = 'Skipped (memory off)';
            }

            return (
              <div
                key={stageObj.id}
                className={clsx(
                  'flex items-center gap-2.5 p-2 rounded-btn border text-xs transition-colors duration-150',
                  isSkipped
                    ? 'bg-slate-100 text-text-muted border-slate-200'
                    : isDone
                    ? 'bg-white text-emerald-800 border-emerald-200'
                    : isCurrent
                    ? 'bg-white text-primary font-medium border-primary shadow-xs'
                    : 'bg-surface/50 text-text-faint border-border'
                )}
              >
                {isSkipped ? (
                  <FastForward className="w-4 h-4 text-text-muted shrink-0" />
                ) : isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Spinner size="sm" color="primary" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className="truncate">{displayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
