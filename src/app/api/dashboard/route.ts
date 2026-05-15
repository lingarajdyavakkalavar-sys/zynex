import { NextResponse } from 'next/server';
import { getDashboardAnalytics } from '@/actions/analytics';
import { isAuthEnabled } from '@/lib/auth-config';

export async function GET() {
  try {
    if (!isAuthEnabled()) {
      const data = await getDashboardAnalytics();
      return NextResponse.json(data);
    }

    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getDashboardAnalytics();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}