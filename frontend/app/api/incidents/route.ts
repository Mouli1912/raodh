import { NextResponse } from 'next/server';
import { MOCK_INCIDENTS } from '@/lib/mock';

export async function GET() {
  return NextResponse.json(MOCK_INCIDENTS);
}
