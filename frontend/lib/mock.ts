import {
  Incident,
  TriageResult,
  Precedent,
  TimelineEvent,
  DeployWarning,
  DeployItem,
  ReplayPoint,
  WeeklyBrief,
  AskReflectResponse,
} from './types';

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-031',
    service: 'checkout',
    title: 'checkout p99 latency > 2s',
    severity: 'sev1',
    status: 'open',
    signature: 'db.query.checkout_orders.timeout > 2000ms',
    opened_at: '2026-09-29T10:14:00Z',
    deploy_context: 'Deploy D-118 touched db config 40 minutes before this alert',
    logs_redacted: `2026-09-29 10:13:48 [ERROR] [checkout-api-7c89b] PoolAcquireTimeoutException: Timeout waiting for connection from pool (max_size=20, in_use=20, pending=142)
2026-09-29 10:13:51 [WARN]  [checkout-api-7c89b] Client request /api/v2/cart/checkout degraded: latency=2140ms status=504
2026-09-29 10:13:55 [ERROR] [checkout-worker-2] DB Connection acquire failed after 3000ms [REDACTED_CONN_STR]
2026-09-29 10:14:01 [ALERT] [pagerduty] checkout_p99_latency triggered threshold > 2000ms (current: 2480ms)`,
  },
  {
    id: 'INC-028',
    service: 'payments',
    title: 'Stripe webhook 500 error spike',
    severity: 'sev2',
    status: 'open',
    signature: 'http.response.status:500 service:payments-stripe-worker',
    opened_at: '2026-09-29T09:42:00Z',
    deploy_context: 'Deploy D-116 updated stripe-sdk version 4 hours ago',
    logs_redacted: `2026-09-29 09:41:22 [ERROR] WebhookSignatureVerificationError: Invalid payload timestamp tolerance
2026-09-29 09:41:30 [ERROR] Failed processing event evt_3NwY72: clock skew tolerance exceeded`,
  },
  {
    id: 'INC-025',
    service: 'search',
    title: 'Elasticsearch query queue saturation',
    severity: 'sev2',
    status: 'open',
    signature: 'es.thread_pool.search.queue > 1000',
    opened_at: '2026-09-29T08:15:00Z',
    logs_redacted: `2026-09-29 08:14:10 [WARN] [es-node-04] [search] queue capacity reached (1000/1000), rejecting queries
2026-09-29 08:14:18 [ERROR] SearchService: RemoteTransportException [es-node-04][EsRejectedExecutionException]`,
  },
  {
    id: 'INC-022',
    service: 'checkout',
    title: 'Address validation service rate limited by downstream',
    severity: 'sev3',
    status: 'mitigated',
    signature: 'http.outbound.upstream_rate_limit:429 address-verify',
    opened_at: '2026-09-28T22:30:00Z',
    root_cause: 'SmartyStreets quota exceeded due to duplicate validation retries',
    fix: 'Switched to cached postcode fallback and doubled client retry backoff',
  },
  {
    id: 'INC-019',
    service: 'payments',
    title: 'Idempotency key lock contention on batch settlements',
    severity: 'sev2',
    status: 'resolved',
    signature: 'redis.lock.contention.timeout key:settle:*',
    opened_at: '2026-09-28T16:05:00Z',
    resolved_at: '2026-09-28T16:42:00Z',
    root_cause: 'Redlock lease TTL was 5s but settlement batch query took 6.2s under load',
    fix: 'Increased lock lease time to 15s and batched settlement keys in slices of 50',
  },
  {
    id: 'INC-014',
    service: 'checkout',
    title: 'PostgreSQL connection exhaustion during flash sale',
    severity: 'sev1',
    status: 'resolved',
    signature: 'pg.connections.active >= max_connections',
    opened_at: '2026-09-17T14:20:00Z',
    resolved_at: '2026-09-17T14:48:00Z',
    root_cause: 'Default client pool size 20 per pod multiplied by 10 autoscaled pods',
    fix: 'Configured PgBouncer transaction pooling and set server pool max to 50',
  },
  {
    id: 'INC-008',
    service: 'search',
    title: 'Autocomplete index replica lag spike',
    severity: 'sev3',
    status: 'resolved',
    signature: 'search.replica.sync_lag_sec > 120s',
    opened_at: '2026-09-10T11:10:00Z',
    resolved_at: '2026-09-10T11:35:00Z',
    root_cause: 'Segment merging throttled by disk I/O cap on gp2 EBS volumes',
    fix: 'Migrated EBS volume type to gp3 with 6000 baseline IOPS',
  },
  {
    id: 'INC-001',
    service: 'checkout',
    title: 'Order creation timeout under promo traffic',
    severity: 'sev1',
    status: 'resolved',
    signature: 'db.pool.exhaustion service:checkout-api',
    opened_at: '2026-08-04T18:00:00Z',
    resolved_at: '2026-08-04T18:32:00Z',
    root_cause: 'HikariCP connection pool was capped at 20 while traffic surged 3.5x',
    fix: 'Raised DB pool max to 50 and set connection idle timeout to 30s',
  },
];

