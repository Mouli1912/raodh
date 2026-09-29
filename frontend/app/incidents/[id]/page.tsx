'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  Incident,
  TriageResult,
  TimelineEvent,
  AvoidItem,
  Hypothesis,
  ResolvePayload,
} from '@/lib/types';
import {
  getIncident,
  triage,
  sendFeedback,
  resolveIncident,
  IS_MOCK_MODE,
} from '@/lib/api';
import {
  MOCK_TRIAGE_MEMORY_ON,
  MOCK_TRIAGE_MEMORY_OFF,
  MOCK_TIMELINE,
} from '@/lib/mock';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { MemoryToggle } from '@/components/incident/MemoryToggle';
import { TriageStepper } from '@/components/incident/TriageStepper';
import { HypothesisCard } from '@/components/incident/HypothesisCard';
import { AvoidList } from '@/components/incident/AvoidList';
import { MemoryPanel } from '@/components/incident/MemoryPanel';
import { Timeline } from '@/components/incident/Timeline';
import { RedactedLogs } from '@/components/incident/RedactedLogs';
import { ResolveDrawer } from '@/components/incident/ResolveDrawer';
import { CompareModal } from '@/components/incident/CompareModal';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Columns3,
  Flame,
  ZapOff,
  Sparkles,
} from 'lucide-react';

