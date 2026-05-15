import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthEnabled } from '@/lib/auth-config';

export async function POST(req: NextRequest) {
  try {
    // Demo mode user ID when auth is not enabled
    const DEMO_USER_ID = 'demo-user-123';
    let userId = DEMO_USER_ID;
    
    // Check if auth is enabled, if so try to get real user
    if (isAuthEnabled()) {
      try {
        const { auth } = await import('@clerk/nextjs/server');
        const { userId: clerkUserId } = await auth();
        if (clerkUserId) userId = clerkUserId;
      } catch (e) {
        // Fall back to demo user
      }
    }

    const body = await req.json();
    const {
      examType,
      mode,
      year,
      branchCode,
      sectionCode,
      totalQuestions = 10,
      duration = 1800,
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
      // Practice mode - get any questions for the exam type
      if (examType === 'GATE' && branchCode) {
        whereClause.gateBranchCode = branchCode;
      } else if (examType === 'CAT' && sectionCode) {
        whereClause.catSectionCode = sectionCode;
      }
    }

    const totalAvailable = await prisma.mCQ.count({ where: whereClause });

    let questionsToFetch = totalQuestions;
    if (totalAvailable < totalQuestions || totalAvailable === 0) {
      // If no specific questions, get any questions for the exam
      const fallbackWhere = { examType };
      const fallbackTotal = await prisma.mCQ.count({ where: fallbackWhere });
      if (fallbackTotal > 0) {
        whereClause.examType = examType;
        delete whereClause.year;
        questionsToFetch = Math.min(totalQuestions, fallbackTotal);
      } else {
        questionsToFetch = 0;
      }
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

    // Create session only if we have questions
    let session = null;
    if (shuffledQuestions.length > 0) {
      const modeToSourceType: Record<string, string> = {
        full: 'MOCK_TEST',
        sectional: 'SECTIONAL',
        practice: 'PRACTICE',
        timed: 'TIMED_TEST',
        revision: 'REVISION',
        previous_year: 'PREVIOUS_YEAR',
      };

      session = await prisma.quizSession.create({
        data: {
          userId,
          examType,
          mode: (mode?.toUpperCase() || 'PRACTICE') as 'FULL_TEST' | 'SECTIONAL' | 'PRACTICE',
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
    }

    return NextResponse.json({
      session,
      questions: shuffledQuestions,
      totalAvailable: shuffledQuestions.length,
    });
  } catch (error) {
    console.error('Quiz start error:', error);
    return NextResponse.json({ error: 'Failed to start quiz' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Demo mode - return empty sessions
    const DEMO_USER_ID = 'demo-user-123';
    
    const sessions = await prisma.quizSession.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { startedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Quiz history error:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz history' }, { status: 500 });
  }
}