import { NextResponse } from 'next/server';
import { MOCK_DEPLOYS } from '@/lib/mock';

export async function GET() {
  return NextResponse.json(MOCK_DEPLOYS);
}
