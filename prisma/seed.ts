import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with new GATE/CAT schema...');

  await prisma.mCQAttempt.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.studyTimer.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.revisionNote.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.uploadedMaterial.deleteMany();
  await prisma.studyPlanner.deleteMany();
  await prisma.topicProgress.deleteMany();
  await prisma.mCQ.deleteMany();
  await prisma.cATPaper.deleteMany();
  await prisma.cATSection.deleteMany();
  await prisma.gATEPaper.deleteMany();
  await prisma.gATETopic.deleteMany();
  await prisma.gATESubject.deleteMany();
  await prisma.gATEBranch.deleteMany();

  console.log('Creating GATE branches...');
  const branches = [
    { code: 'CS', name: 'Computer Science and Information Technology', fullName: 'Computer Science & IT (CS)' },
    { code: 'EC', name: 'Electronics and Communications Engineering', fullName: 'Electronics & Comm (EC)' },
    { code: 'EE', name: 'Electrical Engineering', fullName: 'Electrical (EE)' },
    { code: 'ME', name: 'Mechanical Engineering', fullName: 'Mechanical (ME)' },
    { code: 'CE', name: 'Civil Engineering', fullName: 'Civil (CE)' },
  ];

  for (const branch of branches) {
    await prisma.gATEBranch.create({ data: branch });
  }

  const csBranch = await prisma.gATEBranch.findUnique({ where: { code: 'CS' } });
  if (!csBranch) throw new Error('CS branch not found');

  console.log('Creating GATE CS subjects...');
  const subjects = [
    { code: 'MA', name: 'Engineering Mathematics', order: 1 },
    { code: 'DS', name: 'Digital Logic', order: 2 },
    { code: 'COA', name: 'Computer Organization and Architecture', order: 3 },
    { code: 'PDS', name: 'Programming and Data Structures', order: 4 },
    { code: 'AL', name: 'Algorithms', order: 5 },
    { code: 'TOC', name: 'Theory of Computation', order: 6 },
    { code: 'CD', name: 'Compiler Design', order: 7 },
    { code: 'OS', name: 'Operating Systems', order: 8 },
    { code: 'DB', name: 'Databases', order: 9 },
    { code: 'CN', name: 'Computer Networks', order: 10 },
    { code: 'GA', name: 'General Aptitude', order: 11 },
  ];

  for (const subject of subjects) {
    await prisma.gATESubject.create({ data: { ...subject, branchId: csBranch.id } });
  }

  console.log('Creating GATE CS question papers...');
  for (const year of [2024, 2023, 2022, 2021, 2020, 2019]) {
    await prisma.gATEPaper.create({
      data: {
        year,
        session: 'Forenoon',
        paperCode: 'CS1',
        branchId: csBranch.id,
        setCode: 'A',
        isOfficial: true,
        totalMarks: 100,
        duration: 180,
      },
    });
    await prisma.gATEPaper.create({
      data: {
        year,
        session: 'Afternoon',
        paperCode: 'CS2',
        branchId: csBranch.id,
        setCode: 'A',
        isOfficial: true,
        totalMarks: 100,
        duration: 180,
      },
    });
  }

  console.log('Creating CAT sections...');
  const catSections = [
    { code: 'VARC', name: 'Verbal Ability and Reading Comprehension', order: 1 },
    { code: 'DILR', name: 'Data Interpretation and Logical Reasoning', order: 2 },
    { code: 'QA', name: 'Quantitative Aptitude', order: 3 },
  ];

  for (const section of catSections) {
    await prisma.cATSection.create({ data: section });
  }

  const varcSection = await prisma.cATSection.findUnique({ where: { code: 'VARC' } });
  if (varcSection) {
    await prisma.cATSubsection.create({ data: { code: 'RC', name: 'Reading Comprehension', sectionId: varcSection.id, order: 1 } });
    await prisma.cATSubsection.create({ data: { code: 'VA', name: 'Verbal Ability', sectionId: varcSection.id, order: 2 } });
  }

  const dilrSection = await prisma.cATSection.findUnique({ where: { code: 'DILR' } });
  if (dilrSection) {
    await prisma.cATSubsection.create({ data: { code: 'DI', name: 'Data Interpretation', sectionId: dilrSection.id, order: 1 } });
    await prisma.cATSubsection.create({ data: { code: 'LR', name: 'Logical Reasoning', sectionId: dilrSection.id, order: 2 } });
  }

  const qaSection = await prisma.cATSection.findUnique({ where: { code: 'QA' } });
  if (qaSection) {
    await prisma.cATSubsection.create({ data: { code: 'AR', name: 'Arithmetic', sectionId: qaSection.id, order: 1 } });
    await prisma.cATSubsection.create({ data: { code: 'AL', name: 'Algebra', sectionId: qaSection.id, order: 2 } });
    await prisma.cATSubsection.create({ data: { code: 'GM', name: 'Geometry and Mensuration', sectionId: qaSection.id, order: 3 } });
    await prisma.cATSubsection.create({ data: { code: 'MM', name: 'Modern Mathematics', sectionId: qaSection.id, order: 4 } });
  }

  console.log('Creating CAT papers...');
  for (const year of [2024, 2023, 2022, 2021]) {
    await prisma.cATPaper.create({ data: { year, slot: 'Slot 1', isOfficial: true, totalQuestions: 66, duration: 120 } });
    await prisma.cATPaper.create({ data: { year, slot: 'Slot 2', isOfficial: true, totalQuestions: 66, duration: 120 } });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });