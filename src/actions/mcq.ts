'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { isAuthEnabled } from '@/lib/auth-config';

function getUserId(): string {
  return 'demo-user-123';
}

export async function getMCQsByTopic(gateTopicId: string) {
  return prisma.mCQ.findMany({
    where: { gateTopicId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMCQsForQuiz(params: {
  gateTopicId?: string;
  limit?: number;
  difficulty?: string;
  examType?: string;
  year?: number;
}) {
  const { gateTopicId, limit = 10, difficulty, examType, year } = params;

  return prisma.mCQ.findMany({
    where: {
      ...(gateTopicId && { gateTopicId }),
      ...(difficulty && { difficulty: difficulty as any }),
      ...(examType && { examType: examType as any }),
      ...(year && { year }),
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createMCQ(data: {
  gateTopicId?: string;
  question: string;
  options: any;
  correctAnswer: number;
  difficulty?: string;
  examType?: string;
  marks?: number;
  negativeMarks?: number;
  year?: number;
  isPreviousYear?: boolean;
  questionType?: string;
  explanation?: string;
}) {
  return prisma.mCQ.create({
    data: {
      question: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      difficulty: data.difficulty as any || 'MEDIUM',
      examType: data.examType as any || 'GATE',
      marks: data.marks || 1,
      negativeMarks: data.negativeMarks || 0.33,
      isPreviousYear: data.isPreviousYear || false,
      questionType: (data.questionType as any) || 'MCQ',
      gateTopicId: data.gateTopicId,
      year: data.year,
      explanation: data.explanation,
    },
  });
}

export async function saveQuizAttempt(data: {
  mcqId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  marksObtained: number;
  negativeMarks: number;
  timeSpent: number;
  quizSessionId?: string;
  isMarkedForReview?: boolean;
}) {
  const userId = isAuthEnabled() ? null : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error('Unauthorized');
  }

  return prisma.mCQAttempt.create({
    data: {
      userId: userId!,
      ...data,
    },
  });
}

export async function createQuizSession(data: {
  examType: string;
  mode: string;
  totalQuestions: number;
  duration: number;
  year?: number;
  branchCode?: string;
  sectionCode?: string;
}) {
  const userId = isAuthEnabled() ? null : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error('Unauthorized');
  }

  return prisma.quizSession.create({
    data: {
      userId: userId!,
      examType: data.examType as any,
      mode: data.mode as any,
      totalQuestions: data.totalQuestions,
      duration: data.duration,
      remainingTime: data.duration,
      year: data.year,
      branchCode: data.branchCode,
      sectionCode: data.sectionCode,
    },
  });
}

export async function completeQuizSession(id: string, correctCount: number, obtainedMarks: number) {
  const session = await prisma.quizSession.update({
    where: { id },
    data: {
      correctCount,
      obtainedMarks,
      status: 'COMPLETED',
      completedAt: new Date(),
      remainingTime: 0,
    },
  });
  revalidatePath('/practice');
  return session;
}

export async function getQuizHistory(limit = 20) {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return [];
  }

  return prisma.quizSession.findMany({
    where: { userId: userId || undefined },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

export async function getUserMCQAnalytics() {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;
  }

  const [total, correct, byDifficulty] = await Promise.all([
    prisma.mCQAttempt.count({ where: { userId: userId || undefined } }),
    prisma.mCQAttempt.count({ where: { userId: userId || undefined, isCorrect: true } }),
    prisma.mCQAttempt.findMany({
      where: { userId: userId || undefined },
      include: { mcq: { select: { difficulty: true } } },
    }),
  ]);

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const difficultyStats = byDifficulty.reduce((acc, attempt) => {
    const diff = attempt.mcq.difficulty;
    if (!acc[diff]) acc[diff] = { total: 0, correct: 0 };
    acc[diff].total++;
    if (attempt.isCorrect) acc[diff].correct++;
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  return {
    totalAttempts: total,
    correctAttempts: correct,
    accuracy,
    difficultyStats,
  };
}