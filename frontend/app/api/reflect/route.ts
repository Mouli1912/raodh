import { NextResponse } from 'next/server';
import { callGroqChat } from '@/lib/server/groq';
import { hindsightRecall } from '@/lib/server/hindsight';
import { MOCK_REFLECT_ANSWERS } from '@/lib/mock';
import { AskReflectResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question: string = body?.question || '';

    if (!question.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // 1. Try Hindsight Recall if available
    const recalled = await hindsightRecall(question);
    const contextFromMemories = recalled.map((r) => r.text || r.content || '').filter(Boolean).join('\n---\n');

    // 2. Call Groq with incident memory & precedent context
    const systemPrompt = `You are the memory reflection engine for "Precedent", an on-call incident response platform.
You have access to historical incident precedents and past post-mortems.
Analyze the user's question about past outages, recurring root causes, or anti-patterns.

Historical Precedents Context:
- INC-001 (checkout): HikariCP pool starvation. Max pool connections set to 10 with 30s timeout under 400 req/s caused thread exhaustion. Fix: Increased max pool to 50, added p99 connection wait alerts. Anti-pattern: Restarting pods without pool resize caused immediate retry storms.
- INC-014 (checkout): Read-replica lag spike causing stale catalog pricing and transaction rollbacks. Fix: Route read queries to primary during replica catchup. Anti-pattern: Flushed redis cache simultaneously which amplified database read load 10x.
- INC-022 (auth-service): JWT RSA key rotation cache inconsistency. Fix: Dual-sign tokens during key rotation window. Anti-pattern: Hard-reloading auth instances sequentially caused split-brain token verification failures.

${contextFromMemories ? `Additional Retrieved Memories:\n${contextFromMemories}\n` : ''}

You must reply with a JSON object in this exact format:
{
  "answer": "A clear, concise, actionable response referencing specific historical incidents and lessons learned.",
  "citations": ["INC-001", "INC-014"],
  "confidence": "high",
  "grounded": true
}`;

    const groqResponse = await callGroqChat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      jsonMode: true,
      temperature: 0.1,
    });

    if (groqResponse) {
      try {
        const parsed = JSON.parse(groqResponse);
        const result: AskReflectResponse = {
          question,
          answer: parsed.answer || groqResponse,
          citations: Array.isArray(parsed.citations) ? parsed.citations : ['INC-001'],
          confidence: parsed.confidence || 'high',
          grounded: parsed.grounded !== undefined ? Boolean(parsed.grounded) : true,
        };
        return NextResponse.json(result);
      } catch (parseErr) {
        console.warn('Failed to parse Groq JSON response, returning raw answer:', parseErr);
        const result: AskReflectResponse = {
          question,
          answer: groqResponse,
          citations: ['INC-001'],
          confidence: 'medium',
          grounded: true,
        };
        return NextResponse.json(result);
      }
    }

    // Fallback if GROQ_API_KEY is not set
    const q = question.toLowerCase();
    if (q.includes('pool') || q.includes('db') || q.includes('database') || q.includes('postgres') || q.includes('checkout')) {
      return NextResponse.json({
        ...MOCK_REFLECT_ANSWERS.pool,
        question,
      });
    }
    if (q.includes('avoid') || q.includes('restart') || q.includes('mistake') || q.includes('wrong')) {
      return NextResponse.json({
        ...MOCK_REFLECT_ANSWERS.avoid,
        question,
      });
    }
    return NextResponse.json({
      ...MOCK_REFLECT_ANSWERS.default,
      question,
    });
  } catch (error) {
    console.error('Error in /api/reflect:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
