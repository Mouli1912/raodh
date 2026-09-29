import { NextResponse } from 'next/server';
import { MOCK_REPLAY_POINTS } from '@/lib/mock';

export async function GET() {
  return NextResponse.json(MOCK_REPLAY_POINTS);
}
