'use client';

import React, { useState } from 'react';
import { Incident, ResolvePayload } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { X, CheckCircle2, Plus, Clock } from 'lucide-react';

export interface ResolveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident;
  prefilledRootCause?: string;
  prefilledFix?: string;
  prefilledFailedSteps?: string[];
  onResolve: (payload: ResolvePayload) => Promise<void>;
}

export const ResolveDrawer: React.FC<ResolveDrawerProps> = ({
  isOpen,
  onClose,
  incident,
  prefilledRootCause = '',
  prefilledFix = '',
  prefilledFailedSteps = [],
  onResolve,
}) => {
  const [rootCause, setRootCause] = useState(prefilledRootCause);
  const [fix, setFix] = useState(prefilledFix);
  const [failedSteps, setFailedSteps] = useState<string[]>(prefilledFailedSteps);
  const [newFailedStep, setNewFailedStep] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if initial props change when opening
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (prefilledRootCause) setRootCause(prefilledRootCause);
      if (prefilledFix) setFix(prefilledFix);
      if (prefilledFailedSteps.length > 0) setFailedSteps(prefilledFailedSteps);
    }
  }

  if (!isOpen) return null;

  const handleAddFailedStep = () => {
    if (newFailedStep.trim()) {
      setFailedSteps([...failedSteps, newFailedStep.trim()]);
      setNewFailedStep('');
    }
  };

  const handleRemoveFailedStep = (idx: number) => {
    setFailedSteps(failedSteps.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCause.trim() || !fix.trim()) return;

    try {
      setIsSubmitting(true);
      await onResolve({
        root_cause: rootCause,
        fix,
        failed_steps: failedSteps,
        time_to_resolve_minutes: 18,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 transition-opacity backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-border bg-surface flex items-center justify-between">
            <div>
              <h2 id="slide-over-title" className="text-base font-semibold text-text tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Resolve Incident {incident.id}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Record resolution and save to institutional memory
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-btn text-text-muted hover:text-text hover:bg-surface-muted transition-colors focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form id="resolve-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Auto-filled Time to resolve */}
            <div className="p-3 bg-surface-muted rounded-btn border border-border flex items-center justify-between text-xs">
              <span className="text-text-muted flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Time to resolve (auto-filled):
              </span>
              <span className="font-mono font-semibold text-text">18 minutes</span>
            </div>

            {/* Root cause */}
            <div className="space-y-1.5">
              <label htmlFor="root-cause" className="block text-xs font-semibold text-text">
                Verified Root Cause <span className="text-danger">*</span>
              </label>
              <textarea
                id="root-cause"
                rows={3}
                required
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="Describe what caused the alert..."
                className="w-full text-xs p-3 bg-surface border border-border rounded-btn focus-visible:outline-2 focus-visible:outline-primary text-text placeholder:text-text-muted"
              />
            </div>

            {/* Fix Applied */}
            <div className="space-y-1.5">
              <label htmlFor="fix-applied" className="block text-xs font-semibold text-text">
                Fix Applied <span className="text-danger">*</span>
              </label>
              <textarea
                id="fix-applied"
                rows={3}
                required
                value={fix}
                onChange={(e) => setFix(e.target.value)}
                placeholder="What action mitigated and fixed this issue..."
                className="w-full text-xs p-3 bg-surface border border-border rounded-btn focus-visible:outline-2 focus-visible:outline-primary text-text placeholder:text-text-muted"
              />
            </div>

            {/* Steps that did not work */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text">
                Steps that did not work (Avoid List for future)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFailedStep}
                  onChange={(e) => setNewFailedStep(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFailedStep();
                    }
                  }}
                  placeholder="e.g. Restart checkout pods without raising pool..."
                  className="flex-1 text-xs px-3 py-2 bg-surface border border-border rounded-btn focus-visible:outline-2 focus-visible:outline-primary placeholder:text-text-muted"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddFailedStep}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </Button>
              </div>

              {failedSteps.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {failedSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-btn bg-red-50 text-red-900 border border-red-200 text-xs"
                    >
                      <span className="truncate pr-2 font-medium">• {step}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFailedStep(idx)}
                        className="text-red-600 hover:text-red-800 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-border bg-surface-muted flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              form="resolve-form"
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
            >
              Resolve & Save to Memory
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
