'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function startStudyTimer(topicId?: string, sessionType: string = 'study') {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  // Check if there's an active timer already
  const existingTimer = await prisma.studyTimer.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });

  if (existingTimer) {
    throw new Error('A timer is already running. Please pause or stop it first.');
  }

  const timer = await prisma.studyTimer.create({
    data: {
      userId,
      topicId,
      sessionType,
      startTime: new Date(),
      isActive: true,
    },
  });

  return timer;
}

export async function pauseStudyTimer(timerId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const timer = await prisma.studyTimer.findUnique({
    where: { id: timerId },
  });

  if (!timer || timer.userId !== userId) {
    throw new Error('Timer not found or access denied');
  }

  const now = new Date();
  const additionalPausedTime = timer.pausedAt 
    ? Math.floor((now.getTime() - new Date(timer.pausedAt).getTime()) / 1000)
    : 0;

  return await prisma.studyTimer.update({
    where: { id: timerId },
    data: {
      isActive: false,
      pausedAt: now,
      totalPaused: timer.totalPaused + additionalPausedTime,
    },
  });
}

export async function resumeStudyTimer(timerId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const timer = await prisma.studyTimer.findUnique({
    where: { id: timerId },
  });

  if (!timer || timer.userId !== userId) {
    throw new Error('Timer not found or access denied');
  }

  // Calculate paused duration before resuming
  const pausedDuration = timer.pausedAt
    ? Math.floor((new Date().getTime() - new Date(timer.pausedAt).getTime()) / 1000)
    : 0;

  return await prisma.studyTimer.update({
    where: { id: timerId },
    data: {
      isActive: true,
      totalPaused: timer.totalPaused + pausedDuration,
      pausedAt: null,
    },
  });
}

export async function stopStudyTimer(timerId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const timer = await prisma.studyTimer.findUnique({
    where: { id: timerId },
  });

  if (!timer || timer.userId !== userId) {
    throw new Error('Timer not found or access denied');
  }

  const now = new Date();
  const startTime = new Date(timer.startTime);
  
  // Calculate total duration
  let totalDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
  
  // If paused, add the paused time before stopping
  if (timer.pausedAt) {
    const pausedDuration = Math.floor((now.getTime() - new Date(timer.pausedAt).getTime()) / 1000);
    totalDuration = totalDuration - pausedDuration + timer.totalPaused;
  } else {
    totalDuration = totalDuration - timer.totalPaused;
  }

  // Update the timer
  const updatedTimer = await prisma.studyTimer.update({
    where: { id: timerId },
    data: {
      isActive: false,
      endTime: now,
      duration: totalDuration,
      pausedAt: null,
    },
  });

  // Update user's total study hours
  await prisma.user.update({
    where: { id: userId },
    data: {
      studyHours: {
        increment: totalDuration / 3600, // Convert seconds to hours
      },
    },
  });

  // If there's a topic, update its progress
  if (timer.topicId) {
    const existingProgress = await prisma.topicProgress.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId: timer.topicId,
        },
      },
    });

    if (existingProgress) {
      await prisma.topicProgress.update({
        where: { id: existingProgress.id },
        data: {
          timeSpent: existingProgress.timeSpent + Math.floor(totalDuration / 60),
          lastStudiedAt: now,
          status: 'IN_PROGRESS',
        },
      });
    } else {
      await prisma.topicProgress.create({
        data: {
          userId,
          topicId: timer.topicId,
          timeSpent: Math.floor(totalDuration / 60),
          lastStudiedAt: now,
          status: 'IN_PROGRESS',
        },
      });
    }
  }

  // Create activity log
  await prisma.activityLog.create({
    data: {
      userId,
      action: 'study_timer_completed',
      details: {
        timerId,
        topicId: timer.topicId,
        duration: totalDuration,
        sessionType: timer.sessionType,
      },
    },
  });

  revalidatePath('/workspace');
  return updatedTimer;
}

export async function getActiveTimer() {
  const { userId } = await auth();
  if (!userId) return null;

  const timer = await prisma.studyTimer.findFirst({
    where: {
      userId,
      isActive: true,
    },
    include: {
      topic: true,
    },
  });

  return timer;
}

export async function getTimerHistory(limit: number = 20) {
  const { userId } = await auth();
  if (!userId) return [];

  const timers = await prisma.studyTimer.findMany({
    where: {
      userId,
      endTime: { not: null },
    },
    orderBy: { startTime: 'desc' },
    take: limit,
    include: {
      topic: true,
    },
  });

  return timers;
}

export async function getStudyStats(userId: string) {
  // Get total study time
  const completedTimers = await prisma.studyTimer.findMany({
    where: {
      userId,
      endTime: { not: null },
    },
    select: {
      duration: true,
      startTime: true,
    },
  });

  const totalSeconds = completedTimers.reduce((acc, t) => acc + t.duration, 0);
  const totalHours = totalSeconds / 3600;

  // Get today's study time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTimers = completedTimers.filter(t => 
    new Date(t.startTime) >= today
  );
  const todaySeconds = todayTimers.reduce((acc, t) => acc + t.duration, 0);
  const todayHours = todaySeconds / 3600;

  // Get this week's study time
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekTimers = completedTimers.filter(t => 
    new Date(t.startTime) >= weekAgo
  );
  const weekSeconds = weekTimers.reduce((acc, t) => acc + t.duration, 0);
  const weekHours = weekSeconds / 3600;

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    todayHours: Math.round(todayHours * 10) / 10,
    weekHours: Math.round(weekHours * 10) / 10,
    sessionCount: completedTimers.length,
  };
}