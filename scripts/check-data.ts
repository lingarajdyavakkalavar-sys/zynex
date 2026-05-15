import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function check() {
  const branches = await p.gATEBranch.count();
  const gate = await p.mCQ.count({ where: { examType: 'GATE' } });
  const cat = await p.mCQ.count({ where: { examType: 'CAT' } });
  const topics = await p.gATETopic.count();
  
  console.log('Branches:', branches);
  console.log('GATE Questions:', gate);
  console.log('CAT Questions:', cat);
  console.log('GATE Topics:', topics);
  
  await p.$disconnect();
}

check();