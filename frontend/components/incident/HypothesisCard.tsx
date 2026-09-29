'use client';

import React, { useState } from 'react';
import { Hypothesis } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/components/ui/Toast';
import {
  Check,
  Copy,
  Brain,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';

export interface HypothesisCardProps {
  hypothesis: Hypothesis;
  rank: number;
  onCitationClick?: (precedentId: string) => void;
  onFeedback?: (
    hypothesisId: string,
    verdict: 'accept' | 'reject' | 'worked' | 'failed'
  ) => void;
  onPreFillResolve?: (hypothesis: Hypothesis) => void;
  isHero?: boolean;
}

export const HypothesisCard: React.FC<HypothesisCardProps> = ({
  hypothesis,
  rank,
  onCitationClick,
  onFeedback,
  onPreFillResolve,
  isHero = false,
}) => {
  const { info, success, error } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<
    'none' | 'accepted' | 'rejected' | 'worked' | 'failed'
  >('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyStep = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    info('Copied to clipboard', text);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFeedback = async (
    verdict: 'accept' | 'reject' | 'worked' | 'failed'
  ) => {
    try {
      setIsSubmitting(true);
      const stateMap: Record<string, 'accepted' | 'rejected' | 'worked' | 'failed'> = {
        accept: 'accepted',
        reject: 'rejected',
        worked: 'worked',
        failed: 'failed',
      };
      setFeedbackState(stateMap[verdict] || 'none');
      if (onFeedback) {
        await onFeedback(hypothesis.id, verdict);
      }
      if (verdict === 'accept') {
        success('Hypothesis Accepted', 'Plan highlighted. Next: execute steps and report outcome.');
        if (onPreFillResolve) {
          onPreFillResolve(hypothesis);
        }
      } else if (verdict === 'reject') {
        info('Hypothesis Dismissed', 'Feedback recorded for memory ranker.');
      } else if (verdict === 'worked') {
        success('Step Succeeded', 'Recorded successful outcome.');
      } else if (verdict === 'failed') {
        error('Step Marked as Failed', 'Added to Avoid List to prevent team repetition.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfidenceBadge = (confidence: Hypothesis['confidence']) => {
    switch (confidence) {
      case 'high':
        return (
          <Badge variant="success" size="sm">
            High confidence
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="warning" size="sm">
            Medium confidence
          </Badge>
        );
      case 'low':
      case 'none':
        return (
          <Badge variant="neutral" size="sm">
            Low confidence
          </Badge>
        );
    }
  };

  return (
    <Card
      id={`hypothesis-${hypothesis.id}`}
      className={clsx(
        'transition-all duration-150 scroll-mt-32',
        isHero
          ? 'border-border-strong ring-1 ring-border-strong/50 shadow-md'
          : 'border-border'
      )}
      padding="none"
    >
      {/* Header */}
      <div
        className={clsx(
          'p-5 border-b border-border',
          isHero ? 'bg-surface' : 'bg-surface'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0',
                isHero
                  ? 'bg-primary text-white'
                  : 'bg-surface-muted text-text-muted border border-border'
              )}
            >
              #{rank}
            </span>
            <h3
              className={clsx(
                'font-semibold text-text tracking-tight',
                isHero ? 'text-base sm:text-lg' : 'text-base'
              )}
            >
              {hypothesis.root_cause}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {getConfidenceBadge(hypothesis.confidence)}

            {hypothesis.grounded ? (
              <Badge
                variant="memory"
                size="sm"
                icon={<Brain className="w-3.5 h-3.5" />}
              >
                Grounded in {hypothesis.evidence.length} past incident
                {hypothesis.evidence.length > 1 ? 's' : ''}
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                General knowledge, no precedent
              </Badge>
            )}
          </div>
        </div>

        {/* Evidence & Citations */}
        {hypothesis.grounded && hypothesis.evidence.length > 0 ? (
          <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
            <span className="text-xs text-text-muted font-medium">
              Citations:
            </span>
            {hypothesis.evidence.map((ev) => (
              <button
                key={ev.precedent_id}
                type="button"
                onClick={() => onCitationClick && onCitationClick(ev.precedent_id)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-violet-100 text-violet-800 border border-violet-300 hover:bg-violet-200 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                title={ev.why}
              >
                <span>{ev.precedent_id}</span>
                <ArrowRight className="w-3 h-3 text-violet-600" />
              </button>
            ))}
          </div>
        ) : !hypothesis.grounded ? (
          <p className="mt-2 text-xs text-text-muted italic">
            This hypothesis is generated from general system patterns. No historical incident matched this alert signature.
          </p>
        ) : null}
      </div>

      {/* Suggested steps */}
      <div className="p-5 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Suggested Remediation Steps
        </h4>
        <ol className="space-y-2.5">
          {hypothesis.suggested_steps.map((step, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-3 p-2.5 rounded-btn bg-surface-muted/70 border border-border group hover:bg-surface-muted transition-colors"
            >
              <div className="flex items-start gap-2.5 text-sm text-text leading-relaxed">
                <span className="font-mono text-xs font-semibold text-primary mt-0.5 w-5 shrink-0">
                  {idx + 1}.
                </span>
                <span>{step}</span>
              </div>
              <button
                type="button"
                aria-label={`Copy step ${idx + 1}`}
                onClick={() => handleCopyStep(step, idx)}
                className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white border border-transparent hover:border-border transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Footer: Score Basis & Feedback Buttons */}
      <div className="px-5 py-3.5 bg-surface-muted/60 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Score Basis */}
        <div className="flex items-center gap-1.5 text-text-muted font-mono">
          <span>Score basis: {hypothesis.score_basis}</span>
          <Tooltip content="Score is calculated from verified success rate (70%), recency decay (15%), and signature semantic relevance (15%).">
            <HelpCircle className="w-3.5 h-3.5 text-text-faint hover:text-text cursor-pointer" />
          </Tooltip>
        </div>

        {/* Feedback Buttons */}
        <div className="flex items-center gap-2">
          {feedbackState === 'none' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={() => handleFeedback('accept')}
              >
                Accept
              </Button>
              <Button
                variant="ghost"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<ThumbsDown className="w-3.5 h-3.5 text-text-muted" />}
                onClick={() => handleFeedback('reject')}
              >
                Reject
              </Button>
            </>
          )}

          {feedbackState === 'accepted' && (
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 font-medium flex items-center gap-1 mr-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
              </span>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={() => handleFeedback('worked')}
              >
                This worked
              </Button>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<XCircle className="w-3.5 h-3.5 text-danger" />}
                onClick={() => handleFeedback('failed')}
              >
                This didn&apos;t work
              </Button>
            </div>
          )}

          {feedbackState === 'worked' && (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified fix recorded in team memory
            </span>
          )}

          {feedbackState === 'failed' && (
            <span className="text-red-700 font-medium flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              Added to Avoid List
            </span>
          )}

          {feedbackState === 'rejected' && (
            <span className="text-text-muted font-medium flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Dismissed
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
