'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getUserProfile() {
  const { userId } = await auth();
  if (!userId) return null;

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
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const updateData: any = { ...data };
  if (data.examType) updateData.examType = data.examType;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath('/profile');
  return user;
}