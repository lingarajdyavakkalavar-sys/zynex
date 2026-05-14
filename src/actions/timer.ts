'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function startStudyTimer(topicId?: string, sessionType = 'study') {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.studyTimer.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false, endTime: new Date() },
  });

  return prisma.studyTimer.create({
    data: {
      userId,
      topicId,
      sessionType,
      startTime: new Date(),
      isActive: true,
    },
  });
}

export async function pauseStudyTimer(timerId: string) {
  return prisma.studyTimer.update({
    where: { id: timerId },
    data: {
      isActive: false,
      pausedAt: new Date(),
    },
  });
}

export async function resumeStudyTimer(timerId: string) {
  const timer = await prisma.studyTimer.findUnique({ where: { id: timerId } });
  if (!timer?.pausedAt) throw new Error('Timer not paused');

  const pauseDuration = Math.floor((Date.now() - timer.pausedAt.getTime()) / 1000);

  return prisma.studyTimer.update({
    where: { id: timerId },
    data: {
      isActive: true,
      pausedAt: null,
      totalPaused: { increment: pauseDuration },
    },
  });
}

export async function stopStudyTimer(timerId: string) {
  const timer = await prisma.studyTimer.findUnique({ where: { id: timerId } });
  if (!timer) throw new Error('Timer not found');

  const endTime = new Date();
  const totalSeconds = Math.floor((endTime.getTime() - timer.startTime.getTime()) / 1000);
  const activeSeconds = totalSeconds - (timer.totalPaused || 0);

  await prisma.studyTimer.update({
    where: { id: timerId },
    data: {
      isActive: false,
      endTime,
      duration: activeSeconds,
    },
  });

  if (timer.topicId) {
    await prisma.topicProgress.upsert({
      where: { userId_topicId: { userId: timer.userId, topicId: timer.topicId } },
      update: {
        timeSpent: { increment: activeSeconds },
        lastStudiedAt: endTime,
      },
      create: {
        userId: timer.userId,
        topicId: timer.topicId,
        timeSpent: activeSeconds,
        lastStudiedAt: endTime,
        status: 'IN_PROGRESS',
      },
    });
  }

  await prisma.user.update({
    where: { id: timer.userId },
    data: { studyHours: { increment: activeSeconds / 3600 } },
  });

  revalidatePath('/workspace');
  revalidatePath('/dashboard');
  return timer;
}

export async function getActiveTimer() {
  const { userId } = auth();
  if (!userId) return null;

  return prisma.studyTimer.findFirst({
    where: { userId, isActive: true },
    include: { topic: true },
    orderBy: { startTime: 'desc' },
  });
}

export async function getStudyTimerHistory(limit = 50) {
  const { userId } = auth();
  if (!userId) return [];

  return prisma.studyTimer.findMany({
    where: { userId },
    include: { topic: true },
    orderBy: { startTime: 'desc' },
    take: limit,
  });
}

export async function getStudyStats() {
  const { userId } = auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { studyHours: true, streakDays: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekTimers = await prisma.studyTimer.findMany({
    where: {
      userId,
      startTime: { gte: weekAgo },
    },
  });

  const dailyStats = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekAgo);
    date.setDate(date.getDate() + i);
    const dayTimers = weekTimers.filter(t => {
      const timerDate = new Date(t.startTime);
      return timerDate.toDateString() === date.toDateString();
    });
    const hours = dayTimers.reduce((sum, t) => sum + (t.duration || 0), 0) / 3600;
    return { day: date.toLocaleDateString('en-US', { weekday: 'short' }), hours: Math.round(hours * 10) / 10 };
  });

  return {
    totalHours: Math.round((user?.studyHours || 0) * 10) / 10,
    streakDays: user?.streakDays || 0,
    dailyStats,
    weeklyTotal: dailyStats.reduce((sum, d) => sum + d.hours, 0),
  };
}