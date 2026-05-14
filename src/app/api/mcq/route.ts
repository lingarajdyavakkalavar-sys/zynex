import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMCQsForQuiz, saveQuizAttempt, createQuizSession, completeQuizSession } from '@/actions/mcq';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topicIds = searchParams.get('topicIds')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '10');
    const difficulty = searchParams.get('difficulty');
    const examType = searchParams.get('examType');

    const mcqs = await getMCQsForQuiz({ topicIds, limit, difficulty, examType });
    
    const sanitized = mcqs.map(mcq => ({
      id: mcq.id,
      question: mcq.question,
      topic: { id: mcq.topic.id, title: mcq.topic.title },
      difficulty: mcq.difficulty,
      section: mcq.section,
      marks: mcq.marks,
      negativeMarks: mcq.negativeMarks,
      options: mcq.options.map(opt => ({ index: opt.index, text: opt.text })),
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('MCQ API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, data } = body;

    if (action === 'start-session') {
      const session = await createQuizSession(data);
      return NextResponse.json(session);
    }

    if (action === 'submit-answer') {
      const attempt = await saveQuizAttempt(data);
      return NextResponse.json(attempt);
    }

    if (action === 'complete-session') {
      const session = await completeQuizSession(data.sessionId, data.correctCount);
      return NextResponse.json(session);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('MCQ POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}