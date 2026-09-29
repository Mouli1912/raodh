export type Severity = 'sev1' | 'sev2' | 'sev3';
export type IncidentStatus = 'open' | 'mitigated' | 'resolved';

export interface Incident {
  id: string;
  service: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  signature: string;
  opened_at: string;
  resolved_at?: string;
  root_cause?: string;
  fix?: string;
  deploy_context?: string;
  logs_redacted?: string;
}

export interface Evidence {
  precedent_id: string;
  why: string;
}

export interface AvoidItem {
  step: string;
  reason: string;
  precedent_id?: string;
}

export interface Hypothesis {
  id: string;
  root_cause: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  evidence: Evidence[];
  suggested_steps: string[];
  avoid: AvoidItem[];
  score: number;
  score_basis: string;
  grounded: boolean; // grounded=false means "general knowledge, no precedent"
}

export interface Precedent {
  id: string;
  service: string;
  summary: string;
  root_cause: string;
  fix: string;
  failed_fixes: string[];
  successes: number;
  failures: number;
  last_used_at: string;
  relevance: number;
}

export interface TriageResult {
  incident_id: string;
  memory_used: boolean;
  partial_context: boolean;
  memory_unavailable: boolean;
  hypotheses: Hypothesis[];
  precedents: Precedent[];
  generated_at: string;
}

export type TimelineEventKind =
  | 'alert'
  | 'deploy'
  | 'triage'
  | 'feedback'
  | 'action'
  | 'resolution';

export interface TimelineEvent {
  id: string;
  at: string;
  kind: TimelineEventKind;
  text: string;
}

export interface DeployWarning {
  deploy_id: string;
  service: string;
  message: string;
  precedent_id: string;
  watch_metrics: string[];
}

export interface DeployItem {
  id: string;
  service: string;
  environment: string;
  commit: string;
  author: string;
  timestamp: string;
  changed_files: string[];
  config_keys: string[];
  status: 'healthy' | 'warning' | 'rolled_back';
  warning?: DeployWarning;
}

export interface ReplayPoint {
  incident_index: number;
  memory_on_top1: number;
  memory_off_top1: number;
}

export interface WeeklyBrief {
  week_label: string;
  generated_at: string;
  recurring_causes: {
    cause: string;
    count: number;
    services: string[];
    precedent_ids: string[];
    recommendation: string;
  }[];
  riskiest_services: {
    service: string;
    incidents_count: number;
    risk_level: 'high' | 'medium' | 'low';
    top_vulnerability: string;
  }[];
  deploy_patterns: {
    pattern: string;
    impact: string;
    mitigation: string;
  }[];
  failed_fix_hall_of_shame: {
    anti_pattern: string;
    times_attempted: number;
    wasted_minutes_avg: number;
    lesson: string;
    citing_incidents: string[];
  }[];
}

export interface AskReflectResponse {
  question: string;
  answer: string;
  citations: string[];
  confidence: 'high' | 'medium' | 'low';
  grounded: boolean;
}

export interface ResolvePayload {
  root_cause: string;
  fix: string;
  failed_steps: string[];
  time_to_resolve_minutes?: number;
}
