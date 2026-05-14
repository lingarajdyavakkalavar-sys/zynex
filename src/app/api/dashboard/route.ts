import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDashboardAnalytics } from '@/actions/analytics';

export async function GET() {
  try {
    const { userId } = auth();
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