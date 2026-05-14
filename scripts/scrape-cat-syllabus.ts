import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CAT_SECTIONS = [
  {
    code: 'VARC',
    name: 'Verbal Ability and Reading Comprehension',
    description: 'Tests reading comprehension, grammar, and verbal reasoning',
    subsections: [
      { code: 'RC', name: 'Reading Comprehension', topics: [
        'Main idea and central theme questions',
        'Inference and implication questions',
        'Tone and style identification',
        'Vocabulary in context',
        'Logical structure of passages',
        'Fact vs opinion distinction',
        'Summary and conclusion questions',
        'Critical reasoning questions',
      ]},
      { code: 'VA', name: 'Verbal Ability', topics: [
        'Para Jumbles (rearrangement)',
        'Para Summary (closest meaning)',
        'Odd Sentence Out',
        'Sentence Completion',
        'Fill in the blanks',
        'Word Usage',
        'Idioms and Phrases',
        'Analogies and Antonyms',
      ]},
      { code: 'VR', name: 'Verbal Reasoning', topics: [
        'Critical Reasoning: Argument structure',
        'Assumptions and conclusions',
        'Strengthen/Weaken arguments',
        'Logical fallacies',
        'Cause and effect reasoning',
        'Inference from passages',
      ]},
    ],
  },
  {
    code: 'DILR',
    name: 'Data Interpretation and Logical Reasoning',
    description: 'Tests analytical reasoning and data interpretation skills',
    subsections: [
      { code: 'DI', name: 'Data Interpretation', topics: [
        'Tables and tabular data',
        'Bar charts and histograms',
        'Line graphs and trend analysis',
        'Pie charts and percentages',
        'Caselets and mixed charts',
        'Data sufficiency problems',
        'Calculation and estimation',
      ]},
      { code: 'LR', name: 'Logical Reasoning', topics: [
        'Blood relations and family trees',
        'Coding and decoding',
        'Number series and sequences',
        'Syllogisms and logical deduction',
        'Seating arrangements',
        'Puzzles: Arrangement, Comparison, Categorization',
        'Direction sense and ranking',
        'Venn diagrams',
        'Binary logic and truth-tellers',
      ]},
    ],
  },
  {
    code: 'QA',
    name: 'Quantitative Aptitude',
    description: 'Tests mathematical and computational skills',
    subsections: [
      { code: 'AR', name: 'Arithmetic', topics: [
        'Number system and properties',
        'Percentages, Profit and Loss',
        'Simple and Compound Interest',
        'Ratio and Proportion',
        'Time and Work, Pipes and Cisterns',
        'Time, Speed and Distance',
        'Averages, Mixtures and Alligation',
        'Simple Equations and Word Problems',
      ]},
      { code: 'AL', name: 'Algebra', topics: [
        'Linear and Quadratic Equations',
        'Progressions: AP, GP, HP',
        'Logarithms and Exponents',
        'Functions and Graphs',
        'Inequalities',
        'Modular arithmetic',
        'Binomial Theorem',
      ]},
      { code: 'GM', name: 'Geometry and Mensuration', topics: [
        'Lines, Angles and Triangles',
        'Quadrilaterals and Polygons',
        'Circles and Tangents',
        'Coordinate Geometry',
        'Area and Perimeter',
        'Volume and Surface Area',
        'Trigonometry basics',
        'Height and Distance problems',
      ]},
      { code: 'MM', name: 'Modern Mathematics', topics: [
        'Permutation and Combination',
        'Probability',
        'Set Theory and Venn Diagrams',
        'Matrix Operations',
        'Determinants',
        'Sequence and Series',
        'Clocks and Calendar',
        'Data Sufficiency',
      ]},
    ],
  },
];

const CAT_PAPERS = [
  { year: 2024, slot: 'Slot 1' },
  { year: 2024, slot: 'Slot 2' },
  { year: 2023, slot: 'Slot 1' },
  { year: 2023, slot: 'Slot 2' },
  { year: 2022, slot: 'Slot 1' },
  { year: 2022, slot: 'Slot 2' },
  { year: 2021, slot: 'Slot 1' },
  { year: 2021, slot: 'Slot 2' },
  { year: 2020, slot: 'Slot 1' },
  { year: 2020, slot: 'Slot 2' },
  { year: 2019, slot: 'Slot 1' },
  { year: 2019, slot: 'Slot 2' },
];

async function seedCAT() {
  console.log('Seeding CAT sections...');
  for (let i = 0; i < CAT_SECTIONS.length; i++) {
    const section = CAT_SECTIONS[i];
    await prisma.cATSection.upsert({
      where: { code: section.code },
      update: { name: section.name, description: section.description, order: i },
      create: { code: section.code, name: section.name, description: section.description, order: i },
    });

    const catSection = await prisma.cATSection.findUnique({ where: { code: section.code } });
    if (!catSection) continue;

    console.log(`  Section: ${section.name}`);
    for (let j = 0; j < section.subsections.length; j++) {
      const subsection = section.subsections[j];
      await prisma.cATSubsection.upsert({
        where: { code_sectionId: { code: subsection.code, sectionId: catSection.id } },
        update: { name: subsection.name, order: j },
        create: { code: subsection.code, name: subsection.name, sectionId: catSection.id, order: j },
      });

      const catSubsection = await prisma.cATSubsection.findUnique({
        where: { code_sectionId: { code: subsection.code, sectionId: catSection.id } },
      });
      if (!catSubsection) continue;

      for (let k = 0; k < subsection.topics.length; k++) {
        await prisma.cATTopic.upsert({
          where: { id: `cat-${subsection.code}-${k + 1}` },
          update: { title: subsection.topics[k], order: k + 1 },
          create: {
            id: `cat-${subsection.code}-${k + 1}`,
            title: subsection.topics[k],
            order: k + 1,
            subsectionId: catSubsection.id,
          },
        });
      }
      console.log(`    Subsection: ${subsection.name} (${subsection.topics.length} topics)`);
    }
  }

  console.log('\nSeeding CAT question papers...');
  for (const paper of CAT_PAPERS) {
    await prisma.cATPaper.upsert({
      where: { year_slot: { year: paper.year, slot: paper.slot } },
      update: {},
      create: {
        year: paper.year,
        slot: paper.slot,
        isOfficial: true,
        totalQuestions: 66,
        duration: 120,
      },
    });
  }
  console.log(`Created ${CAT_PAPERS.length} CAT papers`);

  console.log('\nCAT seeding completed successfully!');
}

seedCAT()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());