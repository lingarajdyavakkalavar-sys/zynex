import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSyllabusBySubject, getAllSyllabi, createSyllabus, updateSyllabus, deleteSyllabus } from '@/actions/syllabus';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const examType = searchParams.get('examType');
    const isPublished = searchParams.get('isPublished');

    if (subjectId) {
      const syllabus = await getSyllabusBySubject(subjectId);
      return NextResponse.json(syllabus);
    }

    const syllabi = await getAllSyllabi({
      examType: examType || undefined,
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
    });

    return NextResponse.json(syllabi);
  } catch (error) {
    console.error('Syllabus API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const syllabus = await createSyllabus(body);
    return NextResponse.json(syllabus);
  } catch (error) {
    console.error('Syllabus POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;
    const syllabus = await updateSyllabus(id, data);
    return NextResponse.json(syllabus);
  } catch (error) {
    console.error('Syllabus PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await deleteSyllabus(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Syllabus DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}