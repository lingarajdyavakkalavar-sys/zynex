import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAuthEnabled } from '@/lib/auth-config';

export async function GET() {
  try {
    const userId = isAuthEnabled() ? undefined : 'demo-user-123';
    
    if (isAuthEnabled()) {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
    }

    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
    }) : null;

    if (!user) {
      const newUser = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId!,
          email: 'demo@zypher.com',
          name: 'Demo User',
          role: 'STUDENT',
        },
      });

      return NextResponse.json(newUser);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = isAuthEnabled() ? undefined : 'demo-user-123';
    
    if (isAuthEnabled()) {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { name, phone, bio, examType, targetExam } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(examType !== undefined && { examType: examType as any }),
        ...(targetExam !== undefined && { targetExam }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}