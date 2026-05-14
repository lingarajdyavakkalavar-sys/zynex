import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('examType') as 'GATE' | 'CAT';
    const year = searchParams.get('year');
    const branchCode = searchParams.get('branchCode');
    const sectionCode = searchParams.get('sectionCode');
    const difficulty = searchParams.get('difficulty');
    const count = parseInt(searchParams.get('count') || '65');
    const topicId = searchParams.get('topicId');

    const where: any = { examType };

    if (examType === 'GATE') {
      if (year) where.year = parseInt(year);
      if (branchCode) where.gateBranchCode = branchCode;
    } else if (examType === 'CAT') {
      if (sectionCode) where.catSectionCode = sectionCode;
    }

    if (difficulty) where.difficulty = difficulty;
    if (topicId) where.gateTopicId = topicId;

    const questions = await prisma.mCQ.findMany({
      where,
      take: count,
      orderBy: year ? [{ year: 'desc' }, { paperCode: 'asc' }] : [{ createdAt: 'desc' }],
    });

    if (questions.length === 0) {
      return NextResponse.json({
        message: 'No questions found in database',
        demoMode: true,
        suggestion: 'Upload question papers or use practice mode to generate questions'
      });
    }

    return NextResponse.json({
      questions,
      count: questions.length,
      source: 'database'
    });
  } catch (error) {
    console.error('MCQ fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}