export const MOCK_PRECEDENTS: Precedent[] = [
  {
    id: 'INC-001',
    service: 'checkout',
    summary: 'HikariCP connection pool was capped at 20 under 3.5x surge.',
    root_cause: 'HikariCP connection pool capped at 20 connections per pod with no dynamic scaling.',
    fix: 'Raised pool max from 20 to 50 and adjusted idle connection cleanup to 30s.',
    failed_fixes: ['Restart checkout pods (connections leaked immediately upon warmup)'],
    successes: 3,
    failures: 0,
    last_used_at: '12 days ago',
    relevance: 96,
  },
  {
    id: 'INC-014',
    service: 'checkout',
    summary: 'Flash sale exhausted Postgres connections when pods autoscaled.',
    root_cause: 'Unbounded pod autoscaling exhausted direct DB connection slots.',
    fix: 'Raised pool max to 50 and routed through PgBouncer transaction-mode pool.',
    failed_fixes: ['Rolling pod restart (worsened connection storm on RDS)'],
    successes: 2,
    failures: 0,
    last_used_at: '12 days ago',
    relevance: 91,
  },
  {
    id: 'INC-019',
    service: 'payments',
    summary: 'Redis lock lease expiration during batch settlement jobs.',
    root_cause: 'Lock lease TTL expired before batch DB execution completed.',
    fix: 'Extended lock lease TTL and batched settlement operations in chunks.',
    failed_fixes: ['Disabling lock validation (caused double charge duplicate anomalies)'],
    successes: 2,
    failures: 1,
    last_used_at: '1 day ago',
    relevance: 42,
  },
];

export const MOCK_TRIAGE_MEMORY_ON: TriageResult = {
  incident_id: 'INC-031',
  memory_used: true,
  partial_context: false,
  memory_unavailable: false,
  generated_at: '2026-09-29T10:14:12Z',
  hypotheses: [
    {
      id: 'hyp-1',
      root_cause: 'DB connection pool exhaustion',
      confidence: 'high',
      evidence: [
        {
          precedent_id: 'INC-001',
          why: 'Exact same signature `PoolAcquireTimeoutException` occurred during traffic burst; solved by tuning pool max.',
        },
        {
          precedent_id: 'INC-014',
          why: 'Deploy D-118 touched db config 40m ago, matching connection storm pattern in INC-014.',
        },
      ],
      suggested_steps: [
        'Check metrics dashboard for db.pool.in_use and verify active vs idle connections',
        'Raise checkout pool max from 20 to 50 in ConfigMap / application-prod.yaml',
        'Apply config reload via `kubectl rollout restart deployment/checkout-api` with canary pace',
      ],
      avoid: [
        {
          step: 'Restart checkout pods without raising pool max',
          reason: 'Failed in INC-001 and INC-014: connections saturated immediately on warmup, causing 504 wave.',
          precedent_id: 'INC-001',
        },
      ],
      score: 0.94,
      score_basis: '3 successes, 0 failures, last used 12 days ago',
      grounded: true,
    },
    {
      id: 'hyp-2',
      root_cause: 'Slow query lock contention on checkout_orders table',
      confidence: 'medium',
      evidence: [
        {
          precedent_id: 'INC-019',
          why: 'Lock contention pattern under high read/write overlap.',
        },
      ],
      suggested_steps: [
        'Run `SELECT pid, query, state, age(clock_timestamp(), query_start) FROM pg_stat_activity WHERE state != \'idle\' ORDER BY query_start ASC LIMIT 5;`',
        'Check for long-running uncommitted transactions holding RowExclusiveLock',
      ],
      avoid: [
        {
          step: 'Kill PostgreSQL backend processes indiscriminately',
          reason: 'Causes cascading client connection drops and transaction rollbacks.',
          precedent_id: 'INC-019',
        },
      ],
      score: 0.68,
      score_basis: '1 success, 1 failure, last used 1 day ago',
      grounded: true,
    },
  ],
  precedents: MOCK_PRECEDENTS.slice(0, 2),
};

