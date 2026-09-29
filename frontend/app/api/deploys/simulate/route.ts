import { NextResponse } from 'next/server';
import { callGroqChat } from '@/lib/server/groq';
import { DeployItem } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service: string = body?.service || 'checkout';
    const files: string[] = Array.isArray(body?.files) ? body.files : ['config/database.yaml'];
    const configKeys: string[] = Array.isArray(body?.config_keys) ? body.config_keys : ['db.pool.max_connections'];

    const hasDb =
      configKeys.some((k) => k.includes('db') || k.includes('pool')) ||
      files.some((f) => f.includes('db') || f.includes('database'));

    const commitId = Math.random().toString(16).substring(2, 9);
    const deployId = `D-${Math.floor(Math.random() * 800 + 200)}`;

    // If Groq is available, ask Groq to analyze pre-mortem diff risk
    const groqResponse = await callGroqChat({
      messages: [
        {
          role: 'system',
          content: `You are Precedent's pre-mortem deploy risk evaluator.
Evaluate whether the changed files and configuration keys touch known historical failure modes (e.g. database connection pools, thread starvation, cache invalidation).
Return a JSON object:
{
  "is_risky": true,
  "warning_message": "Clear explanation of the historical risk and why this deploy is dangerous",
  "precedent_id": "INC-001",
  "watch_metrics": ["metric1", "metric2"]
}`,
        },
        {
          role: 'user',
          content: `Service: ${service}\nChanged Files: ${files.join(', ')}\nConfig Keys: ${configKeys.join(', ')}`,
        },
      ],
      jsonMode: true,
      temperature: 0.1,
    });

    let isWarning = hasDb;
    let warningMsg = 'This simulated change touches database pool settings. Resembles INC-001 (HikariCP pool starvation).';
    let precedentId = 'INC-001';
    let watchMetrics = ['db.pool.in_use', 'checkout.p99_latency_ms', 'db.pool.wait_queue_length'];

    if (groqResponse) {
      try {
        const parsed = JSON.parse(groqResponse);
        isWarning = Boolean(parsed.is_risky);
        if (parsed.warning_message) warningMsg = parsed.warning_message;
        if (parsed.precedent_id) precedentId = parsed.precedent_id;
        if (Array.isArray(parsed.watch_metrics) && parsed.watch_metrics.length > 0) {
          watchMetrics = parsed.watch_metrics;
        }
      } catch {
        // use fallback
      }
    }

    const deployItem: DeployItem = {
      id: deployId,
      service,
      environment: 'production',
      commit: commitId,
      author: 'you (simulated)',
      timestamp: new Date().toISOString(),
      changed_files: files,
      config_keys: configKeys,
      status: isWarning ? 'warning' : 'healthy',
      warning: isWarning
        ? {
            deploy_id: deployId,
            service,
            message: warningMsg,
            precedent_id: precedentId,
            watch_metrics: watchMetrics,
          }
        : undefined,
    };

    return NextResponse.json(deployItem);
  } catch (error) {
    console.error('Error in /api/deploys/simulate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
