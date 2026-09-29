'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ReplayPoint } from '@/lib/types';
import { getReplay } from '@/lib/api';
import { isMockMode } from '@/lib/dataSource';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SampleDataBadge } from '@/components/ui/SampleDataBadge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BrainCircuit, ZapOff, Activity, Play } from 'lucide-react';

export default function ReplayPage() {
  const [data, setData] = useState<ReplayPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const points = await getReplay();
        setData(points);
      } catch (err) {
        console.error('Failed to load replay data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latestPoint = useMemo(() => {
    if (data.length === 0) return { memory_on_top1: 0, memory_off_top1: 0 };
    return data[data.length - 1];
  }, [data]);

  const accuracyGain = useMemo(() => {
    return latestPoint.memory_on_top1 - latestPoint.memory_off_top1;
  }, [latestPoint]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-semibold text-text tracking-tight">
              Memory Replay & Learning Curve
            </h1>
            {isMockMode && <SampleDataBadge />}
          </div>
          <p className="text-text-muted text-sm mt-1">
            {isMockMode
              ? 'Illustrative learning curve. Run the replay script to generate measured results.'
              : 'Measured by replaying past incidents with memory limited to what was known at the time.'}
          </p>
        </div>
      </div>

      {!loading && !isMockMode && data.length === 0 ? (
        <EmptyState
          icon={<Play className="w-8 h-8 text-text-muted" />}
          title="No replay results yet"
          description="Run `make replay` to generate them from your team's historical incident records."
        />
      ) : (
        <>
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Memory ON */}
            <Card padding="md" className="border-violet-200 bg-violet-50/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-950 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-memory" />
                  Accuracy with memory (Top-1)
                </span>
                <div className="flex items-center gap-2">
                  {isMockMode ? (
                    <SampleDataBadge />
                  ) : (
                    <Badge variant="memory" size="sm">
                      +{accuracyGain}% gain
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-text">
                  {loading ? (
                    <Skeleton width={60} height={36} />
                  ) : (
                    `${latestPoint.memory_on_top1}%`
                  )}
                </span>
                <span className="text-xs text-text-muted">current precision</span>
              </div>
              <p className="text-xs text-text-muted mt-1.5 font-mono">
                {isMockMode
                  ? 'Sample progression across simulated evaluation run'
                  : `Climbed from ${data[0]?.memory_on_top1 || 0}% at incident #1 to ${latestPoint.memory_on_top1}% at incident #${data.length}`}
              </p>
            </Card>

            {/* Memory OFF */}
            <Card padding="md" className="border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                  <ZapOff className="w-4 h-4 text-slate-500" />
                  Accuracy without memory (Baseline)
                </span>
                <div className="flex items-center gap-2">
                  {isMockMode ? (
                    <SampleDataBadge />
                  ) : (
                    <span className="text-xs font-mono text-text-muted">
                      Static heuristic
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-text">
                  {loading ? (
                    <Skeleton width={60} height={36} />
                  ) : (
                    `${latestPoint.memory_off_top1}%`
                  )}
                </span>
                <span className="text-xs text-text-muted">
                  generic LLM / baseline
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1.5 font-mono">
                {isMockMode
                  ? 'Sample static baseline (no historical memory)'
                  : 'Remains flat near baseline with zero institutional recall'}
              </p>
            </Card>
          </div>

          {/* Chart Card */}
          <Card
            header={
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>Top-1 Diagnosis Accuracy Curve</span>
                </div>
                <div className="flex items-center gap-3">
                  {isMockMode && <SampleDataBadge />}
                  <span className="text-xs text-text-muted font-mono hidden sm:inline">
                    {data.length} incidents evaluation
                  </span>
                </div>
              </div>
            }
            padding="md"
          >
            <div className="h-80 w-full pt-4">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton height={260} className="w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E2E8F0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="incident_index"
                      stroke="#64748B"
                      fontSize={12}
                      tickLine={false}
                      label={{
                        value: 'Incident number (Sequential)',
                        position: 'insideBottom',
                        offset: -12,
                        fontSize: 12,
                        fill: '#64748B',
                      }}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={12}
                      domain={[0, 100]}
                      tickLine={false}
                      unit="%"
                      label={{
                        value: 'Top-1 Accuracy (%)',
                        angle: -90,
                        position: 'insideLeft',
                        fontSize: 12,
                        fill: '#64748B',
                      }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-3 bg-white border border-border-strong rounded-card shadow-lg text-xs space-y-1.5 font-mono">
                              <p className="font-semibold text-text font-sans pb-1 border-b border-border flex items-center justify-between gap-2">
                                <span>Incident #{label}</span>
                                {isMockMode && <SampleDataBadge />}
                              </p>
                              <div className="flex items-center gap-2 text-violet-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-memory" />
                                <span>Memory ON: {payload[0]?.value}%</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                                <span>Memory OFF: {payload[1]?.value}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs font-semibold text-text px-1">
                          {value}
                        </span>
                      )}
                    />
                    <Line
                      name="Memory ON"
                      type="monotone"
                      dataKey="memory_on_top1"
                      stroke="#7C3AED"
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        fill: '#7C3AED',
                        strokeWidth: 1,
                        stroke: '#FFFFFF',
                      }}
                      activeDot={{ r: 6, fill: '#7C3AED' }}
                    />
                    <Line
                      name="Memory OFF"
                      type="monotone"
                      dataKey="memory_off_top1"
                      stroke="#64748B"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{
                        r: 3,
                        fill: '#64748B',
                        strokeWidth: 1,
                        stroke: '#FFFFFF',
                      }}
                      activeDot={{ r: 5, fill: '#64748B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Caption */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted flex-wrap gap-2">
              <p className="italic">
                {isMockMode
                  ? 'Sample data showing illustrative learning curve. Run the replay harness for measured values.'
                  : 'Measured by replaying past incidents with memory limited to what was known at the time.'}
              </p>
              {!isMockMode && (
                <span className="font-mono text-[11px]">
                  Methodology: Strict causal temporal window
                </span>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