export default function IncidentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const incidentId = resolvedParams.id;
  const { success, info, error, memory: toastMemory } = useToast();

  // Core incident state
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loadingIncident, setLoadingIncident] = useState(true);

  // Triage state
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [hasToggledOnce, setHasToggledOnce] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [avoidItems, setAvoidItems] = useState<AvoidItem[]>([]);
  const [highlightedPrecedentId, setHighlightedPrecedentId] = useState<
    string | null
  >(null);

  // Timeline & Drawer state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isResolveDrawerOpen, setIsResolveDrawerOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [acceptedHypothesis, setAcceptedHypothesis] =
    useState<Hypothesis | null>(null);

  // Load Incident & Initial Triage
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoadingIncident(true);
        const inc = await getIncident(incidentId);
        if (!isMounted) return;
        setIncident(inc);

        // Initial timeline
        setTimelineEvents([...MOCK_TIMELINE]);

        // Run initial triage with memory ON
        setIsTriaging(true);
        const result = await triage(incidentId, 'on');
        if (!isMounted) return;
        setTriageResult(result);
        if (result.hypotheses.length > 0) {
          setAvoidItems(result.hypotheses[0].avoid || []);
        }
      } catch (err) {
        console.error('Failed to load incident data', err);
      } finally {
        if (isMounted) {
          setLoadingIncident(false);
          setIsTriaging(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [incidentId]);

  // Live updates / Polling when not mock mode
  useEffect(() => {
    if (IS_MOCK_MODE) return;

    // SSE connection if supported, or polling fallback
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/v1/incidents/${incidentId}/stream`);
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.timeline_event) {
            setTimelineEvents((prev) => [...prev, data.timeline_event]);
          }
          if (data.triage_result) {
            setTriageResult(data.triage_result);
          }
        } catch (err) {
          console.error(err);
        }
      };
    } catch {
      // Polling fallback every 3s
      const interval = setInterval(async () => {
        const updated = await getIncident(incidentId);
        if (updated) setIncident(updated);
      }, 3000);
      return () => clearInterval(interval);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [incidentId]);

  // Handle Memory Toggle Switch
  const handleMemoryToggle = async (enabled: boolean) => {
    setMemoryEnabled(enabled);
    setHasToggledOnce(true);
    setIsTriaging(true);

    try {
      const mode = enabled ? 'on' : 'off';
      const result = await triage(incidentId, mode);
      setTriageResult(result);

      if (enabled) {
        toastMemory(
          'Memory Triage Active',
          'Recalled 2 historical precedents with 96% match.'
        );
        if (result.hypotheses.length > 0) {
          setAvoidItems(result.hypotheses[0].avoid || []);
        }
      } else {
        info(
          'Memory Triage Disabled',
          'Switched to general knowledge heuristics without institutional precedents.'
        );
        setAvoidItems([]);
      }
    } catch (err) {
      console.error(err);
      error('Triage Error', 'Failed to run triage with selected mode.');
    } finally {
      setIsTriaging(false);
    }
  };

  // Citation Click -> Smooth Scroll & Highlight Memory Row
  const handleCitationClick = useCallback((precedentId: string) => {
    setHighlightedPrecedentId(precedentId);
    const element = document.getElementById(`precedent-${precedentId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setHighlightedPrecedentId(null);
    }, 3000);
  }, []);

  // Feedback Handler
  const handleFeedback = async (
    hypothesisId: string,
    verdict: 'accept' | 'reject' | 'worked' | 'failed'
  ) => {
    await sendFeedback(hypothesisId, verdict);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    if (verdict === 'accept') {
      const hyp = triageResult?.hypotheses.find((h) => h.id === hypothesisId);
      if (hyp) setAcceptedHypothesis(hyp);

      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `evt-${Date.now()}`,
          at: timeStr,
          kind: 'feedback',
          text: `On-call engineer accepted hypothesis: "${hyp?.root_cause || hypothesisId}"`,
        },
      ]);
    } else if (verdict === 'worked') {
      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `evt-${Date.now()}`,
          at: timeStr,
          kind: 'action',
          text: `Verified remediation succeeded for ${incidentId}.`,
        },
      ]);
    } else if (verdict === 'failed') {
      // Add immediately to AvoidList
      const newAvoid: AvoidItem = {
        step: 'Pod restart attempted before connection pool tuning',
        reason: `Failed in ${incidentId} (connection storm saturated DB)`,
        precedent_id: incidentId,
      };
      setAvoidItems((prev) => [newAvoid, ...prev]);

      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `evt-${Date.now()}`,
          at: timeStr,
          kind: 'action',
          text: `Step marked failed: Added to Avoid List to prevent team repetition.`,
        },
      ]);
    }
  };

  // Incident Resolution
  const handleResolve = async (payload: ResolvePayload) => {
    if (!incident) return;
    const res = await resolveIncident(incident.id, payload);
    setIncident(res.incident);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setTimelineEvents((prev) => [
      ...prev,
      {
        id: `evt-${Date.now()}`,
        at: timeStr,
        kind: 'resolution',
        text: `Incident ${incident.id} marked RESOLVED. Root cause & fix permanently indexed in Precedent memory.`,
      },
    ]);

    success('Saved', "This incident is now part of your team's memory.");
  };

  const getSeverityBadge = (sev: Incident['severity']) => {
    switch (sev) {
      case 'sev1':
        return (
          <Badge variant="danger" icon={<AlertCircle className="w-3 h-3" />}>
            SEV1
          </Badge>
        );
      case 'sev2':
        return (
          <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>
            SEV2
          </Badge>
        );
      case 'sev3':
        return (
          <Badge variant="info" icon={<Info className="w-3 h-3" />}>
            SEV3
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            Open
          </span>
        );
      case 'mitigated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            Mitigated
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Resolved
          </span>
        );
    }
  };

  if (loadingIncident || !incident) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton width={120} height={32} />
          <Skeleton width={300} height={32} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <Skeleton height={200} />
            <Skeleton height={300} />
          </div>
          <div className="lg:col-span-8 space-y-4">
            <Skeleton height={260} />
            <Skeleton height={140} />
            <Skeleton height={240} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Sticky Header Bar */}
      <div className="sticky top-14 z-40 -mx-6 px-6 py-3.5 bg-white border-b border-border shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Nav back + Incident Identity */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/"
            className="p-1.5 rounded-btn text-text-muted hover:text-text hover:bg-surface-muted transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Back to incidents list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <span className="font-mono font-bold text-sm text-primary">
            {incident.id}
          </span>

          <h1 className="text-base sm:text-lg font-semibold text-text tracking-tight max-w-md truncate">
            {incident.title}
          </h1>

          <div className="flex items-center gap-2">
            {getSeverityBadge(incident.severity)}
            {getStatusBadge(incident.status)}
            <Badge variant="neutral" size="sm">
              {incident.service}
            </Badge>
          </div>
        </div>

        {/* Right: Controls (Memory Toggle, Compare Helper, Resolve Button) */}
        <div className="flex items-center gap-3">
          {/* Compare Before/After Helper */}
          {hasToggledOnce && (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-btn text-xs font-medium text-primary hover:bg-primary-soft border border-primary/20 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Compare ON / OFF</span>
            </button>
          )}

          {/* Memory Toggle */}
          <MemoryToggle
            enabled={memoryEnabled}
            onChange={handleMemoryToggle}
            disabled={isTriaging}
          />

          {/* Resolve Incident Button */}
          {incident.status !== 'resolved' ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
              onClick={() => setIsResolveDrawerOpen(true)}
            >
              Resolve incident
            </Button>
          ) : (
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-btn border border-emerald-200 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Resolved & Indexed
            </span>
          )}
        </div>
      </div>

      {/* Edge State Banners */}
      {triageResult?.memory_unavailable && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-card text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Memory is temporarily unavailable. Showing general guidance only.</span>
        </div>
      )}

      {triageResult?.partial_context && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-card text-sky-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Some context was still loading when this answer was generated.</span>
        </div>
      )}

      {/* 2. Main Two-Column Layout (12 columns: 4 left, 8 right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN (4 Cols): Alert & Timeline ================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Alert Card */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-danger" />
                <span>Alert Details</span>
              </div>
            }
            padding="md"
          >
            <dl className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <dt className="text-text-muted font-medium">Service</dt>
                <dd className="font-semibold text-text">{incident.service}</dd>
              </div>

              <div className="space-y-1 pb-2 border-b border-border">
                <dt className="text-text-muted font-medium">Alert Signature</dt>
                <dd className="font-mono text-[11px] p-1.5 rounded bg-surface-muted text-text break-all border border-border">
                  {incident.signature}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-text-muted font-medium">Fired At</dt>
                <dd className="font-mono text-text-muted">
                  {new Date(incident.opened_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </dd>
              </div>
            </dl>

            {/* Redacted Logs */}
            <div className="mt-4 pt-3 border-t border-border">
              <RedactedLogs logs={incident.logs_redacted} />
            </div>
          </Card>

          {/* Deploy Context Strip (Only when deploy_context exists) */}
          {incident.deploy_context && (
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-card flex items-start gap-2.5 text-xs text-sky-950 shadow-xs">
              <Clock className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block text-sky-900">
                  Deploy Correlation Detected
                </span>
                <p className="leading-relaxed">{incident.deploy_context}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <Timeline events={timelineEvents} />
        </div>

        {/* ================= RIGHT COLUMN (8 Cols): Triage Output ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Triage Stepper while running */}
          {isTriaging && (
            <div className="animate-fadeIn">
              <TriageStepper memoryEnabled={memoryEnabled} />
            </div>
          )}

          {/* Memory OFF Banner */}
          {!memoryEnabled && !isTriaging && (
            <div className="p-4 rounded-card bg-surface-muted border border-border flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-text-muted">
                <ZapOff className="w-4 h-4 text-text-faint shrink-0" />
                <span>
                  <strong>Memory is OFF.</strong> This answer uses general knowledge heuristics only without historical citations.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleMemoryToggle(true)}
                className="text-primary font-semibold hover:underline shrink-0"
              >
                Turn Memory ON
              </button>
            </div>
          )}

          {/* Hypotheses List with subtle transition overlay during re-triage to prevent layout jump */}
          {triageResult && (
            <div
              className={clsx(
                'space-y-5 transition-opacity duration-150 motion-reduce:transition-none',
                isTriaging && 'opacity-40 pointer-events-none'
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Ranked Hypotheses ({triageResult.hypotheses.length})</span>
                </h2>
                <span className="font-mono text-xs text-text-muted">
                  Triaged at {new Date(triageResult.generated_at).toLocaleTimeString()}
                </span>
              </div>

              {triageResult.hypotheses.map((hypothesis, idx) => (
                <HypothesisCard
                  key={hypothesis.id}
                  hypothesis={hypothesis}
                  rank={idx + 1}
                  isHero={idx === 0}
                  onCitationClick={handleCitationClick}
                  onFeedback={handleFeedback}
                  onPreFillResolve={(hyp) => {
                    setAcceptedHypothesis(hyp);
                  }}
                />
              ))}

              {/* Avoid List */}
              <AvoidList
                items={avoidItems}
                onCitationClick={handleCitationClick}
              />

              {/* Memory Panel */}
              {memoryEnabled && triageResult.precedents.length > 0 ? (
                <MemoryPanel
                  precedents={triageResult.precedents}
                  highlightedId={highlightedPrecedentId}
                />
              ) : memoryEnabled && triageResult.precedents.length === 0 ? (
                <Card padding="md" className="bg-violet-50/30 border-violet-200 text-xs">
                  <div className="flex items-center gap-2 text-violet-900">
                    <Info className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>
                      No similar incident found in memory. Showing general guidance, clearly labelled.
                    </span>
                  </div>
                </Card>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Resolve Incident Drawer */}
      <ResolveDrawer
        isOpen={isResolveDrawerOpen}
        onClose={() => setIsResolveDrawerOpen(false)}
        incident={incident}
        prefilledRootCause={
          acceptedHypothesis?.root_cause ||
          triageResult?.hypotheses[0]?.root_cause ||
          'HikariCP connection pool was capped at 20 while traffic surged.'
        }
        prefilledFix={
          acceptedHypothesis?.suggested_steps[1] ||
          'Raised checkout DB pool max from 20 to 50 and verified in_use dropped below threshold.'
        }
        prefilledFailedSteps={avoidItems.map((a) => a.step)}
        onResolve={handleResolve}
      />

      {/* Side-by-Side Comparison Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        memoryOnResult={MOCK_TRIAGE_MEMORY_ON}
        memoryOffResult={MOCK_TRIAGE_MEMORY_OFF}
      />
    </div>
  );
}
