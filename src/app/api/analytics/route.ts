import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get weekly study sessions
    const weeklySessions = await prisma.studySession.findMany({
      where: {
        userId,
        startTime: { gte: weekAgo },
      },
    });

    const weeklyHours = weeklySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;

    // Get topic progress stats
    const progressStats = await prisma.topicProgress.findMany({
      where: { userId },
    });

    const completedTopics = progressStats.filter(p => p.status === 'COMPLETED').length;
    const totalTimeSpent = progressStats.reduce((acc, p) => acc + p.timeSpent, 0);

    // Get MCQ stats
    const mcqAttempts = await prisma.mCQAttempt.findMany({
      where: { userId },
    });

    const totalAttempts = mcqAttempts.length;
    const correctAttempts = mcqAttempts.filter(a => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Get backlog count
    const backlogCount = await prisma.backlogTopic.count({
      where: { userId },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json({
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      totalStudyHours: Math.round(totalTimeSpent / 60),
      completedTopics,
      totalTopicsTracked: progressStats.length,
      backlogCount,
      streakDays: user?.streakDays || 0,
      mcqStats: {
        totalAttempts,
        correctAttempts,
        accuracy,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}