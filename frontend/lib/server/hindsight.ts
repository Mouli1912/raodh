export interface HindsightRecallResult {
  id?: string;
  text?: string;
  content?: string;
  similarity?: number;
  score?: number;
  metadata?: Record<string, unknown>;
}

export async function hindsightRecall(
  query: string,
  bank = 'precedent-incidents'
): Promise<HindsightRecallResult[]> {
  const apiKey = process.env.HINDSIGHT_API_KEY;
  const baseUrl = (process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io').replace(/\/+$/, '');

  if (!apiKey) {
    return [];
  }

  try {
    const res = await fetch(`${baseUrl}/v1/recall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'X-API-Key': apiKey.trim(),
      },
      body: JSON.stringify({
        bank,
        query,
        limit: 5,
      }),
    });

    if (!res.ok) {
      // Try search alternative endpoint if /v1/recall is structured differently
      console.warn(`Hindsight recall status ${res.status}, continuing gracefully`);
      return [];
    }

    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.memories)) return data.memories;
    return [];
  } catch (err) {
    console.warn('Hindsight recall failed (non-blocking):', err);
    return [];
  }
}

export async function hindsightRetain(
  text: string,
  tags: string[] = [],
  bank = 'precedent-incidents'
): Promise<boolean> {
  const apiKey = process.env.HINDSIGHT_API_KEY;
  const baseUrl = (process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io').replace(/\/+$/, '');

  if (!apiKey) {
    return false;
  }

  try {
    const res = await fetch(`${baseUrl}/v1/retain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'X-API-Key': apiKey.trim(),
      },
      body: JSON.stringify({
        bank,
        text,
        tags,
        timestamp: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn('Hindsight retain failed (non-blocking):', err);
    return false;
  }
}

export async function hindsightReflect(
  bank = 'precedent-incidents'
): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.HINDSIGHT_API_KEY;
  const baseUrl = (process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io').replace(/\/+$/, '');

  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch(`${baseUrl}/v1/reflect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'X-API-Key': apiKey.trim(),
      },
      body: JSON.stringify({
        bank,
      }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Hindsight reflect failed (non-blocking):', err);
    return null;
  }
}
