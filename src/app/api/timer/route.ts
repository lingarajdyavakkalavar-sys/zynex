import { NextRequest, NextResponse } from 'next/server';
import { startStudyTimer, pauseStudyTimer, resumeStudyTimer, stopStudyTimer, getActiveTimer } from '@/actions/timer';
import { isAuthEnabled } from '@/lib/auth-config';

export async function GET() {
  try {
    if (isAuthEnabled()) {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const timer = await getActiveTimer();
    return NextResponse.json(timer);
  } catch (error) {
    console.error('Timer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (isAuthEnabled()) {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();
    const { action, timerId, topicId, sessionType } = body;

    if (action === 'start') {
      const timer = await startStudyTimer(topicId, sessionType);
      return NextResponse.json(timer);
    }

    if (action === 'pause') {
      const timer = await pauseStudyTimer(timerId);
      return NextResponse.json(timer);
    }

    if (action === 'resume') {
      const timer = await resumeStudyTimer(timerId);
      return NextResponse.json(timer);
    }

    if (action === 'stop') {
      const timer = await stopStudyTimer(timerId);
      return NextResponse.json(timer);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Timer POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}