'use client';

import React from 'react';
import { TriageResult } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { X, BrainCircuit, ZapOff } from 'lucide-react';

export interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryOnResult: TriageResult;
  memoryOffResult: TriageResult;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  memoryOnResult,
  memoryOffResult,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="compare-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 transition-opacity backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl rounded-card bg-surface border border-border shadow-2xl overflow-hidden my-8">
          {/* Header */}
          <div className="p-5 border-b border-border bg-surface flex items-center justify-between">
            <div>
              <h2
                id="compare-modal-title"
                className="text-lg font-semibold text-text tracking-tight flex items-center gap-2"
              >
                Side-by-Side Comparison: Memory ON vs. Memory OFF
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                See how institutional memory turns generic guesswork into high-precision, precedent-backed triage.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-btn text-text-muted hover:text-text hover:bg-surface-muted transition-colors focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Close comparison modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Side by side comparison columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left Column: Memory OFF */}
            <div className="p-6 bg-surface space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center">
                    <ZapOff className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-text text-sm">Memory OFF</h3>
                </div>
                <Badge variant="neutral" size="sm">
                  General Knowledge Only
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                {memoryOffResult.hypotheses.map((hyp, i) => (
                  <div
                    key={hyp.id || i}
                    className="p-4 rounded-card border border-border bg-surface-muted/40 space-y-3"
                  >
                    <div>
                      <span className="text-[11px] font-mono text-text-muted">
                        Root cause hypothesis:
                      </span>
                      <h4 className="font-semibold text-text text-sm mt-0.5">
                        {hyp.root_cause}
                      </h4>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-semibold text-text-muted text-[11px] uppercase tracking-wider">
                        Suggested Actions:
                      </span>
                      <ul className="space-y-1.5 list-disc list-inside text-text-muted">
                        {hyp.suggested_steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-btn bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                      ⚠️ <strong>Risk:</strong> Restarts pods blindly without addressing HikariCP pool limits, causing immediate reconnection storms.
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Memory ON */}
            <div className="p-6 bg-violet-50/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-violet-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-memory text-white flex items-center justify-center">
                    <BrainCircuit className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-text text-sm">Memory ON</h3>
                </div>
                <Badge variant="memory" size="sm">
                  Grounded in INC-001 & INC-014
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                {memoryOnResult.hypotheses.map((hyp, i) => (
                  <div
                    key={hyp.id || i}
                    className="p-4 rounded-card border border-violet-200 bg-white shadow-xs space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-violet-700 font-semibold">
                          Score: {(hyp.score * 100).toFixed(0)}% · High Confidence
                        </span>
                        <div className="flex gap-1">
                          {hyp.evidence.map((ev) => (
                            <span
                              key={ev.precedent_id}
                              className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 border border-violet-200"
                            >
                              {ev.precedent_id}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h4 className="font-semibold text-text text-sm mt-0.5">
                        {hyp.root_cause}
                      </h4>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-semibold text-text uppercase text-[11px] tracking-wider">
                        Verified Remediation Steps:
                      </span>
                      <ol className="space-y-1.5 list-decimal list-inside text-text font-medium">
                        {hyp.suggested_steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {hyp.avoid.length > 0 && (
                      <div className="p-2.5 rounded-btn bg-red-50 border border-red-200 text-red-900 text-[11px]">
                        <strong>Do Not Repeat:</strong> {hyp.avoid[0].step} (
                        {hyp.avoid[0].reason})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-surface-muted flex items-center justify-between">
            <span className="text-xs text-text-muted font-mono">
              Tested on production alert: db.query.checkout_orders.timeout
            </span>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close comparison
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
