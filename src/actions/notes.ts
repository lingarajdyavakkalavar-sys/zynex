'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getRevisionNotes(topicId?: string) {
  const { userId } = auth();
  if (!userId) return [];

  return prisma.revisionNote.findMany({
    where: { userId, ...(topicId && { topicId }) },
    include: { topic: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createRevisionNote(data: {
  topicId: string;
  title: string;
  content: string;
  tags?: string[];
}) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const note = await prisma.revisionNote.create({
    data: {
      ...data,
      userId,
      tags: data.tags || [],
    },
    include: { topic: true },
  });

  revalidatePath('/notebook');
  return note;
}

export async function updateRevisionNote(id: string, data: { title?: string; content?: string; tags?: string[] }) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const note = await prisma.revisionNote.update({
    where: { id, userId },
    data,
    include: { topic: true },
  });

  revalidatePath('/notebook');
  return note;
}

export async function deleteRevisionNote(id: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.revisionNote.delete({ where: { id, userId } });
  revalidatePath('/notebook');
}

export async function getFlashcards(topicId?: string) {
  const { userId } = auth();
  if (!userId) return [];

  return prisma.flashcard.findMany({
    where: { userId, ...(topicId && { topicId }) },
    include: { topic: true },
    orderBy: { nextReview: 'asc' },
  });
}

export async function createFlashcard(data: { topicId: string; front: string; back: string; difficulty?: string }) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.flashcard.create({
    data: {
      ...data,
      userId,
      difficulty: data.difficulty as any || 'MEDIUM',
    },
    include: { topic: true },
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

export async function getFormulaSheets(topicId?: string) {
  const { userId } = auth();
  if (!userId) return [];

  return prisma.formulaSheet.findMany({
    where: { userId, ...(topicId && { topicId }) },
    include: { topic: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createFormulaSheet(data: { topicId: string; title: string; formulas: any }) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  return prisma.formulaSheet.create({
    data: {
      ...data,
      userId,
    },
    include: { topic: true },
  });
}