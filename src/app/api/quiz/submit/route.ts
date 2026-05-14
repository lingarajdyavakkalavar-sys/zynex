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
    const { sessionId, attempts } = body;

    if (!sessionId || !attempts || !Array.isArray(attempts)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Quiz session not found' }, { status: 404 });
    }

    const examType = session.examType;

    const mcqIds = attempts
      .filter((a: { mcqId: string }) => a.mcqId && !a.mcqId.startsWith('demo-'))
      .map((a: { mcqId: string }) => a.mcqId);

    const mcqs = await prisma.mCQ.findMany({
      where: { id: { in: mcqIds } },
      select: { id: true, correctAnswer: true, marks: true, negativeMarks: true },
    });

    const mcqMap = new Map(mcqs.map((m) => [m.id, m]));

    let correctCount = 0;
    let attemptedCount = 0;
    let markedForReviewCount = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;
    let negativeMarksTotal = 0;

    const mcqAttemptData = [];

    for (const attempt of attempts) {
      const mcqId = attempt.mcqId;
      const selectedAnswer = attempt.selectedAnswer;
      const timeSpent = attempt.timeSpent || 0;
      const isMarkedForReview = attempt.isMarkedForReview || false;

      if (isMarkedForReview) {
        markedForReviewCount++;
      }

      if (selectedAnswer === null || selectedAnswer === undefined) {
        continue;
      }

      attemptedCount++;

      let isCorrect = false;
      let marksObtained = 0;
      let negativeMarks = 0;

      if (!mcqId || mcqId.startsWith('demo-')) {
        continue;
      }

      const mcq = mcqMap.get(mcqId);

      if (!mcq) {
        continue;
      }

      if (selectedAnswer === mcq.correctAnswer) {
        isCorrect = true;
        correctCount++;

        if (examType === 'GATE') {
          marksObtained = mcq.marks;
          totalMarks += mcq.marks;
        } else if (examType === 'CAT') {
          marksObtained = 1;
          totalMarks += 1;
        }
      } else {
        if (examType === 'GATE') {
          negativeMarks = mcq.negativeMarks;
          negativeMarksTotal += mcq.negativeMarks;
        } else if (examType === 'CAT') {
          negativeMarks = 0;
        }
      }

      if (examType === 'GATE') {
        obtainedMarks += marksObtained - negativeMarks;
      } else if (examType === 'CAT') {
        obtainedMarks += marksObtained;
      }

      mcqAttemptData.push({
        userId,
        mcqId,
        quizSessionId: sessionId,
        selectedAnswer,
        isCorrect,
        marksObtained: examType === 'GATE' ? marksObtained : marksObtained,
        negativeMarks,
        timeSpent,
        isMarkedForReview,
      });
    }

    if (mcqAttemptData.length > 0) {
      await prisma.mCQAttempt.createMany({
        data: mcqAttemptData,
      });
    }

    const updatedSession = await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        remainingTime: 0,
        correctCount,
        attemptedCount,
        markedForReview: markedForReviewCount,
        totalMarks,
        obtainedMarks,
        negativeMarks: negativeMarksTotal,
        autoSubmitted: false,
      },
    });

    return NextResponse.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}