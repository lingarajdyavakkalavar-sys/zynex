import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function getUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}

export async function getCurrentUser() {
  const clerkUser = await currentUser();
  return clerkUser;
}

export async function createOrUpdateUser() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { id: clerkUser.id },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      imageUrl: clerkUser.imageUrl,
      role: 'STUDENT',
    },
  });

  return user;
}