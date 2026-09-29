import {
  Incident,
  TriageResult,
  DeployItem,
  WeeklyBrief,
  ReplayPoint,
  AskReflectResponse,
  ResolvePayload,
} from './types';
import {
  MOCK_INCIDENTS,
  MOCK_TRIAGE_MEMORY_ON,
  MOCK_TRIAGE_MEMORY_OFF,
  MOCK_DEPLOYS,
  MOCK_WEEKLY_BRIEF,
  MOCK_REPLAY_POINTS,
  MOCK_REFLECT_ANSWERS,
} from './mock';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const IS_MOCK_MODE =
  process.env.NEXT_PUBLIC_USE_MOCK !== 'false' || !process.env.NEXT_PUBLIC_API_URL;

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listIncidents(): Promise<Incident[]> {
  if (IS_MOCK_MODE) {
    await delay(500);
    return [...MOCK_INCIDENTS];
  }
  const res = await fetch(`${API_BASE_URL}/v1/incidents`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function getIncident(id: string): Promise<Incident | null> {
  if (IS_MOCK_MODE) {
    await delay(400);
    const incident = MOCK_INCIDENTS.find((i) => i.id === id);
    return incident || MOCK_INCIDENTS[0];
  }
  const res = await fetch(`${API_BASE_URL}/v1/incidents/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function triage(
  id: string,
  memory: 'on' | 'off'
): Promise<TriageResult> {
  if (IS_MOCK_MODE) {
    await delay(800); // realistic triage reasoning time
    if (memory === 'off') {
      return {
        ...MOCK_TRIAGE_MEMORY_OFF,
        incident_id: id,
        generated_at: new Date().toISOString(),
      };
    }
    return {
      ...MOCK_TRIAGE_MEMORY_ON,
      incident_id: id,
      generated_at: new Date().toISOString(),
    };
  }
  const res = await fetch(`${API_BASE_URL}/v1/incidents/${id}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memory: memory === 'on' }),
  });
  if (!res.ok) throw new Error('Failed to triage incident');
  return res.json();
}

export async function sendFeedback(
  suggestionId: string,
  verdict: 'accept' | 'reject' | 'worked' | 'failed',
  details?: { reason?: string }
): Promise<{ success: boolean; message: string }> {
  if (IS_MOCK_MODE) {
    await delay(350);
    return {
      success: true,
      message: `Feedback recorded: ${verdict} for suggestion ${suggestionId}`,
    };
  }
  const res = await fetch(`${API_BASE_URL}/v1/suggestions/${suggestionId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verdict, ...details }),
  });
  if (!res.ok) throw new Error('Failed to send feedback');
  return res.json();
}

export async function resolveIncident(
  id: string,
  payload: ResolvePayload
): Promise<{ success: boolean; incident: Incident }> {
  if (IS_MOCK_MODE) {
    await delay(600);
    const inc = MOCK_INCIDENTS.find((i) => i.id === id) || MOCK_INCIDENTS[0];
    const updated: Incident = {
      ...inc,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      root_cause: payload.root_cause,
      fix: payload.fix,
    };
    return { success: true, incident: updated };
  }
  const res = await fetch(`${API_BASE_URL}/v1/incidents/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to resolve incident');
  return res.json();
}

export async function correctMemory(
  precedentId: string,
  reason?: string
): Promise<{ success: boolean }> {
  if (IS_MOCK_MODE) {
    await delay(400);
    return { success: true };
  }
  const res = await fetch(`${API_BASE_URL}/v1/precedents/${precedentId}/correct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to submit correction');
  return res.json();
}

export async function listDeploys(): Promise<DeployItem[]> {
  if (IS_MOCK_MODE) {
    await delay(500);
    return [...MOCK_DEPLOYS];
  }
  const res = await fetch(`${API_BASE_URL}/v1/deploys`);
  if (!res.ok) throw new Error('Failed to fetch deploys');
  return res.json();
}

export async function simulateDeploy(payload: {
  service: string;
  files: string[];
  config_keys: string[];
}): Promise<DeployItem> {
  if (IS_MOCK_MODE) {
    await delay(700);
    const hasDb = payload.config_keys.some((k) => k.includes('db') || k.includes('pool')) ||
      payload.files.some((f) => f.includes('db') || f.includes('database'));
    
    return {
      id: `D-${Math.floor(Math.random() * 800 + 200)}`,
      service: payload.service || 'checkout',
      environment: 'production',
      commit: Math.random().toString(16).substring(2, 9),
      author: 'you (simulated)',
      timestamp: new Date().toISOString(),
      changed_files: payload.files.length ? payload.files : ['config/database.yaml'],
      config_keys: payload.config_keys.length ? payload.config_keys : ['db.pool.max_connections'],
      status: hasDb ? 'warning' : 'healthy',
      warning: hasDb
        ? {
            deploy_id: 'D-SIM',
            service: payload.service || 'checkout',
            message: 'This simulated change touches database pool settings. Resembles INC-001 (HikariCP pool starvation).',
            precedent_id: 'INC-001',
            watch_metrics: ['db.pool.in_use', 'checkout.p99_latency_ms', 'db.pool.wait_queue_length'],
          }
        : undefined,
    };
  }
  const res = await fetch(`${API_BASE_URL}/v1/deploys/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to simulate deploy');
  return res.json();
}

export async function getWeeklyBrief(): Promise<WeeklyBrief> {
  if (IS_MOCK_MODE) {
    await delay(500);
    return MOCK_WEEKLY_BRIEF;
  }
  const res = await fetch(`${API_BASE_URL}/v1/insights/brief`);
  if (!res.ok) throw new Error('Failed to fetch weekly brief');
  return res.json();
}

export async function getReplay(): Promise<ReplayPoint[]> {
  if (IS_MOCK_MODE) {
    await delay(600);
    return MOCK_REPLAY_POINTS;
  }
  const res = await fetch(`${API_BASE_URL}/v1/replay`);
  if (!res.ok) throw new Error('Failed to fetch replay data');
  return res.json();
}

export async function askReflect(question: string): Promise<AskReflectResponse> {
  if (IS_MOCK_MODE) {
    await delay(900);
    const q = question.toLowerCase();
    if (q.includes('pool') || q.includes('db') || q.includes('database') || q.includes('postgres')) {
      return MOCK_REFLECT_ANSWERS.pool;
    }
    if (q.includes('avoid') || q.includes('restart') || q.includes('mistake') || q.includes('wrong')) {
      return MOCK_REFLECT_ANSWERS.avoid;
    }
    return {
      ...MOCK_REFLECT_ANSWERS.default,
      question,
    };
  }
  const res = await fetch(`${API_BASE_URL}/v1/reflect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Failed to query reflect agent');
  return res.json();
}

export async function fireDemoAlert(): Promise<{ success: boolean; incident_id: string }> {
  if (IS_MOCK_MODE) {
    await delay(500);
    return { success: true, incident_id: 'INC-031' };
  }
  const res = await fetch(`${API_BASE_URL}/v1/alerts/demo`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger demo alert');
  return res.json();
}
