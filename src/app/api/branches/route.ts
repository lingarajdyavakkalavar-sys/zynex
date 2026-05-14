import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Try to get branches from database
    let branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' },
    });

    // If no branches exist, create default branches
    if (branches.length === 0) {
      const defaultBranches = [
        { name: 'Computer Science & Engineering', code: 'CSE' },
        { name: 'Electronics & Communication Engineering', code: 'ECE' },
        { name: 'Electrical Engineering', code: 'EE' },
        { name: 'Mechanical Engineering', code: 'ME' },
        { name: 'Civil Engineering', code: 'CE' },
        { name: 'Chemical Engineering', code: 'CHE' },
        { name: 'Information Technology', code: 'IT' },
      ];

      branches = await prisma.branch.createManyAndReturn({
        data: defaultBranches,
      });
    }

    return NextResponse.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    // Return default branches if DB not available
    return NextResponse.json([
      { id: 'cse', name: 'Computer Science & Engineering', code: 'CSE' },
      { id: 'ece', name: 'Electronics & Communication', code: 'ECE' },
      { id: 'ee', name: 'Electrical Engineering', code: 'EE' },
      { id: 'me', name: 'Mechanical Engineering', code: 'ME' },
      { id: 'ce', name: 'Civil Engineering', code: 'CE' },
    ]);
  }
}