import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface MCQInput {
  question: string;
  options: { index: number; text: string }[];
  correctAnswer: number;
  explanation?: string;
  marks?: number;
  negativeMarks?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  year?: number;
  paperCode?: string;
  setCode?: string;
  gateTopicId?: string;
  catTopicId?: string;
  gateBranchCode?: string;
  catSectionCode?: string;
  sourceType?: 'OFFICIAL_PAPER' | 'AI_GENERATED' | 'MANUAL';
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    let mcqs: MCQInput[] = [];
    let examType: 'GATE' | 'CAT' = 'GATE';
    let gateTopicId: string | undefined;
    let catTopicId: string | undefined;
    let gateBranchCode: string | undefined;
    let catSectionCode: string | undefined;
    let year: number | undefined;
    let paperCode: string | undefined;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      mcqs = body.mcqs || [];
      examType = body.examType || 'GATE';
      gateTopicId = body.gateTopicId;
      catTopicId = body.catTopicId;
      gateBranchCode = body.gateBranchCode;
      catSectionCode = body.catSectionCode;
      year = body.year;
      paperCode = body.paperCode;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const examTypeParam = formData.get('examType') as string;
      
      if (examTypeParam) examType = examTypeParam as 'GATE' | 'CAT';
      
      if (file) {
        return NextResponse.json({ 
          message: 'File received. Full PDF parsing requires OpenAI integration.',
          saved: 0 
        });
      }
    }

    if (!mcqs || mcqs.length === 0) {
      return NextResponse.json({ message: 'No MCQs provided', saved: 0 });
    }

    if (!examType) {
      return NextResponse.json({ error: 'examType is required (GATE or CAT)' }, { status: 400 });
    }

    const results = await Promise.allSettled(
      mcqs.map(async (mcq, index) => {
        try {
          const created = await prisma.mCQ.create({
            data: {
              question: mcq.question,
              options: mcq.options,
              correctAnswer: mcq.correctAnswer,
              explanation: mcq.explanation || null,
              difficulty: mcq.difficulty || 'MEDIUM',
              examType,
              marks: mcq.marks || (examType === 'GATE' ? 1 : 1),
              negativeMarks: mcq.negativeMarks || (examType === 'GATE' ? 0.33 : 0),
              year: mcq.year || year,
              paperCode: mcq.paperCode || paperCode,
              setCode: mcq.setCode || null,
              gateTopicId: examType === 'GATE' ? (mcq.gateTopicId || gateTopicId) : null,
              catTopicId: examType === 'CAT' ? (mcq.catTopicId || catTopicId) : null,
              gateBranchCode: examType === 'GATE' ? (mcq.gateBranchCode || gateBranchCode) : null,
              catSectionCode: examType === 'CAT' ? (mcq.catSectionCode || catSectionCode) : null,
              sourceType: mcq.sourceType as any || 'OFFICIAL_PAPER',
              isPreviousYear: year !== undefined,
              tags: [examType],
            },
          });

          return { index, success: true, id: created.id };
        } catch (err) {
          return { index, success: false, error: String(err) };
        }
      })
    );

    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'fulfilled' && !r.value.success).length;

    return NextResponse.json({
      total: mcqs.length,
      succeeded,
      failed,
    });
  } catch (error) {
    console.error('MCQ ingestion error:', error);
    return NextResponse.json({ error: 'MCQ ingestion failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('examType') as 'GATE' | 'CAT' | null;
    const year = searchParams.get('year');
    const branchCode = searchParams.get('branchCode');
    const sectionCode = searchParams.get('sectionCode');
    const gateTopicId = searchParams.get('gateTopicId');
    const catTopicId = searchParams.get('catTopicId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};

    if (examType) where.examType = examType;
    if (year) where.year = parseInt(year);
    if (branchCode) where.gateBranchCode = branchCode;
    if (sectionCode) where.catSectionCode = sectionCode;
    if (gateTopicId) where.gateTopicId = gateTopicId;
    if (catTopicId) where.catTopicId = catTopicId;

    const [mcqs, total] = await Promise.all([
      prisma.mCQ.findMany({
        where,
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.mCQ.count({ where }),
    ]);

    return NextResponse.json({ mcqs, total, limit, offset });
  } catch (error) {
    console.error('Fetch MCQs error:', error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'ids query param required' }, { status: 400 });
    }

    const idArray = ids.split(',').filter(Boolean);
    const deleted = await prisma.mCQ.deleteMany({
      where: { id: { in: idArray } },
    });

    return NextResponse.json({ deleted: deleted.count });
  } catch (error) {
    console.error('Delete MCQs error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}