export const MOCK_TRIAGE_MEMORY_OFF: TriageResult = {
  incident_id: 'INC-031',
  memory_used: false,
  partial_context: false,
  memory_unavailable: false,
  generated_at: '2026-09-29T10:14:12Z',
  hypotheses: [
    {
      id: 'hyp-generic-1',
      root_cause: 'Restart the service and scale up replicas',
      confidence: 'low',
      evidence: [],
      suggested_steps: [
        'Inspect container CPU and memory usage in Grafana',
        'Restart the service pods to clear stale in-memory state',
        'Scale deployment replicas from 4 to 8 to distribute load',
      ],
      avoid: [],
      score: 0.32,
      score_basis: 'Generic heuristic (no historical precedent available)',
      grounded: false,
    },
  ],
  precedents: [],
};

export const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: 'evt-1',
    at: '09:34:00',
    kind: 'deploy',
    text: 'Deploy D-118 completed by @alex.chen (service: checkout, commit: 4f9b8c1)',
  },
  {
    id: 'evt-2',
    at: '10:13:48',
    kind: 'alert',
    text: 'PagerDuty alert: checkout p99 latency > 2s (current: 2480ms)',
  },
  {
    id: 'evt-3',
    at: '10:14:00',
    kind: 'action',
    text: 'Incident INC-031 opened with severity SEV1 assigned to on-call engineer',
  },
  {
    id: 'evt-4',
    at: '10:14:12',
    kind: 'triage',
    text: 'Precedent agent triaged incident: DB connection pool exhaustion (grounded in INC-001, INC-014)',
  },
  {
    id: 'evt-5',
    at: '10:16:30',
    kind: 'feedback',
    text: 'On-call engineer accepted hypothesis #1 (DB connection pool exhaustion)',
  },
  {
    id: 'evt-6',
    at: '10:19:15',
    kind: 'action',
    text: 'Executed step 1: verified db.pool.in_use = 20/20 at 100% capacity with 140 queued callers',
  },
  {
    id: 'evt-7',
    at: '10:22:00',
    kind: 'action',
    text: 'Executed step 2: increased pool max to 50 via configmap and reloaded service',
  },
];

export const MOCK_DEPLOY_WARNING: DeployWarning = {
  deploy_id: 'D-118',
  service: 'checkout',
  message: 'This change modifies DB connection pool parameters without increasing max connections.',
  precedent_id: 'INC-001',
  watch_metrics: ['db.pool.in_use', 'checkout.p99_latency_ms', 'db.pool.wait_queue_length'],
};

