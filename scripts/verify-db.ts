import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.mCQ.count();
  const byBranch = await prisma.mCQ.groupBy({ 
    by: ['gateBranchCode'], 
    _count: { id: true },
    where: { gateBranchCode: { not: null } }
  });
  const byDifficulty = await prisma.mCQ.groupBy({ 
    by: ['difficulty'], 
    _count: { id: true }
  });
  
  console.log('Total MCQs:', total);
  console.log('By Branch:', JSON.stringify(byBranch, null, 2));
  console.log('By Difficulty:', JSON.stringify(byDifficulty, null, 2));
  
  const sample = await prisma.mCQ.findMany({ take: 3, select: { question: true, gateBranchCode: true, difficulty: true } });
  console.log('Sample MCQs:', JSON.stringify(sample, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);