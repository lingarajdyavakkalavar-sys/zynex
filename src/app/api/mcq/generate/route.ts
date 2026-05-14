import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import OpenAI from 'openai';

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

interface MCQPrompt {
  topicId: string;
  sourceContent: string;
  count: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  examType: 'GATE' | 'CAT';
  branchCode?: string;
  section?: string;
}

function chunkText(text: string, maxChars: number = 8000): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + '.';
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const body: MCQPrompt = await req.json();
    const { topicId, sourceContent, count = 5, difficulty = 'MEDIUM', examType = 'GATE', branchCode, section } = body;

    if (!topicId || !sourceContent) {
      return NextResponse.json({ error: 'topicId and sourceContent are required' }, { status: 400 });
    }

    // Get topic for context
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { unit: { include: { syllabus: true } } },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Chunk content if too long
    const chunks = chunkText(sourceContent);
    const promptChunk = chunks[0] || sourceContent.substring(0, 8000);

    const difficultyLabel = difficulty === 'EASY' ? 'basic' : difficulty === 'HARD' ? 'advanced' : 'intermediate';
    const examContext = examType === 'CAT' 
      ? 'CAT exam pattern (VARC/DILR/QA style)'
      : 'GATE CS exam pattern';

    const prompt = `You are an expert in ${topic.title} for ${examContext}.
Generate exactly ${count} multiple choice questions of ${difficultyLabel} difficulty level.
${examType === 'GATE' ? 'Include both 1-mark and 2-mark questions where appropriate.' : ''}
Follow competitive exam MCQ format.

Return ONLY valid JSON array, no markdown, no explanation outside JSON:
[
  {
    "question": "Clear, specific question text",
    "options": [
      {"index": 0, "text": "First option"},
      {"index": 1, "text": "Second option"},
      {"index": 2, "text": "Third option"},
      {"index": 3, "text": "Fourth option"}
    ],
    "correctIndex": 0,
    "explanation": "Brief explanation why this is correct",
    "difficulty": "${difficulty}"
  }
]

Content for generating questions:
${promptChunk}`;

    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert exam question generator. Output ONLY JSON array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const aiContent = response.choices[0]?.message?.content;
    if (!aiContent) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse JSON response
    let mcqs: any[];
    try {
      const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
      mcqs = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, aiContent);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    if (!Array.isArray(mcqs)) {
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 });
    }

    // Store MCQs in database
    const createdMcqs = [];
    for (const mcq of mcqs.slice(0, count)) {
      const created = await prisma.mCQ.create({
        data: {
          topicId,
          question: mcq.question,
          difficulty: mcq.difficulty || difficulty,
          correctIndex: mcq.correctIndex ?? 0,
          explanation: mcq.explanation,
          tags: [topic.title],
          examType: examType as any,
          branchCode,
          section,
          marks: examType === 'GATE' ? 1 : undefined,
          source: 'AI_GENERATED',
        },
      });

      // Create options
      for (const option of mcq.options) {
        await prisma.mCQOption.create({
          data: {
            mcqId: created.id,
            text: option.text,
            index: option.index,
          },
        });
      }

      createdMcqs.push(created);
    }

    // Update material mcqCount
    await prisma.uploadedMaterial.updateMany({
      where: { userId },
      data: { mcqCount: { increment: createdMcqs.length } },
    });

    return NextResponse.json({
      success: true,
      count: createdMcqs.length,
      mcqs: createdMcqs.map(m => ({ id: m.id, question: m.question, difficulty: m.difficulty })),
    });
  } catch (error) {
    console.error('MCQ generation error:', error);
    return NextResponse.json({ error: 'MCQ generation failed' }, { status: 500 });
  }
}