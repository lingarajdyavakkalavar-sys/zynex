import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isAuthEnabled } from '@/lib/auth-config';
import pdfParse from 'pdf-parse';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    let userId = 'demo-user-123';
    
    if (isAuthEnabled()) {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = clerkUserId;
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const textContent = formData.get('content') as string | null;
    const topicId = formData.get('topicId') as string | null;

    let extractedText = '';
    let fileName = '';

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
      }

      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 400 });
      }

      fileName = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (textContent) {
      extractedText = textContent;
      fileName = 'pasted-text';
    } else {
      return NextResponse.json({ error: 'No file or content provided' }, { status: 400 });
    }

    // Clean and truncate text if too long
    const cleanedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x00-\x7F]/g, '')
      .trim()
      .substring(0, 50000); // 50k char limit for API

    // Store the material
    const material = await prisma.uploadedMaterial.create({
      data: {
        userId,
        title: fileName || 'Uploaded Material',
        fileName,
        content: cleanedText,
        sourceType: 'PDF_UPLOAD',
        topicCount: 0,
        mcqCount: 0,
      },
    });

    return NextResponse.json({
      id: material.id,
      title: material.title,
      contentLength: cleanedText.length,
      message: 'Material uploaded successfully. Use the content to generate MCQs.',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    let userId = 'demo-user-123';
    
    if (isAuthEnabled()) {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = clerkUserId;
    }

    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get('id');

    if (materialId) {
      const material = await prisma.uploadedMaterial.findUnique({
        where: { id: materialId, userId },
      });
      return NextResponse.json(material);
    }

    const materials = await prisma.uploadedMaterial.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}