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
    const {
      examType,
      mode,
      year,
      branchCode,
      sectionCode,
      totalQuestions,
      duration,
      gateTopicId,
      catTopicId,
    } = body;

    const whereClause: Record<string, unknown> = {
      examType,
    };

    if (year) {
      whereClause.year = year;
    }

    if (mode === 'sectional') {
      if (examType === 'GATE' && gateTopicId) {
        whereClause.gateTopicId = gateTopicId;
      } else if (examType === 'CAT' && sectionCode) {
        whereClause.catSectionCode = sectionCode;
      }
    } else if (mode === 'full') {
      if (examType === 'GATE' && branchCode) {
        whereClause.gateBranchCode = branchCode;
      } else if (examType === 'CAT') {
        whereClause.catSectionCode = { in: ['VARC', 'DILR', 'QA'] };
      }
    } else if (mode === 'practice') {
      if (examType === 'GATE' && gateTopicId) {
        whereClause.gateTopicId = gateTopicId;
      } else if (examType === 'CAT' && catTopicId) {
        whereClause.catTopicId = catTopicId;
      } else if (examType === 'CAT' && sectionCode) {
        whereClause.catSectionCode = sectionCode;
      }
    }

    const totalAvailable = await prisma.mCQ.count({ where: whereClause });

    let questionsToFetch = totalQuestions;
    if (totalAvailable < totalQuestions) {
      questionsToFetch = totalAvailable;
    }

    const fetchedQuestions = await prisma.mCQ.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
      take: questionsToFetch,
      select: {
        id: true,
        question: true,
        options: true,
        correctAnswer: true,
        difficulty: true,
        marks: true,
        negativeMarks: true,
        explanation: true,
        tags: true,
        examType: true,
        year: true,
        gateTopicId: true,
        catTopicId: true,
        gateBranchCode: true,
        catSectionCode: true,
        questionType: true,
      },
    });

    const shuffledQuestions = fetchedQuestions.sort(() => Math.random() - 0.5);

    const modeToSourceType: Record<string, string> = {
      full: 'MOCK_TEST',
      sectional: 'SECTIONAL',
      practice: 'PRACTICE',
    };

    const session = await prisma.quizSession.create({
      data: {
        userId,
        examType,
        mode: mode.toUpperCase() as 'FULL_TEST' | 'SECTIONAL' | 'PRACTICE',
        sourceType: modeToSourceType[mode] || 'PRACTICE',
        year: year || null,
        branchCode: branchCode || null,
        sectionCode: sectionCode || null,
        totalQuestions: shuffledQuestions.length,
        duration,
        remainingTime: duration,
        status: 'IN_PROGRESS',
      },
    });

    return NextResponse.json({
      session,
      questions: shuffledQuestions,
      totalAvailable,
    });
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