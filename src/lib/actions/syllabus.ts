'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export const GATE_CSE_SUBJECTS = [
  'Engineering Mathematics',
  'Digital Logic',
  'Computer Organization and Architecture',
  'Data Structures and Algorithms',
  'Theory of Computation',
  'Operating System',
  'Database Management Systems',
  'Computer Networks',
  'Compiler Design',
  'Software Engineering',
  'Web Technologies',
];

export const CAT_SECTIONS_DATA = [
  {
    section: 'VARC',
    name: 'Verbal Ability and Reading Comprehension',
    topics: ['Reading Comprehension', 'Verbal Ability', 'Para Jumbles', 'Sentence Correction', 'Para Summary'],
  },
  {
    section: 'DILR',
    name: 'Data Interpretation and Logical Reasoning',
    topics: ['Data Interpretation', 'Logical Reasoning', 'Arrangement', 'Puzzles', 'Caselets'],
  },
  {
    section: 'QA',
    name: 'Quantitative Ability',
    topics: ['Number System', 'Algebra', 'Geometry', 'Arithmetic', 'Modern Math'],
  },
];

export async function getGATESubjectsWithProgress(branchCode: string, userId: string) {
  const branch = await prisma.gATEBranch.findUnique({ where: { code: branchCode } });
  if (!branch) return [];

  const subjects = await prisma.gATESubject.findMany({
    where: { branchId: branch.id },
    include: {
      topics: true,
    },
  });

  return subjects;
}

export async function getCATSectionsWithProgress(userId: string) {
  const sections = await prisma.cATSection.findMany({
    include: {
      subsections: {
        include: {
          topics: true,
        },
      },
    },
  });

  return sections;
}

export async function getSyllabusProgress(examType: 'GATE' | 'CAT', userId: string) {
  const whereClause = examType === 'GATE' ? { examType: 'GATE' as const } : { examType: 'CAT' as const };
  
  const progress = await prisma.topicProgress.findMany({
    where: { userId, ...whereClause },
  });

  return progress;
}

export async function updateTopicProgress(data: {
  topicId: string;
  examType: 'GATE' | 'CAT';
  status: string;
  masteryScore?: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  if (data.examType === 'GATE') {
    const topicProgress = await prisma.topicProgress.upsert({
      where: { userId_gateTopicId: { userId, gateTopicId: data.topicId } },
      update: {
        status: data.status as any,
        masteryScore: data.masteryScore ?? undefined,
        lastStudiedAt: new Date(),
      },
      create: {
        userId,
        examType: data.examType,
        status: data.status as any,
        masteryScore: data.masteryScore ?? 0,
        gateTopicId: data.topicId,
      },
    });

    revalidatePath('/dashboard');
    return topicProgress;
  }

  return null;
}