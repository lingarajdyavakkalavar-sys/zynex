'use server';

import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getDashboardAnalytics() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      topicProgress: true,
      mcqAttempts: {
        orderBy: { startedAt: 'desc' },
        take: 100,
      },
    },
  });

  if (!user) return null;

  const totalTopics = user.examType === 'GATE'
    ? await prisma.gATETopic.count()
    : await prisma.cATTopic.count();

  const completedTopics = user.topicProgress.filter(p => p.status === 'COMPLETED').length;
  const totalAttempts = user.mcqAttempts.length;
  const correctAttempts = user.mcqAttempts.filter(a => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const isNewUser = totalTopics === 0 && user.topicProgress.length === 0 && totalAttempts === 0;

  return {
    user: {
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      studyHours: Math.round(user.studyHours * 10) / 10,
      streakDays: user.streakDays,
      examType: user.examType,
    },
    progress: {
      totalTopics,
      completedTopics,
      completionPercentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    },
    performance: {
      totalAttempts,
      correctAttempts,
      accuracy,
    },
    weakTopics: [] as { topicId: string; count: number }[],
    weeklyStudyHours: 0,
    isNewUser,
  };
}

export async function getTopicAnalytics(gateTopicId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const progress = await prisma.topicProgress.findUnique({
    where: { userId_gateTopicId: { userId, gateTopicId } },
  });

  const totalStudyTime = await prisma.studyTimer.aggregate({
    where: { userId },
    _sum: { duration: true },
  });

  return {
    status: progress?.status || 'NOT_STARTED',
    masteryScore: progress?.masteryScore || 0,
    attempts: progress?.totalAttempts || 0,
    accuracy: progress?.accuracy || 0,
    studyTimeMinutes: Math.round((totalStudyTime._sum.duration || 0) / 60),
    lastStudied: progress?.lastStudiedAt,
  };
}