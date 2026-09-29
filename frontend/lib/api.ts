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
  MOCK_LATENCY_MS,
} from './mock';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const IS_MOCK_MODE =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
  !process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_USE_MOCK === undefined;

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listIncidents(): Promise<Incident[]> {
  if (IS_MOCK_MODE) {
    await delay(400);
    return [...MOCK_INCIDENTS];
  }
  try {
    const res = await fetch(`${API_BASE_URL}/v1/incidents`);
    if (!res.ok) throw new Error('Backend returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(300);
    return [...MOCK_INCIDENTS];
  }
}

export async function getIncident(id: string): Promise<Incident | null> {
  if (IS_MOCK_MODE) {
    await delay(300);
    const incident = MOCK_INCIDENTS.find((i) => i.id === id);
    return incident || MOCK_INCIDENTS[0];
  }
  try {
    const res = await fetch(`${API_BASE_URL}/v1/incidents/${id}`);
    if (!res.ok) throw new Error('Incident not found on backend');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(300);
    const incident = MOCK_INCIDENTS.find((i) => i.id === id);
    return incident || MOCK_INCIDENTS[0];
  }
}

export async function triage(
  id: string,
  memory: 'on' | 'off'
): Promise<TriageResult> {
  if (IS_MOCK_MODE) {
    await delay(700);
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
  try {
    const res = await fetch(`${API_BASE_URL}/v1/incidents/${id}/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memory: memory === 'on' }),
    });
    if (!res.ok) throw new Error('Backend triage returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(700);
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
}

export async function sendFeedback(
  suggestionId: string,
  verdict: 'accept' | 'reject' | 'worked' | 'failed',
  details?: { reason?: string }
): Promise<{ success: boolean; message: string }> {
  if (IS_MOCK_MODE) {
    await delay(300);
    return {
      success: true,
      message: `Feedback recorded: ${verdict} for suggestion ${suggestionId}`,
    };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/v1/suggestions/${suggestionId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verdict, ...details }),
    });
    if (!res.ok) throw new Error('Backend feedback returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(300);
    return {
      success: true,
      message: `Feedback recorded: ${verdict} for suggestion ${suggestionId}`,
    };
  }
}

export async function resolveIncident(
  id: string,
  payload: ResolvePayload
): Promise<{ success: boolean; incident: Incident }> {
  if (IS_MOCK_MODE) {
    await delay(500);
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
  try {
    const res = await fetch(`${API_BASE_URL}/v1/incidents/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Backend resolve returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(500);
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
}

export async function correctMemory(
  precedentId: string,
  reason?: string
): Promise<{ success: boolean }> {
  if (IS_MOCK_MODE) {
    await delay(300);
    return { success: true };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/v1/precedents/${precedentId}/correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Backend correction returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(300);
    return { success: true };
  }
}

export async function listDeploys(): Promise<DeployItem[]> {
  if (IS_MOCK_MODE) {
    await delay(400);
    return [...MOCK_DEPLOYS];
  }
  try {
    const res = await fetch(`${API_BASE_URL}/v1/deploys`);
    if (!res.ok) throw new Error('Backend deploys returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(400);
    return [...MOCK_DEPLOYS];
  }
}

export async function simulateDeploy(payload: {
  service: string;
  files: string[];
  config_keys: string[];
}): Promise<DeployItem> {
  if (IS_MOCK_MODE) {
    await delay(500);
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
  try {
    const res = await fetch(`${API_BASE_URL}/v1/deploys/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Backend simulate returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(500);
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
}

export async function getWeeklyBrief(): Promise<WeeklyBrief> {
  if (IS_MOCK_MODE) {
    await delay(400);
    return MOCK_WEEKLY_BRIEF;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/v1/insights/brief`);
    if (!res.ok) throw new Error('Backend brief returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(400);
    return MOCK_WEEKLY_BRIEF;
  }
}

export async function getReplay(): Promise<ReplayPoint[]> {
  if (IS_MOCK_MODE) {
    await delay(MOCK_LATENCY_MS);
    return MOCK_REPLAY_POINTS;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/v1/eval/results`);
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error('Failed to fetch replay data');
    }
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  } catch (err) {
    console.error('Error fetching real replay data:', err);
    return [];
  }
}

export async function askReflect(question: string): Promise<AskReflectResponse> {
  if (IS_MOCK_MODE) {
    await delay(600);
    const q = question.toLowerCase();
    if (q.includes('pool') || q.includes('db') || q.includes('database') || q.includes('postgres') || q.includes('checkout')) {
      return {
        ...MOCK_REFLECT_ANSWERS.pool,
        question,
      };
    }
    if (q.includes('avoid') || q.includes('restart') || q.includes('mistake') || q.includes('wrong')) {
      return {
        ...MOCK_REFLECT_ANSWERS.avoid,
        question,
      };
    }
    return {
      ...MOCK_REFLECT_ANSWERS.default,
      question,
    };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/v1/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Backend reflect returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(600);
    const q = question.toLowerCase();
    if (q.includes('pool') || q.includes('db') || q.includes('database') || q.includes('postgres') || q.includes('checkout')) {
      return {
        ...MOCK_REFLECT_ANSWERS.pool,
        question,
      };
    }
    if (q.includes('avoid') || q.includes('restart') || q.includes('mistake') || q.includes('wrong')) {
      return {
        ...MOCK_REFLECT_ANSWERS.avoid,
        question,
      };
    }
    return {
      ...MOCK_REFLECT_ANSWERS.default,
      question,
    };
  }
}

export async function fireDemoAlert(): Promise<{ success: boolean; incident_id: string }> {
  if (IS_MOCK_MODE) {
    await delay(400);
    return { success: true, incident_id: 'INC-031' };
  }
  try {
    const res = await fetch(`${API_BASE_URL}/v1/alerts/demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Backend demo alert returned error');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local memory engine:', err);
    await delay(400);
    return { success: true, incident_id: 'INC-031' };
  }
}
