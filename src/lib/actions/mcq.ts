'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function getTopicsForMCQ(options: {
  examType?: string;
  branchId?: string;
  difficulty?: string;
  topicId?: string;
}) {
  const { examType, difficulty, topicId } = options;

  const where: Record<string, unknown> = {};
  
  if (topicId) {
    where.id = topicId;
  }

  const topics = await prisma.topic.findMany({
    where,
    include: {
      unit: {
        include: {
          syllabus: {
            include: {
              subject: {
                include: {
                  semester: {
                    include: {
                      branch: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      mcqs: {
        where: {
          ...(examType ? { examType: examType as any } : {}),
          ...(difficulty ? { difficulty: difficulty as any } : {}),
        },
      },
    },
  });

  return topics;
}

export async function getMCQsForQuiz(options: {
  topicIds: string[];
  count: number;
  difficulty?: string;
  examType?: string;
}) {
  const { topicIds, count, difficulty, examType } = options;

  const mcqs = await prisma.mCQ.findMany({
    where: {
      topicId: { in: topicIds },
      ...(difficulty ? { difficulty: difficulty as any } : {}),
      ...(examType ? { examType: examType as any } : {}),
    },
    include: {
      options: { orderBy: { index: 'asc' } },
      topic: true,
    },
    take: count,
    orderBy: { createdAt: 'desc' },
  });

  // Shuffle the MCQs
  return mcqs.sort(() => Math.random() - 0.5);
}

export async function startQuizSession(data: {
  mode: 'PRACTICE' | 'TIMED_TEST' | 'REVISION';
  topicIds: string[];
  totalQuestions: number;
  duration?: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const session = await prisma.quizSession.create({
    data: {
      userId,
      mode: data.mode,
      topicIds: data.topicIds,
      totalQuestions: data.totalQuestions,
      duration: data.duration || 0,
    },
  });

  return session;
}

export async function submitMCQAnswer(data: {
  mcqId: string;
  selectedIndex: number;
  timeSpent: number;
  quizSessionId?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  // Get the MCQ to check the answer
  const mcq = await prisma.mCQ.findUnique({
    where: { id: data.mcqId },
  });

  if (!mcq) throw new Error('MCQ not found');

  const isCorrect = data.selectedIndex === mcq.correctIndex;

  const attempt = await prisma.mCQAttempt.create({
    data: {
      userId,
      mcqId: data.mcqId,
      quizSessionId: data.quizSessionId,
      selectedIndex: data.selectedIndex,
      isCorrect,
      timeSpent: data.timeSpent,
    },
  });

  revalidatePath('/practice');
  return { attempt, isCorrect, correctIndex: mcq.correctIndex };
}

export async function completeQuizSession(sessionId: string, correctCount: number) {
  const session = await prisma.quizSession.update({
    where: { id: sessionId },
    data: {
      completedAt: new Date(),
      correctCount,
    },
  });

  return session;
}

export async function getQuizHistory(limit: number = 10) {
  const { userId } = await auth();
  if (!userId) return [];

  const sessions = await prisma.quizSession.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: limit,
    include: {
      attempts: {
        include: {
          mcq: {
            include: {
              topic: true,
            },
          },
        },
      },
    },
  });

  return sessions;
}

export async function getWeakTopics(threshold: number = 60) {
  const { userId } = await auth();
  if (!userId) return [];

  // Get all MCQ attempts grouped by topic
  const attempts = await prisma.mCQAttempt.groupBy({
    by: ['mcqId'],
    where: { userId },
    _count: true,
    _avg: { isCorrect: true },
  });

  // Get weak topic IDs (accuracy below threshold)
  const weakMcqIds = attempts
    .filter(a => (a._avg.isCorrect || 0) * 100 < threshold)
    .map(a => a.mcqId);

  // Get the topics for these MCQs
  const mcqs = await prisma.mCQ.findMany({
    where: { id: { in: weakMcqIds } },
    include: {
      topic: {
        include: {
          unit: {
            include: {
              syllabus: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Group by topic
  const topicMap = new Map();
  mcqs.forEach(mcq => {
    if (!topicMap.has(mcq.topicId)) {
      topicMap.set(mcq.topicId, {
        topic: mcq.topic,
        mcqCount: 0,
        totalAttempts: 0,
        accuracy: 0,
      });
    }
    const data = topicMap.get(mcq.topicId);
    data.mcqCount++;
  });

  return Array.from(topicMap.values());
}