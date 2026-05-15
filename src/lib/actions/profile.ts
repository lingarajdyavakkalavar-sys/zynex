'use server';

import { prisma } from '@/lib/db';
import { isAuthEnabled } from '@/lib/auth-config';
import { revalidatePath } from 'next/cache';

function getUserId(): string {
  return 'demo-user-123';
}

export async function getUserProfile() {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  return user;
}

export async function updateUserProfile(data: {
  name?: string;
  examType?: 'GATE' | 'CAT';
  targetExam?: string;
  phone?: string;
  bio?: string;
}) {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error('Not authenticated');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  revalidatePath('/dashboard');
  return user;
}

export async function updateStudyStreak() {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const lastActive = user.lastActiveAt;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let newStreak = user.streakDays;
  
  if (lastActive) {
    const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
    } else if (diffDays === 1) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      streakDays: newStreak,
      lastActiveAt: now,
    },
  });

  return { streak: newStreak };
}

export async function getStudyAnalytics(userId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklySessions = await prisma.studyTimer.findMany({
    where: {
      userId,
      startTime: { gte: weekAgo },
    },
  });

  const weeklyHours = weeklySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600;

  const progressStats = await prisma.topicProgress.findMany({
    where: { userId },
  });

  const completedTopics = progressStats.filter(p => p.status === 'COMPLETED').length;
  const totalTimeSpent = progressStats.reduce((acc, p) => acc + p.timeSpent, 0);

  const mcqStats = await prisma.mCQAttempt.findMany({
    where: { userId },
  });

  const totalAttempts = mcqStats.length;
  const correctAttempts = mcqStats.filter(a => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return {
    weeklyHours: Math.round(weeklyHours * 10) / 10,
    totalStudyHours: Math.round(totalTimeSpent / 3600),
    completedTopics,
    totalTopicsTracked: progressStats.length,
    streakDays: user?.streakDays || 0,
    mcqStats: {
      totalAttempts,
      correctAttempts,
      accuracy,
    },
  };
}