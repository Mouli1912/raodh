'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="py-16 max-w-lg mx-auto">
      <EmptyState
        icon={<AlertTriangle className="w-8 h-8 text-danger" />}
        title="Application Error Encountered"
        description={
          error.message ||
          'An unexpected error occurred while processing telemetry or memory recall.'
        }
        action={
          <Button
            variant="secondary"
            size="md"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry Request
          </Button>
        }
      />
    </div>
  );
}
