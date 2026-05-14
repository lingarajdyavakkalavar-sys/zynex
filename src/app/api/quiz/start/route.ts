import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { examType, mode, year, branchCode, sectionCode, totalQuestions, duration } = body;

    const session = await prisma.quizSession.create({
      data: {
        userId,
        examType,
        mode,
        sourceType: mode === 'full' ? 'MOCK_TEST' : mode === 'sectional' ? 'SECTIONAL' : 'PRACTICE',
        year: year || null,
        branchCode: branchCode || null,
        sectionCode: sectionCode || null,
        totalQuestions,
        duration,
        remainingTime: duration,
        status: 'IN_PROGRESS',
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Quiz start error:', error);
    return NextResponse.json({ error: 'Failed to start quiz' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.quizSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Quiz history error:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz history' }, { status: 500 });
  }
}