export const MOCK_DEPLOYS: DeployItem[] = [
  {
    id: 'D-118',
    service: 'checkout',
    environment: 'production',
    commit: '4f9b8c1',
    author: 'alex.chen',
    timestamp: '2026-09-29T09:34:00Z',
    changed_files: ['config/database.yaml', 'src/db/pool.ts', 'k8s/checkout-deployment.yaml'],
    config_keys: ['db.pool.timeout_ms', 'db.pool.max_connections', 'checkout.cache.ttl'],
    status: 'warning',
    warning: {
      deploy_id: 'D-118',
      service: 'checkout',
      message: 'This change resembles INC-001: Pool max remained capped at 20 while request concurrency increased.',
      precedent_id: 'INC-001',
      watch_metrics: ['db.pool.in_use', 'checkout.p99_latency_ms', 'db.pool.wait_queue_length'],
    },
  },
  {
    id: 'D-117',
    service: 'search',
    environment: 'production',
    commit: '8e2d409',
    author: 'sarah.m',
    timestamp: '2026-09-29T07:50:00Z',
    changed_files: ['src/search/query_builder.ts', 'src/search/synonyms.json'],
    config_keys: ['search.synonym_expansion.enabled'],
    status: 'warning',
    warning: {
      deploy_id: 'D-117',
      service: 'search',
      message: 'This change resembles INC-025: Unbounded synonym expansion increases query thread queue size.',
      precedent_id: 'INC-025',
      watch_metrics: ['es.thread_pool.search.queue', 'search.p95_latency'],
    },
  },
  {
    id: 'D-116',
    service: 'payments',
    environment: 'production',
    commit: '1a90c33',
    author: 'jordan.k',
    timestamp: '2026-09-29T05:20:00Z',
    changed_files: ['package.json', 'src/webhooks/stripe.ts'],
    config_keys: ['stripe.webhook_tolerance_sec', 'stripe.api_version'],
    status: 'warning',
    warning: {
      deploy_id: 'D-116',
      service: 'payments',
      message: 'This change resembles INC-028: Upgrading stripe-sdk tightened timestamp tolerance without NTP sync check.',
      precedent_id: 'INC-028',
      watch_metrics: ['payments.webhook.500_rate', 'payments.stripe.errors'],
    },
  },
  {
    id: 'D-115',
    service: 'checkout',
    environment: 'production',
    commit: '7b54fa0',
    author: 'priya.r',
    timestamp: '2026-09-28T19:15:00Z',
    changed_files: ['src/ui/components/CartSummary.tsx', 'src/ui/styles/cart.css'],
    config_keys: ['ui.cart.v2_layout_enabled'],
    status: 'healthy',
  },
  {
    id: 'D-114',
    service: 'search',
    environment: 'production',
    commit: '3f18b99',
    author: 'alex.chen',
    timestamp: '2026-09-28T14:00:00Z',
    changed_files: ['src/search/ranking/boost.ts'],
    config_keys: ['search.ranking.popularity_weight'],
    status: 'healthy',
  },
];

export const MOCK_REPLAY_POINTS: ReplayPoint[] = [
  { incident_index: 1, memory_on_top1: 33, memory_off_top1: 30 },
  { incident_index: 2, memory_on_top1: 35, memory_off_top1: 29 },
  { incident_index: 3, memory_on_top1: 42, memory_off_top1: 31 },
  { incident_index: 4, memory_on_top1: 48, memory_off_top1: 30 },
  { incident_index: 5, memory_on_top1: 54, memory_off_top1: 32 },
  { incident_index: 6, memory_on_top1: 61, memory_off_top1: 28 },
  { incident_index: 7, memory_on_top1: 66, memory_off_top1: 31 },
  { incident_index: 8, memory_on_top1: 71, memory_off_top1: 29 },
  { incident_index: 9, memory_on_top1: 74, memory_off_top1: 30 },
  { incident_index: 10, memory_on_top1: 78, memory_off_top1: 32 },
  { incident_index: 11, memory_on_top1: 81, memory_off_top1: 29 },
  { incident_index: 12, memory_on_top1: 83, memory_off_top1: 30 },
];

