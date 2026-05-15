import { NextRequest, NextResponse } from 'next/server';
import { getGATEBranches, getGATESubjects, getGATETopics, getGATEPapers, getCATSections, getCATSubsections, getCATTopics, getCATPapers } from '@/actions/syllabus';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const code = searchParams.get('code');
    const branchCode = searchParams.get('branchCode') || 'CS';
    const year = searchParams.get('year');

    if (type === 'gate-branches') {
      const branches = await getGATEBranches();
      return NextResponse.json(branches);
    }

    if (type === 'gate-subjects') {
      const subjects = await getGATESubjects(branchCode);
      return NextResponse.json(subjects);
    }

    if (type === 'gate-topics') {
      const topics = await getGATETopics(code || '');
      return NextResponse.json(topics);
    }

    if (type === 'gate-papers') {
      const papers = await getGATEPapers(branchCode, year ? parseInt(year) : undefined);
      return NextResponse.json(papers);
    }

    if (type === 'cat-sections') {
      const sections = await getCATSections();
      return NextResponse.json(sections);
    }

    if (type === 'cat-subsections') {
      const subsections = await getCATSubsections(code || 'VARC');
      return NextResponse.json(subsections);
    }

    if (type === 'cat-topics') {
      const topics = await getCATTopics(code || '');
      return NextResponse.json(topics);
    }

    if (type === 'cat-papers') {
      const papers = await getCATPapers(year ? parseInt(year) : undefined);
      return NextResponse.json(papers);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Syllabus API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}