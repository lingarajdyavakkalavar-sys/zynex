'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getStudyPlanner() {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.studyPlanner.findFirst({
    where: { userId, isActive: true },
    include: {
      dailyTargets: {
        orderBy: { date: 'asc' },
        take: 30,
      },
    },
  });
}

export async function createStudyPlanner(data: {
  title: string;
  targetDate: Date;
  dailyHours: number;
  examType: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.studyPlanner.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const planner = await prisma.studyPlanner.create({
    data: { ...data, userId, examType: data.examType as any },
    include: { dailyTargets: true },
  });

  revalidatePath('/planner');
  return planner;
}

export async function updateDailyTarget(plannerId: string, date: Date, completedHours: number) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return prisma.dailyTarget.upsert({
    where: {
      plannerId_date: {
        plannerId,
        date: targetDate,
      },
    },
    update: { completedHours },
    create: {
      plannerId,
      date: targetDate,
      targetHours: 4,
      completedHours,
      topics: [],
    },
  });
}

export async function calculateReadinessScore() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      topicProgress: {
        include: { topic: { include: { unit: { include: { syllabus: { include: { subject: true } } } } } } },
      },
      mcqAttempts: true,
    },
  });

  if (!user) return null;

  const totalTopics = user.topicProgress.length;
  const completedTopics = user.topicProgress.filter(p => p.status === 'COMPLETED').length;
  const totalAttempts = user.mcqAttempts.length;
  const correctAttempts = user.mcqAttempts.filter(a => a.isCorrect).length;

  const topicScore = totalTopics > 0 ? (completedTopics / totalTopics) * 50 : 0;
  const mcqScore = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 30 : 0;
  const studyHoursScore = Math.min((user.studyHours / 100) * 20, 20);

  const readiness = Math.round(topicScore + mcqScore + studyHoursScore);

  await prisma.readinessScore.upsert({
    where: { userId_subjectId: { userId, subjectId: 'overall' } },
    update: { score: readiness },
    create: {
      userId,
      subjectId: 'overall',
      score: readiness,
    },
  });

  return readiness;
}

export async function getBacklogTopics() {
  const { userId } = await auth();
  if (!userId) return [];

  return prisma.backlogTopic.findMany({
    where: { userId },
    include: { topic: true },
    orderBy: { priority: 'asc' },
  });
}

export async function addToBacklog(topicId: string, reason?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.backlogTopic.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { reason },
    create: { userId, topicId, reason },
    include: { topic: true },
  });
}

export async function removeFromBacklog(topicId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.backlogTopic.delete({
    where: { userId_topicId: { userId, topicId } },
  });
  revalidatePath('/planner');
}