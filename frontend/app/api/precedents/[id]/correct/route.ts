import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Memory precedent ${id} corrected.`);
    return NextResponse.json({ success: true, precedent_id: id });
  } catch (error) {
    console.error('Error in /api/precedents/[id]/correct:', error);
    return NextResponse.json({ error: 'Failed to correct precedent' }, { status: 500 });
  }
}
