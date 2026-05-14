'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getSyllabusBySubject(subjectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.syllabus.findFirst({
    where: { subjectId, isPublished: true },
    include: {
      subject: true,
      units: {
        orderBy: { order: 'asc' },
        include: {
          topics: {
            orderBy: { order: 'asc' },
            include: {
              _count: { select: { mcqs: true } },
            },
          },
        },
      },
    },
  });
}

export async function getAllSyllabi(filters?: {
  examType?: string;
  subjectId?: string;
  isPublished?: boolean;
}) {
  return prisma.syllabus.findMany({
    where: {
      ...(filters?.isPublished !== undefined && { isPublished: filters.isPublished }),
      ...(filters?.examType && { examType: filters.examType as any }),
      ...(filters?.subjectId && { subjectId: filters.subjectId }),
    },
    include: {
      subject: true,
      _count: { select: { units: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createSyllabus(data: {
  title: string;
  description?: string;
  subjectId: string;
  sourceType?: string;
  sourceUrl?: string;
  fileName?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== 'ADMIN') throw new Error('Forbidden');

  return prisma.syllabus.create({
    data: {
      ...data,
      sourceType: data.sourceType as any || 'PASTED_TEXT',
    },
    include: { subject: true },
  });
}

export async function updateSyllabus(id: string, data: {
  title?: string;
  description?: string;
  isPublished?: boolean;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== 'ADMIN') throw new Error('Forbidden');

  const syllabus = await prisma.syllabus.update({
    where: { id },
    data,
    include: { subject: true },
  });

  revalidatePath('/admin');
  return syllabus;
}

export async function deleteSyllabus(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== 'ADMIN') throw new Error('Forbidden');

  await prisma.syllabus.delete({ where: { id } });
  revalidatePath('/admin');
}

export async function createUnit(syllabusId: string, data: { title: string; order: number }) {
  return prisma.unit.create({
    data: { ...data, syllabusId },
    include: { topics: true },
  });
}

export async function createTopic(unitId: string, data: { title: string; order: number; content?: string }) {
  return prisma.topic.create({
    data: { ...data, unitId },
  });
}