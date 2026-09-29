'use client';

import React, { useState } from 'react';
import { Precedent } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { correctMemory } from '@/lib/api';
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquareX,
} from 'lucide-react';
import clsx from 'clsx';

export interface MemoryPanelProps {
  precedents: Precedent[];
  highlightedId?: string | null;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  precedents,
  highlightedId,
}) => {
  const { success, error } = useToast();
  const [correctedIds, setCorrectedIds] = useState<Record<string, boolean>>({});
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitCorrection = async (precedentId: string) => {
    try {
      setIsSubmitting(true);
      await correctMemory(precedentId, correctionReason);
      setCorrectedIds((prev) => ({ ...prev, [precedentId]: true }));
      setActivePopoverId(null);
      setCorrectionReason('');
      success('Memory Corrected', `Marked ${precedentId} as disputed. Ranker will penalize this entry.`);
    } catch (err) {
      console.error(err);
      error('Correction Failed', 'Could not submit memory correction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!precedents || precedents.length === 0) {
    return null;
  }

  return (
    <div className="rounded-card border-t-2 border-t-memory border-x border-b border-violet-200 bg-violet-50/40 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="p-4 bg-violet-50/80 border-b border-violet-200/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-memory text-white flex items-center justify-center">
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-semibold text-text text-sm tracking-tight">
            Memories used for this answer
          </h3>
          <Badge variant="memory" size="sm">
            {precedents.length} precedent{precedents.length > 1 ? 's' : ''}
          </Badge>
        </div>
        <span className="text-xs text-text-muted font-mono hidden sm:inline">
          Auditable institutional recall
        </span>
      </div>

      {/* Precedent Rows */}
      <div className="divide-y divide-violet-200/60">
        {precedents.map((precedent) => {
          const isHighlighted = highlightedId === precedent.id;
          const isCorrected = !!correctedIds[precedent.id];

          return (
            <div
              key={precedent.id}
              id={`precedent-${precedent.id}`}
              className={clsx(
                'p-5 transition-all duration-300 relative',
                isHighlighted
                  ? 'bg-violet-100/80 ring-2 ring-memory/60'
                  : 'hover:bg-violet-50/70',
                isCorrected && 'opacity-60 bg-slate-100/80'
              )}
            >
              {/* Row Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-violet-200/80 text-violet-900 border border-violet-300">
                    {precedent.id}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {precedent.service}
                  </Badge>
                  <span className="text-xs font-semibold text-text">
                    {precedent.summary}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Relevance chip */}
                  <span className="text-xs font-mono font-medium text-violet-700 bg-white px-2 py-0.5 rounded border border-violet-200">
                    {precedent.relevance}% match
                  </span>

                  {/* Last used */}
                  <span className="text-xs text-text-muted flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {precedent.last_used_at}
                  </span>
                </div>
              </div>

              {/* Root cause and verified fix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3.5">
                <div className="p-3 bg-white rounded-btn border border-border">
                  <span className="font-semibold text-text block mb-1">
                    Historical Root Cause:
                  </span>
                  <p className="text-text-muted leading-relaxed">
                    {precedent.root_cause}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-btn border border-border">
                  <span className="font-semibold text-emerald-800 block mb-1">
                    Verified Fix Applied:
                  </span>
                  <p className="text-text leading-relaxed">
                    {precedent.fix}
                  </p>
                </div>
              </div>

              {/* Outcome Bar & Feedback Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-violet-200/50 text-xs">
                {/* Outcome Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-text-muted font-medium">Outcome history:</span>
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-medium text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {precedent.successes} worked
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono font-medium text-[11px]">
                      <XCircle className="w-3 h-3 text-red-600" />
                      {precedent.failures} failed
                    </span>
                  </div>
                </div>

                {/* Correction trigger or status */}
                <div className="relative">
                  {isCorrected ? (
                    <span className="text-xs font-medium text-amber-800 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Marked as disputed / corrected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setActivePopoverId(
                          activePopoverId === precedent.id ? null : precedent.id
                        )
                      }
                      className="text-xs text-text-muted hover:text-danger flex items-center gap-1 underline transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <MessageSquareX className="w-3.5 h-3.5" />
                      This memory is wrong
                    </button>
                  )}

                  {/* Correction Popover */}
                  {activePopoverId === precedent.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-72 p-3.5 bg-white border border-border-strong rounded-card shadow-xl z-30">
                      <p className="font-semibold text-xs text-text mb-1">
                        Report memory inaccuracy
                      </p>
                      <p className="text-[11px] text-text-muted mb-2">
                        Help Precedent refine team memory by specifying why this precedent is invalid or outdated.
                      </p>
                      <textarea
                        value={correctionReason}
                        onChange={(e) => setCorrectionReason(e.target.value)}
                        placeholder="Optional reason (e.g. PgBouncer config changed in Q3)..."
                        rows={2}
                        className="w-full text-xs p-2 bg-surface-muted border border-border rounded-btn mb-2.5 focus-visible:outline-2 focus-visible:outline-primary placeholder:text-text-muted"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActivePopoverId(null);
                            setCorrectionReason('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={isSubmitting}
                          onClick={() => handleSubmitCorrection(precedent.id)}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
