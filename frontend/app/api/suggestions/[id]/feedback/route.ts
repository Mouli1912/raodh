import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: `Feedback recorded: ${body.verdict || 'accepted'} for suggestion ${id}`,
    });
  } catch (error) {
    console.error('Error in /api/suggestions/[id]/feedback:', error);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}
