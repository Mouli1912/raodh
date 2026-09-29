'use client';

import React from 'react';
import { AvoidItem } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { XCircle, ArrowRight } from 'lucide-react';

export interface AvoidListProps {
  items: AvoidItem[];
  onCitationClick?: (precedentId: string) => void;
}

export const AvoidList: React.FC<AvoidListProps> = ({
  items,
  onCitationClick,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <Card
      className="border-red-200 bg-red-50/50 shadow-sm transition-all duration-200"
      padding="none"
    >
      <div className="p-4 border-b border-red-200/60 bg-red-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-red-900 font-semibold text-sm">
          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>Do not repeat (Known Anti-Patterns)</span>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
          {items.length} step{items.length > 1 ? 's' : ''} to avoid
        </span>
      </div>

      <div className="p-4 space-y-3 divide-y divide-red-200/50">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
              idx > 0 ? 'pt-3' : ''
            }`}
          >
            <div className="space-y-1 flex-1">
              <p className="text-sm font-semibold text-red-950 flex items-start gap-1.5">
                <span className="text-red-500 font-bold">•</span>
                <span>{item.step}</span>
              </p>
              <p className="text-xs text-red-800/80 leading-relaxed pl-3">
                {item.reason}
              </p>
            </div>

            {item.precedent_id && (
              <button
                type="button"
                onClick={() => onCitationClick && onCitationClick(item.precedent_id!)}
                className="self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-white text-red-800 border border-red-300 hover:bg-red-100 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
                title={`View ${item.precedent_id}`}
              >
                <span>{item.precedent_id}</span>
                <ArrowRight className="w-3 h-3 text-red-600" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