export const MOCK_WEEKLY_BRIEF: WeeklyBrief = {
  week_label: 'Week 39 · Sep 22 – Sep 29, 2026',
  generated_at: '2026-09-29T08:00:00Z',
  recurring_causes: [
    {
      cause: 'Database connection pool starvation under unexpected traffic bursts',
      count: 3,
      services: ['checkout', 'payments'],
      precedent_ids: ['INC-001', 'INC-014', 'INC-031'],
      recommendation: 'Adopt centralized PgBouncer pool with uniform pool sizing formula across all microservice deployments.',
    },
    {
      cause: 'Redis distributed lock TTL expiration before slow batch operations complete',
      count: 2,
      services: ['payments'],
      precedent_ids: ['INC-019'],
      recommendation: 'Wrap batch settlement in renewal heartbeats and limit slice size to 50 items per batch.',
    },
    {
      cause: 'Downstream webhook API version and tolerance mismatch',
      count: 1,
      services: ['payments'],
      precedent_ids: ['INC-028'],
      recommendation: 'Add synthetic webhook replay tests in pre-production staging with simulated clock drifts.',
    },
  ],
  riskiest_services: [
    {
      service: 'checkout',
      incidents_count: 4,
      risk_level: 'high',
      top_vulnerability: 'Stateful Postgres connection exhaustion during pod autoscaling events',
    },
    {
      service: 'payments',
      incidents_count: 3,
      risk_level: 'medium',
      top_vulnerability: 'Webhook clock skew and Redis distributed lock contention',
    },
    {
      service: 'search',
      incidents_count: 2,
      risk_level: 'low',
      top_vulnerability: 'Elasticsearch query thread pool saturation on uncurated synonym expansions',
    },
  ],
  deploy_patterns: [
    {
      pattern: 'ConfigMap changes to database pools without load verification',
      impact: '3 out of 4 checkout incidents were preceded within 1 hour by a database config deployment.',
      mitigation: 'Implement automated pre-deploy validation rules checking pool size vs replica limit ratios.',
    },
    {
      pattern: 'SDK dependency major/minor bumps on Friday mornings',
      impact: '2 out of 3 payment alerts stemmed from unannounced upstream payload validation rule shifts.',
      mitigation: 'Enforce staged progressive rollout on payment webhook ingress nodes.',
    },
  ],
  failed_fix_hall_of_shame: [
    {
      anti_pattern: 'Blindly restarting pods during connection pool exhaustion',
      times_attempted: 4,
      wasted_minutes_avg: 18,
      lesson: 'Causes immediate reconnection storms that saturate backend DB CPU and amplify 504 errors.',
      citing_incidents: ['INC-001', 'INC-014', 'INC-031'],
    },
    {
      anti_pattern: 'Disabling distributed lock validation to bypass timeout errors',
      times_attempted: 2,
      wasted_minutes_avg: 35,
      lesson: 'Causes catastrophic duplicate settlement runs and balance inconsistency requiring manual ledger rollbacks.',
      citing_incidents: ['INC-019'],
    },
  ],
};

export const MOCK_REFLECT_ANSWERS: Record<string, AskReflectResponse> = {
  default: {
    question: 'General memory query',
    answer:
      'Based on past incidents across checkout and payments, DB connection pool sizing has been the primary trigger for 75% of Sev1 alerts. Recommended remediation includes enforcing max_connections >= 50 and routing via PgBouncer.',
    citations: ['INC-001', 'INC-014', 'INC-031'],
    confidence: 'high',
    grounded: true,
  },
  pool: {
    question: 'How do we fix database connection exhaustion in checkout?',
    answer:
      'In past incidents INC-001 and INC-014, DB connection pool exhaustion was caused by default HikariCP pool caps (20) multiplied by pod autoscaling. The verified fix is raising `db.pool.max_connections` to 50 and routing traffic through PgBouncer transaction pooling. Never restart pods blindly without changing the pool cap.',
    citations: ['INC-001', 'INC-014', 'INC-031'],
    confidence: 'high',
    grounded: true,
  },
  avoid: {
    question: 'What actions should on-call engineers avoid during checkout latency spikes?',
    answer:
      'Do not execute a blind rollout restart of checkout pods when connection pool saturation is active (failed in INC-001, INC-014). This creates a thundering herd where all warming pods simultaneously request max connections, compounding DB CPU saturation.',
    citations: ['INC-001', 'INC-014'],
    confidence: 'high',
    grounded: true,
  },
};
