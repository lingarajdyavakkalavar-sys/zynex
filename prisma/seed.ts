import { PrismaClient, Role, ExamType, Status, Difficulty, QuizMode, SourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.backlogTopic.deleteMany();
  await prisma.readinessScore.deleteMany();
  await prisma.dailyTarget.deleteMany();
  await prisma.studyPlanner.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.mCQAttempt.deleteMany();
  await prisma.mCQOption.deleteMany();
  await prisma.mCQ.deleteMany();
  await prisma.mindMap.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.formulaSheet.deleteMany();
  await prisma.revisionNote.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.topicProgress.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.syllabus.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.branch.deleteMany();

  // Create branches
  const csBranch = await prisma.branch.create({
    data: { name: 'Computer Science & Engineering', code: 'CSE' },
  });

  // Create semesters
  const csSem1 = await prisma.semester.create({
    data: { number: 1, branchId: csBranch.id },
  });

  const csSem2 = await prisma.semester.create({
    data: { number: 2, branchId: csBranch.id },
  });

  // Create subjects
  const dsSubject = await prisma.subject.create({
    data: { name: 'Data Structures & Algorithms', code: 'CS201', semesterId: csSem2.id, examType: ExamType.GATE },
  });

  // Create syllabus with units and topics
  const dsSyllabus = await prisma.syllabus.create({
    data: {
      title: 'DSA Complete Syllabus',
      description: 'GATE preparation',
      subjectId: dsSubject.id,
      sourceType: SourceType.PASTED_TEXT,
      isPublished: true,
    },
  });

  const unit1 = await prisma.unit.create({
    data: { title: 'Arrays and Linked Lists', order: 1, syllabusId: dsSyllabus.id },
  });

  const topicsData = [
    'Introduction to Arrays', 'Dynamic Arrays', 'Singly Linked List',
    'Doubly Linked List', 'Circular Linked List', 'Stack Implementation',
    'Queue Implementation', 'Binary Trees', 'Binary Search Trees',
    'Graph Representations', 'BFS and DFS', 'Sorting Algorithms'
  ];

  for (let i = 0; i < topicsData.length; i++) {
    await prisma.topic.create({
      data: { title: topicsData[i], order: i + 1, unitId: unit1.id },
    });
  }

  // Create admin user
  await prisma.user.create({
    data: { email: 'admin@zypher.edu', name: 'Admin', role: Role.ADMIN },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });