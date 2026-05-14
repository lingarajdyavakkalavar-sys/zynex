import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let semesters = await prisma.semester.findMany({
      orderBy: { number: 'asc' },
    });

    if (semesters.length === 0) {
      // Create semesters for each branch
      const branches = await prisma.branch.findMany();
      
      for (const branch of branches) {
        for (let i = 1; i <= 8; i++) {
          await prisma.semester.create({
            data: { number: i, branchId: branch.id },
          });
        }
      }

      semesters = await prisma.semester.findMany({
        orderBy: { number: 'asc' },
      });
    }

    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    // Return default semesters
    return NextResponse.json(
      Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), number: i + 1 }))
    );
  }
}