'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';

export async function getGATESubjects(branchCode: string = 'CS') {
  const branch = await prisma.gATEBranch.findUnique({ where: { code: branchCode } });
  if (!branch) return [];

  return prisma.gATESubject.findMany({
    where: { branchId: branch.id },
    orderBy: { order: 'asc' },
  });
}

export async function getGATETopics(subjectId: string) {
  return prisma.gATETopic.findMany({
    where: { subjectId },
    orderBy: { order: 'asc' },
  });
}

export async function getGATEBranches() {
  return prisma.gATEBranch.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getGATEPapers(branchCode: string, year?: number) {
  const branch = await prisma.gATEBranch.findUnique({ where: { code: branchCode } });
  if (!branch) return [];

  return prisma.gATEPaper.findMany({
    where: {
      branchId: branch.id,
      ...(year && { year }),
    },
    orderBy: { year: 'desc' },
  });
}

export async function getCATSections() {
  return prisma.cATSection.findMany({
    orderBy: { order: 'asc' },
  });
}

export async function getCATSubsections(sectionCode: string) {
  const section = await prisma.cATSection.findUnique({ where: { code: sectionCode } });
  if (!section) return [];

  return prisma.cATSubsection.findMany({
    where: { sectionId: section.id },
    orderBy: { order: 'asc' },
  });
}

export async function getCATTopics(subsectionId: string) {
  return prisma.cATTopic.findMany({
    where: { subsectionId },
    orderBy: { order: 'asc' },
  });
}

export async function getCATPapers(year?: number) {
  return prisma.cATPaper.findMany({
    where: year ? { year } : undefined,
    orderBy: { year: 'desc' },
  });
}