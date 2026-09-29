'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-16 max-w-lg mx-auto">
      <EmptyState
        icon={<FileQuestion className="w-8 h-8 text-text-muted" />}
        title="Page not found"
        description="The incident, deploy, or insight report you are looking for does not exist or has been relocated."
        action={
          <Link href="/">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Back to Incidents
            </Button>
          </Link>
        }
      />
    </div>
  );
}
