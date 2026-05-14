'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function getUserProfile() {
  const { userId } = await auth();
  if (!userId) return null;
  
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
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

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
  const { userId } = await auth();
  if (!userId) return;

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
      // Same day, no change
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      newStreak += 1;
    } else {
      // Streak broken
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
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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
  const mcqStats = await prisma.mCQAttempt.findMany({
    where: { userId },
  });

  const totalAttempts = mcqStats.length;
  const correctAttempts = mcqStats.filter(a => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Get backlog count
  const backlogCount = await prisma.backlogTopic.count({
    where: { userId },
  });

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return {
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
  };
}