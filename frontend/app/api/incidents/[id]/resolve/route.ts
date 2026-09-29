import { NextResponse } from 'next/server';
import { MOCK_INCIDENTS } from '@/lib/mock';
import { hindsightRetain } from '@/lib/server/hindsight';
import { Incident, ResolvePayload } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: ResolvePayload = await request.json();

    const inc = MOCK_INCIDENTS.find((i) => i.id === id) || MOCK_INCIDENTS[0];
    const updated: Incident = {
      ...inc,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      root_cause: body.root_cause || inc.root_cause,
      fix: body.fix || inc.fix,
    };

    // Retain in Hindsight memory
    const narrativeText = `Incident: ${updated.id} (${updated.service}) - ${updated.title}
Root Cause: ${body.root_cause}
Fix: ${body.fix}
Failed Steps/Anti-patterns: ${(body.failed_steps || []).join('; ')}
Signature: ${updated.signature}`;

    await hindsightRetain(narrativeText, [updated.service, updated.id, 'postmortem']);

    return NextResponse.json({ success: true, incident: updated });
  } catch (error) {
    console.error('Error in /api/incidents/[id]/resolve:', error);
    return NextResponse.json({ error: 'Failed to resolve incident' }, { status: 500 });
  }
}
