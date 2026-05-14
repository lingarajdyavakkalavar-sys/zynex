'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getStudyPlanner() {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.studyPlanner.findFirst({
    where: { userId, isActive: true },
  });
}

export async function createStudyPlanner(data: {
  title: string;
  targetDate: Date;
  dailyHours: number;
  examType: string;
  branchCode?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.studyPlanner.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  return prisma.studyPlanner.create({
    data: { ...data, userId, examType: data.examType as any },
  });
}

export async function calculateReadinessScore() {
  const { userId } = await auth();
  if (!userId) return null;

  const [topicProgress, mcqAttempts, user] = await Promise.all([
    prisma.topicProgress.findMany({ where: { userId } }),
    prisma.mCQAttempt.findMany({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (!user) return null;

  const completedTopics = topicProgress.filter(p => p.status === 'COMPLETED').length;
  const totalAttempts = mcqAttempts.length;
  const correctAttempts = mcqAttempts.filter(a => a.isCorrect).length;

  const topicScore = topicProgress.length > 0 ? (completedTopics / topicProgress.length) * 50 : 0;
  const mcqScore = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 30 : 0;
  const studyHoursScore = Math.min((user.studyHours / 100) * 20, 20);

  return Math.round(topicScore + mcqScore + studyHoursScore);
}