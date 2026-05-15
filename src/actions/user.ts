'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { isAuthEnabled } from '@/lib/auth-config';

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

  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function updateUserProfile(data: {
  name?: string;
  examType?: string;
  targetExam?: string;
  phone?: string;
  bio?: string;
}) {
  const userId = isAuthEnabled() ? undefined : getUserId();
  
  if (isAuthEnabled()) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error('Unauthorized');
  }

  const updateData: any = { ...data };
  if (data.examType) updateData.examType = data.examType;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath('/profile');
  return user;
}