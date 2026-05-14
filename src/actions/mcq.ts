'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getMCQsByTopic(topicId: string) {
  return prisma.mCQ.findMany({
    where: { topicId },
    include: { options: { orderBy: { index: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMCQsForQuiz(params: {
  topicIds?: string[];
  limit?: number;
  difficulty?: string;
  examType?: string;
}) {
  const { topicIds, limit = 10, difficulty, examType } = params;

  return prisma.mCQ.findMany({
    where: {
      ...(topicIds && topicIds.length > 0 && { topicId: { in: topicIds } }),
      ...(difficulty && { difficulty: difficulty as any }),
      ...(examType && { examType: examType as any }),
    },
    include: {
      options: { orderBy: { index: 'asc' } },
      topic: true,
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createMCQ(data: {
  topicId: string;
  question: string;
  difficulty?: string;
  examType?: string;
  section?: string;
  marks?: number;
  negativeMarks?: number;
  year?: number;
  isPreviousYear?: boolean;
  questionType?: string;
  answer?: string;
  options: { text: string; index: number }[];
  explanation?: string;
}) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const { options, ...mcqData } = data;

  return prisma.mCQ.create({
    data: {
      ...mcqData,
      difficulty: mcqData.difficulty as any || 'MEDIUM',
      examType: mcqData.examType as any || 'UNIVERSITY',
      correctIndex: options.findIndex(o => o.index === 0) + 1 || 1,
      options: { create: options },
    },
    include: { options: true },
  });
}

export async function updateTopicProgress(topicId: string, status: string, masteryScore?: number) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.topicProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: {
      status: status as any,
      ...(masteryScore !== undefined && { masteryScore }),
      lastStudiedAt: new Date(),
    },
    create: {
      userId,
      topicId,
      status: status as any,
      masteryScore: masteryScore || 0,
      lastStudiedAt: new Date(),
    },
  });
}

export async function saveQuizAttempt(data: {
  mcqId: string;
  selectedIndex: number | null;
  isCorrect: boolean;
  timeSpent: number;
  quizSessionId?: string;
}) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.mCQAttempt.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function createQuizSession(data: {
  mode: string;
  topicIds: string[];
  totalQuestions: number;
  duration: number;
}) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.quizSession.create({
    data: {
      userId,
      mode: data.mode as any,
      topicIds: data.topicIds,
      totalQuestions: data.totalQuestions,
      duration: data.duration,
    },
  });
}

export async function completeQuizSession(id: string, correctCount: number) {
  const session = await prisma.quizSession.update({
    where: { id },
    data: {
      correctCount,
      completedAt: new Date(),
    },
  });
  revalidatePath('/practice');
  return session;
}

export async function getQuizHistory(limit = 20) {
  const { userId } = auth();
  if (!userId) return [];

  return prisma.quizSession.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: limit,
    include: {
      _count: { select: { attempts: true } },
    },
  });
}

export async function getUserMCQAnalytics() {
  const { userId } = auth();
  if (!userId) return null;

  const [total, correct, byTopic, byDifficulty] = await Promise.all([
    prisma.mCQAttempt.count({ where: { userId } }),
    prisma.mCQAttempt.count({ where: { userId, isCorrect: true } }),
    prisma.mCQAttempt.groupBy({
      by: ['mcqId'],
      where: { userId },
      _count: true,
    }),
    prisma.mCQAttempt.findMany({
      where: { userId },
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