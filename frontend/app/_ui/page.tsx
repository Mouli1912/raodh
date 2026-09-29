'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tooltip } from '@/components/ui/Tooltip';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  Brain,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Flame,
  ArrowRight,
} from 'lucide-react';

export default function UITestPage() {
  const { success, warning, error, memory } = useToast();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-text tracking-tight">
          UI Primitives Showcase
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Verification page for design tokens, typography, and atomic components.
        </p>
      </div>

      {/* Buttons */}
      <Card header="Buttons">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Medium</Button>
            <Button variant="primary" size="sm">
              Primary Small
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" isLoading>
              Loading
            </Button>
            <Button
              variant="primary"
              leftIcon={<Brain className="w-4 h-4 text-white" />}
            >
              With Icon
            </Button>
          </div>
        </div>
      </Card>

      {/* Badges */}
      <Card header="Badges & Memory Token">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="neutral">Neutral Badge</Badge>
          <Badge
            variant="success"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Resolved
          </Badge>
          <Badge
            variant="warning"
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
          >
            Mitigated / SEV2
          </Badge>
          <Badge
            variant="danger"
            icon={<AlertCircle className="w-3.5 h-3.5" />}
          >
            Open / SEV1
          </Badge>
          <Badge variant="info" icon={<Info className="w-3.5 h-3.5" />}>
            SEV3 / Informational
          </Badge>
          <Badge variant="memory" icon={<Brain className="w-3.5 h-3.5" />}>
            Precedent found (Memory)
          </Badge>
        </div>
      </Card>

      {/* Tooltip & Spinners */}
      <Card header="Tooltips & Spinners">
        <div className="flex items-center gap-6">
          <Tooltip content="Tooltip explaining score calculation: 3 successes, 0 failures, recency weight 0.94">
            <Button variant="secondary" size="sm">
              Hover for Score Tooltip
            </Button>
          </Tooltip>

          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" color="memory" />
            <Spinner size="lg" color="muted" />
          </div>
        </div>
      </Card>

      {/* Skeletons */}
      <Card header="Skeletons">
        <div className="space-y-2">
          <Skeleton height={20} className="w-3/4" />
          <Skeleton height={16} className="w-1/2" />
          <Skeleton height={16} className="w-5/6" />
        </div>
      </Card>

      {/* Toasts Trigger */}
      <Card header="Toasts Notification System">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              success('Saved', 'This incident is now part of your memory.')
            }
          >
            Success Toast
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              memory('Memory Cited', 'Triaged using precedents INC-001 & INC-014.')
            }
          >
            Memory Toast
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              warning('Pre-mortem Warning', 'Deploy D-118 resembles INC-001.')
            }
          >
            Warning Toast
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              error('Resolution Failed', 'Connection to API timed out.')
            }
          >
            Danger Toast
          </Button>
        </div>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={<Flame className="w-6 h-6 text-text-muted" />}
        title="No active alerts matching criteria"
        description="Your filters did not match any open or mitigated incidents. Try resetting search parameters."
        action={
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Reset filters
          </Button>
        }
      />
    </div>
  );
}
