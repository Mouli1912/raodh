'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WeeklyBrief, AskReflectResponse } from '@/lib/types';
import { getWeeklyBrief, askReflect } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  BrainCircuit,
  Sparkles,
  Flame,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
  Lightbulb,
} from 'lucide-react';

export default function InsightsPage() {
  const { memory: toastMemory, error } = useToast();
  const [brief, setBrief] = useState<WeeklyBrief | null>(null);
  const [loading, setLoading] = useState(true);

  // Reflection query state
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<AskReflectResponse | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getWeeklyBrief();
        setBrief(data);
      } catch (err) {
        console.error('Failed to load brief', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAskMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setAsking(true);
      const res = await askReflect(question);
      setAnswer(res);
      toastMemory('Memory Queried', `Retrieved answer with ${res.citations.length} precedent citations.`);
    } catch (err) {
      console.error(err);
      error('Query Failed', 'Failed to retrieve response from reflect agent.');
    } finally {
      setAsking(false);
    }
  };

  const sampleQuestions = [
    'How do we fix database connection exhaustion in checkout?',
    'What actions should on-call engineers avoid during checkout latency spikes?',
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text tracking-tight">
          Weekly Reliability Brief & Memory Recall
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {brief?.week_label || 'Weekly synthesis'} · Aggregated patterns, repeat vulnerabilities, and interactive institutional knowledge lookup.
        </p>
      </div>

      {/* Interactive Reflect Query Card */}
      <Card
        className="border-violet-300 bg-violet-50/30 shadow-md"
        padding="md"
        header={
          <div className="flex items-center gap-2 text-violet-950">
            <BrainCircuit className="w-4 h-4 text-memory" />
            <span>Ask Your Team&apos;s Memory</span>
          </div>
        }
      >
        <form onSubmit={handleAskMemory} className="space-y-3">
          <p className="text-xs text-violet-950/80">
            Query past post-mortems, verified fixes, and anti-patterns in plain English.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How did we resolve checkout database pool exhaustion last month?"
              className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-violet-200 rounded-btn focus-visible:outline-2 focus-visible:outline-primary placeholder:text-text-muted"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={asking}
              className="bg-memory hover:bg-violet-700"
              leftIcon={<Sparkles className="w-4 h-4 text-white" />}
            >
              Ask Memory
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-text-muted">
            <span className="font-medium">Try asking:</span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuestion(q)}
                className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-violet-100 text-violet-800 border border-violet-200 transition-colors"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
        </form>

        {/* Answer Box */}
        {answer && (
          <div className="mt-4 p-4 rounded-card bg-white border border-violet-200 space-y-3 animate-fadeIn shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-violet-100">
              <span className="text-xs font-semibold text-violet-900 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-memory" />
                Precedent Knowledgebase Answer
              </span>
              <Badge variant="memory" size="sm">
                High confidence · Grounded
              </Badge>
            </div>

            <p className="text-xs text-text leading-relaxed">
              {answer.answer}
            </p>

            {answer.citations.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-violet-100 text-xs">
                <span className="text-text-muted font-medium">Cited Precedents:</span>
                {answer.citations.map((id) => (
                  <Link
                    key={id}
                    href={`/incidents/${id}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-violet-100 text-violet-800 border border-violet-300 hover:bg-violet-200 transition-colors"
                  >
                    <span>{id}</span>
                    <ArrowRight className="w-3 h-3 text-violet-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Reliability Brief Sections */}
      {loading || !brief ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height={240} />
          <Skeleton height={240} />
          <Skeleton height={240} />
          <Skeleton height={240} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* 1. Recurring Causes */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-danger" />
                <span>Recurring Root Causes</span>
              </div>
            }
            padding="md"
          >
            <div className="space-y-4">
              {brief.recurring_causes.map((item, idx) => (
                <div key={idx} className="space-y-1.5 pb-3 border-b border-border last:border-0 last:pb-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">{item.cause}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                      {item.count} outages
                    </span>
                  </div>
                  <p className="text-text-muted leading-relaxed">
                    <strong>Remediation:</strong> {item.recommendation}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-text-muted font-medium">Precedents:</span>
                    {item.precedent_ids.map((id) => (
                      <Link
                        key={id}
                        href={`/incidents/${id}`}
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 hover:underline"
                      >
                        {id}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. Riskiest Services */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-warning" />
                <span>Riskiest Services</span>
              </div>
            }
            padding="md"
          >
            <div className="space-y-3">
              {brief.riskiest_services.map((s, idx) => (
                <div key={idx} className="p-3 rounded-btn bg-surface-muted border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">{s.service}</span>
                    <Badge
                      variant={
                        s.risk_level === 'high'
                          ? 'danger'
                          : s.risk_level === 'medium'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {s.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <p className="text-text-muted leading-relaxed">
                    {s.top_vulnerability}
                  </p>
                  <div className="font-mono text-[11px] text-text-muted pt-1">
                    {s.incidents_count} incidents this cycle
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 3. Deploy Patterns */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Deploy Risk Patterns</span>
              </div>
            }
            padding="md"
          >
            <div className="space-y-4 text-xs">
              {brief.deploy_patterns.map((dp, idx) => (
                <div key={idx} className="space-y-1.5 pb-3 border-b border-border last:border-0 last:pb-0">
                  <h4 className="font-semibold text-text">{dp.pattern}</h4>
                  <p className="text-text-muted leading-relaxed">{dp.impact}</p>
                  <p className="text-emerald-900 bg-emerald-50 p-2 rounded border border-emerald-200">
                    <strong>Action:</strong> {dp.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. Failed-Fix Hall of Shame */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-danger" />
                <span>Failed-Fix Hall of Shame (Anti-Patterns)</span>
              </div>
            }
            padding="md"
            className="border-red-200"
          >
            <div className="space-y-4 text-xs">
              {brief.failed_fix_hall_of_shame.map((anti, idx) => (
                <div key={idx} className="p-3 bg-red-50/70 border border-red-200 rounded-btn space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-950">{anti.anti_pattern}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-200 text-red-900">
                      {anti.times_attempted}x attempted
                    </span>
                  </div>
                  <p className="text-red-900/90 leading-relaxed">
                    {anti.lesson}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-red-200 text-[11px] text-red-800 font-mono">
                    <span>Avg wasted MTTR: {anti.wasted_minutes_avg}m</span>
                    <div className="flex gap-1">
                      {anti.citing_incidents.map((id) => (
                        <Link
                          key={id}
                          href={`/incidents/${id}`}
                          className="px-1 py-0.2 rounded bg-white text-red-900 border border-red-300 hover:underline"
                        >
                          {id}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
