import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: true, incident_id: 'INC-031' });
}
