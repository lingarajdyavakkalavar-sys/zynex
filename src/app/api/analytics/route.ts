import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalTopics,
      completedTopics,
      totalAttempts,
      correctAttempts,
      userData,
      totalMcqs,
      weakTopics,
      recentSessions,
      dailyStats,
    ] = await Promise.all([
      // Total topics for user's exam type
      prisma.user.findUnique({
        where: { id: userId },
        select: { examType: true },
      }).then(async (user) => {
        const count = await prisma.topic.count({
          where: { examType: user?.examType || 'GATE' },
        });
        return count;
      }),

      // Completed topics
      prisma.topicProgress.count({
        where: { userId, status: 'COMPLETED' },
      }),

      // Total MCQ attempts
      prisma.mCQAttempt.count({
        where: { userId },
      }),

      // Correct attempts
      prisma.mCQAttempt.count({
        where: { userId, isCorrect: true },
      }),

      // Study hours
      prisma.user.findUnique({
        where: { id: userId },
        select: { studyHours: true, streakDays: true },
      }),
      prisma.mCQ.count(),

      // Weak topics (most wrong answers)
      prisma.mCQAttempt.groupBy({
        by: ['mcqId'],
        where: { userId, isCorrect: false },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Recent quiz sessions
      prisma.quizSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: { _count: { select: { attempts: true } } },
      }),

      // Daily study stats (last 7 days)
      prisma.studyTimer.findMany({
        where: {
          userId,
          startTime: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { startTime: true, duration: true },
      }),
    ]);

    // Process weak topics
    const weakTopicIds = weakTopics.map(w => w.mcqId);
    const topicsWithMcqs = await prisma.mCQ.findMany({
      where: { id: { in: weakTopicIds } },
      include: { topic: true },
    });

    const weakTopicsWithCount = weakTopics.map(w => {
      const mcq = topicsWithMcqs.find(t => t.id === w.mcqId);
      return {
        topicId: mcq?.topicId,
        topicName: mcq?.topic?.title,
        wrongCount: w._count.id,
      };
    });

    // Process daily stats
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

    // Calculate readiness score
    const readinessScore = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Overall stats
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
      weakTopics: weakTopicsWithCount.filter(t => t.topicName),
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        mode: s.mode,
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