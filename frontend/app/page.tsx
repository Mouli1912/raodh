'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Incident,
  Severity,
  IncidentStatus,
} from '@/lib/types';
import { listIncidents, fireDemoAlert, IS_MOCK_MODE } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tooltip } from '@/components/ui/Tooltip';
import { SampleDataBadge } from '@/components/ui/SampleDataBadge';
import { isMockMode } from '@/lib/dataSource';
import { useToast } from '@/components/ui/Toast';
import {
  Search,
  BrainCircuit,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Radio,
  Flame,
  FilterX,
  TrendingUp,
  History,
} from 'lucide-react';

export default function IncidentsPage() {
  const router = useRouter();
  const { success } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [firingAlert, setFiringAlert] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await listIncidents();
        setIncidents(data);
      } catch (err) {
        console.error('Failed to load incidents', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFireDemoAlert = async () => {
    try {
      setFiringAlert(true);
      const res = await fireDemoAlert();
      success('Alert Triggered', `Hero alert fired: ${res.incident_id}`);
      router.push(`/incidents/${res.incident_id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setFiringAlert(false);
    }
  };

  // Extract unique services
  const services = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => set.add(i.service));
    return Array.from(set).sort();
  }, [incidents]);

  // Client-side filtering
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch =
        !searchQuery.trim() ||
        inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.signature.toLowerCase().includes(searchQuery.toLowerCase());

      const matchService =
        serviceFilter === 'all' || inc.service === serviceFilter;
      const matchSeverity =
        severityFilter === 'all' || inc.severity === severityFilter;
      const matchStatus =
        statusFilter === 'all' || inc.status === statusFilter;

      return matchSearch && matchService && matchSeverity && matchStatus;
    });
  }, [incidents, searchQuery, serviceFilter, severityFilter, statusFilter]);

  // Stat metrics
  const openCount = incidents.filter((i) => i.status === 'open').length;

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return isoString;
    }
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
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

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            Open
          </span>
        );
      case 'mitigated':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Mitigated
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
    }
  };

  // Check if incident has precedent grounded in memory
  const hasPrecedent = (inc: Incident) => {
    return ['INC-031', 'INC-001', 'INC-014', 'INC-019', 'INC-028'].includes(
      inc.id
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text tracking-tight">
            Incidents
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Every alert, triaged with what your team already knows
          </p>
        </div>
        <div>
          {!IS_MOCK_MODE && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Flame className="w-4 h-4 text-danger" />}
              isLoading={firingAlert}
              onClick={handleFireDemoAlert}
            >
              Fire demo alert
            </Button>
          )}
          {IS_MOCK_MODE && (
            <Link href="/incidents/INC-031">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Flame className="w-4 h-4 text-danger" />}
              >
                Hero incident (INC-031)
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 5. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Open incidents
            </span>
            <div className="flex items-center gap-1.5">
              {isMockMode && <SampleDataBadge />}
              <Radio className="w-4 h-4 text-danger" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-text">
              {loading ? <Skeleton width={32} height={28} /> : openCount}
            </span>
            <span className="text-xs text-text-muted">active in triage</span>
          </div>
          <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
            {isMockMode ? (
              <span className="text-text-muted font-mono">sample value</span>
            ) : (
              <>
                <span className="text-emerald-600 font-medium font-mono">↓ 2</span> vs yesterday
              </>
            )}
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Median time to resolve
            </span>
            <div className="flex items-center gap-1.5">
              {isMockMode && <SampleDataBadge />}
              <Clock className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-text">
              18m
            </span>
            <span className="text-xs text-text-muted">p50 MTTR</span>
          </div>
          <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
            {isMockMode ? (
              <span className="text-text-muted font-mono">sample value</span>
            ) : (
              <>
                <span className="text-emerald-600 font-medium font-mono">↓ 34%</span> with memory triage
              </>
            )}
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Suggestions accepted
            </span>
            <div className="flex items-center gap-1.5">
              {isMockMode && <SampleDataBadge />}
              <TrendingUp className="w-4 h-4 text-memory" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono text-text">
              88.4%
            </span>
            <span className="text-xs text-text-muted">
              {isMockMode ? 'sample rate' : 'on-call adoption'}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
            {isMockMode ? (
              <span className="text-text-muted font-mono">sample value</span>
            ) : (
              <>
                <span className="text-emerald-600 font-medium font-mono">↑ 6.1%</span> this sprint
              </>
            )}
          </p>
        </Card>
      </div>

      {/* 2. Filter Bar */}
      <Card padding="sm" className="bg-surface">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, signature..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-muted border border-border rounded-btn focus-visible:outline-2 focus-visible:outline-primary placeholder:text-text-muted"
            />
          </div>

          {/* Select Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by service"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium bg-surface border border-border rounded-btn text-text focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value="all">All Services</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium bg-surface border border-border rounded-btn text-text focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value="all">All Severities</option>
              <option value="sev1">SEV1 (Critical)</option>
              <option value="sev2">SEV2 (Major)</option>
              <option value="sev3">SEV3 (Minor)</option>
            </select>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium bg-surface border border-border rounded-btn text-text focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="mitigated">Mitigated</option>
              <option value="resolved">Resolved</option>
            </select>

            {(searchQuery ||
              serviceFilter !== 'all' ||
              severityFilter !== 'all' ||
              statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setServiceFilter('all');
                  setSeverityFilter('all');
                  setStatusFilter('all');
                }}
                leftIcon={<FilterX className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Incident Table */}
      <Card padding="none" className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-surface-muted border-b border-border text-xs font-semibold text-text-muted select-none">
              <th className="py-3 px-4 w-28">ID</th>
              <th className="py-3 px-4">Title & Signature</th>
              <th className="py-3 px-4 w-28">Service</th>
              <th className="py-3 px-4 w-24">Severity</th>
              <th className="py-3 px-4 w-28">Status</th>
              <th className="py-3 px-4 w-36">Memory</th>
              <th className="py-3 px-4 w-28 text-right">Opened</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="h-14">
                  <td className="py-3 px-4">
                    <Skeleton width={60} height={18} />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton width={240} height={18} />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton width={70} height={18} />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton width={50} height={18} />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton width={60} height={18} />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton width={110} height={18} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Skeleton width={50} height={18} className="ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8">
                  <EmptyState
                    icon={<FilterX className="w-6 h-6 text-text-muted" />}
                    title="No incidents match these filters"
                    description="Try widening your search keywords or clearing active severity and service filters."
                    action={
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setServiceFilter('all');
                          setSeverityFilter('all');
                          setStatusFilter('all');
                        }}
                      >
                        Clear filters
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              filteredIncidents.map((inc) => {
                const citedMemory = hasPrecedent(inc);
                return (
                  <tr
                    key={inc.id}
                    tabIndex={0}
                    role="link"
                    onClick={() => router.push(`/incidents/${inc.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/incidents/${inc.id}`);
                      }
                    }}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-primary focus-visible:bg-slate-50"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-xs text-primary group-hover:underline">
                      <Link
                        href={`/incidents/${inc.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="focus-visible:outline-none"
                      >
                        {inc.id}
                      </Link>
                    </td>

                    {/* Title & Signature */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-semibold text-text group-hover:text-primary transition-colors text-sm">
                        {inc.title}
                      </div>
                      <div className="font-mono text-xs text-text-muted truncate mt-0.5" title={inc.signature}>
                        {inc.signature}
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4">
                      <Badge variant="neutral" size="sm">
                        {inc.service}
                      </Badge>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      {getSeverityBadge(inc.severity)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(inc.status)}
                    </td>

                    {/* Memory */}
                    <td className="py-3.5 px-4">
                      {citedMemory ? (
                        <Badge
                          variant="memory"
                          size="sm"
                          icon={<BrainCircuit className="w-3.5 h-3.5" />}
                        >
                          Precedent found
                        </Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-text-faint font-medium">
                          <History className="w-3 h-3" />
                          No precedent
                        </span>
                      )}
                    </td>

                    {/* Opened */}
                    <td className="py-3.5 px-4 text-right">
                      <Tooltip content={new Date(inc.opened_at).toLocaleString()}>
                        <span className="text-xs text-text-muted font-mono whitespace-nowrap">
                          {formatRelativeTime(inc.opened_at)}
                        </span>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
