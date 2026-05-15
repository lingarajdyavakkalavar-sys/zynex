import { prisma } from '@/lib/db/prisma';
import { isAuthEnabled } from './auth-config';

export async function getUser() {
  if (!isAuthEnabled()) {
    const user = await prisma.user.findUnique({
      where: { id: 'demo-user-123' },
    });
    
    if (!user) {
      return await prisma.user.upsert({
        where: { id: 'demo-user-123' },
        update: {},
        create: {
          id: 'demo-user-123',
          email: 'demo@zypher.com',
          name: 'Demo User',
          role: 'STUDENT',
        },
      });
    }
    
    return user;
  }

  const { auth, currentUser } = await import('@clerk/nextjs/server');
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
  if (!isAuthEnabled()) {
    return {
      id: 'demo-user-123',
      fullName: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'demo@zypher.com' }],
      imageUrl: null,
    };
  }

  const { currentUser } = await import('@clerk/nextjs/server');
  return await currentUser();
}

export async function createOrUpdateUser() {
  if (!isAuthEnabled()) {
    return await prisma.user.upsert({
      where: { id: 'demo-user-123' },
      update: {},
      create: {
        id: 'demo-user-123',
        email: 'demo@zypher.com',
        name: 'Demo User',
        role: 'STUDENT',
      },
    });
  }

  const { currentUser } = await import('@clerk/nextjs/server');
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

export function getUserId(): string {
  return 'demo-user-123';
}