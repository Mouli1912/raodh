import { NextResponse } from 'next/server';
import { callGroqChat } from '@/lib/server/groq';
import { hindsightRecall } from '@/lib/server/hindsight';
import { MOCK_TRIAGE_MEMORY_ON, MOCK_TRIAGE_MEMORY_OFF, MOCK_INCIDENTS } from '@/lib/mock';
import { TriageResult } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const incidentId: string = body?.incident_id || body?.id || 'INC-031';
    const memoryEnabled: boolean = body?.memory !== false;

    const incident = MOCK_INCIDENTS.find((i) => i.id === incidentId) || MOCK_INCIDENTS[0];

    // If memory is off, generate standard non-grounded triage or return mock
    if (!memoryEnabled) {
      const groqResponse = await callGroqChat({
        messages: [
          {
            role: 'system',
            content: `You are an SRE on-call assistant performing cold triage WITHOUT past incident memory.
Generate a JSON object matching this schema for a generic, ungrounded triage hypothesis:
{
  "hypotheses": [
    {
      "id": "H1",
      "root_cause": "Generic high-level cause based solely on logs",
      "confidence": "low",
      "evidence": [],
      "suggested_steps": ["Generic diagnostic step 1", "Generic diagnostic step 2"],
      "avoid": [],
      "score": 0.42,
      "score_basis": "Heuristic match without precedent reinforcement",
      "grounded": false
    }
  ]
}`,
          },
          {
            role: 'user',
            content: `Incident: ${incident.id} (${incident.service}) - ${incident.title}
Signature: ${incident.signature}
Logs: ${incident.logs_redacted || 'N/A'}
Deploy Context: ${incident.deploy_context || 'N/A'}`,
          },
        ],
        jsonMode: true,
      });

      if (groqResponse) {
        try {
          const parsed = JSON.parse(groqResponse);
          const result: TriageResult = {
            incident_id: incidentId,
            memory_used: false,
            partial_context: false,
            memory_unavailable: false,
            hypotheses: parsed.hypotheses || MOCK_TRIAGE_MEMORY_OFF.hypotheses,
            precedents: [],
            generated_at: new Date().toISOString(),
          };
          return NextResponse.json(result);
        } catch {
          // fallback to mock off
        }
      }

      return NextResponse.json({
        ...MOCK_TRIAGE_MEMORY_OFF,
        incident_id: incidentId,
        generated_at: new Date().toISOString(),
      });
    }

    // Memory is ON: Retrieve memories from Hindsight
    const memories = await hindsightRecall(
      `${incident.service} ${incident.title} ${incident.signature}`
    );
    const recalledContext = memories.map((m) => m.text || m.content || '').filter(Boolean).join('\n');

    const prompt = `You are "Precedent", an on-call agent backed by organizational incident memory.
Given the incident details below and historical precedent memory, synthesize a high-confidence grounded triage.
You MUST output a JSON object adhering to this schema:
{
  "hypotheses": [
    {
      "id": "H1",
      "root_cause": "Specific root cause referencing past similar incident",
      "confidence": "high",
      "evidence": [
        {
          "precedent_id": "INC-001",
          "why": "Exact explanation of similarity in stack trace, pool configuration, or commit diff."
        }
      ],
      "suggested_steps": [
        "Actionable verification step 1",
        "Actionable fix step 2"
      ],
      "avoid": [
        {
          "step": "Dangerous action to avoid (e.g., pod restart)",
          "reason": "Why this made things worse in the past",
          "precedent_id": "INC-001"
        }
      ],
      "score": 0.94,
      "score_basis": "Memory match to INC-001 with 94% signature overlap",
      "grounded": true
    }
  ],
  "precedents": [
    {
      "id": "INC-001",
      "service": "${incident.service}",
      "summary": "HikariCP connection starvation under burst traffic",
      "root_cause": "Database connection pool exhaustion due to tight pool size",
      "fix": "Scale max_connections from 10 to 50 in database.yaml and reload without dropping connections",
      "failed_fixes": ["Restarting pods without increasing pool size caused instant retry storms"],
      "successes": 3,
      "failures": 1,
      "last_used_at": "2026-08-14T09:30:00Z",
      "relevance": 0.94
    }
  ]
}

Incident Details:
ID: ${incident.id}
Service: ${incident.service}
Title: ${incident.title}
Signature: ${incident.signature}
Deploy Context: ${incident.deploy_context || 'None'}
Logs: ${incident.logs_redacted || 'None'}

Retrieved Memories:
${recalledContext || 'INC-001: HikariCP connection starvation caused by max-connections=10 in checkout database configuration.'}
`;

    const groqResponse = await callGroqChat({
      messages: [
        {
          role: 'system',
          content: 'You are an incident response intelligence engine. Respond with strict JSON.',
        },
        { role: 'user', content: prompt },
      ],
      jsonMode: true,
      temperature: 0.1,
    });

    if (groqResponse) {
      try {
        const parsed = JSON.parse(groqResponse);
        const result: TriageResult = {
          incident_id: incidentId,
          memory_used: true,
          partial_context: false,
          memory_unavailable: false,
          hypotheses: parsed.hypotheses || MOCK_TRIAGE_MEMORY_ON.hypotheses,
          precedents: parsed.precedents || MOCK_TRIAGE_MEMORY_ON.precedents,
          generated_at: new Date().toISOString(),
        };
        return NextResponse.json(result);
      } catch (parseErr) {
        console.warn('Failed to parse Groq triage JSON:', parseErr);
      }
    }

    // Default fallback
    return NextResponse.json({
      ...MOCK_TRIAGE_MEMORY_ON,
      incident_id: incidentId,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/triage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
