import { PrismaClient } from '@prisma/client';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

interface ExtractedMCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  difficulty?: string;
}

interface PaperConfig {
  examType: 'GATE' | 'CAT';
  year: number;
  branchCode?: string;
  sectionCode?: string;
  paperCode?: string;
  gateTopicId?: string;
  catTopicId?: string;
}

async function parsePDF(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

function chunkText(text: string, maxChars: number = 8000): string[] {
  const chunks: string[] = [];
  const lines = text.split('\n');
  let currentChunk = '';

  for (const line of lines) {
    if ((currentChunk + line).length > maxChars) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = line;
    } else {
      currentChunk += '\n' + line;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

async function extractMCQsFromText(text: string, config: PaperConfig): Promise<ExtractedMCQ[]> {
  const { examType } = config;
  const isGATE = examType === 'GATE';

  const prompt = `You are an expert at parsing ${examType} exam question papers.
Extract all multiple choice questions from the text below.
Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "question": "The full question text exactly as in the paper",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": 0-3 (index of correct option, 0=A, 1=B, 2=C, 3=D),
    "explanation": "Brief explanation if available, otherwise null",
    "marks": ${isGATE ? '1 or 2 (infer from question format)' : '1'},
    "negativeMarks": ${isGATE ? '0.33 for 1-mark, 0.66 for 2-mark (if wrong, otherwise 0)' : '0'},
    "difficulty": "EASY or MEDIUM or HARD (infer from complexity)"
  }
]

Rules:
- If question has multiple correct answers, use the first correct option listed
- For GATE: 2-mark questions usually have multiple statements to evaluate
- Ignore non-MCQ content like Numerical Answer Type (NAT) questions
- If options are numbered like "1.", "2.", treat them as A, B, C, D
- Return empty array if no MCQs found
- Only include questions where you can identify a clear correct answer

Text to parse:
${text}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a ${examType} exam paper parsing expert. Output ONLY JSON array.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 8000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return [];

  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    console.error('Failed to parse extracted MCQs:', content.substring(0, 200));
    return [];
  }
}

async function ingestMCQs(mcqs: ExtractedMCQ[], config: PaperConfig): Promise<{ saved: number; failed: number }> {
  let saved = 0;
  let failed = 0;

  for (const mcq of mcqs) {
    try {
      await prisma.mCQ.create({
        data: {
          question: mcq.question,
          options: mcq.options.map((text, i) => ({ index: i, text })),
          correctAnswer: mcq.correctAnswer,
          explanation: mcq.explanation || null,
          difficulty: (mcq.difficulty || 'MEDIUM') as any,
          examType: config.examType,
          marks: mcq.marks,
          negativeMarks: mcq.negativeMarks,
          year: config.year,
          paperCode: config.paperCode || null,
          gateBranchCode: config.branchCode,
          catSectionCode: config.sectionCode || null,
          gateTopicId: config.gateTopicId || null,
          catTopicId: config.catTopicId || null,
          sourceType: 'OFFICIAL_PAPER',
          isPreviousYear: true,
          tags: [`GATE-${config.year}`, config.branchCode || ''],
        },
      });
      saved++;
    } catch (err) {
      console.error('Failed to save MCQ:', err);
      failed++;
    }
  }

  return { saved, failed };
}

export async function ingestFromPDF(
  pdfPath: string,
  config: PaperConfig
): Promise<{ total: number; saved: number; failed: number }> {
  console.log(`Ingesting ${config.examType} ${config.year} paper from ${pdfPath}...`);

  const text = await parsePDF(pdfPath);
  console.log(`Extracted ${text.length} characters from PDF`);

  const chunks = chunkText(text);
  console.log(`Split into ${chunks.length} chunks`);

  let allMCQs: ExtractedMCQ[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
    const chunkMCQs = await extractMCQsFromText(chunks[i], config);
    allMCQs = allMCQs.concat(chunkMCQs);
    console.log(`Found ${chunkMCQs.length} MCQs in chunk ${i + 1}`);
  }

  console.log(`Total MCQs extracted: ${allMCQs.length}`);

  const { saved, failed } = await ingestMCQs(allMCQs, config);
  console.log(`Saved: ${saved}, Failed: ${failed}`);

  return { total: allMCQs.length, saved, failed };
}

export async function ingestFromJSON(
  jsonPath: string,
  config: PaperConfig
): Promise<{ total: number; saved: number; failed: number }> {
  console.log(`Ingesting MCQs from JSON: ${jsonPath}`);

  const content = fs.readFileSync(jsonPath, 'utf-8');
  const mcqs: ExtractedMCQ[] = JSON.parse(content);

  const { saved, failed } = await ingestMCQs(mcqs, config);
  return { total: mcqs.length, saved, failed };
}

export async function bulkIngestFromFolder(
  folderPath: string,
  config: PaperConfig
): Promise<{ files: number; total: number; saved: number; failed: number }> {
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.pdf'));

  let totalMCQs = 0;
  let totalSaved = 0;
  let totalFailed = 0;

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const { total, saved, failed } = await ingestFromPDF(filePath, {
      ...config,
      paperCode: file.replace('.pdf', ''),
    });
    totalMCQs += total;
    totalSaved += saved;
    totalFailed += failed;
  }

  return { files: files.length, total: totalMCQs, saved: totalSaved, failed: totalFailed };
}

export async function seedSampleMCQs(config: PaperConfig): Promise<{ saved: number }> {
  const sampleGATEMCQs = [
    {
      question: "Which data structure is used in BFS traversal of a graph?",
      options: ["Stack", "Queue", "Heap", "Tree"],
      correctAnswer: 1,
      explanation: "BFS uses a queue to maintain the order of visited nodes.",
      marks: 1,
      negativeMarks: 0.33,
      difficulty: "EASY",
    },
    {
      question: "Time complexity of QuickSort in average case is:",
      options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      correctAnswer: 1,
      explanation: "QuickSort average case is O(n log n) due to balanced partitioning.",
      marks: 1,
      negativeMarks: 0.33,
      difficulty: "EASY",
    },
    {
      question: "What is the output of the following C code?\n#include<stdio.h>\nint main() { printf(\"%d\", sizeof(char)); return 0; }",
      options: ["1", "2", "4", "8"],
      correctAnswer: 0,
      explanation: "Size of char is always 1 byte in C.",
      marks: 1,
      negativeMarks: 0.33,
      difficulty: "EASY",
    },
    {
      question: "Which of the following is NOT a layer of the OSI model?",
      options: ["Physical", "Data Link", "Internet", "Application Layer"],
      correctAnswer: 3,
      explanation: "Application Layer is part of OSI model, but the question asks which is NOT a layer - this is a trick question. Internet is not an OSI layer.",
      marks: 2,
      negativeMarks: 0.66,
      difficulty: "MEDIUM",
    },
    {
      question: "Which sorting algorithm has the best worst-case time complexity?",
      options: ["QuickSort", "MergeSort", "HeapSort", "InsertionSort"],
      correctAnswer: 2,
      explanation: "HeapSort has O(n log n) worst-case time complexity.",
      marks: 1,
      negativeMarks: 0.33,
      difficulty: "MEDIUM",
    },
  ];

  const sampleCATMCQs = [
    {
      question: "If 3x + 6 = 15, what is the value of x?",
      options: ["2", "3", "4", "5"],
      correctAnswer: 1,
      explanation: "3x = 9, so x = 3",
      marks: 1,
      negativeMarks: 0,
      difficulty: "EASY",
    },
    {
      question: "A train travels 240 km in 4 hours. What is its speed?",
      options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"],
      correctAnswer: 2,
      explanation: "Speed = Distance/Time = 240/4 = 60 km/h",
      marks: 1,
      negativeMarks: 0,
      difficulty: "EASY",
    },
  ];

  const mcqs = config.examType === 'GATE' ? sampleGATEMCQs : sampleCATMCQs;
  const { saved } = await ingestMCQs(mcqs, config);

  console.log(`Seeded ${saved} sample MCQs for ${config.examType}`);
  return { saved };
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set');
    process.exit(1);
  }

  if (mode === 'seed') {
    const examType = (args[1] || 'GATE') as 'GATE' | 'CAT';
    await seedSampleMCQs({ examType, year: parseInt(args[2] || '2024') });
  } else if (mode === 'pdf') {
    const pdfPath = args[1];
    const examType = (args[2] || 'GATE') as 'GATE' | 'CAT';
    const year = parseInt(args[3] || '2024');
    const branchCode = args[4] || 'CS';

    if (!pdfPath) {
      console.error('Usage: npx ts-node ingest-mcqs.ts pdf <pdfPath> <examType> <year> <branchCode>');
      process.exit(1);
    }

    await ingestFromPDF(pdfPath, { examType, year, branchCode });
  } else if (mode === 'json') {
    const jsonPath = args[1];
    const examType = (args[2] || 'GATE') as 'GATE' | 'CAT';
    const year = parseInt(args[3] || '2024');

    if (!jsonPath) {
      console.error('Usage: npx ts-node ingest-mcqs.ts json <jsonPath> <examType> <year>');
      process.exit(1);
    }

    await ingestFromJSON(jsonPath, { examType, year });
  } else {
    console.log('Usage:');
    console.log('  npx ts-node scripts/ingest-mcqs.ts seed <GATE|CAT> <year>');
    console.log('  npx ts-node scripts/ingest-mcqs.ts pdf <pdfPath> <GATE|CAT> <year> <branchCode>');
    console.log('  npx ts-node scripts/ingest-mcqs.ts json <jsonPath> <GATE|CAT> <year>');
  }

  await prisma.$disconnect();
}

main().catch(console.error);