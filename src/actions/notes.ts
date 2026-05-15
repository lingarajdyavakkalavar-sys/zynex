'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { isAuthEnabled } from '@/lib/auth-config';

function getUserId(): string {
  return 'demo-user-123';
}

export async function getRevisionNotes(topicId?: string) {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return [];
  }

  return prisma.revisionNote.findMany({
    where: { userId: userId || undefined, ...(topicId && { topicId }) },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createRevisionNote(data: {
  topicId?: string;
  title: string;
  content: string;
  tags?: string[];
}) {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error('Unauthorized');
  }

  return prisma.revisionNote.create({
    data: {
      ...data,
      userId: userId!,
      tags: data.tags || [],
    },
  });
}

export async function updateRevisionNote(id: string, data: { title?: string; content?: string; tags?: string[] }) {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error('Unauthorized');
  }

  return prisma.revisionNote.update({
    where: { id, userId: userId! },
    data,
  });
}

export async function deleteRevisionNote(id: string) {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error('Unauthorized');
  }

  await prisma.revisionNote.delete({ where: { id, userId: userId! } });
  revalidatePath('/notebook');
}

export async function getFlashcards(topicId?: string) {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return [];
  }

  return prisma.flashcard.findMany({
    where: { userId, ...(topicId && { topicId }) },
    orderBy: { nextReview: 'asc' },
  });
}

export async function createFlashcard(data: { topicId?: string; front: string; back: string; difficulty?: string }) {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error('Unauthorized');
  }

  return prisma.flashcard.create({
    data: {
      ...data,
      userId: userId!,
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