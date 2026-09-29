import { NextResponse } from 'next/server';
import { MOCK_INCIDENTS } from '@/lib/mock';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = MOCK_INCIDENTS.find((i) => i.id === id) || MOCK_INCIDENTS[0];
  return NextResponse.json(incident);
}
