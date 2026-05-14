'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getRevisionNotes(topicId?: string) {
  const { userId } = await auth();
  if (!userId) return [];

  return prisma.revisionNote.findMany({
    where: { userId, ...(topicId && { topicId }) },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createRevisionNote(data: {
  topicId?: string;
  title: string;
  content: string;
  tags?: string[];
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.revisionNote.create({
    data: {
      ...data,
      userId,
      tags: data.tags || [],
    },
  });
}

export async function updateRevisionNote(id: string, data: { title?: string; content?: string; tags?: string[] }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.revisionNote.update({
    where: { id, userId },
    data,
  });
}

export async function deleteRevisionNote(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.revisionNote.delete({ where: { id, userId } });
  revalidatePath('/notebook');
}

export async function getFlashcards(topicId?: string) {
  const { userId } = await auth();
  if (!userId) return [];

  return prisma.flashcard.findMany({
    where: { userId, ...(topicId && { topicId }) },
    orderBy: { nextReview: 'asc' },
  });
}

export async function createFlashcard(data: { topicId?: string; front: string; back: string; difficulty?: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.flashcard.create({
    data: {
      ...data,
      userId,
      difficulty: data.difficulty as any || 'MEDIUM',
    },
  });
}

export async function updateFlashcardReview(id: string, wasCorrect: boolean) {
  const card = await prisma.flashcard.findUnique({ where: { id } });
  if (!card) throw new Error('Not found');

  const nextReview = new Date();
  const daysToAdd = wasCorrect ? card.difficulty === 'EASY' ? 7 : card.difficulty === 'MEDIUM' ? 3 : 1 : 1;
  nextReview.setDate(nextReview.getDate() + daysToAdd);

  return prisma.flashcard.update({
    where: { id },
    data: { nextReview },
  });
}