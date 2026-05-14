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
  gateTopicId?: string;
  catTopicId?: string;
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
    const { gateTopicId, catTopicId, sourceContent, count = 5, difficulty = 'MEDIUM', examType = 'GATE', branchCode, section } = body;

    let topicTitle = 'Unknown Topic';
    if (examType === 'GATE' && gateTopicId) {
      const topic = await prisma.gATETopic.findUnique({ where: { id: gateTopicId } });
      topicTitle = topic?.title || topicTitle;
    } else if (examType === 'CAT' && catTopicId) {
      const topic = await prisma.cATTopic.findUnique({ where: { id: catTopicId } });
      topicTitle = topic?.title || topicTitle;
    }

    const chunks = chunkText(sourceContent);
    const promptChunk = chunks[0] || sourceContent.substring(0, 8000);

    const difficultyLabel = difficulty === 'EASY' ? 'basic' : difficulty === 'HARD' ? 'advanced' : 'intermediate';
    const examContext = examType === 'CAT'
      ? 'CAT exam pattern (VARC/DILR/QA style)'
      : 'GATE exam pattern';

    const prompt = `You are an expert in ${topicTitle} for ${examContext}.
Generate exactly ${count} multiple choice questions of ${difficultyLabel} difficulty level.
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
    "explanation": "Brief explanation why this is correct"
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

    const createdMcqs = await Promise.all(mcqs.slice(0, count).map(async (mcq) => {
      return prisma.mCQ.create({
        data: {
          question: mcq.question,
          options: mcq.options.map((o: any) => ({ index: o.index, text: o.text })),
          correctAnswer: mcq.correctIndex ?? 0,
          explanation: mcq.explanation,
          difficulty: difficulty as any,
          tags: [topicTitle],
          examType: examType as any,
          gateTopicId: examType === 'GATE' ? gateTopicId : null,
          catTopicId: examType === 'CAT' ? catTopicId : null,
          gateBranchCode: examType === 'GATE' ? branchCode : null,
          catSectionCode: examType === 'CAT' ? section : null,
          sourceType: 'AI_GENERATED',
        },
      });
    }));

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