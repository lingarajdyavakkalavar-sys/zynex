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
    const { sessionId, attempts, obtainedMarks, negativeMarks, correctCount, wrongCount, unattempted } = body;

    const session = await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        remainingTime: 0,
        correctCount,
        attemptedCount: correctCount + wrongCount,
        markedForReview: attempts.filter((a: any) => a.isMarkedForReview).length,
        obtainedMarks,
        negativeMarks,
        autoSubmitted: false,
      },
    });

    for (const attempt of attempts) {
      if (attempt.selectedAnswer !== null && attempt.selectedAnswer !== undefined) {
        await prisma.mCQAttempt.create({
          data: {
            userId,
            mcqId: attempt.mcqId || `demo-${attempt.questionId}`,
            quizSessionId: sessionId,
            selectedAnswer: attempt.selectedAnswer,
            isCorrect: attempt.isCorrect || false,
            marksObtained: attempt.isCorrect ? 1 : 0,
            negativeMarks: attempt.isCorrect ? 0 : 0.33,
            timeSpent: attempt.timeSpent || 0,
            isMarkedForReview: attempt.isMarkedForReview || false,
          },
        });
      }
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}