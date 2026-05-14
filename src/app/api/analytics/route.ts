import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { examType: true, studyHours: true, streakDays: true },
    });

    const examType = userData?.examType || 'GATE';

    const [
      totalTopics,
      completedTopics,
      totalAttempts,
      correctAttempts,
      totalMcqs,
      weakTopics,
      recentSessions,
      dailyStats,
    ] = await Promise.all([
      examType === 'GATE'
        ? prisma.gATETopic.count()
        : prisma.cATTopic.count(),

      prisma.topicProgress.count({
        where: { userId, examType },
      }),

      prisma.mCQAttempt.count({
        where: { userId },
      }),

      prisma.mCQAttempt.count({
        where: { userId, isCorrect: true },
      }),

      prisma.mCQ.count(),

      prisma.mCQAttempt.groupBy({
        by: ['mcqId'],
        where: { userId, isCorrect: false },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      prisma.quizSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: { _count: { select: { attempts: true } } },
      }),

      prisma.studyTimer.findMany({
        where: {
          userId,
          startTime: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { startTime: true, duration: true },
      }),
    ]);

    let weakTopicsData: { topicId: string | null; topicName: string | null; wrongCount: number }[] = [];

    if (weakTopics.length > 0) {
      const weakTopicIds = weakTopics.map(w => w.mcqId);
      const mcqs = await prisma.mCQ.findMany({
        where: { id: { in: weakTopicIds } },
        select: {
          id: true,
          gateTopicId: true,
          catTopicId: true,
        },
      });

      weakTopicsData = weakTopics.map(w => {
        const mcq = mcqs.find(m => m.id === w.mcqId);
        const topicId = examType === 'GATE' ? (mcq?.gateTopicId ?? null) : (mcq?.catTopicId ?? null);
        return {
          topicId,
          topicName: null as string | null,
          wrongCount: w._count.id,
        };
      });
    }

    const dailyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('en-US', { weekday: 'short' });
      dailyMap.set(key, 0);
    }
    dailyStats.forEach(t => {
      const key = new Date(t.startTime).toLocaleDateString('en-US', { weekday: 'short' });
      const current = dailyMap.get(key) || 0;
      dailyMap.set(key, current + t.duration / 3600);
    });
    const dailyStudyStats = Array.from(dailyMap.entries()).map(([day, hours]) => ({
      day,
      hours: Math.round(hours * 10) / 10,
    }));

    const readinessScore = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    const stats = {
      readinessScore,
      completedTopics,
      totalTopics,
      completionPercentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      totalAttempts,
      correctAttempts,
      accuracy,
      totalMcqs,
      availableMcqs: totalMcqs - totalAttempts,
      studyHours: userData?.studyHours || 0,
      streakDays: userData?.streakDays || 0,
      weakTopics: weakTopicsData.filter(t => t.topicName),
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        mode: s.mode,
        examType: s.examType,
        totalQuestions: s.totalQuestions,
        correctCount: s.correctCount,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        attemptCount: s._count.attempts,
        accuracy: s.totalQuestions > 0 ? Math.round((s.correctCount / s.totalQuestions) * 100) : 0,
      })),
      dailyStudyStats,
      weeklyTotal: dailyStudyStats.reduce((sum, d) => sum + d.hours, 0),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}