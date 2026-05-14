import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

const CAT_SYLLABUS = {
  VARC: {
    name: 'Verbal Ability and Reading Comprehension',
    subsections: {
      'Reading Comprehension': [
        'Passage Analysis',
        'Main Idea Identification',
        'Inference Questions',
        'Tone and Style Questions',
        'Vocabulary in Context',
        'Critical Reading',
      ],
      'Verbal Ability': [
        'Para Jumbles',
        'Para Summary',
        'Odd Sentence Out',
        'Word Usage',
        'Sentence Completion',
        'Fill in the Blanks',
      ],
      'Verbal Reasoning': [
        'Critical Reasoning',
        'Argument Structure',
        'Assumptions',
        'Conclusions',
        'Strengthen/Weaken Arguments',
        'Paragraph Completion',
        'Facts Inference Judgment',
      ],
    },
  },
  DILR: {
    name: 'Data Interpretation and Logical Reasoning',
    subsections: {
      'Data Interpretation': [
        'Tables',
        'Bar Charts',
        'Line Graphs',
        'Pie Charts',
        'Caselets',
        'Data Sufficiency',
        'Mixed Charts',
        'Combination Charts',
      ],
      'Logical Reasoning': [
        'Blood Relations',
        'Coding-Decoding',
        'Number Series',
        'Letter Series',
        'Syllogism',
        'Seating Arrangement',
        'Linear Arrangement',
        'Circular Arrangement',
        'Puzzles',
        'Floor Puzzles',
        'Scheduling Puzzles',
        'Venn Diagrams',
        'Logical Connectives',
        'Assertion and Reason',
        'Binary Logic',
      ],
    },
  },
  QA: {
    name: 'Quantitative Aptitude',
    subsections: {
      'Arithmetic': [
        'Percentages',
        'Profit and Loss',
        'Discount',
        'Simple Interest',
        'Compound Interest',
        'Ratio and Proportion',
        'Time and Work',
        'Pipes and Cisterns',
        'Time Speed and Distance',
        'Trains',
        'Boats and Streams',
        'Averages',
        'Mixtures and Alligation',
        'Partnership',
      ],
      'Algebra': [
        'Linear Equations',
        'Quadratic Equations',
        'Higher Degree Equations',
        'Logarithms',
        'Functions',
        'Progressions',
        'Arithmetic Progression',
        'Geometric Progression',
        'Harmonic Progression',
        'Inequalities',
        'Modular Arithmetic',
      ],
      'Geometry and Mensuration': [
        'Triangles',
        'Properties of Triangles',
        'Similarity',
        'Congruency',
        'Circles',
        'Chords and Tangents',
        'Arc and Sector',
        'Quadrilaterals',
        'Polygons',
        '3D Geometry',
        'Cubes',
        'Cylinders',
        'Cones',
        'Spheres',
        'Area and Perimeter',
        'Volume and Surface Area',
      ],
      'Modern Mathematics': [
        'Permutation and Combination',
        'Fundamental Principle',
        'Arrangements',
        'Selections',
        'Probability',
        'Basic Probability',
        'Conditional Probability',
        'Bayes Theorem',
        'Set Theory',
        'Venn Diagrams',
        'Set Operations',
        'Number of Elements',
      ],
    },
  },
};

async function main() {
  console.log('Seeding CAT Syllabus...');

  for (const [sectionKey, sectionData] of Object.entries(CAT_SYLLABUS)) {
    // Create Subject for section
    const section = await prisma.subject.upsert({
      where: { 
        code_examType: { 
          code: sectionKey,
          examType: ExamType.CAT,
        }
      },
      update: {},
      create: {
        name: sectionData.name,
        code: sectionKey,
        examType: ExamType.CAT,
        section: sectionKey,
      },
    });

    // Create Syllabus
    const syllabus = await prisma.syllabus.upsert({
      where: { id: `cat-${sectionKey.toLowerCase()}` },
      update: {},
      create: {
        id: `cat-${sectionKey.toLowerCase()}`,
        title: `CAT ${sectionKey} Syllabus`,
        description: `Official CAT ${sectionData.name} syllabus`,
        subjectId: section.id,
        examType: ExamType.CAT,
        section: sectionKey,
        isPublished: true,
        sourceType: 'SYLLABUS',
      },
    });

    const subsectionKeys = Object.keys(sectionData.subsections);
    let unitOrder = 1;

    for (const subsection of subsectionKeys) {
      const topics: string[] = sectionData.subsections[subsection as keyof typeof sectionData.subsections];

      // Create unit for subsection
      const unit = await prisma.unit.create({
        data: {
          title: subsection,
          order: unitOrder++,
          syllabusId: syllabus.id,
        },
      });

      // Create topics
      for (let t = 0; t < topics.length; t++) {
        await prisma.topic.create({
          data: {
            title: topics[t],
            order: t + 1,
            unitId: unit.id,
            examType: ExamType.CAT,
            section: sectionKey,
            subsection: subsection.replace(/\s+/g, '_').toUpperCase().substring(0, 3),
          },
        });
      }

      console.log(`Created: ${sectionKey} - ${subsection} (${topics.length} topics)`);
    }
  }

  console.log('CAT Syllabus seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });