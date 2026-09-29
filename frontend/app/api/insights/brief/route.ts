import { NextResponse } from 'next/server';
import { MOCK_WEEKLY_BRIEF } from '@/lib/mock';

export async function GET() {
  return NextResponse.json(MOCK_WEEKLY_BRIEF);
}
