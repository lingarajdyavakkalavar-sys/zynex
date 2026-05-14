'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function getGATETopicsForMCQ(options: {
  subjectId?: string;
  difficulty?: string;
  branchCode?: string;
}) {
  const { subjectId, difficulty } = options;

  const where: Record<string, unknown> = {};
  
  if (subjectId) {
    where.subjectId = subjectId;
  }

  const topics = await prisma.gATETopic.findMany({
    where,
    include: {
      subject: true,
    },
  });

  if (topics.length > 0 && difficulty) {
    const mcqs = await prisma.mCQ.findMany({
      where: {
        gateTopicId: { in: topics.map(t => t.id) },
        difficulty: difficulty as any,
      },
    });
    return topics.map(t => ({
      ...t,
      mcqs: mcqs.filter(m => m.gateTopicId === t.id),
    }));
  }

  return topics;
}

export async function getCATTopicsForMCQ(options: {
  subsectionId?: string;
  difficulty?: string;
  sectionCode?: string;
}) {
  const { subsectionId, difficulty } = options;

  const where: Record<string, unknown> = {};
  
  if (subsectionId) {
    where.subsectionId = subsectionId;
  }

  const topics = await prisma.cATTopic.findMany({
    where,
    include: {
      subsection: true,
    },
  });

  if (topics.length > 0 && difficulty) {
    const mcqs = await prisma.mCQ.findMany({
      where: {
        catTopicId: { in: topics.map(t => t.id) },
        difficulty: difficulty as any,
      },
    });
    return topics.map(t => ({
      ...t,
      mcqs: mcqs.filter(m => m.catTopicId === t.id),
    }));
  }

  return topics;
}

export async function getMCQsForQuiz(options: {
  gateTopicIds?: string[];
  catTopicIds?: string[];
  count: number;
  difficulty?: string;
  examType?: string;
}) {
  const { gateTopicIds, catTopicIds, count, difficulty, examType } = options;

  const whereClause: Record<string, unknown> = {};
  
  if (gateTopicIds?.length) {
    whereClause.gateTopicId = { in: gateTopicIds };
  }
  if (catTopicIds?.length) {
    whereClause.catTopicId = { in: catTopicIds };
  }
  if (difficulty) {
    whereClause.difficulty = difficulty as any;
  }
  if (examType) {
    whereClause.examType = examType as any;
  }

  const mcqs = await prisma.mCQ.findMany({
    where: whereClause,
    take: count,
    orderBy: { createdAt: 'desc' },
  });

  return mcqs.sort(() => Math.random() - 0.5);
}

export async function submitMCQAnswer(data: {
  mcqId: string;
  selectedIndex: number;
  timeSpent: number;
  quizSessionId?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const mcq = await prisma.mCQ.findUnique({
    where: { id: data.mcqId },
  });

  if (!mcq) throw new Error('MCQ not found');

  const isCorrect = data.selectedIndex === mcq.correctAnswer;

  await prisma.mCQAttempt.create({
    data: {
      userId,
      mcqId: data.mcqId,
      quizSessionId: data.quizSessionId,
      selectedAnswer: data.selectedIndex,
      isCorrect,
      timeSpent: data.timeSpent,
    },
  });

  revalidatePath('/practice');
  return { isCorrect, correctIndex: mcq.correctAnswer };
}

export async function getQuizHistory(limit: number = 10) {
  const { userId } = await auth();
  if (!userId) return [];

  const sessions = await prisma.quizSession.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: limit,
    include: {
      _count: { select: { attempts: true } },
    },
  });

  return sessions;
}