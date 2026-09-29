'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DeployItem } from '@/lib/types';
import { listDeploys, simulateDeploy } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  GitCommit,
  Clock,
  AlertTriangle,
  FileCode,
  Sliders,
  Sparkles,
  ArrowRight,
  Eye,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';

export default function DeploysPage() {
  const { success, warning } = useToast();
  const [deploys, setDeploys] = useState<DeployItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation form state
  const [simService, setSimService] = useState('checkout');
  const [simFiles, setSimFiles] = useState('config/database.yaml, src/db/pool.ts');
  const [simConfigKeys, setSimConfigKeys] = useState('db.pool.max_connections, db.pool.timeout');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listDeploys();
        setDeploys(data);
      } catch (err) {
        console.error('Failed to load deploys', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSimulating(true);
      const filesArray = simFiles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const configArray = simConfigKeys
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await simulateDeploy({
        service: simService,
        files: filesArray,
        config_keys: configArray,
      });

      setDeploys((prev) => [result, ...prev]);

      if (result.warning) {
        warning(
          'Pre-mortem Warning Triggered',
          `Change resembles historical precedent ${result.warning.precedent_id}`
        );
      } else {
        success('Simulated Deploy Analyzed', 'No known historical risks matched this diff.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text tracking-tight">
            Deploy Risk & Pre-Mortems
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Proactive warnings correlating active code diffs and config updates with past outage patterns.
          </p>
        </div>
      </div>

      {/* Simulate Deploy Form */}
      <Card
        header={
          <div className="flex items-center gap-2 text-text">
            <Zap className="w-4 h-4 text-primary" />
            <span>Simulate a Pre-Deploy Diff</span>
          </div>
        }
        padding="md"
        className="bg-surface border-border"
      >
        <form onSubmit={handleSimulate} className="space-y-4">
          <p className="text-xs text-text-muted">
            Run a simulated pull request or config change through Precedent memory to detect known failure signatures before rolling to production.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="sim-service" className="block text-xs font-semibold text-text mb-1">
                Target Service
              </label>
              <select
                id="sim-service"
                aria-label="Target Service"
                value={simService}
                onChange={(e) => setSimService(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-surface border border-border rounded-btn focus-visible:outline-2 focus-visible:outline-primary"
              >
                <option value="checkout">checkout</option>
                <option value="payments">payments</option>
                <option value="search">search</option>
              </select>
            </div>

            <div>
              <label htmlFor="sim-files" className="block text-xs font-semibold text-text mb-1">
                Changed Files (comma-separated)
              </label>
              <input
                id="sim-files"
                type="text"
                value={simFiles}
                onChange={(e) => setSimFiles(e.target.value)}
                placeholder="e.g. config/database.yaml, src/pool.ts"
                className="w-full text-xs px-3 py-2 bg-surface border border-border rounded-btn focus-visible:outline-2 focus-visible:outline-primary placeholder:text-text-muted font-mono"
              />
            </div>

            <div>
              <label htmlFor="sim-config" className="block text-xs font-semibold text-text mb-1">
                Config Keys Modified
              </label>
              <input
                id="sim-config"
                type="text"
                value={simConfigKeys}
                onChange={(e) => setSimConfigKeys(e.target.value)}
                placeholder="e.g. db.pool.max_connections"
                className="w-full text-xs px-3 py-2 bg-surface border border-border rounded-btn focus-visible:outline-2 focus-visible:outline-primary placeholder:text-text-muted font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSimulating}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
            >
              Analyze Diff with Memory
            </Button>
          </div>
        </form>
      </Card>

      {/* Deploy List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-text uppercase tracking-wider">
          Recent Deploys & Pre-Mortem Audits
        </h2>

        {loading ? (
          <div className="space-y-4">
            <Skeleton height={140} />
            <Skeleton height={140} />
            <Skeleton height={140} />
          </div>
        ) : (
          <div className="space-y-4">
            {deploys.map((deploy) => {
              const hasWarning = !!deploy.warning;

              return (
                <Card
                  key={deploy.id}
                  padding="none"
                  className={clsx(
                    'overflow-hidden transition-all duration-150',
                    hasWarning ? 'border-amber-300 shadow-sm' : 'border-border'
                  )}
                >
                  {/* Top Bar */}
                  <div className="p-4 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-muted border border-border text-text">
                        {deploy.id}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {deploy.service}
                      </Badge>
                      <span className="font-mono text-xs text-text-muted flex items-center gap-1">
                        <GitCommit className="w-3.5 h-3.5" />
                        {deploy.commit}
                      </span>
                      <span className="text-xs text-text-muted">
                        by @{deploy.author}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(deploy.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {hasWarning ? (
                        <Badge
                          variant="warning"
                          size="sm"
                          icon={<AlertTriangle className="w-3.5 h-3.5" />}
                        >
                          Pre-mortem Alert
                        </Badge>
                      ) : (
                        <Badge
                          variant="success"
                          size="sm"
                          icon={<ShieldCheck className="w-3.5 h-3.5" />}
                        >
                          No known risk
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Changes overview */}
                  <div className="p-4 space-y-3 text-xs bg-surface">
                    {/* Changed Files */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-text-muted font-medium flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5" />
                        Files:
                      </span>
                      {deploy.changed_files.map((f, i) => (
                        <span
                          key={i}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-muted text-text border border-border"
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Config keys */}
                    {deploy.config_keys.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-text-muted font-medium flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5" />
                          Config:
                        </span>
                        {deploy.config_keys.map((k, i) => (
                          <span
                            key={i}
                            className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pre-Mortem Warning Panel */}
                  {deploy.warning && (
                    <div className="p-4 bg-amber-50/80 border-t border-amber-200 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                            <h4 className="text-xs font-semibold text-amber-950">
                              {deploy.warning.message}
                            </h4>
                          </div>
                        </div>

                        <Link
                          href={`/incidents/${deploy.warning.precedent_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-violet-100 text-violet-800 border border-violet-300 hover:bg-violet-200 transition-colors shrink-0"
                        >
                          <span>{deploy.warning.precedent_id}</span>
                          <ArrowRight className="w-3 h-3 text-violet-600" />
                        </Link>
                      </div>

                      {/* Watch metrics */}
                      <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-amber-900 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-amber-700" />
                          Watch these metrics:
                        </span>
                        {deploy.warning.watch_metrics.map((m, i) => (
                          <span
                            key={i}
                            className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-amber-950 border border-amber-300 shadow-xs"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
