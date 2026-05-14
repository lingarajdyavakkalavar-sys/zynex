'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function startStudyTimer(gateTopicId?: string, sessionType: string = 'study') {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

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
      topicId: gateTopicId,
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
  
  let totalDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
  
  if (timer.pausedAt) {
    const pausedDuration = Math.floor((now.getTime() - new Date(timer.pausedAt).getTime()) / 1000);
    totalDuration = totalDuration - pausedDuration + timer.totalPaused;
  } else {
    totalDuration = totalDuration - timer.totalPaused;
  }

  const updatedTimer = await prisma.studyTimer.update({
    where: { id: timerId },
    data: {
      isActive: false,
      endTime: now,
      duration: totalDuration,
      pausedAt: null,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      studyHours: {
        increment: totalDuration / 3600,
      },
    },
  });

  if (timer.topicId) {
    const existingProgress = await prisma.topicProgress.findUnique({
      where: {
        userId_gateTopicId: {
          userId,
          gateTopicId: timer.topicId,
        },
      },
    });

    if (existingProgress) {
      await prisma.topicProgress.update({
        where: { id: existingProgress.id },
        data: {
          timeSpent: existingProgress.timeSpent + Math.floor(totalDuration / 60),
          lastStudiedAt: now,
        },
      });
    } else {
      await prisma.topicProgress.create({
        data: {
          userId,
          gateTopicId: timer.topicId,
          timeSpent: Math.floor(totalDuration / 60),
          lastStudiedAt: now,
          examType: 'GATE',
        },
      });
    }
  }

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
  });

  return timers;
}

export async function getStudyStats(userId: string) {
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTimers = completedTimers.filter(t => 
    new Date(t.startTime) >= today
  );
  const todaySeconds = todayTimers.reduce((acc, t) => acc + t.duration, 0);
  const todayHours = todaySeconds / 3600;

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