'use server';

import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getDashboardAnalytics() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      topicProgress: {
        include: { topic: { include: { unit: { include: { syllabus: { include: { subject: true } } } } } } },
      },
      mcqAttempts: {
        orderBy: { attemptedAt: 'desc' },
        take: 100,
        include: { mcq: true },
      },
      studyPlanners: {
        include: { dailyTargets: { take: 7, orderBy: { date: 'desc' } } },
      },
      backlogTopics: { include: { topic: true } },
    },
  });

  if (!user) return null;

  const totalTopics = await prisma.topic.count({
    where: {
      unit: {
        syllabus: {
          subject: {
            semester: { branchId: user.branchId || undefined },
          },
        },
      },
    },
  });

  const completedTopics = user.topicProgress.filter(p => p.status === 'COMPLETED').length;
  const inProgressTopics = user.topicProgress.filter(p => p.status === 'IN_PROGRESS').length;

  const totalAttempts = user.mcqAttempts.length;
  const correctAttempts = user.mcqAttempts.filter(a => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  const recentAttempts = user.mcqAttempts.slice(0, 20);
  const weakTopics = recentAttempts
    .filter(a => !a.isCorrect)
    .map(a => a.mcq?.topicId)
    .filter(Boolean)
    .reduce((acc, topicId) => {
      acc[topicId!] = (acc[topicId!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const upcomingExams = user.studyPlanners
    .filter(p => p.isActive)
    .map(p => ({
      id: p.id,
      title: p.title,
      targetDate: p.targetDate,
      daysLeft: Math.ceil((new Date(p.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    }));

  const weeklyStudy = user.studyPlanners[0]?.dailyTargets || [];
  const weeklyHours = weeklyStudy.reduce((sum, t) => sum + t.completedHours, 0);

  return {
    user: {
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      studyHours: Math.round(user.studyHours * 10) / 10,
      streakDays: user.streakDays,
      examType: user.examType,
      targetExam: user.targetExam,
    },
    progress: {
      totalTopics,
      completedTopics,
      inProgressTopics,
      completionPercentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    },
    performance: {
      totalAttempts,
      correctAttempts,
      accuracy,
    },
    weakTopics: Object.entries(weakTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topicId, count]) => ({ topicId, count })),
    backlogCount: user.backlogTopics.length,
    weeklyStudyHours: Math.round(weeklyHours * 10) / 10,
    upcomingExams,
  };
}

export async function getTopicAnalytics(topicId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const [progress, attempts, studyTime] = await Promise.all([
    prisma.topicProgress.findUnique({
      where: { userId_topicId: { userId, topicId } },
    }),
    prisma.mCQAttempt.findMany({
      where: { userId, mcq: { topicId } },
      orderBy: { attemptedAt: 'desc' },
    }),
    prisma.studyTimer.findMany({
      where: { userId, topicId },
      orderBy: { startTime: 'desc' },
      take: 10,
    }),
  ]);

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter(a => a.isCorrect).length;
  const totalStudyTime = studyTime.reduce((sum, t) => sum + t.duration, 0);

  return {
    status: progress?.status || 'NOT_STARTED',
    masteryScore: progress?.masteryScore || 0,
    attempts: totalAttempts,
    accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
    studyTimeMinutes: Math.round(totalStudyTime / 60),
    lastStudied: progress?.lastStudiedAt,
  };
}